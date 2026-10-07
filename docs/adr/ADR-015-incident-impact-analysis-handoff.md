# ADR-015: Incident to Impact Analysis Handoff Contract

- **Status:** Accepted
- **Deciders:** Ishu (System Architecture), Piyush (Backend), Tanisha (Frontend)
- **Date:** 2026-10-07
- **Technical Area:** Cross-Domain Integration & Blast-Radius Triggering

---

## 1. Context and Problem Statement

When an incident occurs (e.g. power substation failure or campus Wi-Fi outage), the Phase 4 Impact Analysis engine must calculate the downstream cascading blast radius across facilities, rooms, and academic operations. However, the Impact Analysis domain must NOT depend directly on internal incident persistence tables, audit trails, or UI-specific metadata.

---

## 2. Decision Drivers

1. **Domain Boundary Decoupling:** Impact Analysis requires only root failure parameters (`root_node_id`, `failure_type`, `severity`, `occurred_at`, `data_mode`).
2. **Type Harmonization:** `IncidentType` (operational categorization) must cleanly translate to `FailureType` (graph failure mode), and `IncidentSeverity` to graph `Criticality`.
3. **Data Provenance Preservation:** An incident's `data_mode` (`live`, `simulated`, `estimated`) must pass faithfully to impact reports.

---

## 3. Considered Options

* **Option A:** Pass the raw `Incident` database model directly into `DefaultImpactAnalysisService.analyze_failure()`.
* **Option B:** Have Impact Analysis query the incident SQL table directly.
* **Option C:** Define a dedicated, minimal value object `IncidentToImpactHandoff` and endpoint `/incidents/{id}/impact-handoff` mapping incident parameters to the Phase 4 `FailureEvent` contract.

---

## 4. Decision Outcome

**Chosen Option:** Option C — Minimal `IncidentToImpactHandoff` integration contract.

### Contract Definition:
```python
@dataclass(frozen=True)
class IncidentToImpactHandoff:
    incident_id: str
    root_node_id: str
    failure_type: FailureType      # e.g., OUTAGE, CONNECTIVITY_LOSS, FAILURE
    severity: Criticality          # e.g., CRITICAL, HIGH, MEDIUM, LOW
    occurred_at: str
    data_mode: DataMode            # SIMULATED / LIVE / ESTIMATED
```

### Type Mapping Strategy:
* `POWER_OUTAGE` $\rightarrow$ `FailureType.OUTAGE`
* `NETWORK_OUTAGE` $\rightarrow$ `FailureType.CONNECTIVITY_LOSS`
* `EQUIPMENT_FAILURE` / `BUILDING_ISSUE` $\rightarrow$ `FailureType.FAILURE`
* `MAINTENANCE` $\rightarrow$ `FailureType.MAINTENANCE`
* `CAPACITY_ISSUE` $\rightarrow$ `FailureType.CAPACITY_EXCEEDED`

---

## 5. Consequences

### Positive:
* **Zero Coupling:** Impact Analysis remains a pure deterministic graph engine without knowing anything about incident titles, descriptions, or comment threads.
* **Autonomous Pipeline:** When an incident transitions to `ACTIVE`, background triggers can seamlessly fetch the handoff payload and invoke `POST /impact-analysis`.

### Negative / Tradeoffs:
* Requires maintaining explicit mapping dictionaries between `IncidentType` and `FailureType`.

---

## 6. Compliance and Verification

* API test `test_create_incident_and_lifecycle_transitions` in `tests/backend/test_incident_api.py` asserts the correctness of `/incidents/{id}/impact-handoff`.
