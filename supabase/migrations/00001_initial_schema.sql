-- ==============================================================================
-- EzyKwelez Phase 2 Database Migration: Initial Schema
-- ==============================================================================
-- Description: Core tables, enums, constraints, and indexes for campus topology,
--              telemetry snapshots, incidents, dependency graph, and recovery.
-- Version: 00001
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Custom Domain Types and Enums
-- ------------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'operator', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_status AS ENUM (
        'REPORTED',
        'INVESTIGATING',
        'ACTIVE',
        'MITIGATED',
        'RESOLVED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE entity_type AS ENUM (
        'CAMPUS',
        'BUILDING',
        'ZONE',
        'ROOM',
        'RESOURCE',
        'CLASS_SESSION',
        'FACILITY'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE recovery_plan_status AS ENUM (
        'DRAFT',
        'EVALUATED',
        'RECOMMENDED',
        'APPROVED',
        'REJECTED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE data_mode AS ENUM ('live', 'simulated', 'estimated', 'unknown');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE occupancy_status AS ENUM (
        'Low',
        'Moderate',
        'Busy',
        'Very Busy',
        'Over Capacity'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE connectivity_quality AS ENUM (
        'Excellent',
        'Good',
        'Fair',
        'Weak',
        'Very Weak'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE dependency_type AS ENUM (
        'POWERED_BY',
        'NETWORKED_BY',
        'LOCATED_IN',
        'OCCUPIES',
        'REQUIRES_RESOURCE',
        'ATTENDED_BY',
        'SERVES',
        'ALTERNATIVE_TO'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE dependency_criticality AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------
-- 2. User Profiles (Linked to Supabase Auth)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT DEFAULT '',
    role user_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. Campus & Facilities Hierarchy
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.campuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES public.campuses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    total_floors INT NOT NULL DEFAULT 1 CHECK (total_floors > 0),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (campus_id, code)
);

CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES public.campuses(id) ON DELETE CASCADE,
    building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
    room_number TEXT NOT NULL,
    name TEXT NOT NULL,
    room_type entity_type NOT NULL DEFAULT 'ROOM',
    capacity INT NOT NULL CHECK (capacity > 0),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (building_id, room_number)
);

-- ------------------------------------------------------------------------------
-- 4. Live & Historical Telemetry Snapshots
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.occupancy_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    current_students INT NOT NULL CHECK (current_students >= 0),
    capacity INT NOT NULL CHECK (capacity > 0),
    occupancy_percentage FLOAT NOT NULL,
    status occupancy_status NOT NULL,
    data_mode data_mode NOT NULL DEFAULT 'simulated',
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.connectivity_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    signal_score INT NOT NULL CHECK (signal_score >= 0 AND signal_score <= 100),
    quality connectivity_quality NOT NULL,
    network_name TEXT NOT NULL,
    dbm INT NOT NULL,
    data_mode data_mode NOT NULL DEFAULT 'simulated',
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. Dependency Graph (Vertices and Edges)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.dependency_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES public.campuses(id) ON DELETE CASCADE,
    entity_type entity_type NOT NULL,
    entity_id UUID NOT NULL,
    name TEXT NOT NULL,
    criticality dependency_criticality NOT NULL DEFAULT 'MEDIUM',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (campus_id, entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS public.dependency_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES public.campuses(id) ON DELETE CASCADE,
    source_node_id UUID NOT NULL REFERENCES public.dependency_nodes(id) ON DELETE CASCADE,
    target_node_id UUID NOT NULL REFERENCES public.dependency_nodes(id) ON DELETE CASCADE,
    relationship_type dependency_type NOT NULL,
    criticality dependency_criticality NOT NULL DEFAULT 'MEDIUM',
    weight FLOAT NOT NULL DEFAULT 1.0,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (source_node_id <> target_node_id)
);

-- ------------------------------------------------------------------------------
-- 6. Incidents and Blast Radius Analysis
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES public.campuses(id) ON DELETE CASCADE,
    target_node_id UUID REFERENCES public.dependency_nodes(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    severity incident_severity NOT NULL DEFAULT 'MEDIUM',
    status incident_status NOT NULL DEFAULT 'REPORTED',
    data_mode data_mode NOT NULL DEFAULT 'simulated',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.incident_impacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    direct_impact_count INT NOT NULL DEFAULT 0,
    cascading_impact_count INT NOT NULL DEFAULT 0,
    total_affected_people INT NOT NULL DEFAULT 0,
    criticality_score FLOAT NOT NULL DEFAULT 0.0,
    affected_node_ids UUID[] NOT NULL DEFAULT '{}',
    raw_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. Recovery Planning & Optimization
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.recovery_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status recovery_plan_status NOT NULL DEFAULT 'DRAFT',
    disruption_score FLOAT NOT NULL DEFAULT 0.0,
    students_affected INT NOT NULL DEFAULT 0,
    explanation_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.recovery_plan_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recovery_plan_id UUID NOT NULL REFERENCES public.recovery_plans(id) ON DELETE CASCADE,
    action_order INT NOT NULL DEFAULT 1,
    source_entity_id UUID,
    target_entity_id UUID,
    action_type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- ------------------------------------------------------------------------------
-- 8. Counterfactual Simulation Runs
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.simulation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    scenario_name TEXT NOT NULL,
    scenario_params JSONB NOT NULL DEFAULT '{}'::jsonb,
    baseline_disruption_score FLOAT NOT NULL,
    simulated_disruption_score FLOAT NOT NULL,
    delta_improvement FLOAT NOT NULL,
    run_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. Audit Logs
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES public.campuses(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. Performance Indexes
-- ------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_buildings_campus ON public.buildings(campus_id);
CREATE INDEX IF NOT EXISTS idx_rooms_building ON public.rooms(building_id);
CREATE INDEX IF NOT EXISTS idx_rooms_campus ON public.rooms(campus_id);
CREATE INDEX IF NOT EXISTS idx_occupancy_room_time ON public.occupancy_snapshots(room_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_connectivity_room_time ON public.connectivity_snapshots(room_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_dep_nodes_campus ON public.dependency_nodes(campus_id);
CREATE INDEX IF NOT EXISTS idx_dep_edges_source ON public.dependency_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_dep_edges_target ON public.dependency_edges(target_node_id);
CREATE INDEX IF NOT EXISTS idx_incidents_campus_status ON public.incidents(campus_id, status);
CREATE INDEX IF NOT EXISTS idx_recovery_plans_incident ON public.recovery_plans(incident_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_campus_time ON public.audit_logs(campus_id, created_at DESC);
