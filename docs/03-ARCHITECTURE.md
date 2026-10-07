# EzyKwelez — Technical System Architecture & Domain Specification

**Document Status:** Approved Baseline (Phase 1)  
**Lead Architect:** Ishu (System Design & Architecture)  
**Contributors:** Piyush (Backend Integration), Tanisha (Frontend Architecture), Aile (UX/UI Design)  
**Target Topology:** Modular Monolith API (FastAPI) + Modern Web Client (Next.js) + Managed Postgres/Auth (Supabase)  
**Version:** 2.0  

---

## 1. Executive System Overview

EzyKwelez is an intelligent campus continuity and operational recovery platform. It replaces reactive, fragmented crisis coordination with an explainable, dependency-aware decision system.

The fundamental value proposition of EzyKwelez is answering one central question:
> **"When something goes wrong on campus, what else is affected, and what is the optimal, constraint-safe way to recover?"**

### 1.1 The Core Closed Decision Loop

The architecture is structured strictly around an eight-stage closed decision loop:

```text
Campus State
      ↓
Dependencies (Graph Traversal)
      ↓
Incidents / Conditions (Blast Radius)
      ↓
Impact Analysis (Transparent Scoring)
      ↓
Recovery Options (Candidate Generation & Constraint Solving)
      ↓
Optimization (Multi-Objective Disruption Minimization)
      ↓
Simulation (Counterfactual Scenario Testing)
      ↓
Human-Readable Explanation (Grounded AI Synthesis)
```

Each stage operates as an independent bounded context with explicit contracts, ensuring capabilities evolve without systemic coupling.

---

## 2. System Context & Container Architecture

### 2.1 C4 System Context Diagram (Level 1)

```mermaid
C4Context
    title System Context Diagram for EzyKwelez

    Person(operator, "Campus Operator", "Manages incidents, evaluates recovery plans, and approves interventions.")
    Person(student, "Campus Student", "Views live room conditions, class relocations, and schedule updates.")

    Enterprise_Boundary(ezy_boundary, "EzyKwelez Platform") {
        System(ezy_system, "EzyKwelez Core", "Provides dependency-aware blast radius analysis, optimization, simulation, and live condition monitoring.")
    }

    System_Ext(iot_providers, "Campus IoT / Telemetry Providers", "Door counters, Wi-Fi controllers (Cisco/Aruba), and simulated sensors.")
    System_Ext(llm_providers, "External AI Providers", "Google Gemini / OpenAI / Anthropic LLM services.")
    System_Ext(supabase_cloud, "Supabase Managed Platform", "PostgreSQL database, Row Level Security, and Auth services.")

    Rel(operator, ezy_system, "Manages incidents, runs simulations, approves plans", "HTTPS")
    Rel(student, ezy_system, "Views live conditions and class updates", "HTTPS")
    Rel(ezy_system, iot_providers, "Pulls occupancy & connectivity telemetry", "HTTPS/REST")
    Rel(ezy_system, llm_providers, "Requests grounded natural language summaries", "HTTPS/REST")
    Rel(ezy_system, supabase_cloud, "Persists state & authenticates tokens", "PostgreSQL Wire / HTTPS")
```

### 2.2 C4 Container Diagram (Level 2)

```mermaid
C4Container
    title Container Diagram for EzyKwelez

    Person(user, "User (Operator / Student)", "Web browser user")

    Container(web_app, "Web Client", "Next.js 14, TypeScript, TailwindCSS", "Delivers responsive operator command center and student live conditions views.")
    Container(api_app, "API Application (Modular Monolith)", "FastAPI, Python 3.11+, Pydantic", "Executes graph traversals, impact scoring, recovery optimization, and AI grounding.")
    ContainerDb(database, "Database & Auth Store", "Supabase PostgreSQL 15+", "Stores campus entities, dependency topology, incidents, recovery records, and audit logs.")

    System_Ext(mock_telemetry, "Mock / Simulated Provider", "Python In-Memory Adapter", "Generates deterministic telemetry for testing and simulation drills.")
    System_Ext(real_telemetry, "Hardware IoT Gateway", "Network / Sensor API", "Live Wi-Fi and door counter feeds.")
    System_Ext(ai_provider, "AI Engine Adapter", "Gemini / OpenAI API", "Translates structured mathematical facts into natural language.")

    Rel(user, web_app, "Interacts via", "HTTPS")
    Rel(web_app, api_app, "Consumes typed API", "HTTPS / JSON")
    Rel(api_app, database, "Reads/Writes with RLS", "Postgres Driver (asyncpg/SQLAlchemy)")
    Rel(api_app, mock_telemetry, "Invokes via Provider Interface", "In-Process")
    Rel(api_app, real_telemetry, "Invokes via Provider Interface", "HTTPS")
    Rel(api_app, ai_provider, "Sends verified structured context", "HTTPS")
```

