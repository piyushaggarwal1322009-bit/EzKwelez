# EzyKwelez — Software Requirements Document (SRD)

**Document status:** Phase 1 — Locked baseline  
**Version:** 1.0  
**System:** EzyKwelez  
**Primary architecture:** Web client + FastAPI modular backend + Supabase Postgres/Auth

---

## 1. Purpose

This document converts the PRD into implementation-level software requirements. Antigravity must treat this file as the implementation contract for the MVP unless a later phase explicitly changes a requirement.

Priority levels:

- **P0:** required for the judging MVP;
- **P1:** valuable but can be reduced if schedule pressure exists;
- **P2:** future enhancement.

---

## 2. System Roles

### 2.1 Student

Can:
- authenticate;
- see incidents relevant to published student-facing information;
- view the effect of an approved recovery action on their class/location;
- read basic disruption explanations.

Cannot:
- create or approve operational recovery plans;
- mutate campus dependencies;
- access administrator analytics or audit logs.

### 2.2 Operator

Can:
- access the command center;
- create, update, and resolve incidents;
- inspect dependency relationships;
- calculate blast radius;
- generate and compare recovery plans;
- run what-if simulations;
- approve a recovery plan;
- publish a student-facing update;
- inspect audit history;
- query the AI Operations Analyst.

### 2.3 Future roles

Not required for MVP: super-admin, facilities manager, security manager, event manager.

---

## 3. Functional Requirements

## FR-001 — Authentication [P0]

The system shall use Supabase Auth for user authentication.

Acceptance criteria:
- unauthenticated users cannot access protected operator pages;
- the authenticated session is available to the application;
- backend protected endpoints verify the authenticated identity/token;
- role information is loaded from application profile data;
- logout invalidates the client session.

---

## FR-002 — Authorization [P0]

The system shall enforce role-based authorization on the backend and at the database layer where applicable.

Acceptance criteria:
- a student request to an operator-only endpoint is rejected;
- object-level access is checked using the authenticated identity;
- operator authorization is not based solely on hidden frontend buttons;
- Supabase RLS policies are enabled for exposed application tables.

---

## FR-003 — Campus Model [P0]

The system shall represent:

```text
Campus
 -> Building
 -> Zone/Room
 -> Resource
```

and academic relationships:

```text
Course/Class
 -> Scheduled Room
 -> Faculty
 -> Student Cohort
```

The model shall support dependency edges between operational entities.

---

## FR-004 — Dependency Graph [P0]

The system shall represent dependencies as typed relationships.

Minimum dependency types:

- `POWERED_BY`
- `NETWORKED_BY`
- `LOCATED_IN`
- `OCCUPIES`
- `REQUIRES_RESOURCE`
- `ATTENDED_BY`
- `SERVES`
- `ALTERNATIVE_TO`

The domain model may add types where necessary, but new dependency types require explicit domain meaning and tests.

Acceptance criteria:
- graph traversal from an incident target returns reachable impacted entities;
- traversal is deterministic for the same campus snapshot and incident;
- cycles do not create infinite traversal;
- depth and/or visited-node controls are used.

---

## FR-005 — Incident Creation [P0]

An operator shall be able to create an incident with:

- incident type;
- title/summary;
- target entity;
- severity input;
- start time;
- expected duration;
- optional description;
- source (`operator`, `simulation`, future external source);
- status (`draft`, `active`, `resolved`, `cancelled`).

Validation shall reject incomplete or impossible combinations.

---

## FR-006 — Blast Radius Analysis [P0]

Given an active incident, the system shall identify:

- directly impacted entities;
- second-order/secondary impacts;
- affected rooms/buildings/resources;
- affected classes;
- estimated affected students/cohorts;
- affected faculty where modeled;
- dependency paths explaining impact.

The result shall be persisted or reproducibly recalculable.

---

## FR-007 — Impact Score [P0]

The system shall calculate a transparent impact score from named components.

The initial model shall be configuration-driven rather than hardcoded across multiple files.

Example conceptual inputs:

