# Synthetic Campus Seed Data

Place SQL seed files and synthetic campus topology datasets here.
Per the PRD/SRD, all campus data used for judging and demonstration must remain synthetic and reproducible.

Apply `00001_seed_campus.sql` first, then `00002_seed_incidents.sql` after
migrations `00003_incident_domain_types.sql` and
`00004_incident_entity_state.sql`. The incident seed uses graph nodes from the
campus seed and only records the explicitly linked entities.