---

## 3. Layered Architecture & Dependency Rule

The backend adheres to a strict **Hexagonal / Clean Layered Architecture**:

```text
Presentation Layer (HTTP Routes, FastAPI Routers, Schema Validation)
      ↓
Application Layer (Use Case Orchestration, Workflows, Provider Coordination)
      ↓
Domain Layer (Pure Entities, Business Invariants, Graph Traversal, Optimizers)
      ↑ (Dependency Inversion)
Infrastructure Layer (Database Repositories, Hardware Adapters, LLM Clients)
```

```mermaid
graph TD
    subgraph Presentation["1. Presentation Layer (apps/api/app/api)"]
        Routes["FastAPI Routers"]
        Deps["Dependency Injection"]
        Middlewares["Auth & Error Middlewares"]
    end

    subgraph Application["2. Application Layer (apps/api/app/application)"]
        ConditionService["ConditionAggregationService"]
        BlastRadiusService["BlastRadiusService"]
        RecoveryService["RecoveryService"]
        SimulationService["SimulationService"]
        AIService["AIExplanationService"]
    end

    subgraph Domain["3. Domain Layer (apps/api/app/domain)"]
        CampusDomain["Campus & Location Entities"]
        GraphDomain["Graph Traversal & Cycles"]
        ImpactDomain["Impact Scoring Engine"]
        RecoveryDomain["Constraint Solver & Optimizer"]
        ProvenanceDomain["Data Mode & Provenance Rules"]
        Ports["Abstract Repository & Provider Interfaces"]
    end

    subgraph Infrastructure["4. Infrastructure Layer (apps/api/app/infrastructure)"]
        SupabaseRepo["Supabase / Postgres Repositories"]
        MockProviders["Mock Telemetry Adapters"]
        RealProviders["IoT / Wi-Fi Gateway Adapters"]
        LLMAdapter["LLM Provider Adapter"]
    end

    Presentation --> Application
    Application --> Domain
    Infrastructure -.->|Implements Ports| Domain
    Application --> Infrastructure
```

### Strict Architectural Dependency Constraints:
1. **Domain Purity:** The Domain layer MUST NOT import FastAPI, Pydantic (outside schemas), Supabase SDK, HTTP clients (`httpx`, `requests`), or third-party AI SDKs.
2. **One-Way Inversion:** Infrastructure implements abstract interfaces defined in the Domain/Application layers.
3. **No Direct UI-to-Database Coupling:** The frontend client NEVER communicates directly with Supabase database tables or service-role keys. All operations pass through the FastAPI API layer.

---

## 4. Domain Boundaries & Bounded Contexts

EzyKwelez partitions campus continuity into eight distinct bounded contexts:

