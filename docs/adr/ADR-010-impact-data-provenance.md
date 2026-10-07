# ADR-010: Impact Analysis Data Provenance & Stale Telemetry Handling

- **Status:** Accepted
- **Deciders:** Ishu (System Architecture), Piyush (Backend), Tanisha (Frontend)
- **Date:** 2026-10-07
- **Technical Area:** Data Provenance, Stale Data Detection & Quality Transparency

---

## 1. Context and Problem Statement

Impact analysis combines multiple input streams:
1. The structural campus dependency topology (`DependencyGraph`)
2. Real-time or simulated campus conditions (occupancy & connectivity from Phase 3)

If the graph is synthetic, or if the underlying room occupancy data is stale (>15 minutes old), the system must explicitly communicate the provenance and data quality of the generated impact report.

---

## 2. Decision Outcome

**Chosen Option:** Embed an explicit `AnalysisProvenance` payload inside every `ImpactReport` and attach structured warnings when stale or simulated inputs are detected.

### Provenance Structure:
```python
@dataclass(frozen=True)
class AnalysisProvenance:
    graph_data_mode: DataMode       # live | simulated | estimated | unknown
    campus_data_mode: DataMode      # live | simulated | estimated | unknown
    generated_at: str
    source_summary: str
```

### Stale Data Policy:
* If `CampusContextProvider.is_campus_data_stale()` returns `True`, the engine appends:
  `"CAMPUS_DATA_STALE: Underlying location conditions exceed 15-minute freshness threshold."`
* Stale data is NEVER silently dropped or refreshed with fake telemetry.

---

## 3. Consequences

### Positive:
* **Operational Honesty:** Operators immediately know whether a blast radius estimate is based on live sensors or simulated models.
* **Audit Integrity:** Historical incident reports record the exact telemetry state at analysis time.
