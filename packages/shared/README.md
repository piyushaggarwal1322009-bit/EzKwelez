# @ezykwelez/shared

Shared package for genuinely shared contracts across the EzyKwelez monorepo.

## Scope

- Common Enums (e.g. `IncidentSeverity`, `IncidentStatus`, `EntityType`)
- Data Transfer Contracts & API Types (e.g. `HealthCheckResponse`, `IncidentSummary`)
- System Constants (e.g. `APP_NAME`, `SEVERITY_WEIGHTS`)

## Architectural Guidelines

- **No Business Logic:** Do NOT place business or domain logic here.
- **No Monolithic Utils:** Do NOT turn this into a generic dumping ground for helper scripts.
- **Strict Typing:** All exports must be strictly typed and validated against Phase 0 specifications.