```text
EzyKwelez Core
├── 1. Campus & Facilities Domain
│   ├── Location (Hierarchy: Campus → Building → Zone → Room)
│   ├── Occupancy (Current headcount, capacity, thresholds)
│   ├── Connectivity (Signal score, RSSI dBm, network quality)
│   └── Live Conditions Aggregation
├── 2. Dependency Graph Domain
│   ├── Topology Nodes & Typed Edges
│   ├── Cycle Detection & Depth-Bounded Traversal
│   └── Upstream / Downstream Reachability
├── 3. Incident Management Domain
│   ├── Lifecycle (Reported → Investigating → Active → Mitigated → Resolved)
│   ├── Severity & Target Scope
│   └── Audit Trail Integration
├── 4. Blast Radius & Impact Analysis Domain
│   ├── Direct vs. Cascading Disruption
│   ├── Population & Academic Schedule Impact
│   └── Transparent Multi-Factor Impact Scoring
├── 5. Recovery Planning Domain
│   ├── Resource & Room Candidate Generation
│   ├── Feasibility & Hard Constraint Validation
│   └── Relocation Candidate Builder
├── 6. Multi-Objective Optimization Domain
│   ├── Objective Evaluation (Students Displaced, Travel Time, Room Waste)
│   └── Plan Ranking & Trade-off Scoring
├── 7. Counterfactual Simulation Domain
│   ├── Isolated Scenario Clones (Zero mutation on production tables)
│   ├── Parameter Mutation (Duration, Capacity, Availability)
│   └── Before-vs-After Delta Engine
└── 8. Grounded AI Explanation Domain
    ├── Structured Context Compilation
    ├── Read-Only Natural Language Translation
    └── Provider Fail-Safe Fallbacks
```

---

## 5. Live Campus Conditions & Extensible Provider Architecture

### 5.1 Extensible Entity Design (Zero Hardcoding)

The system must support the **Library** and **Canteen** out-of-the-box, while dynamically supporting any campus facility (**Computer Labs, Hostels, Study Halls, Auditoriums, Sports Complexes**) purely via data configuration.

```text
Location Record (DB) ──► Occupancy Provider ──► Connectivity Provider ──► Aggregation Service ──► API Response
```

### 5.2 Provider Port Interfaces

```python
from abc import ABC, abstractmethod
from typing import List
from app.domain.campus.models import OccupancySnapshot, ConnectivitySnapshot

class OccupancyProvider(ABC):
    @abstractmethod
    async def get_occupancy(self, location_id: str) -> OccupancySnapshot:
        """Retrieve occupancy metrics for a given location ID."""
        pass

    @abstractmethod
    async def get_all_occupancies(self, campus_id: str) -> List[OccupancySnapshot]:
        """Retrieve occupancy metrics for all locations in a campus."""
        pass

class ConnectivityProvider(ABC):
    @abstractmethod
    async def get_connectivity(self, location_id: str) -> ConnectivitySnapshot:
        """Retrieve Wi-Fi / connectivity metrics for a given location ID."""
        pass

    @abstractmethod
    async def get_all_connectivity(self, campus_id: str) -> List[ConnectivitySnapshot]:
        """Retrieve connectivity metrics for all locations in a campus."""
        pass
```

### 5.3 Authoritative Business Rules

To prevent business logic fragmentation, classifications are defined authoritatively in domain constants and shared across the monorepo:

#### Occupancy Classification Rules:
$$\text{Occupancy Percentage} = \left( \frac{\text{Current Students}}{\text{Capacity}} \right) \times 100$$

| Occupancy Range | Classification Status | Operational Meaning |
| :--- | :--- | :--- |
| **0% – 49%** | `Low` | Ample capacity available for relocation |
| **50% – 74%** | `Moderate` | Normal operational load |
| **75% – 89%** | `Busy` | High utilization; limited relocation buffer |
| **90% – 100%** | `Very Busy` | Near maximum capacity; not eligible for major additions |
| **> 100%** | `Over Capacity` | Critical bottleneck / safety threshold breached |

#### Connectivity Classification Rules:
| Signal Score (0–100) | Quality Rating | Network Characteristics |
| :--- | :--- | :--- |
| **80 – 100** | `Excellent` | High bandwidth, low latency, RSSI > -60 dBm |
| **60 – 79** | `Good` | Normal academic use, RSSI -60 to -70 dBm |
| **40 – 59** | `Fair` | Degraded speeds, potential packet loss |
| **20 – 39** | `Weak` | Intermittent connectivity, unsuitable for labs |
| **0 – 19** | `Very Weak` | Complete dropout or non-functional network |

---

## 6. Data Provenance & Operational Modes

Every operational metric, telemetry record, and API payload MUST explicitly declare its provenance.