```text
people impact
resource criticality
incident duration
dependency depth
academic importance
capacity pressure
```

The final weighting shall live in a dedicated domain configuration/model and be covered by tests.

The UI shall expose the major contributing factors.

---

## FR-008 — Recovery Candidate Generation [P0]

For an incident with recoverable impacts, the system shall identify candidate alternatives.

Example candidate sources:

- available rooms;
- alternate buildings;
- available resources;
- rescheduling windows;
- alternate event locations.

The generator shall operate from structured data and constraints.

It must not ask an LLM to invent a room, resource, capacity, or schedule.

---

## FR-009 — Constraint Validation [P0]

A candidate recovery action shall be considered feasible only when required constraints pass.

Minimum constraints:

1. replacement room capacity is sufficient;
2. room is available in the required time window;
3. required equipment/resources are available;
4. the action does not create a timetable collision;
5. the target is a valid campus entity;
6. user has authority to approve/apply the action.

Additional constraints can be introduced only with corresponding tests.

---

## FR-010 — Recovery Plan Generation [P0]

The system shall produce multiple feasible recovery plans when the dataset allows it.

Each plan shall contain:

- plan ID;
- affected incident;
- actions;
- validation result;
- predicted affected population;
- estimated time lost;
- travel/displacement estimate where available;
- conflicts;
- objective score;
- explanation factors.

---

## FR-011 — Recovery Optimization [P0]

The optimizer shall compare feasible plans using a documented objective function.

Conceptual objective:

```text
Minimize:
  student disruption
+ time lost
+ schedule/resource conflicts
+ movement burden
+ operational cost (if modeled)
```

Weights shall be configurable.

The optimizer shall never select an invalid plan.

---

## FR-012 — What-If Simulation [P0]

The system shall allow an operator to modify a scenario and re-run impact/recovery calculations without mutating the production campus state.

Examples:

- outage duration changes;
- additional students arrive;
- building becomes unavailable;
- alternate gate closes;
- event attendance changes;
- weather factor changes.

A simulation must be isolated from authoritative production data until explicitly approved.

---

## FR-013 — Before/After Comparison [P0]

The system shall compare baseline vs selected intervention.

Minimum comparison fields:

- total affected students;
- affected classes;
- impacted resources;
- impact score;
- estimated disruption time;
- optionally aggregate student-hours affected/recovered.

---

## FR-014 — Human Approval [P0]

A generated plan shall not automatically become an active campus change.

Operator workflow:

```text
Generated
 -> Reviewed
 -> Simulated
 -> Approved
 -> Published/Applied
```

---

## FR-015 — Student-Facing Update [P0]

After approval, the system shall expose only necessary student-facing information.

Example:

```text
Physics Lab
B204 -> C204

Reason: temporary building outage
Effective: 14:00
```

The student view shall not expose internal scoring weights, confidential operational notes, or unrestricted audit data.

---

## FR-016 — Audit Log [P1]

The system shall record major operator actions:

- incident created/updated;
- analysis run;
- simulation run;
- recovery plan approved;
- student update published.

Each record should include actor, action, target, timestamp, and a structured metadata payload where useful.

---

## FR-017 — AI Operations Analyst [P0]

The system shall expose a backend AI service behind a provider-independent interface.

The AI may answer:

- why an incident is high impact;
- which dependencies caused an impact;
- why a plan ranked higher;
- what changes under a scenario;
- concise operator summaries.

The AI must receive a structured context produced by the application engine.

The AI must not create authoritative facts that are not present in the structured context.

If required data is missing, it must say so.

---

## FR-018 — Explainability [P0]

Every major impact score and recovery recommendation shall have machine-readable reasons.

Required concept:

```text
RecommendationReason
- factor
- observed value
- effect on result
- human-readable label
```

This structure should be used by both the UI and AI layer.

---

## 4. API Requirements

The exact route naming may evolve during implementation, but the backend shall preserve these logical capabilities:

