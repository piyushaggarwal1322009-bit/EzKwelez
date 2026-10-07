# ADR-004: Data Provenance & Operational Data Modes

- **Status:** Accepted
- **Deciders:** Ishu (System Architecture), Piyush (Backend), Tanisha (Frontend)
- **Date:** 2026-10-07
- **Technical Area:** Data Integrity, Trust & Provenance

---

## 1. Context and Problem Statement

EzyKwelez operates as an operational command platform. In hackathon demonstrations, staging environments, and partial production rollouts, the system frequently handles a combination of live IoT feeds, synthetic demo datasets, statistical schedule-based estimates, and what-if counterfactual simulations.

If simulated or estimated telemetry is accidentally or deceptively presented as real-time campus data, operator trust is destroyed, and real-world safety/operational decisions could be compromised.

We must establish a system-wide architectural mandate that enforces data provenance on every operational metric.

---

## 2. Decision Drivers

1. **Absolute Transparency:** Operators and students must immediately distinguish verified live sensor readings from simulations or statistical projections.
2. **Type-Level Enforcement:** Make it structurally difficult or impossible for mock/simulation providers to emit records with `DataMode.LIVE`.
3. **Auditability:** Historical snapshots and recovery decisions must permanently capture the provenance mode under which the decision was evaluated.
4. **UI Honesty:** Frontend interfaces must visibly badge simulated or estimated data according to design standards.

---

## 3. Considered Options

* **Option A:** Implicit Trust (Rely on developer discipline without explicit schema tracking)
* **Option B:** Global Environment Flag (System is either 100% Live or 100% Demo)
* **Option C (Selected):** Granular, Record-Level Provenance Tagging with Enforced Data Modes

---

## 4. Decision Outcome

**Chosen Option:** Option C — Enforce `dataMode: DataMode` on all domain entities, telemetry snapshots, API responses, and simulation artifacts.

### Allowed Data Modes:

```typescript
export enum DataMode {
  LIVE = "live",           // Real IoT / Wi-Fi hardware telemetry (<5m freshness)
  SIMULATED = "simulated", // Synthetic scenario or counterfactual simulation run
  ESTIMATED = "estimated", // Algorithmic inference (e.g., timetable + historical attendance)
  UNKNOWN = "unknown",     // Telemetry stale, provider failed, or source unverified
}
```

### Architectural Safeguards:
1. **Provider Self-Declaration:** `MockOccupancyProvider` and `MockConnectivityProvider` are hardcoded to output `DataMode.SIMULATED` or `DataMode.ESTIMATED`. Their constructor parameters do not permit passing `DataMode.LIVE`.
2. **Real Provider Validation:** `RealOccupancyProvider` verifies hardware heartbeat before emitting `DataMode.LIVE`. If hardware connectivity drops beyond threshold (e.g. 10 minutes), status falls back to `DataMode.UNKNOWN`.
3. **Simulation State Isolation:** All counterfactual simulation services clone baseline records and overwrite `dataMode` with `DataMode.SIMULATED`.
4. **UI Display Contract:** Frontend components render distinct visual tags:
   - `LIVE`: Green active pulse indicator.
   - `SIMULATED`: Purple simulation badge.
   - `ESTIMATED`: Amber projection indicator.
   - `UNKNOWN`: Muted gray warning indicator.

---

## 5. Consequences

### Positive:
* **Zero Ambiguity:** Operators always know if a room count is from an infrared door counter, a timetable estimate, or a what-if drill.
* **Integrity in Demos:** Prevents misrepresenting hackathon synthetic data as unauthorized student surveillance.
* **Audit Trail Compliance:** Incident review logs record exact provenance of all inputs.

### Negative / Tradeoffs:
* All DTOs and database snapshot records must carry the `data_mode` column/attribute.
* Requires UI developers to consistently handle visual badges for all four states.

---

## 6. Compliance and Verification

* Domain unit tests verify that mock generators produce only `SIMULATED` or `ESTIMATED` tags.
* Validation schemas reject `LIVE` payloads arriving from simulation route handlers.
