-- ==============================================================================
-- EzyKwelez Phase 2 Seed Data: Synthetic Connected Campus Network
-- ==============================================================================
-- Scenario: High-load academic period at Apex Institute of Technology
--           Supports the Building B 90-minute power outage decision workflow.
-- Version: 00001
-- ==============================================================================

-- Clean existing data in dependency order
TRUNCATE public.audit_logs,
         public.simulation_runs,
         public.recovery_plan_actions,
         public.recovery_plans,
         public.incident_impacts,
         public.incidents,
         public.dependency_edges,
         public.dependency_nodes,
         public.connectivity_snapshots,
         public.occupancy_snapshots,
         public.rooms,
         public.buildings,
         public.campuses CASCADE;

-- ------------------------------------------------------------------------------
-- 1. Campus Seed
-- ------------------------------------------------------------------------------

INSERT INTO public.campuses (id, name, code, timezone)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'Apex Institute of Technology — Main Campus',
    'APEX-MAIN',
    'Asia/Kolkata'
);

-- ------------------------------------------------------------------------------
-- 2. Buildings Seed
-- ------------------------------------------------------------------------------

INSERT INTO public.buildings (id, campus_id, name, code, total_floors, metadata) VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'Administrative & Faculty Tower',
    'BLD-A',
    5,
    '{"primary_use": "Administration & Executive Offices"}'::jsonb
),
(
    'b0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000001',
    'Ramanujan Science & Engineering Block',
    'BLD-B',
    4,
    '{"primary_use": "Undergraduate Physics, Chemistry & Engineering Labs"}'::jsonb
),
(
    'b0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000001',
    'Turing Advanced Computing Complex',
    'BLD-C',
    4,
    '{"primary_use": "Computer Science Labs, Auditoriums & Seminar Halls"}'::jsonb
),
(
    'b0000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000001',
    'Central Library & Student Hub',
    'BLD-LIB',
    3,
    '{"primary_use": "Library, Study Commons, Central Canteen & Food Court"}'::jsonb
);

-- ------------------------------------------------------------------------------
-- 3. Rooms & Facilities Seed
-- ------------------------------------------------------------------------------

