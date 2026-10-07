-- ==============================================================================
-- EzyKwelez Phase 2 Database Migration: Row Level Security (RLS) Policies
-- ==============================================================================
-- Description: Enforces table-level and role-based security isolation between
--              Student, Operator, and Admin roles according to OWASP standards.
-- Version: 00002
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Helper Security Functions
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_operator_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND role IN ('operator', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 2. Enable RLS on All Public Tables
-- ------------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occupancy_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connectivity_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dependency_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dependency_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_impacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_plan_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 3. Profiles Policies
-- ------------------------------------------------------------------------------

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_operator_or_admin());

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 4. Facilities & Telemetry Read Policies (Open to Authenticated & Public)
-- ------------------------------------------------------------------------------

CREATE POLICY "Public read access for campuses"
    ON public.campuses FOR SELECT
    USING (true);

CREATE POLICY "Public read access for buildings"
    ON public.buildings FOR SELECT
    USING (true);

CREATE POLICY "Public read access for rooms"
    ON public.rooms FOR SELECT
    USING (true);

CREATE POLICY "Public read access for occupancy snapshots"
    ON public.occupancy_snapshots FOR SELECT
    USING (true);

CREATE POLICY "Public read access for connectivity snapshots"
    ON public.connectivity_snapshots FOR SELECT
    USING (true);

-- Mutation restricted to Operators
CREATE POLICY "Operators can manage buildings"
    ON public.buildings FOR ALL
    USING (public.is_operator_or_admin());

CREATE POLICY "Operators can manage rooms"
    ON public.rooms FOR ALL
    USING (public.is_operator_or_admin());

CREATE POLICY "Operators can insert occupancy snapshots"
    ON public.occupancy_snapshots FOR INSERT
    WITH CHECK (public.is_operator_or_admin());

CREATE POLICY "Operators can insert connectivity snapshots"
    ON public.connectivity_snapshots FOR INSERT
    WITH CHECK (public.is_operator_or_admin());

-- ------------------------------------------------------------------------------
-- 5. Dependency Graph Policies
-- ------------------------------------------------------------------------------

CREATE POLICY "Authenticated users can view dependency nodes"
    ON public.dependency_nodes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Operators can mutate dependency nodes"
    ON public.dependency_nodes FOR ALL
    USING (public.is_operator_or_admin());

CREATE POLICY "Authenticated users can view dependency edges"
    ON public.dependency_edges FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Operators can mutate dependency edges"
    ON public.dependency_edges FOR ALL
    USING (public.is_operator_or_admin());

-- ------------------------------------------------------------------------------
-- 6. Incidents & Impact Policies
-- ------------------------------------------------------------------------------

CREATE POLICY "Authenticated users can view incidents"
    ON public.incidents FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Operators can insert and update incidents"
    ON public.incidents FOR ALL
    USING (public.is_operator_or_admin());

CREATE POLICY "Authenticated users can view incident impacts"
    ON public.incident_impacts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Operators can manage incident impacts"
    ON public.incident_impacts FOR ALL
    USING (public.is_operator_or_admin());

-- ------------------------------------------------------------------------------
-- 7. Recovery Plans & Simulation Policies
-- ------------------------------------------------------------------------------

CREATE POLICY "Authenticated users can view approved recovery plans"
    ON public.recovery_plans FOR SELECT
    TO authenticated
    USING (status = 'APPROVED' OR public.is_operator_or_admin());

CREATE POLICY "Operators can manage recovery plans"
    ON public.recovery_plans FOR ALL
    USING (public.is_operator_or_admin());

CREATE POLICY "Authenticated users can view recovery actions"
    ON public.recovery_plan_actions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Operators can manage recovery actions"
    ON public.recovery_plan_actions FOR ALL
    USING (public.is_operator_or_admin());

CREATE POLICY "Operators can view and execute simulation runs"
    ON public.simulation_runs FOR ALL
    USING (public.is_operator_or_admin());

-- ------------------------------------------------------------------------------
-- 8. Audit Logs Policies (Strictly Operator / Admin Only)
-- ------------------------------------------------------------------------------

CREATE POLICY "Operators can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_operator_or_admin());

CREATE POLICY "Operators can insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (public.is_operator_or_admin());
