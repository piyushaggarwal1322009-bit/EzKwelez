# ADR-008: Impact Analysis Service Boundary & Structured Report Contract

- **Status:** Accepted
- **Deciders:** Ishu (System Architecture), Piyush (Backend), Tanisha (Frontend)
- **Date:** 2026-10-07
- **Technical Area:** Impact Propagation, Service Boundaries & Contracts

---

## 1. Context and Problem Statement

When an operational disruption occurs (e.g. power outage, Wi-Fi gateway drop), operators need to understand the cascading blast radius. In early prototypes, teams often merge graph traversal, impact scoring, database updates, and UI formatting into route handlers or unstructured prompt outputs.

We must establish a strict service boundary for `ImpactAnalysisService` that consumes structured `FailureEvent` inputs and produces a deterministic, machine-readable `ImpactReport`.

---

## 2. Decision Drivers

1. **Deterministic Separation of Concerns:** Impact evaluation must be independent of HTTP routers, UI components, and LLM text generation.
2. **Machine-Readable Downstream Consumers:** The output (`ImpactReport`) must be cleanly structured so a future `RecoveryPlanningService` and `OptimizationEngine` can compute room moves and objective costs without parsing text.
3. **Decoupled Campus Integration:** Querying facility names and headcounts must occur through the `CampusContextProvider` port rather than direct SQL queries.

---

## 3. Decision Outcome

**Chosen Option:** Isolate impact analysis in `DefaultImpactAnalysisService` implementing `ImpactAnalysisEngine`.

### Input Contract (`FailureEvent`):
* `id`, `node_id`, `failure_type` (`outage`, `degradation`, `failure`, `maintenance`, `capacity_exceeded`, `connectivity_loss`), `severity`, `occurred_at`.

### Output Contract (`ImpactReport`):
* `analysis_id`: Unique correlation ID.
* `root_node`: Failure source vertex.
* `impacted_nodes`: List of `ImpactedNode` (distance, impact_type: `direct`/`indirect`, impact_severity, reason).
* `impacted_locations`: Resolved physical location IDs for mapping.
* `severity`: Overall calculated severity (`none`, `low`, `moderate`, `high`, `critical`).
* `propagation_depth`: Maximum hops traversed.
* `provenance`: Detailed data mode source tracking.
* `warnings`: Structured warning codes (e.g. `CAMPUS_DATA_STALE`, `CYCLE_DETECTED`).

---

## 4. Consequences

### Positive:
* **Clean Downstream Handoff:** Recovery planning and AI explanation services consume structured JSON arrays of impacted entities.
* **Testability:** Can be unit-tested completely in-memory with fake failure events.
