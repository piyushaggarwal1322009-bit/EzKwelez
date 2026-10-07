-- Extend the existing incident and campus vocabularies for the incident engine.
-- This migration is separate from table changes so PostgreSQL commits new enum
-- labels before the next migration references them.

ALTER TYPE public.incident_severity ADD VALUE IF NOT EXISTS 'INFO';
ALTER TYPE public.incident_severity ADD VALUE IF NOT EXISTS 'MODERATE';

ALTER TYPE public.incident_status ADD VALUE IF NOT EXISTS 'TRIAGED';
ALTER TYPE public.incident_status ADD VALUE IF NOT EXISTS 'CLOSED';

ALTER TYPE public.entity_type ADD VALUE IF NOT EXISTS 'SERVICE';

DO $$ BEGIN
    CREATE TYPE public.incident_type AS ENUM (
        'power_outage',
        'network_outage',
        'water_outage',
        'fire',
        'equipment_failure',
        'building_issue',
        'security_event',
        'capacity_issue',
        'maintenance',
        'environmental',
        'hvac_issue',
        'communications_outage',
        'access_issue',
        'operational',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE public.incident_source AS ENUM (
        'manual',
        'sensor',
        'provider',
        'monitoring',
        'system',
        'imported',
        'unknown'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;