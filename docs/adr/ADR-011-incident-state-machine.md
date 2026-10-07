# ADR-011: Incident Lifecycle State Machine & Transition Rules

- **Status:** Accepted
- **Deciders:** Ishu (System Architecture), Piyush (Backend), Tanisha (Frontend)
- **Date:** 2026-10-07
- **Technical Area:** Incident Domain & Operational State Machines

---

## 1. Context and Problem Statement

Campus disruptions, outages, and emergency events follow distinct operational lifecycles from initial observation to final resolution. Without an authoritative, centralized state machine, business transition rules could be scattered across API controllers, client code, or background cron workers, risking invalid state jumps (such as resolving an un-triaged incident or silently reopening closed tickets).

---

## 2. Decision Drivers

1. **Deterministic Lifecycle:** Enforce strict, legal status transitions across `REPORTED`, `TRIAGED`, `INVESTIGATING`, `ACTIVE`, `MITIGATED`, `RESOLVED`, and `CLOSED`.
2. **Encapsulated Domain Rules:** State transition validation must live strictly inside the domain model (`IncidentStateMachine`), isolated from FastAPI routes and React UI components.
3. **Explicit Milestone Timestamps:** Capturing `acknowledged_at`, `resolved_at`, and `closed_at` must occur deterministically as side-effects of valid transitions.
4. **Controlled Reopening:** Prevent silent reopening; require explicit transition from `RESOLVED` or `CLOSED` back to `INVESTIGATING`.

---

## 3. Considered Options

* **Option A:** Allow arbitrary `PATCH` requests on status directly in SQL / ORM models.
* **Option B:** Decentralized transition checks inside API endpoint handlers.
* **Option C:** Centralized, immutable `IncidentStateMachine` in the domain layer with explicit `transition()` method returning updated entity, audit delta, and domain events.

---

## 4. Decision Outcome

**Chosen Option:** Option C — Dedicated `IncidentStateMachine` domain engine.

### Allowed Transition Graph:
```
REPORTED      ──> TRIAGED, CLOSED
TRIAGED       ──> INVESTIGATING, ACTIVE, CLOSED
INVESTIGATING ──> ACTIVE, MITIGATED, RESOLVED, CLOSED
ACTIVE        ──> MITIGATED, RESOLVED
MITIGATED     ──> ACTIVE, RESOLVED
RESOLVED      ──> CLOSED, INVESTIGATING (reopened)
CLOSED        ──> INVESTIGATING (reopened)
```

Illegal transitions immediately raise `InvalidStatusTransitionError` (yielding structured HTTP 400 with machine-readable error codes).

---

## 5. Consequences

### Positive:
* **Integrity:** Invariant timestamps (`resolved_at >= started_at`, `closed_at >= resolved_at`) are guaranteed.
* **Auditability:** Every transition produces an immutable `IncidentUpdate` and emits domain events.
* **Reusability:** The state machine is easily executed by background workers, CLI scripts, or REST endpoints without duplicating logic.

### Negative / Tradeoffs:
* Direct ad-hoc status editing is disallowed; all callers must go through `/incidents/{id}/transitions`.

---

## 6. Compliance and Verification

* Domain tests in `tests/backend/test_incident_domain.py` verify all valid pathways and reject invalid transition attempts.