```typescript
export enum DataMode {
  LIVE = "live",           // Verified hardware sensor telemetry (<5m freshness)
  SIMULATED = "simulated", // Synthetic scenario or counterfactual simulation run
  ESTIMATED = "estimated", // Statistical calculation (e.g. timetable * attendance rate)
  UNKNOWN = "unknown",     // Stale data, provider timeout, or unverified source
}
```

### Provenance Safeguards:
1. **Mock Providers:** Structurally incapable of outputting `DataMode.LIVE`. Always tagged as `SIMULATED` or `ESTIMATED`.
2. **Simulation Runs:** Isolated from production tables. All generated records are stamped `SIMULATED`.
3. **UI Transparency:** The frontend renders distinct visual indicators for each data mode to ensure no synthetic data can be mistaken for live telemetry.

---

## 7. Database Architecture & Schema Design

The persistence tier is built on PostgreSQL (managed via Supabase).

### 7.1 Schema Diagram (Core Entities)

```mermaid
erDiagram
    CAMPUSES ||--o{ BUILDINGS : contains
    BUILDINGS ||--o{ ROOMS : contains
    ROOMS ||--o{ DEPENDENCY_NODES : maps_to
    DEPENDENCY_NODES ||--o{ DEPENDENCY_EDGES : source
    DEPENDENCY_NODES ||--o{ DEPENDENCY_EDGES : target
    INCIDENTS ||--o{ INCIDENT_IMPACTS : calculates
    INCIDENTS ||--o{ RECOVERY_PLANS : generates
    RECOVERY_PLANS ||--o{ RECOVERY_PLAN_ACTIONS : contains
    ROOMS ||--o{ OCCUPANCY_SNAPSHOTS : records
    ROOMS ||--o{ CONNECTIVITY_SNAPSHOTS : records
    INCIDENTS ||--o{ SIMULATION_RUNS : spawns

    CAMPUSES {
        uuid id PK
        string name
        string code UK
        string timezone
        timestamptz created_at
    }

    BUILDINGS {
        uuid id PK
        uuid campus_id FK
        string name
        string code
        int total_floors
    }

    ROOMS {
        uuid id PK
        uuid building_id FK
        string room_number
        string room_type
        int capacity
        jsonb metadata
    }

    DEPENDENCY_NODES {
        uuid id PK
        uuid campus_id FK
        string entity_type
        uuid entity_id
        string name
        string criticality
    }

    DEPENDENCY_EDGES {
        uuid id PK
        uuid source_node_id FK
        uuid target_node_id FK
        string relationship_type
        string criticality
        float weight
    }

    INCIDENTS {
        uuid id PK
        uuid campus_id FK
        uuid target_entity_id
        string target_entity_type
        string title
        string severity
        string status
        string data_mode
        timestamptz started_at
        timestamptz resolved_at
    }

    RECOVERY_PLANS {
        uuid id PK
        uuid incident_id FK
        string status
        float disruption_score
        float students_affected
        jsonb explanation_factors
        timestamptz created_at
    }

    OCCUPANCY_SNAPSHOTS {
        uuid id PK
        uuid room_id FK
        int current_students
        int capacity
        float occupancy_percentage
        string status
        string data_mode
        timestamptz recorded_at
    }

    CONNECTIVITY_SNAPSHOTS {
        uuid id PK
        uuid room_id FK
        int signal_score
        string quality
        string network_name
        int dbm
        string data_mode
        timestamptz recorded_at
    }
```

### 7.2 Current (Phase 1 Baseline) vs. Planned Tables

