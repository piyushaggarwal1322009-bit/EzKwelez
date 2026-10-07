# ADR-012: Incident Update Audit History Model

- **Status:** Accepted
- **Deciders:** Ishu (System Architecture), Piyush (Backend), Tanisha (Frontend)
- **Date:** 2026-10-07
- **Technical Area:** Incident Provenance & Audit Ledger

---

## 1. Context and Problem Statement

Campus operational incidents mutate over time: severity escalates, statuses change, dispatchers attach comments, and technicians mitigate equipment faults. Overwriting columns on the `incidents` table destroys historical context, making post-incident reviews, compliance audits, and reliability reporting impossible.

---

## 2. Decision Drivers

1. **Immutability:** Every mutation or milestone must create an append-only audit record.
2. **Actor Attribution:** Every update must capture `created_by` (actor ID, sensor service, or dispatch agent).
3. **State Diffs:** Updates must capture `status_before`, `status_after`, `severity_before`, and `severity_after`.
4. **Structured Metadata:** Support extensible JSON payloads for sensor telemetry snapshots, technician notes, or dispatch codes.

---

## 3. Considered Options

* **Option A:** Database-level change data capture (CDC) / PostgreSQL trigger log tables.
* **Option B:** Unstructured application log parsing.
* **Option C:** First-class domain entity `IncidentUpdate` managed by the application service and exposed via `/incidents/{id}/updates`.

---

## 4. Decision Outcome

**Chosen Option:** Option C — Domain-level `IncidentUpdate` entity stored in an append-only table `incident_updates`.

### Entity Attributes:
* `id`: Unique update ID (`upd_...`).
* `incident_id`: Foreign key to `incidents`.
* `type`: `IncidentUpdateType` (`created`, `status_changed`, `severity_changed`, `comment_added`, `acknowledged`, `mitigated`, `resolved`, `closed`).
* `message`: Human or automated description.
* `status_before` / `status_after`: State transition delta.
* `severity_before` / `severity_after`: Severity escalation delta.
* `created_by`: Actor/agent identifier.
* `created_at`: ISO8601 UTC timestamp.
* `metadata`: Structured JSON dictionary.

---

## 5. Consequences

### Positive:
* **Complete Traceability:** Answers "Who changed severity?", "When was it mitigated?", and "What was the initial status?".
* **API Access:** Frontends can render live chronological incident activity timelines without log scraping.

### Negative / Tradeoffs:
* Requires double-write in the application service (update incident + insert update row) inside a transactional unit of work.

---

## 6. Compliance and Verification

* Integration tests in `tests/backend/test_incident_api.py` verify that creating and transitioning incidents automatically appends `IncidentUpdate` records.
