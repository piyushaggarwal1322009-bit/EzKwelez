# ADR-013: Incident Domain Events & Asynchronous Boundary

- **Status:** Accepted
- **Deciders:** Ishu (System Architecture), Piyush (Backend), Tanisha (Frontend)
- **Date:** 2026-10-07
- **Technical Area:** Event Architecture & Inter-Module Communication

---

## 1. Context and Problem Statement

When an incident status changes or an incident is declared `ACTIVE`, other subsystems (such as notification dispatchers, impact analysis engines, digital signage, and emergency SMS providers) need to react. Embedding direct synchronous dependencies from the Incident domain into these downstream consumers violates modularity and prevents independent scaling.

---

## 2. Decision Drivers

1. **Decoupled Architecture:** The Incident domain must know nothing about email/SMS gateways, UI web sockets, or specific recovery orchestrators.
2. **Standard Event Contract:** Define strongly-typed `DomainEvent` classes with standard metadata (`event_id`, `event_type`, `occurred_at`).
3. **Trigger Discretion:** Distinguish lightweight routine edits from operational events like `incident.activated` that trigger downstream impact calculations.

---

## 3. Considered Options

* **Option A:** Synchronous in-line calls to all downstream services directly within `transition_incident_status`.
* **Option B:** External message broker (Kafka, RabbitMQ, Redis Streams) introduced in Phase 5.
* **Option C:** In-process domain event publisher port (`IncidentEventPublisher`) with in-memory implementation for Phase 5, ready for future broker integration.

---

## 4. Decision Outcome

**Chosen Option:** Option C — In-process `IncidentEventPublisher` port emitting structured domain events:

* `IncidentStatusChangedEvent`: Emitted on any state machine change.
* `IncidentActivatedEvent`: Emitted specifically when an incident reaches `ACTIVE` state, carrying `root_node_id`, `severity`, and `data_mode` for downstream impact consumers.

---

## 5. Consequences

### Positive:
* **Zero External Dependencies:** No RabbitMQ/Kafka infrastructure needed during early development.
* **Seamless Scalability:** In later phases, swapping the publisher implementation to Celery/Redis/Kafka requires zero changes to domain models.

### Negative / Tradeoffs:
* In-memory publishing is transient during process restart; reliable delivery requires durable outbox tables in subsequent backend milestones.

---

## 6. Compliance and Verification

* Unit tests in `tests/backend/test_incident_domain.py` verify that activating an incident generates both `IncidentStatusChangedEvent` and `IncidentActivatedEvent`.
