# EzyKwelez — System Architecture

**Document status:** Phase 1 — Locked baseline  
**Version:** 1.0  
**Architecture style:** Modular monolith backend + Next.js web client + Supabase-managed Postgres/Auth

---

## 1. Architectural Goal

Build a system where the **campus reasoning engine is isolated from the web presentation and AI provider**.

The architecture must make it possible to:

- replace the UI without rewriting the domain engine;
- replace Supabase or the persistence adapter later without rewriting domain rules;
- replace the LLM provider without changing business logic;
- test graph/impact/optimization logic without a running browser or external AI;
- deploy the web and API independently.

---

## 2. High-Level Architecture

```text
                         EzyKwelez Web
                Next.js + TypeScript + Tailwind
                              |
                        HTTPS / JSON API
                              |
                     +--------v--------+
                     |     FastAPI     |
                     |   API Boundary  |
                     +--------+--------+
                              |
              +---------------+----------------+
              |                                |
      +-------v--------+              +--------v--------+
      | Application    |              | AI Application  |
      | Services       |              | Service         |
      +-------+--------+              +--------+--------+
              |                                |
      +-------v------------------+      +------v-------+
      | Domain Engine             |      | LLM Adapter  |
      |                          |      | / Provider   |
      | Graph                   |      +--------------+
      | Blast Radius            |
      | Impact Scoring          |
      | Constraints             |
      | Recovery Generation     |
      | Optimization             |
      | Simulation               |
      +-------+------------------+
              |
      +-------v------------------+
      | Repository / Data Layer  |
      +-------+------------------+
              |
      +-------v------------------+
      | Supabase Postgres        |
      | + Auth                   |
      +--------------------------+
```

Deployment:

```text
Next.js Web  -> Vercel
FastAPI API  -> Render
Auth + DB    -> Supabase
```

Next.js's App Router is the recommended routing model for the web application. FastAPI provides the API layer and typed request/response validation. Supabase provides authentication and Postgres persistence. citeturn692117search4turn692117search0turn692117search1

---

## 3. Repository Architecture

Preferred monorepo shape:

```text
EzyKwelez/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   └── shared/
├── supabase/
│   ├── migrations/
│   ├── seed/
│   └── tests/
├── docs/
├── scripts/
├── tests/
├── .github/
├── .env.example
├── .gitignore
└── README.md
```

The final implementation may adjust exact file placement, but responsibility boundaries must remain equivalent.

---

## 4. Frontend Architecture

Use Next.js + TypeScript + Tailwind with a domain-oriented component structure.

Preferred conceptual areas:

```text
app/
  (public)/
  (auth)/
  operator/
  student/

components/
  ui/
  campus/
  incidents/
  recovery/
  simulation/
  ai/

features/
  incidents/
  blast-radius/
  recovery/
  simulation/

lib/
  api/
  auth/
  validation/
  formatting/
```

### Frontend rules

- UI components do presentation, not business decisions.
- API access is centralized through a typed client layer.
- Feature logic belongs in feature modules/hooks/services, not giant page components.
- Reusable primitives live in `components/ui`.
- Do not duplicate API types across dozens of components.
- Use server/client boundaries intentionally.
- Loading, error, empty, and success states are first-class UI states.

---

## 5. Backend Architecture

Use a modular monolith.

Conceptual structure:

```text
app/
├── main.py
├── api/
│   ├── routes/
│   ├── dependencies.py
│   └── errors.py
├── application/
│   ├── incident_service.py
│   ├── blast_radius_service.py
│   ├── recovery_service.py
│   ├── simulation_service.py
│   └── ai_service.py
├── domain/
│   ├── campus/
│   ├── incidents/
│   ├── graph/
│   ├── impact/
│   ├── recovery/
│   ├── simulation/
│   └── common/
├── infrastructure/
│   ├── repositories/
│   ├── auth/
│   ├── llm/
│   └── persistence/
├── schemas/
└── config/
```

The exact names can differ; the separation of responsibilities cannot.

---

## 6. Domain Boundaries

### Campus domain

Owns campus entities and relationships.

### Incident domain

Owns incident lifecycle and incident metadata.

### Graph domain

Owns typed dependency traversal and impact paths.

### Impact domain

Owns severity/impact calculations.

### Recovery domain

Owns candidate generation, constraint validation, plan creation, scoring, and optimization.

### Simulation domain

Owns isolated scenario state and counterfactual execution.

### AI domain/application layer

Owns conversion of verified structured system state into LLM context, provider calls, output validation, and fallback behavior.

---

## 7. Dependency Direction

The required dependency direction is:

```text
API
  -> Application
      -> Domain abstractions
          <- Infrastructure implementations
```

The domain must not import FastAPI, Supabase SDKs, HTTP client classes, or a specific LLM SDK.

Infrastructure depends on domain abstractions, not the other way around.

This follows the dependency-inversion intent of SOLID architecture: higher-level application/domain rules depend on abstractions rather than low-level implementation details. citeturn763248search13turn763248search12

