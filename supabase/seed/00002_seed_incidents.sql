-- Deterministic demo incidents for Apex Institute of Technology.
-- Every affected entity below exists in seed 00001 and is linked directly;
-- no dependency traversal or inferred affected entities are performed.

DELETE FROM public.incidents
WHERE id IN (
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002'
);

INSERT INTO public.incidents (
    id, campus_id, target_node_id, title, description, type, severity, status,
    source, data_mode, started_at, detected_at, acknowledged_at,
    resolved_at, estimated_duration_minutes, created_at, updated_at
)
VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    '90000000-0000-0000-0000-000000000001',
    'Campus Core Power Interruption',
    'A simulated feeder interruption affecting the explicitly linked Block B building.',
    'power_outage', 'HIGH', 'ACTIVE', 'manual', 'simulated',
    NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '18 minutes',
    NOW() - INTERVAL '15 minutes', NULL, 90, NOW() - INTERVAL '18 minutes', NOW()
),
(
    '10000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000001',
    '90000000-0000-0000-0000-000000000004',
    'Block B201 Power Maintenance',
    'Scheduled maintenance for the seeded Optics and Laser Physics Lab resource.',
    'maintenance', 'MODERATE', 'RESOLVED', 'manual', 'simulated',
    NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '175 minutes', NOW() - INTERVAL '2 hours', 60,
    NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours'
);

INSERT INTO public.incident_affected_entities (
    incident_id, campus_id, entity_node_id, entity_type, reason, created_by
)
VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    '90000000-0000-0000-0000-000000000002',
    'BUILDING', 'Block B is directly affected by the feeder interruption.', 'seed'
),
(
    '10000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000001',
    '90000000-0000-0000-0000-000000000004',
    'ROOM', 'The Optics and Laser Physics Lab is explicitly under maintenance.', 'seed'
);

INSERT INTO public.incident_updates (
    incident_id, campus_id, update_type, message, status_after, created_by
)
VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'created', 'Seeded simulated power interruption.', 'ACTIVE', 'seed'
),
(
    '10000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000001',
    'resolved', 'Scheduled maintenance completed.', 'RESOLVED', 'seed'
);