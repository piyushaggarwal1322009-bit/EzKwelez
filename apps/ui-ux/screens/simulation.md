# EzyKwelez — Screen Specification: What-If Simulation

**Screen Designation:** `5.0 What-If Simulation (Counterfactual Scenario Sandbox & Decision Projection)`  
**Route Mapping:** `app/(operator)/simulation/page.tsx` & `app/(operator)/incidents/[incidentId]/simulation/page.tsx`  
**UI/UX Owner:** Aile Sharma (`Lead UI/UX Designer & Design System Owner`)  
**Target Audience:** Incident Commander, Crisis Planner, Operations Lead  
**Status:** Phase 6 Finalized  
**Version:** 1.0  

---

## 1. Executive Purpose & Mental Model

The **What-If Simulation** is the counterfactual scenario engine of EzyKwelez. It answers the critical operator question:

> **"What happens across campus occupancy, facilities, and recovery feasibility if I change this assumption?"**

The simulation workflow enables non-destructive, advisory experimentation:
```text
ACTIVE BASELINE ──> ADJUST ASSUMPTIONS ──> RECOMPUTE SCENARIO ──> PROJECTED DELTA ──> DECISION HAND-OFF
(Current State)      (Duration, Crowd)     (Debounced Engine)     (↑ +92 Students)    (Update Recovery)
```

### Safety & Consequence Axiom
> **"SIMULATION ONLY · No live campus mutations are made. Running a scenario is purely advisory and requires explicit confirmation in the Recovery workflow to apply to live operations."**

---

## 2. Information Architecture: Contextual & Standalone Sandboxes

```text
Simulation (app/(operator)/simulation/ & app/(operator)/incidents/[incidentId]/simulation/)
├── 5.1 Scenario Context & Safety Header
│   ├── "SIMULATION SANDBOX (ADVISORY MODE)" High-Contrast Sky-Blue Banner
│   ├── Pinned Incident Context Bar (Incident ID, Location, Current Impact)
│   └── Scenario Preset Selector (`[ Baseline ]`, `[ +60m Delay ]`, `[ +30m Delay ]`, `[ Custom ]`)
├── 5.2 Assumptions & Scenario Controls Panel
│   ├── Recovery Duration Slider (15m → 240m) + Companion Accessible Numeric Input
│   ├── Crowd / Occupancy Multiplier Slider (1.0x → 2.5x)
│   ├── Secondary Resource Availability Toggles (e.g. `Substation C Margin: 40% -> 0%`)
│   └── Scenario Reset & Recalculate Triggers (`[ Run Simulation ]`, `[ Reset to Baseline ]`)
├── 5.3 Baseline vs. Projected Outcome Comparison
│   ├── Side-by-Side Outcome Scorecard (Baseline 84 Students vs. Projected 176 Students)
│   ├── Directional Delta Badges (`↑ +92 Students`, `↑ +60m Recovery`, `↑ +2 Closed Rooms`)
│   └── Confidence & Provenance Breakdown (Observed vs. Assumed vs. Projected)
├── 5.4 Multi-Scenario Comparison & History Matrix
│   ├── Tabular Matrix: Baseline vs. Scenario A (+60m) vs. Scenario B (+30m)
│   └── Lightweight Recent Scenario History Stream
└── 5.5 Action & Recovery Decision Hand-off
    ├── AI Grounded Contextual Explanation Panel
    └── Hand-off Controls: `[ Apply Scenario Parameters to Recovery Plans → ]`
```

---

## 3. Entry Points & Context Preservation

| Entry Point | Source Location | Inherited Context & Behavior |
| :--- | :--- | :--- |
| **1. Incident Dossier Entry** | `/incidents/[id]` -> `[ Run What-If Simulation ]` | Inherits `incidentId`, `targetBuilding (Bldg B)`, `baselineDisplaced (438)`. Pre-loads current baseline recovery plan. |
| **2. Recovery Plan Entry** | `/recovery` -> `[ "Simulate Plan B with +30m delay" ]` | Inherits `incidentId`, `selectedPlan (Plan B)`, `baselineTime (52m)`. Slider initializes at 82m. |
| **3. Global Standalone Entry** | Sidebar -> `Simulation` (`/simulation`) | Allows freeform campus-wide scenario testing or selecting an active disruption from a dropdown. |

---

## 4. Scenario Controls & Input Anatomy

Every simulation control combines interactive analog manipulation with accessible precision input:

```text
+-----------------------------------------------------------------------------------------+
| ASSUMPTION: RECOVERY WORK DURATION                                                      |
| Primary Factor: Time required for electrical repair crews to replace transformer.       |
|                                                                                         |
| [ 15m ] ──────────────●─────────────────────────── [ 240m ]     [ 98 ] Minutes          |
|                       ▲ Current Value: 98m (+60m vs Baseline)   (Direct Numeric Input)  |
|                                                                                         |
| Presets: [ Baseline (38m) ]  [ +30m (68m) ]  [ +60m (98m) ]  [ Max Window (240m) ]      |
+-----------------------------------------------------------------------------------------+
```