---

## 8. Core Domain Flow

### Incident analysis

```text
POST /incidents/:id/analyze
        |
        v
Application service
        |
        +--> Load incident
        +--> Load campus snapshot
        +--> Traverse dependency graph
        +--> Calculate impact
        +--> Build explanation factors
        |
        v
Return typed AnalysisResult
```

### Recovery planning

```text
AnalysisResult
     |
     v
Candidate generator
     |
     v
Constraint validator
     |
     v
Feasible candidates
     |
     v
Plan builder
     |
     v
Optimizer
     |
     v
Ranked RecoveryPlans
```

### Simulation

```text
Baseline campus snapshot
        |
        +--> apply hypothetical changes
        |
        v
isolated simulation state
        |
        v
re-run graph/impact/recovery calculations
        |
        v
SimulationResult
```

Simulation state must not mutate production data unless an operator explicitly approves a resulting recovery plan.

---

## 9. Data Architecture

Supabase Postgres is the authoritative persistence store.

### Core relationship model

```text
campus
 ├── buildings
 │    ├── zones
 │    │    └── rooms
 │    └── infrastructure dependencies
 ├── resources
 ├── classes
 ├── student cohorts
 ├── events
 └── dependencies

incident
  └── target entity
       └── graph traversal
            └── incident impact
                 └── recovery plans
                      └── simulation runs
```

### Repository boundary

Domain/application code should use interfaces such as:

```text
CampusRepository
IncidentRepository
RecoveryPlanRepository
SimulationRepository
AuditRepository
```

Infrastructure provides the Supabase/Postgres implementation.

---

## 10. Authentication and Authorization

Supabase Auth provides identity/session management. The API verifies the authenticated user and derives authorization from application profile/role data.

Use database RLS for exposed application tables. Supabase recommends enabling RLS on exposed tables and explicitly testing allow/deny behavior for relevant operations. citeturn692117search1turn692117search2

Important:

- never expose the Supabase service role key to the browser;
- never treat a frontend role flag as authorization;
- backend checks are mandatory for protected operations;
- object IDs received from clients require object-level authorization;
- views/functions must be reviewed for RLS implications.

---

## 11. AI Architecture

AI is a replaceable adapter.

```text
AIApplicationService
        |
        v
AIProvider interface
   /              \
Provider A       Provider B
```

The AI service receives an explicitly constructed `AnalysisContext`, for example:

```text
incident summary
impact metrics
affected entities
dependency reasons
ranked recovery plans
simulation comparison
```

The LLM returns a constrained response such as:

```text
summary
reasons[]
recommended_plan_id (optional)
uncertainties[]
```

The backend validates the output before returning it.

The AI provider must not have direct write access to the production database.

---

## 12. API Design Rules

- REST/JSON for MVP.
- Version the API boundary if/when compatibility requires it.
- Use typed request and response schemas.
- Use consistent error envelopes.
- Do not expose database implementation details.
- Validate all client-provided IDs and state changes.
- Restrict expensive operations with sensible rate/resource limits.
- Keep an inventory of deployed API routes.

These controls align with OWASP's API security guidance, including authorization, resource consumption, security configuration, inventory management, and safe third-party API consumption. citeturn763248search1

---

## 13. Deployment Architecture

### Vercel

Hosts the Next.js application.

Environment examples:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_API_BASE_URL
```

### Render

Hosts the FastAPI service.

Environment examples:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY   # server only
SUPABASE_DB_URL             # server only, if used
LLM_API_KEY                 # server only
ALLOWED_ORIGINS
```

Render's documented FastAPI deployment uses an ASGI server such as Uvicorn with the service listening on the platform-provided port. citeturn692117search0

### Supabase

Provides:

- Auth;
- Postgres;
- optional storage if required later.

---

## 14. Caching and State Rules

Do not prematurely introduce Redis or another cache.

For the MVP:

- authoritative campus/incident state lives in Postgres;
- simulation state is transient or persisted as a simulation record;
- frontend caching is allowed only where it does not create stale operational decisions;
- any recommendation must be based on a known campus snapshot/version.

---

## 15. Architectural Anti-Patterns to Reject

Antigravity must reject or refactor these patterns:

- route handlers containing graph algorithms;
- UI components directly calculating impact scores;
- LLM prompts containing hidden business rules;
- database models used directly as API response contracts;
- direct service-role database access from the browser;
- giant `utils.ts`/`helpers.py` files;
- one mega-service containing incidents, optimization, AI, and database logic;
- speculative microservices;
- duplicated validation rules across frontend and backend;
- untyped `any` data crossing major boundaries.

---

## 16. Architectural Definition of Done

The architecture is acceptable when:

1. the blast-radius engine can be unit-tested with in-memory domain data;
2. the optimizer can be tested without Supabase;
3. the AI service can be tested with a fake provider;
4. API tests can run without a browser;
5. frontend tests can mock the API cleanly;
6. database implementation details are not imported into domain modules;
7. frontend cannot bypass backend authorization for privileged operations.