| Table Name | Phase | Purpose | Indexes |
| :--- | :--- | :--- | :--- |
| `campuses` | **Current** | University/Campus root entity | `id`, `code` |
| `buildings` | **Current** | Physical building structures | `id`, `campus_id` |
| `rooms` (campus_locations) | **Current** | Individual rooms, labs, canteens | `id`, `building_id`, `room_type` |
| `occupancy_snapshots` | **Current** | Headcount & capacity logs | `room_id, recorded_at DESC` |
| `connectivity_snapshots` | **Current** | Wi-Fi signal & latency metrics | `room_id, recorded_at DESC` |
| `dependency_nodes` | **Current** | Graph vertex definitions | `campus_id`, `(entity_type, entity_id)` |
| `dependency_edges` | **Current** | Directed graph edges | `source_node_id`, `target_node_id` |
| `incidents` | **Current** | Operational incident records | `campus_id`, `status`, `started_at` |
| `recovery_plans` | **Current** | Generated recovery candidates | `incident_id`, `status` |
| `recovery_plan_actions` | **Current** | Step-by-step room reassignments | `recovery_plan_id` |
| `simulation_runs` | **Current** | Isolated scenario executions | `incident_id`, `created_at` |
| `audit_logs` | **Current** | Tamper-evident operator action trail | `campus_id`, `actor_id`, `created_at` |
| `courses` & `classes` | Planned (Phase 2) | Full timetable & cohort mapping | `room_id`, `schedule_window` |
| `iot_device_registry` | Planned (Phase 2) | Physical hardware sensor binding | `device_mac`, `room_id` |

---

## 8. API Contract Specifications

All API endpoints adhere to the standard RESTful envelope format with strict type safety across Python and TypeScript.

### 8.1 Core Endpoint Catalog

```http
# System & Diagnostics
GET    /api/health                             -> HealthCheckResponse

# Campus Facilities & Live Conditions
GET    /api/campus/locations                   -> ApiResponseEnvelope<CampusLocation[]>
GET    /api/campus/conditions                  -> ApiResponseEnvelope<LiveCampusConditionsResponse>
GET    /api/campus/conditions/{locationId}     -> ApiResponseEnvelope<LocationCondition>
GET    /api/campus/graph                       -> ApiResponseEnvelope<DependencyGraphSnapshot>

# Incident Lifecycle & Blast Radius
GET    /api/incidents                          -> ApiResponseEnvelope<IncidentSummary[]>
POST   /api/incidents                          -> ApiResponseEnvelope<IncidentSummary>
GET    /api/incidents/{id}                     -> ApiResponseEnvelope<IncidentDetail>
POST   /api/incidents/{id}/analyze             -> ApiResponseEnvelope<BlastRadiusSummary>

# Recovery & Optimization
GET    /api/incidents/{id}/recovery-plans      -> ApiResponseEnvelope<RecoveryOptionSummary[]>
POST   /api/incidents/{id}/recovery-plans/generate -> ApiResponseEnvelope<RecoveryOptionSummary[]>
POST   /api/recovery-plans/{id}/approve        -> ApiResponseEnvelope<RecoveryPlanApprovalResult>

# Simulation & What-If Drills
POST   /api/incidents/{id}/simulate            -> ApiResponseEnvelope<SimulationResult>

# Grounded AI Operational Explanation
POST   /api/ai/explain                         -> ApiResponseEnvelope<AIExplanationResponse>
```

### 8.2 Standard Error Envelope

```json
{
  "error": {
    "code": "LOCATION_NOT_FOUND",
    "message": "Campus location with ID 'loc_lib_02' does not exist.",
    "requestId": "req_01h8x9p4k2",
    "details": {
      "locationId": "loc_lib_02"
    }
  }
}
```

---

## 9. Dependency Graph & Traversal Algorithm

The campus dependency graph is modeled as a Directed Acyclic Graph (DAG) with cycle-suppression safeguards.

```mermaid
graph TD
    PowerMain["Main Substation (POWER)"] -->|POWERED_BY| BuildingB["Building B (BUILDING)"]
    BuildingB -->|LOCATED_IN| Lab201["Physics Lab 201 (ROOM)"]
    BuildingB -->|LOCATED_IN| Room202["Lecture Hall 202 (ROOM)"]
    Lab201 -->|REQUIRES_RESOURCE| Spectrometer["Spectrometer Rig (RESOURCE)"]
    Room202 -->|OCCUPIES| Physics101["Physics 101 Lecture (CLASS)"]
    Physics101 -->|ATTENDED_BY| CohortA["Freshman Cohort A (STUDENTS: 120)"]
```

