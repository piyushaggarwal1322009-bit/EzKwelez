# EzyKwelez — Screen Specification: Recovery Experience

**Screen Designation:** `4.0 Recovery Experience (Multi-Candidate Optimization, Trade-off Matrix & Guarded Approval)`  
**Route Mapping:** `app/(operator)/incidents/[incidentId]/recovery/` (`page.tsx`, `compare/page.tsx`)  
**UI/UX Owner:** Aile Sharma (`Lead UI/UX Designer & Design System Owner`)  
**Target Audience:** Incident Commander, Facilities Director, Academic Registrar  
**Status:** Phase 5 Finalized  
**Version:** 1.0  

---

## 1. Executive Purpose & Mental Model

The **Recovery Experience** is the operational decision-support cockpit of EzyKwelez. It answers the defining executive question:

> **"Given the current incident and its impact cascade, what recovery option should I choose, and what are the trade-offs?"**

The recovery workflow transitions from diagnostic investigation into structured, deterministic intervention:
```text
INCIDENT DOSSIER ──> CANDIDATE PLANS ──> TRADE-OFF COMPARISON ──> GUARDED APPROVAL ──> LIVE EXECUTION
(Context & Scope)     (Ranked & Scored)   (Time vs. Residual)     (2-Step Safeguard)   (Student Notice)
```

---

## 2. Information Architecture: 2 Connected Sub-Views

```text
Recovery (app/(operator)/incidents/[incidentId]/recovery/)
├── 4.1 Recovery Plans List (page.tsx)
│   ├── Pinned Incident Context Bar (Locked: [CRITICAL] Building B · 438 Displaced)
│   ├── Recommended Flagship Candidate Card (#1 Plan A · Score: 92.4 · -81% Residual)
│   ├── Ranked Alternative Candidate Cards (Plan B, Plan C)
│   ├── Multi-Objective Trade-Off Strip (Speed vs. Headcount vs. Resource Cost)
│   ├── Constraint Validation Indicators (SATISFIED, WARNING, BLOCKING)
│   └── Direct Action Controls (`[ Review & Approve Plan ]`, `[ Compare Plans (3) → ]`)
└── 4.2 Compare Recovery Plans (compare/page.tsx)
    ├── Multi-Plan Side-by-Side Trade-off Matrix (Plan A vs. Plan B vs. Plan C)
    ├── Delta Inspection against Baseline Impact
    ├── AI Grounded Rationale Breakdown (Why Plan A outperforms Plan B)
    └── Simulation Branch Trigger (`[ "Simulate Plan B with +30m Delay" → ]`)
```

---

## 3. Persistent Pinned Incident Context Bar

Locked continuously beneath the top command bar across all recovery sub-routes:

```text
+---------------------------------------------------------------------------------------------------------+
| [CRITICAL] Building B Power Outage · Science Complex · 438 Students Displaced · Elapsed 24m · [← Dossier]|
+---------------------------------------------------------------------------------------------------------+
```

- **Inherited Parameters:** `incidentId`, `rootEntityId`, `baselineDisplacedCount (438)`, `specializedEquipment (4 Labs)`, `currentStatus`.
- **Zero Data Entry:** The operator never re-selects the crisis or re-inputs capacity constraints.

---

## 4. View Specifications

### 4.1 Recovery Plans List (`/recovery`)

- **Primary Goal:** Review ranked candidate interventions and understand why the recommended plan mathematically excels.
- **Top Summary & Optimization Status Strip:**
  - `3 Candidate Plans Generated` · `Algorithm: Multi-Objective Pareto Optimizer`
  - `Generation Freshness`: `LIVE · Generated 2m ago (Valid for current incident state)`
  - `Baseline Disruption`: `438 Students across 7 Rooms`
