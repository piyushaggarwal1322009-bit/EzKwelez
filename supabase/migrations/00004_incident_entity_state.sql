-- Campus-owned incident records, explicit affected entities, and audit updates.

ALTER TABLE public.incidents
    ADD COLUMN IF NOT EXISTS type public.incident_type NOT NULL DEFAULT 'other',
    ADD COLUMN IF NOT EXISTS source public.incident_source NOT NULL DEFAULT 'manual',
    ADD COLUMN IF NOT EXISTS detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS estimated_duration_minutes INT
        CHECK (estimated_duration_minutes IS NULL OR estimated_duration_minutes > 0);

ALTER TABLE public.dependency_nodes
    ADD CONSTRAINT uq_dependency_nodes_id_campus UNIQUE (id, campus_id),
    ADD CONSTRAINT uq_dependency_nodes_id_campus_entity UNIQUE (id, campus_id, entity_type);

ALTER TABLE public.incidents
    ADD CONSTRAINT uq_incidents_id_campus UNIQUE (id, campus_id),
    ADD CONSTRAINT fk_incidents_target_node_campus
        FOREIGN KEY (target_node_id, campus_id)
        REFERENCES public.dependency_nodes (id, campus_id);

ALTER TABLE public.incidents
    ALTER COLUMN severity SET DEFAULT 'MODERATE';

CREATE TABLE IF NOT EXISTS public.incident_affected_entities (
    incident_id UUID NOT NULL,
    campus_id UUID NOT NULL,
    entity_node_id UUID NOT NULL,
    entity_type public.entity_type NOT NULL
        CHECK (entity_type IN ('BUILDING', 'ROOM', 'RESOURCE', 'SERVICE', 'FACILITY')),
    reason TEXT NOT NULL CHECK (length(trim(reason)) >= 3),
    created_by TEXT NOT NULL DEFAULT 'system',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (incident_id, entity_node_id),
    FOREIGN KEY (incident_id, campus_id)
        REFERENCES public.incidents (id, campus_id) ON DELETE CASCADE,
    FOREIGN KEY (entity_node_id, campus_id, entity_type)
        REFERENCES public.dependency_nodes (id, campus_id, entity_type) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.incident_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL,
    campus_id UUID NOT NULL,
    update_type TEXT NOT NULL CHECK (update_type IN (
        'created', 'status_changed', 'severity_changed', 'location_updated',
        'root_node_updated', 'comment_added', 'acknowledged', 'mitigated',
        'resolved', 'closed', 'cancelled', 'affected_entity_added'
    )),
    message TEXT NOT NULL,
    status_before public.incident_status,
    status_after public.incident_status,
    severity_before public.incident_severity,
    severity_after public.incident_severity,
    created_by TEXT NOT NULL DEFAULT 'system',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (incident_id, campus_id)
        REFERENCES public.incidents (id, campus_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_incident_affected_entities_campus_entity
    ON public.incident_affected_entities (campus_id, entity_node_id);
CREATE INDEX IF NOT EXISTS idx_incident_updates_campus_incident_time
    ON public.incident_updates (campus_id, incident_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_campus_severity
    ON public.incidents (campus_id, severity);

ALTER TABLE public.incident_affected_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view incident affected entities"
    ON public.incident_affected_entities FOR SELECT TO authenticated
    USING (true);
CREATE POLICY "Operators can manage incident affected entities"
    ON public.incident_affected_entities FOR ALL TO authenticated
    USING (public.is_operator_or_admin())
    WITH CHECK (public.is_operator_or_admin());

CREATE POLICY "Authenticated users can view incident updates"
    ON public.incident_updates FOR SELECT TO authenticated
    USING (true);
CREATE POLICY "Operators can append incident updates"
    ON public.incident_updates FOR INSERT TO authenticated
    WITH CHECK (public.is_operator_or_admin());