### Traversal Safeguards:
1. **Cycle Prevention:** Breadth-First Search (BFS) / Depth-First Search (DFS) maintains a `visited_nodes` set. If an edge creates a loop, traversal logs a warning and terminates the cycle branch.
2. **Depth Bounding:** Default maximum traversal depth is capped at 6 hops to prevent unbounded graph walking.
3. **Blast Radius Metric Calculation:**
$$\text{Disruption Score} = \sum_{n \in \text{Impacted Nodes}} \left( \text{CriticalityWeight}(n) \times \text{People}(n) \times \text{DurationHours} \right)$$

---

## 10. Multi-Objective Recovery Optimizer

When an incident causes room unavailability, the **Recovery Planning Engine** searches the campus graph for feasible replacements.

### 10.1 Hard Feasibility Constraints:
1. $\text{Capacity}(\text{Candidate Room}) \ge \text{Headcount}(\text{Displaced Class})$
2. $\text{Equipment}(\text{Candidate Room}) \supseteq \text{Required Equipment}(\text{Displaced Class})$
3. $\text{Schedule}(\text{Candidate Room}) \cap \text{Time Window} = \emptyset$ (No double booking)
4. $\text{Accessibility}(\text{Candidate Room}) = \text{True}$ (If required by class)

### 10.2 Objective Function (Minimization):
$$\text{Cost}(P) = w_1 \cdot \Delta \text{DisplacedStudents} + w_2 \cdot \text{WalkingDistanceMeters} + w_3 \cdot \text{CapacityWaste} + w_4 \cdot \text{ScheduleDelayMinutes}$$

* **Default Weights:** $w_1 = 0.40$, $w_2 = 0.25$, $w_3 = 0.20$, $w_4 = 0.15$.
* The optimizer ranks candidate plans and returns the top 3 options with machine-readable `RecommendationReason` factors.

---

## 11. AI Architecture & Explanation Boundary

The AI Operations Analyst is strictly isolated as a read-only summarization layer.

```mermaid
sequenceDiagram
    autonumber
    actor Operator
    participant API as FastAPI Boundary
    participant Engine as Deterministic Domain Engine
    participant AIAdapter as AI Provider Adapter (LLM)
    participant DB as Postgres Database

    Operator->>API: POST /api/ai/explain (incidentId)
    API->>Engine: get_verified_analysis_context(incidentId)
    Engine->>DB: Fetch incidents, blast radius, recovery plans
    DB-->>Engine: Raw entities
    Engine-->>API: Structured AnalysisContext (Verified JSON)
    API->>AIAdapter: explain_incident(AnalysisContext)
    AIAdapter-->>API: Grounded Narrative + Cited Factor IDs
    API-->>Operator: ApiResponseEnvelope<AIExplanationResponse>
```

### Grounding Rules:
* The LLM prompt is injected ONLY with verified engine outputs (counts, scores, reasons).
* The LLM is strictly prohibited from inventing new room numbers, changing student counts, or altering plan scores.
* If the LLM provider fails, times out, or returns invalid JSON, the system falls back to a deterministic template summary.

---

## 12. Security Architecture & Threat Model

EzyKwelez adheres to the **OWASP API Security Top 10**:

1. **Authentication & Identity:** Managed via Supabase Auth with JWT verification on all protected endpoints.
2. **Row Level Security (RLS):** Database policies enforce tenant and role isolation:
   - `student` role: Read-only access to published incidents and public room conditions.
   - `operator` role: Full access to incident creation, simulation runs, and plan approvals.
3. **Secret Segregation:**
   - Public frontend (`apps/web`): Only has access to `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Server backend (`apps/api`): Privately holds `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, and `AI_API_KEY`.
   - The Supabase Service Role Key is NEVER sent to the client browser.
4. **Input Validation:** Strict Pydantic models validate all incoming requests, preventing SQL injection and payload poisoning.
5. **CORS Configuration:** Explicit origin whitelisting (`ALLOWED_ORIGINS`) on Render deployments.

---

## 13. Reliability, Resilience & Graceful Degradation

```text
Incoming Telemetry Request
        │
        ▼
   Live Hardware Provider Online?
   ├── YES ──► Output Telemetry (DataMode.LIVE)
   └── NO / Timeout (2.0s)
               │
               ▼
        Cached Snapshot Available (<15m)?
        ├── YES ──► Return Cached Data (DataMode.UNKNOWN, stale=true)
        └── NO ──► Fallback to Estimated/Mock Model (DataMode.ESTIMATED)
```

