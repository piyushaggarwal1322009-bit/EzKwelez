-- ==============================================================================
-- EzyKwelez Supabase Migration: 20261007000002_create_campus_and_dependencies.sql
-- Phase 3: Campus Model + Dependency Graph Foundation
-- ==============================================================================

-- 1. CAMPUSES TABLE
CREATE TABLE IF NOT EXISTS public.campuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.campuses IS 'University or enterprise campus boundaries.';

-- 2. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES public.campuses(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    location_type TEXT NOT NULL CHECK (
        location_type IN ('academic', 'library', 'canteen', 'hostel', 'administration', 'laboratory', 'sports', 'entrance', 'common_area', 'other')
    ),
    description TEXT,
    capacity INT NOT NULL DEFAULT 0 CHECK (capacity >= 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'inactive', 'maintenance', 'unknown')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_location_campus_code UNIQUE (campus_id, code)
);

CREATE INDEX IF NOT EXISTS idx_locations_campus ON public.locations(campus_id);
CREATE INDEX IF NOT EXISTS idx_locations_type ON public.locations(location_type);

-- 3. RESOURCES / INFRASTRUCTURE TABLE
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES public.campuses(id) ON DELETE RESTRICT,
    location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    resource_type TEXT NOT NULL CHECK (
        resource_type IN ('power', 'network', 'water', 'hvac', 'security', 'communication', 'transport', 'equipment', 'other')
    ),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'inactive', 'maintenance', 'unknown')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_resource_campus_code UNIQUE (campus_id, code)
);

CREATE INDEX IF NOT EXISTS idx_resources_campus ON public.resources(campus_id);
CREATE INDEX IF NOT EXISTS idx_resources_location ON public.resources(location_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON public.resources(resource_type);

-- 4. SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES public.campuses(id) ON DELETE RESTRICT,
    location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    service_type TEXT NOT NULL CHECK (
        service_type IN ('network', 'academic', 'food', 'security', 'access', 'water', 'power', 'communication', 'administration', 'other')
    ),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'inactive', 'maintenance', 'unknown')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_service_campus_code UNIQUE (campus_id, code)
);

CREATE INDEX IF NOT EXISTS idx_services_campus ON public.services(campus_id);
CREATE INDEX IF NOT EXISTS idx_services_location ON public.services(location_id);
CREATE INDEX IF NOT EXISTS idx_services_type ON public.services(service_type);

-- 5. DEPENDENCIES TABLE (Graph Edges: Source -> Target)
CREATE TABLE IF NOT EXISTS public.dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES public.campuses(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL CHECK (source_type IN ('resource', 'location', 'service')),
    source_id UUID NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('resource', 'location', 'service')),
    target_id UUID NOT NULL,
    dependency_type TEXT NOT NULL CHECK (
        dependency_type IN ('power', 'network', 'water', 'hvac', 'security', 'communication', 'access', 'operational', 'other')
    ),
    strength TEXT NOT NULL DEFAULT 'critical' CHECK (
        strength IN ('required', 'critical', 'important', 'optional')
    ),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_dependency_edge UNIQUE (campus_id, source_type, source_id, target_type, target_id, dependency_type),
    CONSTRAINT chk_no_self_dependency CHECK (NOT (source_type = target_type AND source_id = target_id))
);

CREATE INDEX IF NOT EXISTS idx_dependencies_campus ON public.dependencies(campus_id);
CREATE INDEX IF NOT EXISTS idx_dependencies_source ON public.dependencies(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_dependencies_target ON public.dependencies(target_type, target_id);

-- 6. POLYMORPHIC REFERENTIAL INTEGRITY TRIGGER
CREATE OR REPLACE FUNCTION public.validate_dependency_endpoints()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    source_exists BOOLEAN := FALSE;
    target_exists BOOLEAN := FALSE;
BEGIN
    -- Check source entity existence and campus ownership
    IF NEW.source_type = 'resource' THEN
        SELECT EXISTS(SELECT 1 FROM public.resources WHERE id = NEW.source_id AND campus_id = NEW.campus_id) INTO source_exists;
    ELSIF NEW.source_type = 'location' THEN
        SELECT EXISTS(SELECT 1 FROM public.locations WHERE id = NEW.source_id AND campus_id = NEW.campus_id) INTO source_exists;
    ELSIF NEW.source_type = 'service' THEN
        SELECT EXISTS(SELECT 1 FROM public.services WHERE id = NEW.source_id AND campus_id = NEW.campus_id) INTO source_exists;
    END IF;

    IF NOT source_exists THEN
        RAISE EXCEPTION 'Dependency source entity (%) with ID % does not exist in campus %', NEW.source_type, NEW.source_id, NEW.campus_id;
    END IF;

    -- Check target entity existence and campus ownership
    IF NEW.target_type = 'resource' THEN
        SELECT EXISTS(SELECT 1 FROM public.resources WHERE id = NEW.target_id AND campus_id = NEW.campus_id) INTO target_exists;
    ELSIF NEW.target_type = 'location' THEN
        SELECT EXISTS(SELECT 1 FROM public.locations WHERE id = NEW.target_id AND campus_id = NEW.campus_id) INTO target_exists;
    ELSIF NEW.target_type = 'service' THEN
        SELECT EXISTS(SELECT 1 FROM public.services WHERE id = NEW.target_id AND campus_id = NEW.campus_id) INTO target_exists;
    END IF;

    IF NOT target_exists THEN
        RAISE EXCEPTION 'Dependency target entity (%) with ID % does not exist in campus %', NEW.target_type, NEW.target_id, NEW.campus_id;
    END IF;

    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_dependency_endpoints ON public.dependencies;
CREATE TRIGGER trg_validate_dependency_endpoints
    BEFORE INSERT OR UPDATE ON public.dependencies
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_dependency_endpoints();

-- 7. ROW LEVEL SECURITY
ALTER TABLE public.campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dependencies ENABLE ROW LEVEL SECURITY;

-- Read Policies: All authenticated users can read campus models
CREATE POLICY "campuses_select_auth" ON public.campuses FOR SELECT TO authenticated USING (true);
CREATE POLICY "locations_select_auth" ON public.locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "resources_select_auth" ON public.resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "services_select_auth" ON public.services FOR SELECT TO authenticated USING (true);
CREATE POLICY "dependencies_select_auth" ON public.dependencies FOR SELECT TO authenticated USING (true);

-- Mutation Policies: Restricted to staff or admin roles
CREATE POLICY "campuses_write_staff_admin" ON public.campuses FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')));

CREATE POLICY "locations_write_staff_admin" ON public.locations FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')));

CREATE POLICY "resources_write_staff_admin" ON public.resources FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')));

CREATE POLICY "services_write_staff_admin" ON public.services FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')));

CREATE POLICY "dependencies_write_staff_admin" ON public.dependencies FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')));