```text
GET    /health
GET    /me
GET    /campus/overview
GET    /campus/entities/:id
POST   /incidents
GET    /incidents
GET    /incidents/:id
POST   /incidents/:id/analyze
POST   /incidents/:id/simulate
POST   /incidents/:id/recovery-plans/generate
POST   /recovery-plans/:id/simulate
POST   /recovery-plans/:id/approve
GET    /incidents/:id/blast-radius
GET    /audit
POST   /ai/analyze
```

Routes should be grouped by domain, not by individual database table.

API responses should use stable DTO/schema models rather than leaking raw database structures into the web application.

---

## 5. Non-Functional Requirements

### NFR-001 — Performance [P0]

For the seeded hackathon campus:

- normal read APIs target < 500 ms server processing time excluding network variance;
- graph/blast-radius analysis target < 2 seconds;
- recovery optimization target < 3 seconds for the seeded scenario;
- the UI shall show a loading state for longer operations.

These are MVP targets, not guarantees for arbitrary campus sizes.

### NFR-002 — Reliability [P0]

The frontend shall handle API failure states gracefully.

The backend shall return structured errors and meaningful HTTP status codes.

### NFR-003 — Security [P0]

Follow OWASP API Security Top 10 principles, especially:

- object-level authorization;
- authentication;
- property-level authorization;
- resource limits;
- function-level authorization;
- security configuration;
- API inventory;
- safe external API consumption.

### NFR-004 — Maintainability [P0]

Follow SOLID principles. Business rules must remain independently testable and should not be hidden inside route handlers, UI components, or LLM prompts.

### NFR-005 — Observability [P1]

Structured server logs shall include request correlation information and domain operation identifiers where useful, without leaking secrets or sensitive student data.

### NFR-006 — Accessibility [P0]

Core workflows shall support keyboard navigation, visible focus, readable contrast, semantic controls, and reduced-motion behavior.

### NFR-007 — Responsive behavior [P0]

The operator interface is desktop-first but must remain usable on tablet-sized displays. The student view must be mobile-friendly.

---

## 6. Data Requirements

### Required entities

```text
profiles
campuses
buildings
zones
rooms
resources
dependencies
courses
classes
student_cohorts
events
incidents
incident_impacts
interventions
recovery_plans
recovery_plan_actions
simulation_runs
audit_logs
```

The schema should use foreign keys, timestamps, explicit enums/status values where appropriate, and indexes for common lookup paths.

### Synthetic data requirements

Seed data must form a coherent network. Random rows without meaningful relationships are unacceptable.

The primary scenario must have:

- at least 4 buildings;
- at least 15 rooms;
- multiple room capacities;
- at least 2 labs with distinct equipment requirements;
- multiple scheduled classes;
- at least 100 synthetic student records or cohort-equivalents;
- multiple infrastructure dependencies;
- at least 3 viable recovery destinations for the demo scenario.

The dataset may be smaller during early development, but the final demo dataset must support non-trivial optimization.

---

## 7. Error Handling Requirements

Errors shall be categorized at the application boundary, for example:

```text
ValidationError
AuthorizationError
NotFoundError
ConflictError
ConstraintViolationError
SimulationError
ExternalServiceError
InternalError
```

Frontend messages should be human-readable. Backend logs may contain deeper technical context.

AI failures must not make the core disruption analysis unavailable.

---

## 8. Definition of Done by Technical Layer

### Domain

Core graph, impact, constraint, and optimization logic has unit tests.

### API

Protected endpoints validate auth and return typed responses.

### Database

Migrations are reproducible and RLS policies are tested for key tables.

### Frontend

Core screens consume real APIs and show loading/empty/error/success states.

### AI

Provider failures degrade gracefully and AI never becomes the source of truth.

### Deployment

Production environment uses environment variables and contains no committed secrets.

---

## 9. Out-of-Scope Technical Temptations

Do not introduce these merely because they look impressive:

- microservices;
- Kubernetes;
- event buses;
- custom ML training pipelines;
- real-time WebSocket infrastructure unless a measured requirement exists;
- 3D engines;
- complex graph databases.

A modular FastAPI backend with Postgres is sufficient for the MVP. Complexity must be justified by an actual requirement.