* **Stale Over Fabricated Rule:** The system always prefers displaying a clearly marked stale reading over fabricating synthetic data as "live".
* **Circuit Breaking:** External API calls to IoT gateways and LLM providers have a 2.5-second timeout with automatic fallback to prevent thread exhaustion.

---

## 14. Observability & Monitoring

Every HTTP transaction generates a structured log record:

```json
{
  "timestamp": "2026-10-07T12:00:01.120Z",
  "requestId": "req_01h8x9p4k2",
  "method": "POST",
  "path": "/api/incidents/inc_01/analyze",
  "statusCode": 200,
  "durationMs": 42.6,
  "actorId": "usr_operator_88",
  "campusId": "cmp_main",
  "domainOperation": "BLAST_RADIUS_EVALUATION"
}
```

* **Zero PII Logging:** Student names, passwords, authorization bearer headers, and raw credentials are scrubbed prior to log formatting.
* **Health Check Endpoints:** `/api/health` performs active database pinging and reports sub-system readiness.

---

## 15. Deployment & CI/CD Topology

```mermaid
graph LR
    subgraph Source["GitHub Repository"]
        PR["Pull Request / main"]
    end

    subgraph CI["GitHub Actions CI Pipeline"]
        Lint["Lint (ESLint / Ruff)"]
        Typecheck["Typecheck (tsc / mypy)"]
        TestBackend["Pytest (Unit & Domain)"]
        Build["Build Web & Shared"]
    end

    subgraph CD["Automated Deployment"]
        VercelDeploy["Vercel (Next.js Web Client)"]
        RenderDeploy["Render (FastAPI Application)"]
        SupabaseDeploy["Supabase (PostgreSQL & Auth)"]
    end

    PR --> Lint --> Typecheck --> TestBackend --> Build
    Build -->|Merge to main| VercelDeploy
    Build -->|Merge to main| RenderDeploy
    Build -->|Migrations| SupabaseDeploy
```

---

## 16. Contract Ownership Matrix

| System Component | Frontend (`apps/web`) | Backend (`apps/api`) | Database (`supabase`) | AI Provider |
| :--- | :--- | :--- | :--- | :--- |
| **Presentation & UI Formatting** | **Owner** | Consumer | N/A | N/A |
| **Client Navigation & State** | **Owner** | N/A | N/A | N/A |
| **Domain Logic & Business Rules** | Formatter | **Authoritative Owner** | N/A | N/A |
| **Graph Traversal & Blast Radius** | Display | **Authoritative Owner** | N/A | N/A |
| **Recovery Optimization** | Display | **Authoritative Owner** | N/A | N/A |
| **Persistence & Constraints** | N/A | Client | **Authoritative Owner** | N/A |
| **Row Level Security (RLS)** | N/A | Enforcer | **Authoritative Owner** | N/A |
| **Telemetry Provenance Tagging** | Display | **Authoritative Owner** | Persistence | N/A |
| **Operational Explanation** | Display | Context Builder | N/A | **Translator** |

---

## 17. Architecture Decision Records (ADR) Index

The key architectural decisions governing this platform are formalized in `docs/adr/`:

1. [ADR-001: Modular Monolith vs. Microservices Architecture](file:///docs/adr/ADR-001-modular-monolith-vs-microservices.md)
2. [ADR-002: Provider / Adapter Architecture for Telemetry & Extensibility](file:///docs/adr/ADR-002-provider-adapter-architecture.md)
3. [ADR-003: RESTful API Contract Strategy & Envelope Standard](file:///docs/adr/ADR-003-api-contract-strategy.md)
4. [ADR-004: Data Provenance & Operational Data Modes](file:///docs/adr/ADR-004-data-provenance-and-modes.md)
5. [ADR-005: AI Explanation Boundary & Deterministic Source of Truth](file:///docs/adr/ADR-005-ai-explanation-boundary.md)
6. [ADR-006: Real-Time Communication Strategy & Evolution Roadmap](file:///docs/adr/ADR-006-future-realtime-strategy.md)