### Supported Domain Controls:
1. **Recovery Work Duration:** Range `15m – 240m` (Default: active plan baseline). Step: `5m`.
2. **Crowd / Timetable Multiplier:** Range `1.0x – 2.5x` (Simulates unexpected exam/event attendance). Step: `0.1x`.
3. **Resource Outage Toggles:** `[x] Substation C Busbar Available`, `[ ] Backup Generator Online`.
4. **Start Time Offset:** Range `0m – 120m` (Simulates dispatch delay).

---

## 5. Baseline vs. Projected Outcome Scorecard

Projections are NEVER presented in isolation; they are always anchored against the current baseline:

```text
+-----------------------------------------------------------------------------------------+
| CURRENT BASELINE (Plan A)             PROJECTED SCENARIO (+60m Delay)    DIRECTIONAL DELTA|
|-----------------------------------------------------------------------------------------+
| Expected Recovery: 38 min             Expected Recovery: 98 min          ↑ +60 Minutes   |
| Displaced Students: 84                Displaced Students: 176            ↑ +92 Students  |
| Locked Facilities: 2 Rooms            Locked Facilities: 4 Rooms         ↑ +2 Facilities |
| Evening Exam Disrupted: NO            Evening Exam Disrupted: YES        ↑ +1 Constraint |
| Operational Risk: Low                 Operational Risk: Medium           ↑ +1 Tier Risk  |
+-----------------------------------------------------------------------------------------+
| CONFIDENCE: [ MEDIUM CONFIDENCE ] (Assumed timetable schedule overlap starting at 16:00)|
+-----------------------------------------------------------------------------------------+
```

### Delta Direction Indicator Tokens:
* `↑ +92 Students` (Elevated impact / Deterioration — `--color-status-warning`)
* `↓ -54 Students` (Reduced impact / Improvement — `--color-status-success`)
* `→ 0 Delta` (Neutral / Unchanged — `--color-status-neutral`)

---

## 6. Simulation Data Provenance & Trust Framework

The UI strictly distinguishes observation from assumption and projection:

```text
+-----------------------------------------------------------------------------------------+
| DATA PROVENANCE BREAKDOWN:                                                              |
| • OBSERVED: Current displaced headcount = 84 students (Live timetable headcount)        |
| • ASSUMED: Repair completion extended from 14:50 to 15:50 (+60 min offset)              |
| • CALCULATED: Science Wing 2 power offline until 15:50 (Deterministic physics model)    |
| • PROJECTED: 92 additional students displaced by Chemistry 201 lecture starting @ 15:00|
+-----------------------------------------------------------------------------------------+
```

---

## 7. Scenario State Machine & Debounced Recalculation

```text
[ UNTOUCHED ] ──> [ MODIFIED ] ──> [ CALCULATING (Debounced 500ms) ] ──> [ CALCULATED ]
                         │
                         ├──> [ INVALID INPUT ] ──> (Validation Error Message)
                         └──> [ INSUFFICIENT DATA ] ──> (Missing Dependency Notice)
```

| State | Badge & Status Text | UI Manifestation & Interaction |
| :--- | :--- | :--- |
| **UNTOUCHED** | `[ BASELINE ACTIVE ]` | Controls reflect live plan baseline. Recalculate button disabled. |
| **MODIFIED** | `[ SCENARIO MODIFIED ]` (Amber) | Slider moved. Projected panel dims by 15% with *"Pending Recalculation"* tag. |
| **CALCULATING** | `[ CALCULATING PROJECTION... ]` | 500ms debounce elapsed. Subtle spinner; controls remain interactable. |
| **CALCULATED** | `[ SCENARIO CALCULATED (12:42:18) ]` | Fresh projection values render with high-contrast delta badges. |
| **STALE** | `[ STALE SCENARIO ]` | Underlying incident baseline changed; prompts *"Click to Re-run"*. |
| **INVALID** | `[ INVALID SCENARIO ]` (Red) | Input outside range (e.g. 0 min); shows corrective guidance. |
| **UNAVAILABLE** | `[ SIMULATION UNAVAILABLE ]` | Sensor/timetable data missing; shows fallback suggestions. |

---

## 8. Multi-Scenario Comparison Matrix

Operators can compare up to 3 distinct scenarios against the baseline in a dense tabular format:

```text
Metric / Dimension       | Baseline (38m)       | Scenario A (+30m)    | Scenario B (+60m)    | Scenario C (No Gen)
-------------------------+----------------------+----------------------+----------------------+--------------------
Assumed Recovery Time    | 38 min               | 68 min (+30m)        | 98 min (+60m)        | 140 min (+102m)
Projected Displaced      | 84 Students          | 124 Students (↑ +40) | 176 Students (↑ +92) | 290 Students (↑+206)
Impacted Rooms           | 2 Rooms              | 3 Rooms (↑ +1)       | 4 Rooms (↑ +2)       | 6 Rooms (↑ +4)
Evening Exam Impact      | None                 | None                 | Chem 101 Midterm     | 3 Exams Locked
Feasible Recovery Plan   | Plan A (Reroute)     | Plan A (Reroute)     | Plan B (Generator)   | Plan C (Relocate)
Confidence Rating        | HIGH CONFIDENCE      | HIGH CONFIDENCE      | MEDIUM CONFIDENCE    | LOW CONFIDENCE
Decision Action          | [ Active Baseline ]  | [ Branch Recovery ]  | [ Branch Recovery ]  | [ Branch Recovery ]
```

