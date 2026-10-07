# ADR-001: Modular Monolith vs. Microservices Architecture

- **Status:** Accepted
- **Deciders:** Ishu (System Architecture), Piyush (Backend), Tanisha (Frontend)
- **Date:** 2026-10-07
- **Technical Area:** System Topography & Service Boundaries

---

## 1. Context and Problem Statement

EzyKwelez is an intelligent campus continuity and operational recovery platform. It performs complex relational graph traversals, impact calculations, multi-objective optimization, and counterfactual simulations.

In early-stage design, teams frequently face the decision of deploying independent distributed microservices (e.g., separate services for Campus Graph, Incident Management, Optimizer, and AI Engine) versus adopting a unified modular monolith.

We must select an architectural topology that minimizes operational friction, ensures deterministic transactional integrity across graph/incident/recovery workflows, and avoids distributed systems overhead while strictly preserving domain boundaries for future horizontal scaling.

---

## 2. Decision Drivers

1. **Transactional Integrity & Graph Traversal:** Graph analysis and blast-radius evaluation require traversing building, room, class, and resource dependencies synchronously with sub-second latencies.
2. **Team Velocity & Operational Complexity:** A distributed microservice ecosystem introduces network serialization overhead, distributed tracing complexity, multi-repo CI/CD friction, and distributed transaction management (Saga/2PC).
3. **Domain Purity & Modularity:** Need clear domain boundaries so that if a domain (such as the Optimization Engine or Simulation Engine) requires independent scaling in the future, it can be extracted without refactoring business logic.
4. **Development and Testing Ergonomics:** Need frictionless local execution and unit/integration testing without running a dozen containerized services.

---

## 3. Considered Options

* **Option A:** Microservices Architecture (separate services for Campus, Incident, Graph/Impact, Recovery, AI)
* **Option B:** Unstructured Monolith (single flat codebase with cross-cutting spaghetti dependencies)
* **Option C (Selected):** Modular Monolith with Clean Layered Hexagonal/Clean Architecture Boundaries

---

## 4. Decision Outcome

**Chosen Option:** Option C — **Modular Monolith** built on FastAPI with strict Python packaging boundaries and dependency inversion.

### Architectural Structure:
* A single deployment unit (`apps/api`) hosted on Render.
* Domain modules (`campus`, `incidents`, `graph`, `impact`, `recovery`, `simulation`, `ai`) are isolated inside `app/domain/`.
* Presentation (`app/api/`), Application Orchestration (`app/application/`), Domain Core (`app/domain/`), and Infrastructure Adapters (`app/infrastructure/`) enforce one-way dependency flow.
* In-memory domain objects and pure Python functions are used for core calculation and graph traversal, preventing network I/O during algorithmic passes.

### Extraction Triggers (Future Microservice Criteria):
A domain will only be extracted into an independent microservice if:
1. **Compute Disparity:** Graph optimization or heavy Monte-Carlo simulation workloads saturate CPU/GPU resources and starve standard REST API traffic.
2. **Independent Scaling:** Ingestion of live IoT telemetry (thousands of edge sensor events per second) requires a specialized streaming pipeline (e.g., Kafka + Go/Rust worker).
3. **Organizational Scale:** Distinct engineering teams take exclusive ownership of separate bounded contexts.

---

## 5. Consequences

### Positive:
* **Zero Network Latency Between Domains:** Graph traversals, constraint validations, and impact scores execute in sub-millisecond in-memory Python operations.
* **Simplified Deployment & Operations:** Single container deployment on Render, unified logs, and simplified environment variable management.
* **Refactoring Simplicity:** Boundary adjustments between domain entities are compile/type-checked without distributed schema breaking changes.
* **High Test Velocity:** Full integration tests run within seconds in Pytest without mock service meshes.

### Negative / Tradeoffs:
* Requires strict engineering discipline and linting to prevent developers from importing infrastructure modules into domain layers or creating direct cross-domain coupling.
* Shared compute pool requires query timeouts and resource safeguards so large simulation runs do not block API threads.

---

## 6. Compliance and Verification

* Static analysis rules and architecture tests in `tests/backend/` enforce dependency rules (e.g., `app/domain/` must never import `app/infrastructure/`, `fastapi`, or `supabase`).
* Pytest test suites validate in-memory domain isolation.
