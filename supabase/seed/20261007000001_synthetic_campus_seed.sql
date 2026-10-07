-- ==============================================================================
-- EzyKwelez Synthetic Campus Seed Dataset
-- Campus: Ezy University (Code: EZY-MAIN)
-- Phase 3 Baseline Topology
-- ==============================================================================

-- 1. Insert Campus
INSERT INTO public.campuses (id, name, code, description)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Ezy University',
    'EZY-MAIN',
    'Main collegiate campus for disruption response and dependency simulation'
)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 2. Insert Locations (9 locations)
INSERT INTO public.locations (id, campus_id, name, code, location_type, description, capacity, status)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Main Library', 'LOC-LIB', 'library', 'Central multi-floor university library', 450, 'active'),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Central Canteen', 'LOC-CAN', 'canteen', 'Primary campus dining hall and food court', 300, 'active'),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Academic Block A', 'LOC-ACAD-A', 'academic', 'Undergraduate lecture halls and auditoriums', 600, 'active'),
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Academic Block B', 'LOC-ACAD-B', 'academic', 'Graduate seminar rooms and faculty offices', 400, 'active'),
    ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Computer Lab', 'LOC-LAB-CS', 'laboratory', 'High-performance computing workstations', 120, 'active'),
    ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Administration Block', 'LOC-ADMIN', 'administration', 'Registrar, admissions, and campus operations center', 150, 'active'),
    ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Hostel Block A', 'LOC-HOST-A', 'hostel', 'Residential student dormitories', 350, 'active'),
    ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Student Activity Centre', 'LOC-SAC', 'common_area', 'Student union, recreation, and clubs', 250, 'active'),
    ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'Main Gate', 'LOC-GATE-1', 'entrance', 'Campus perimeter security checkpoint and vehicle gate', 50, 'active')
ON CONFLICT (campus_id, code) DO UPDATE
SET name = EXCLUDED.name, location_type = EXCLUDED.location_type, capacity = EXCLUDED.capacity;

-- 3. Insert Resources (8 infrastructure components)
INSERT INTO public.resources (id, campus_id, location_id, name, code, resource_type, description, status)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006', 'Main Transformer', 'RES-TX-01', 'power', 'Primary grid stepping substation for campus', 'active'),
    ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'Electrical Panel A', 'RES-PNL-A', 'power', 'Sub-distribution electrical panel for North Sector', 'active'),
    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006', 'Network Core Switch', 'RES-NET-CORE', 'network', 'Campus fiber backbone routing core', 'active'),
    ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Library Network Switch', 'RES-NET-LIB', 'network', 'Managed gigabit access switch in Library', 'active'),
    ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'Canteen Network Switch', 'RES-NET-CAN', 'network', 'POS terminal network switch in Canteen', 'active'),
    ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000007', 'Water Pump A', 'RES-PUMP-01', 'water', 'Hydraulic booster pump for residential hostels', 'active'),
    ('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006', 'Campus Generator', 'RES-GEN-01', 'power', 'Emergency diesel backup generation system', 'active'),
    ('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Library Wi-Fi AP', 'RES-WIFI-LIB', 'network', 'High-density wireless access point in study hall', 'active')
ON CONFLICT (campus_id, code) DO UPDATE
SET name = EXCLUDED.name, resource_type = EXCLUDED.resource_type, status = EXCLUDED.status;

-- 4. Insert Services (7 services)
INSERT INTO public.services (id, campus_id, location_id, name, code, service_type, description, status)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NULL, 'Campus Internet', 'SVC-INET', 'network', 'University wide-area broadband connection', 'active'),
    ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Library Wi-Fi', 'SVC-WIFI-LIB', 'network', 'Student wireless connectivity in Library', 'active'),
    ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'Canteen POS', 'SVC-POS-CAN', 'food', 'Electronic meal payments and checkout service', 'active'),
    ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Library Access System', 'SVC-ACC-LIB', 'access', 'RFID turnstile entry control for Library', 'active'),
    ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000009', 'Campus CCTV', 'SVC-SEC-CCTV', 'security', 'Security video monitoring network', 'active'),
    ('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000007', 'Hostel Water Supply', 'SVC-WTR-HOST', 'water', 'Potable running water distribution in Hostel Block A', 'active'),
    ('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006', 'Student Information System', 'SVC-SIS', 'academic', 'Academic portal, grading, and course enrollment', 'active')
ON CONFLICT (campus_id, code) DO UPDATE
SET name = EXCLUDED.name, service_type = EXCLUDED.service_type, status = EXCLUDED.status;