---

## 9. AI Grounded Rationale vs. Simulation Engine

```text
+-----------------------------------------------------------------------------------------+
| SIMULATION ENGINE OUTPUT (Deterministic Physics & Timetable Intersection):              |
| • Projected Impact: 176 students (+92 delta) · 4 Rooms Locked · Duration: 98 min        |
+-----------------------------------------------------------------------------------------+
| AI GROUNDED EXPLANATION:                                                                |
| "Extending outage duration past 90 minutes crosses the 15:00 timetable boundary,       |
| displacing the Chemistry 201 cohort (92 students) which cannot be absorbed in Wing 1."  |
| Grounded Evidence: [ Timetable Schedule: Chem 201 @ 15:00 ] [ Wing 1 Capacity: Max ]    |
+-----------------------------------------------------------------------------------------+
```

---

## 10. Safety Boundary & Recovery Decision Hand-off

1. **Advisory Banner:** Persistent sky-blue header: *"SIMULATION SANDBOX · Changes made here do not alter live operations."*
2. **Decision Hand-Off Action:** If a scenario reveals a superior strategy, clicking `[ Branch Recovery Plan with Scenario Assumptions → ]` transitions to `/recovery` with pre-loaded assumptions and launches the **Guarded Two-Step Approval Flow**.

---

## 11. Responsive Layout Behavior

```text
DESKTOP (>= 1280px)                    TABLET (768px - 1023px)                MOBILE (< 768px)
+------------------------------------+  +------------------------------------+  +------------------------------------+
| Safety Strip: SIMULATION SANDBOX   |  | Safety Strip: SIMULATION SANDBOX   |  | Strip: SIMULATION SANDBOX (ADVIS)  |
+------------------------------------+  +------------------------------------+  +------------------------------------+
| 2-COLUMN SANDBOX:                  |  | SINGLE COLUMN STACK:               |  | TOP STATUS:                        |
| [Controls: Duration / Multipliers] |  | [Scenario Controls (Sliders)]      |  | • Projected: 176 Students (↑ +92)  |
| [Scorecard: Baseline vs Projected] |  | [Baseline vs Projected Scorecard]  |  | • Duration: 98m (↑ +60m)           |
| [Directional Delta Badges]         |  | [Directional Delta Strip]          |  +------------------------------------+
| [AI Grounded Explanation Panel]    |  | [AI Grounded Narrative Panel]      |  | SLIDER CONTROL:                    |
| [Comparison Table: Scenarios A/B]  |  +------------------------------------+  | [ 15m ─────●──── 240m ] (98m)      |
|                                    |  | [ View Multi-Scenario Comparison ] |  | [ Run Simulation ]  [ Reset ]      |
+------------------------------------+  +------------------------------------+  +------------------------------------+
                                                                                | [ Compare Scenarios (Bottom Sheet)]|
                                                                                +------------------------------------+
```

---

## 12. Accessibility Compliance (WCAG 2.1 AA)

- **Accessible Sliders:** `<input type="range" aria-label="Assumed Recovery Work Duration" aria-valuemin="15" aria-valuemax="240" aria-valuenow="98" aria-valuetext="98 minutes (+60m vs baseline)">`.
- **Companion Numeric Input:** Direct text/number inputs provided alongside all sliders for precise keyboard entry.
- **Directional Deltas:** Uses vector icons (`ArrowUp`, `ArrowDown`, `ArrowRight`) + explicit text (`+92 students`, `-54 students`) rather than color alone.
- **Dynamic Announcements:** Calculation status updates use `aria-live="polite"`.

---

## 13. Frontend Developer Implementation Notes (for Ishu & Tanisha)

```text
apps/web/src/
├── app/(operator)/simulation/
│   └── page.tsx                         # Standalone Scenario Sandbox
├── app/(operator)/incidents/[incidentId]/
│   └── simulation/
│       └── page.tsx                     # Contextual Incident Scenario Sandbox
└── features/simulation/
    ├── components/
    │   ├── SimulationSafetyBanner.tsx   # Sky-blue advisory mode header
    │   ├── ScenarioControlSlider.tsx    # Slider + companion numeric input
    │   ├── BaselineVsProjectedCard.tsx  # Side-by-side outcome scorecard
    │   ├── DirectionalDeltaBadge.tsx    # Directional delta pill (↑/↓/→)
    │   ├── MultiScenarioMatrix.tsx      # Tabular scenario comparison table
    │   ├── SimulationProvenanceCard.tsx # Observed vs Assumed vs Projected breakdown
    │   └── ScenarioHistoryDrawer.tsx    # Lightweight recent scenario stream
    └── hooks/
        ├── useSimulationState.ts        # Debounced slider & recalculation state
        └── useScenarioComparison.ts     # Multi-scenario comparison state
```
