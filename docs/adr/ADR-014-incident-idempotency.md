# ADR-014: Incident Idempotency & Duplicate Request Mitigation

- **Status:** Accepted
- **Deciders:** Ishu (System Architecture), Piyush (Backend), Tanisha (Frontend)
- **Date:** 2026-10-07
- **Technical Area:** API Reliability & Duplicate Ingestion Protection

---

## 1. Context and Problem Statement

Automated telemetry probes, IoT network monitors, and mobile client retries may repeatedly post duplicate incident reports due to network timeouts or retry loops. Without an idempotency mechanism, a single power trip could trigger dozens of duplicate incidents, corrupting analytics and triggering false alarms.

---

## 2. Decision Drivers

1. **Deterministic Ingestion:** Multiple identical POST requests must resolve to the same incident resource.
2. **Standard HTTP Protocols:** Support the standard `Idempotency-Key` HTTP header on creation endpoints.
3. **Repository Support:** The persistence layer must quickly identify existing incidents matching the client's idempotency key.

---

## 3. Considered Options

* **Option A:** Blind insertion; rely on human operators to manually merge duplicate incidents.
* **Option B:** Naive text hash matching on `(title, description)` (brittle to minor variations).
* **Option C:** Header-driven `Idempotency-Key` stored in metadata and queried during creation via `IncidentRepository.exists_by_idempotency_key()`.

---

## 4. Decision Outcome

**Chosen Option:** Option C — Header-driven idempotency key evaluation.

When `Idempotency-Key` is passed in `POST /incidents`:
1. Application service checks `repository.exists_by_idempotency_key(key)`.
2. If found, returns the existing `Incident` without creating a duplicate record or appending duplicate creation audits.
3. If not found, stores `idempotency_key` in `incident.metadata["idempotency_key"]` alongside the newly created record.

---

## 5. Consequences

### Positive:
* **Fault-Tolerant Client Retries:** Network timeouts on client POSTs can safely retry without creating ghost incidents.
* **Telemetry Protection:** Automated cron monitors can reuse daily/hourly event keys safely.

### Negative / Tradeoffs:
* Keys should have a time-to-live or scoping strategy in long-term production database schemas.

---

## 6. Compliance and Verification

* API test `test_incident_idempotency` in `tests/backend/test_incident_api.py` verifies that duplicate submissions return the identical incident ID.