INSERT INTO public.rooms (id, campus_id, building_id, room_number, name, room_type, capacity, metadata) VALUES
-- Building B (Engineering Block)
('80000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'B101', 'Physics Main Lecture Hall', 'ROOM', 120, '{"av_equipped": true, "has_projector": true}'::jsonb),
('80000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'B102', 'Chemistry Lecture Hall', 'ROOM', 100, '{"av_equipped": true}'::jsonb),
('80000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'B201', 'Optics & Laser Physics Lab', 'RESOURCE', 40, '{"equipment": ["Spectrometer Rig", "Laser Optical Bench"], "requires_lab_assistant": true}'::jsonb),
('80000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'B202', 'Analytical Chemistry Lab', 'RESOURCE', 35, '{"equipment": ["Fume Hoods", "Centrifuge"]}'::jsonb),
('80000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'B203', 'Robotics & Microcontroller Workshop', 'RESOURCE', 30, '{"equipment": ["Oscilloscopes", "Soldering Stations"]}'::jsonb),

-- Building C (Computing Complex)
('80000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'C101', 'Computer Lab Alpha', 'RESOURCE', 60, '{"workstations": 60, "os": "Linux"}'::jsonb),
('80000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'C102', 'Computer Lab Beta', 'RESOURCE', 60, '{"workstations": 60, "os": "Windows"}'::jsonb),
('80000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'C201', 'Main Campus Auditorium', 'FACILITY', 250, '{"stage_lighting": true, "av_surround": true}'::jsonb),
('80000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'C204', 'Multi-Purpose Seminar Hall', 'ROOM', 130, '{"av_equipped": true, "flexible_seating": true}'::jsonb),

-- Library & Student Hub (Library & Canteen Out-of-the-Box)
('80000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'LIB-101', 'Central Library Commons', 'FACILITY', 200, '{"wifi_zones": ["AP-LIB-01", "AP-LIB-02"], "quiet_zone": false}'::jsonb),
('80000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'CAN-001', 'Central Campus Canteen', 'FACILITY', 300, '{"food_stalls": 6, "peak_hours": "12:00-14:30"}'::jsonb);

-- ------------------------------------------------------------------------------
-- 4. Initial Telemetry Snapshots
-- ------------------------------------------------------------------------------

-- Occupancy Snapshots
INSERT INTO public.occupancy_snapshots (room_id, current_students, capacity, occupancy_percentage, status, data_mode, recorded_at) VALUES
('80000000-0000-0000-0000-000000000001', 114, 120, 95.0, 'Very Busy', 'simulated', NOW()),
('80000000-0000-0000-0000-000000000002', 82, 100, 82.0, 'Busy', 'simulated', NOW()),
('80000000-0000-0000-0000-000000000003', 34, 40, 85.0, 'Busy', 'simulated', NOW()),
('80000000-0000-0000-0000-000000000004', 28, 35, 80.0, 'Busy', 'simulated', NOW()),
('80000000-0000-0000-0000-000000000005', 26, 30, 86.6, 'Busy', 'simulated', NOW()),
('80000000-0000-0000-0000-000000000006', 42, 60, 70.0, 'Moderate', 'simulated', NOW()),
('80000000-0000-0000-0000-000000000007', 38, 60, 63.3, 'Moderate', 'simulated', NOW()),
('80000000-0000-0000-0000-000000000008', 0, 250, 0.0, 'Low', 'simulated', NOW()),
('80000000-0000-0000-0000-000000000009', 14, 130, 10.7, 'Low', 'simulated', NOW()), -- Prime recovery destination
('80000000-0000-0000-0000-000000000010', 142, 200, 71.0, 'Moderate', 'simulated', NOW()), -- Library
('80000000-0000-0000-0000-000000000011', 282, 300, 94.0, 'Very Busy', 'simulated', NOW()); -- Canteen

-- Connectivity Snapshots
INSERT INTO public.connectivity_snapshots (room_id, signal_score, quality, network_name, dbm, data_mode, recorded_at) VALUES
('80000000-0000-0000-0000-000000000001', 74, 'Good', 'APEX-FACULTY-WIFI', -64, 'simulated', NOW()),
('80000000-0000-0000-0000-000000000002', 68, 'Good', 'APEX-STUDENT-WIFI', -68, 'simulated', NOW()),
('80000000-0000-0000-0000-000000000003', 72, 'Good', 'APEX-LAB-SECURE', -65, 'simulated', NOW()),
('80000000-0000-0000-0000-000000000004', 65, 'Good', 'APEX-LAB-SECURE', -69, 'simulated', NOW()),
('80000000-0000-0000-0000-000000000005', 78, 'Good', 'APEX-LAB-SECURE', -62, 'simulated', NOW()),
('80000000-0000-0000-0000-000000000006', 92, 'Excellent', 'APEX-CS-HIGHSP', -52, 'simulated', NOW()),
('80000000-0000-0000-0000-000000000007', 90, 'Excellent', 'APEX-CS-HIGHSP', -54, 'simulated', NOW()),
('80000000-0000-0000-0000-000000000008', 88, 'Excellent', 'APEX-AUDITORIUM', -55, 'simulated', NOW()),
('80000000-0000-0000-0000-000000000009', 95, 'Excellent', 'APEX-SEMINAR-5G', -48, 'simulated', NOW()),
('80000000-0000-0000-0000-000000000010', 88, 'Excellent', 'APEX-LIB-FREEWIFI', -56, 'simulated', NOW()),
('80000000-0000-0000-0000-000000000011', 64, 'Good', 'APEX-CANTEEN-OPEN', -70, 'simulated', NOW());

-- ------------------------------------------------------------------------------
-- 5. Dependency Graph Topology Seed
-- ------------------------------------------------------------------------------

-- Vertices (Dependency Nodes)
INSERT INTO public.dependency_nodes (id, campus_id, entity_type, entity_id, name, criticality) VALUES
('90000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'FACILITY', 'b0000000-0000-0000-0000-000000000002', 'Substation Sub-Grid B (Power)', 'CRITICAL'),
('90000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'BUILDING', 'b0000000-0000-0000-0000-000000000002', 'Building B Structure', 'HIGH'),
('90000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'ROOM', '80000000-0000-0000-0000-000000000001', 'Physics Lecture Hall B101', 'HIGH'),
('90000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'ROOM', '80000000-0000-0000-0000-000000000003', 'Optics Lab B201', 'HIGH'),
('90000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'ROOM', '80000000-0000-0000-0000-000000000009', 'Seminar Hall C204 (Backup)', 'MEDIUM'),
('90000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', 'CLASS_SESSION', 'c0000000-0000-0000-0000-000000000001', 'PHYS-101 Freshman Physics', 'HIGH');

-- Directed Edges (Dependencies)
INSERT INTO public.dependency_edges (campus_id, source_node_id, target_node_id, relationship_type, criticality, weight) VALUES
('c0000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000002', 'POWERED_BY', 'CRITICAL', 1.0),
('c0000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000003', 'LOCATED_IN', 'HIGH', 1.0),
('c0000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000004', 'LOCATED_IN', 'HIGH', 1.0),
('c0000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000003', '90000000-0000-0000-0000-000000000006', 'OCCUPIES', 'HIGH', 1.0),
('c0000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000003', '90000000-0000-0000-0000-000000000005', 'ALTERNATIVE_TO', 'MEDIUM', 0.8);