-- 5. Insert Multi-Tier Dependency Edges (Source -> Target)
INSERT INTO public.dependencies (campus_id, source_type, source_id, target_type, target_id, dependency_type, strength, description)
VALUES
    -- Power Grid Topology
    ('a0000000-0000-0000-0000-000000000001', 'resource', 'c0000000-0000-0000-0000-000000000001', 'resource', 'c0000000-0000-0000-0000-000000000002', 'power', 'required', 'Main Transformer feeds Electrical Panel A'),
    ('a0000000-0000-0000-0000-000000000001', 'resource', 'c0000000-0000-0000-0000-000000000002', 'location', 'b0000000-0000-0000-0000-000000000001', 'power', 'critical', 'Electrical Panel A provides grid power to Main Library'),
    ('a0000000-0000-0000-0000-000000000001', 'resource', 'c0000000-0000-0000-0000-000000000002', 'location', 'b0000000-0000-0000-0000-000000000002', 'power', 'critical', 'Electrical Panel A provides grid power to Central Canteen'),
    ('a0000000-0000-0000-0000-000000000001', 'resource', 'c0000000-0000-0000-0000-000000000002', 'service', 'd0000000-0000-0000-0000-000000000004', 'power', 'required', 'Electrical Panel A powers RFID Library Access System'),
    
    -- Network Backbone Topology
    ('a0000000-0000-0000-0000-000000000001', 'service', 'd0000000-0000-0000-0000-000000000001', 'resource', 'c0000000-0000-0000-0000-000000000003', 'network', 'required', 'Campus Internet feeds Network Core Switch'),
    ('a0000000-0000-0000-0000-000000000001', 'resource', 'c0000000-0000-0000-0000-000000000003', 'resource', 'c0000000-0000-0000-0000-000000000004', 'network', 'required', 'Network Core Switch connects Library Network Switch'),
    ('a0000000-0000-0000-0000-000000000001', 'resource', 'c0000000-0000-0000-0000-000000000003', 'resource', 'c0000000-0000-0000-0000-000000000005', 'network', 'required', 'Network Core Switch connects Canteen Network Switch'),
    ('a0000000-0000-0000-0000-000000000001', 'resource', 'c0000000-0000-0000-0000-000000000003', 'service', 'd0000000-0000-0000-0000-000000000007', 'network', 'critical', 'Network Core Switch serves Student Information System'),
    
    -- End-Service Dependencies
    ('a0000000-0000-0000-0000-000000000001', 'resource', 'c0000000-0000-0000-0000-000000000004', 'resource', 'c0000000-0000-0000-0000-000000000008', 'network', 'required', 'Library Network Switch uplinks Library Wi-Fi AP'),
    ('a0000000-0000-0000-0000-000000000001', 'resource', 'c0000000-0000-0000-0000-000000000008', 'service', 'd0000000-0000-0000-0000-000000000002', 'network', 'required', 'Library Wi-Fi AP broadcasts Library Wi-Fi service'),
    ('a0000000-0000-0000-0000-000000000001', 'location', 'b0000000-0000-0000-0000-000000000001', 'service', 'd0000000-0000-0000-0000-000000000002', 'operational', 'important', 'Library physical space hosts Library Wi-Fi access'),
    ('a0000000-0000-0000-0000-000000000001', 'resource', 'c0000000-0000-0000-0000-000000000005', 'service', 'd0000000-0000-0000-0000-000000000003', 'network', 'required', 'Canteen Network Switch links Canteen POS system'),
    ('a0000000-0000-0000-0000-000000000001', 'location', 'b0000000-0000-0000-0000-000000000002', 'service', 'd0000000-0000-0000-0000-000000000003', 'operational', 'critical', 'Central Canteen physical operation requires POS payment system'),

    -- Water Supply Topology
    ('a0000000-0000-0000-0000-000000000001', 'resource', 'c0000000-0000-0000-0000-000000000006', 'location', 'b0000000-0000-0000-0000-000000000007', 'water', 'required', 'Water Pump A pumps water to Hostel Block A'),
    ('a0000000-0000-0000-0000-000000000001', 'location', 'b0000000-0000-0000-0000-000000000007', 'service', 'd0000000-0000-0000-0000-000000000006', 'water', 'required', 'Hostel Block A delivers Hostel Water Supply')
ON CONFLICT (campus_id, source_type, source_id, target_type, target_id, dependency_type) DO NOTHING;