- **Recommended Candidate Card (#1 Flagship Anatomy):**
  ```text
  +-----------------------------------------------------------------------------------------+
  | [ ★ RECOMMENDED #1 ]  PLAN A: Temporary Power Reroute              Score: 92.4 / 100    |
  | Strategy: Reroute primary feed via Substation C secondary busbar.                       |
  | --------------------------------------------------------------------------------------- |
  | [ RESIDUAL IMPACT ]        [ EXPECTED DURATION ]    [ RESOURCE COST ]   [ RISK LEVEL ]  |
  | 84 Students Remaining      38 Minutes               Medium (2 Crews)    Low Risk        |
  | (-81% Disruption Delta)    (Full Power Online)      (1 Backup Switch)   (0 Violations)  |
  | --------------------------------------------------------------------------------------- |
  | CONSTRAINTS: [✓ Substation C Capacity: OK] [✓ 4 Labs Powered] [✓ Safety Buffer: OK]     |
  | CONFIDENCE: [ HIGH CONFIDENCE (Verified Switchgear Topology) ]                          |
  | --------------------------------------------------------------------------------------- |
  | AI EXPLANATION:                                                                         |
  | "Plan A ranks #1 because it resolves 100% of lab power requirements with 38m recovery,  |
  | reducing displaced students from 438 to 84 without requiring inter-building moves."      |
  | --------------------------------------------------------------------------------------- |
  | [ Review & Approve Plan A → ]        [ Compare Against Plans B & C ]                    |
  +-----------------------------------------------------------------------------------------+
  ```
- **Alternative Ranked Candidate Cards:**
  - **Rank #2 — Plan B: Deploy Mobile Backup Generator**
    - `Objective Score`: `87.1 / 100` · `Recovery Time`: `52 min` · `Residual Impact`: `120 students` · `Resource Cost`: `High` · `Risk`: `Medium`
    - `Constraint State`: `WARNING` (`Generator transport transit delay possible`).
  - **Rank #3 — Plan C: Satellite Building Relocation**
    - `Objective Score`: `79.8 / 100` · `Recovery Time`: `75 min` · `Residual Impact`: `176 students` · `Resource Cost`: `Low` · `Risk`: `Low`
    - `Constraint State`: `SATISFIED` (`Non-lab classes rerouted to Humanities Wing`).

---

### 4.2 Compare Recovery Plans (`/recovery/compare`)

- **Primary Goal:** Multi-plan trade-off analysis matrix displaying quantitative deltas side-by-side.
- **Side-by-Side Comparison Matrix:**
  ```text
  Metric / Dimension       | Baseline (No Action) | Plan A (Recommended) | Plan B (Generator)   | Plan C (Relocation)
  -------------------------+----------------------+----------------------+----------------------+--------------------
  Objective Score          | 0.0 / 100            | 92.4 / 100 ★         | 87.1 / 100           | 79.8 / 100
  Expected Recovery Time   | Indefinite (>4h)     | 38 min               | 52 min               | 75 min
  Residual Displaced Count | 438 Students         | 84 Students (-81%)   | 120 Students (-73%)  | 176 Students (-60%)
  Lab Equipment Coverage   | 0 / 4 Labs           | 4 / 4 Labs (100%)    | 4 / 4 Labs (100%)    | 0 / 4 Labs (0%)
  Resource Burden          | None                 | 2 Teams / 1 Switch   | 4 Teams / 1 Generator| 1 Relocation Admin
  Operational Risk         | Critical Failure     | Low Risk             | Medium Risk          | Low Risk
  Constraint Status        | 7 Violations         | ALL SATISFIED        | WARNING (Transit)    | ALL SATISFIED
  Confidence Tier          | Confirmed Crisis     | HIGH CONFIDENCE      | MEDIUM CONFIDENCE    | HIGH CONFIDENCE
  Primary Action           | --                   | [ Approve Plan A → ] | [ Approve Plan B → ] | [ Approve Plan C → ]
  ```
- **Trade-Off Insights Strip:**
  - Highlights critical trade-offs: *Plan A is 14m faster than Plan B and uses 50% fewer crew resources while covering 100% of lab equipment.*

---

## 5. Objective Score Transparency

The objective score (0–100 scale) is mathematically derived and fully transparent:

```text
Objective Score = 92.4 / 100
├── Impact Reduction (40% Weight):      +38.0 / 40.0   (438 -> 84 students = 81% reduction)
├── Recovery Velocity (25% Weight):     +24.2 / 25.0   (38m recovery vs 120m baseline)
├── Resource Efficiency (20% Weight):   +16.4 / 20.0   (2 crews, low inventory cost)
└── Operational Risk (15% Weight):      +13.8 / 15.0   (Low electrical transient risk)
```

Operators can click `[ View Scoring Breakdown ]` to expand this breakdown on any candidate card.

---

## 6. Constraint State Machine

Every recovery candidate validates hard operational constraints:

| Constraint State | Badge & Styling | Meaning | Action Availability |
| :--- | :--- | :--- | :--- |
| **SATISFIED** | `[✓ ALL SATISFIED]` (Green) | All physical, safety, and equipment dependencies validated. | `[ Approve Recovery ]` fully enabled. |
| **WARNING** | `[⚠ WARNING]` (Amber) | Non-fatal constraint risk (e.g. tight transit window). | `[ Approve Recovery ]` enabled with cautionary note. |
| **BLOCKING** | `[✕ BLOCKED]` (Red) | Fatal constraint violation (e.g. generator out of service). | `[ Approve Recovery ]` disabled; shows explanation. |

---

## 7. Confidence & Data Trust Framework

Confidence reflects the quality of underlying infrastructure inputs, not recommendation favoritism:

* `HIGH CONFIDENCE`: Verified real-time telemetry from all affected utility nodes.
* `MEDIUM CONFIDENCE`: Historical estimates used for transit or crew setup durations (±10m).
* `LOW CONFIDENCE`: Missing telemetry from secondary facilities; estimated timetable headcount.

---

## 8. AI Explanation vs. Deterministic Recommendation

The UI strictly preserves the boundary between machine optimization and narrative assistance:

```text
+--------------------------------------------------------------------------------+
| DETERMINISTIC SYSTEM FACT:                                                     |
| • Rank: #1 · Objective Score: 92.4 · Displaced Students: 84 · Recovery: 38 min |
+--------------------------------------------------------------------------------+
| AI GROUNDED EXPLANATION:                                                       |
| "Plan A ranks #1 because it utilizes Substation C's available 40% margin,      |
| resolving lab equipment power demands in 38m without requiring student moves."  |
| Grounded Evidence: [ Substation C Margin: 40% ] [ 4 Chemistry Labs Online ]    |
+--------------------------------------------------------------------------------+
```

---

## 9. Handling Outdated, Stale & Failed Plan States

| Recovery State | Visual Manifestation | Preserved Actions |
| :--- | :--- | :--- |
| **Generating Options** | Skeleton shimmers across 3 cards with step ticker: *"Analyzing grid margin... Evaluating 7 rooms..."* | Interactive navigation remains responsive. |
| **Plan Outdated / Stale** | Amber warning banner: *"⚠️ Incident conditions changed 4m ago (Room B208 power dropped). Plans may be outdated."* | `[ Recalculate Recovery Plans ]` button prominently featured. |
| **No Feasible Plans** | Serious amber alert: *"No Feasible Recovery Plan. All candidate strategies violate specialized lab power constraints."* | Actions: `[ Relax Constraints ]`, `[ View Incident Dossier ]`, `[ Run What-If Simulation ]`. |
| **Generation Error** | Red error box: *"Optimization engine temporarily unreachable."* | `[ Retry Generation ]` with exponential backoff. |

---

## 10. Guarded Two-Step Approval Flow

Executing a recovery plan changes physical campus routing and dispatches maintenance crews. EzyKwelez enforces a two-step confirmation modal:

```text
+-----------------------------------------------------------------------------------------+
| CONFIRM RECOVERY INTERVENTION: PLAN A (TEMPORARY POWER REROUTE)                         |
+-----------------------------------------------------------------------------------------+
| Scope of Intervention:                                                                  |
| • Facilities Reconnected: Science Complex Building B (Wings 1 & 2 · 7 Rooms)            |
| • Classes Restored: 4 Chemistry Lab Sessions (354 Students)                             |
| • Residual Relocations: 1 Lecture Class rerouted to Humanities Wing C (84 Students)     |
| • Maintenance Dispatch: Crew Team Alpha (Lead: R. Martinez) dispatched to Substation C  |
| • Automated Broadcast: Student alert drafted for 438 enrolled cohort members.           |
| --------------------------------------------------------------------------------------- |
| [x] I confirm this recovery intervention will be applied to live campus operations.      |
| --------------------------------------------------------------------------------------- |
| [ Cancel ]                                         [ Confirm & Execute Recovery Plan ]  |
+-----------------------------------------------------------------------------------------+
```

* Keyboard focus defaults to `[ Cancel ]` to prevent accidental execution.

---

## 11. Responsive Layout Behavior

```text
DESKTOP (>= 1280px)                    TABLET (768px - 1023px)                MOBILE (< 768px)
+------------------------------------+  +------------------------------------+  +------------------------------------+
| Pinned Context: [CRITICAL] Bldg B  |  | Pinned Context: [CRITICAL] Bldg B  |  | Status Pill: [CRITICAL] Bldg B (438|
+------------------------------------+  +------------------------------------+  +------------------------------------+
| RECOMMENDED PLAN #1 (Full Width)   |  | RECOMMENDED PLAN #1                |  | RECOMMENDED PLAN #1 (Card):        |
| [Score: 92.4] [Residual: 84]       |  | [Score: 92.4] [Residual: 84]       |  | • Score: 92.4 · Recovery: 38m      |
| [AI Explanation & Grounding Chips] |  +------------------------------------+  | • Residual: 84 Students (-81%)     |
+------------------------------------+  | ALTERNATIVE PLANS (Stacked):       |  | [ Approve Plan A → ]               |
| ALTERNATIVE CANDIDATES (2 Columns) |  | • Plan B (Score: 87.1)             |  +------------------------------------+
| [Plan B Card]      [Plan C Card]   |  | • Plan C (Score: 79.8)             |  | ALTERNATIVE CANDIDATES (Carousel): |
+------------------------------------+  +------------------------------------+  | ◀ Plan B (87.1) | Plan C (79.8) ▶  |
| [ Compare All 3 Plans Side-by-Side]|  | [ View Side-by-Side Comparison ]   |  +------------------------------------+
+------------------------------------+  +------------------------------------+  | [ Compare Matrix (Bottom Sheet) ]  |
                                                                                +------------------------------------+
```

---

## 12. Accessibility Compliance (WCAG 2.1 AA)

- **Semantic Ranking:** Recovery plan cards use `<article aria-label="Recovery Candidate Rank 1: Plan A, Recommended">`.
- **Non-Color Recommendation:** Recommended status pairs a gold star icon (`<Star />`), bold uppercase text (`RECOMMENDED #1`), and semantic border token.
- **Accessible Comparison Table:** Matrix uses semantic `<table>`, `<th>` headers with `scope="col"` and `scope="row"`, and numeric tabular cells.
- **Accessible Disabled State:** Blocked actions use `aria-disabled="true"` accompanied by an explicit descriptive reason (`aria-describedby="block-reason-id"`).

---

## 13. Frontend Developer Implementation Notes (for Ishu & Tanisha)

```text
apps/web/src/
├── app/(operator)/incidents/[incidentId]/
│   └── recovery/
│       ├── page.tsx                     # 4.1 Recovery Plans Ranked List
│       └── compare/page.tsx             # 4.2 Multi-Plan Trade-off Matrix
└── features/recovery/
    ├── components/
    │   ├── RecommendedPlanHeroCard.tsx  # Flagship #1 candidate card
    │   ├── AlternativePlanCard.tsx      # Ranked secondary candidate card
    │   ├── PlanComparisonMatrix.tsx     # Side-by-side trade-off table
    │   ├── ObjectiveScoreBreakdown.tsx  # Factor weights popover
    │   ├── ConstraintStatusBadge.tsx    # Satisfied / Warning / Blocking badge
    │   ├── GuardedApprovalModal.tsx     # Two-step confirmation modal with checkbox
    │   └── StalePlanBanner.tsx          # Outdated condition warning
    └── hooks/
        ├── useRecoveryPlans.ts          # Candidate plan fetching & ranking hook
        └── useApproveRecoveryPlan.ts    # Guarded approval mutation hook
```
