# EzyKwelez — Screen Specification: Incident Experience

**Screen Designation:** `3.0 Incident Experience (Triage, Root Cause, Blast Radius & Cascade Intelligence)`  
**Route Mapping:** `app/(operator)/incidents/` (`page.tsx`, `[incidentId]/page.tsx`, `[incidentId]/blast-radius/page.tsx`)  
**UI/UX Owner:** Aile Sharma (`Lead UI/UX Designer & Design System Owner`)  
**Target Audience:** Incident Commander, Campus Operations Director, Facilities Engineer  
**Status:** Phase 4 Finalized  
**Version:** 1.0  

---

## 1. Executive Purpose & Mental Model

The **Incident Experience** is the core crisis investigation engine of EzyKwelez. It answers the operator's urgent questions under high cognitive load:

> **"What happened, how serious is it, what is affected across campus layers, and what should I do next?"**

The experience transforms chaos into structured operational clarity through a disciplined 5-stage progression:
```text
INCIDENT ───> ROOT CAUSE ───> BLAST RADIUS ───> IMPACT SCOPE ───> OPERATIONAL RESPONSE
(Detection)    (Confirmed/    (Multi-tier      (Students &      (Recovery &
               Suspected)      Cascade)         Facilities)      Simulations)
```

---

## 2. Information Architecture: 3 Connected Views

```text
Incidents (app/(operator)/incidents/)
├── 3.1 Active Incidents Queue (page.tsx)
│   ├── Triage Severity Header & Queue Status Strip
│   ├── Prioritized Disruption Feed (Sorted by Impact Score & Urgency)
│   ├── Multi-Facet Filter Toolbar (Severity, Building, Subsystem, Status)
│   └── Empty / All-Clear State ("0 Active Disruptions · Last Resolved 42m ago")
├── 3.2 Incident Details & Root Cause ([incidentId]/page.tsx)
│   ├── Pinned Incident Context Header (Locked Across Incident Responses)
│   ├── Root Cause Diagnosis Card (CONFIRMED vs. SUSPECTED vs. UNKNOWN)
│   ├── Impact Summary KPI Group (Students, Rooms, Subsystems, Estimated Duration)
│   ├── Chronological Operational Timeline (Observed, Calculated, Operator Actions)
│   └── Primary Action Bar (`[ View Blast Radius → ]`, `[ Jump to Recovery Plans → ]`)
└── 3.3 Impact / Blast Radius Cascade ([incidentId]/blast-radius/page.tsx)
    ├── Disruption Propagation Visualizer (Root -> Physical -> Schedule -> Cohorts)
    ├── Tier Depth Traversal (Tier 1 Direct, Tier 2 Dependent, Tier 3 Secondary)
    ├── Dual-View Accessible Data Table Alternative
    └── Recovery & Simulation Entrypoints (`[ Generate Recovery Plans → ]`, `[ What-If Sandbox ]`)
```

---

## 3. Persistent Pinned Incident Context Bar

When an operator enters any sub-view of an active incident (`Details`, `Blast Radius`, `Recovery`, `Compare Plans`, `Simulation`), a persistent 40px Context Bar locks immediately beneath the global command header:

```text
+---------------------------------------------------------------------------------------------------------+
| [CRITICAL] Building B Power Outage · Science Complex · 438 Students Displaced · Elapsed 24m · [← Incidents] |
+---------------------------------------------------------------------------------------------------------+
```

### Context Bar Behavior & State Preservation:
1. **Zero Context Loss:** Preserves active `incidentId`, severity tier, affected headcounts, and selected building across all recovery workflows.
2. **Quick Dossier Popover:** Clicking the incident title reveals a micro-summary modal without causing view reloads or losing in-progress recovery configurations.
3. **Breadcrumb Integration:** Complements breadcrumbs: `Incidents > Building B Power Outage > Blast Radius > Recovery`.

---

## 4. View Specifications

### 4.1 Active Incidents Queue (`/incidents`)

- **Primary Goal:** Rapid triage and queue management; immediately surface the highest-impact disruptions.
- **Top Queue Summary Strip:**
  - `3 Active Disruptions`: `1 Critical` (`#ef4444`) · `1 High` (`#f97316`) · `1 Medium` (`#f59e0b`) · `0 Low` · `0 Info`
  - `Total Impacted Students`: `482 students displaced across 2 facilities`
  - `Queue Freshness`: `LIVE · Synced 6s ago`
- **Prioritized Incident Card Anatomy:**
  ```text
  +-----------------------------------------------------------------------------------------+
  | [CRITICAL] Building B Power Outage                                    24m ago · Active  |
  | Target Entity: Science Complex · Building B Substation A                                |
  | Cascade Impact: [ 438 Students (High Conf) ] [ 7 Rooms Closed ] [ 3 Services Down ]     |
  | Status: INVESTIGATING                                           Priority Score: 98/100 |
  | --------------------------------------------------------------------------------------- |
  | [ View Impact / Blast Radius → ]   [ Review Recovery Plans → ]    [ Quick Details Drawer ] |
  +-----------------------------------------------------------------------------------------+
  ```
- **Sorting Hierarchy:**
  1. `Severity Tier` (Critical > High > Medium > Low > Informational)
  2. `Total Impacted Students / Capacity Burden`
  3. `Elapsed Time / Urgency`

---

### 4.2 Incident Details & Root Cause (`/incidents/[incidentId]`)

- **Primary Goal:** Comprehensive root-cause dossier, impact verification, and chronological timeline.
- **Section Layout (Desktop Split View):**
  - **Left Column (Primary Dossier - 65% Width):**
    1. **Incident Header:** Title, ID (`#INC-2026-104`), Status badge (`INVESTIGATING`), Elapsed time (`24m`).
    2. **Root Cause Analysis Card:**
       - **CONFIRMED:** `Electrical Substation A Transformer Failure` (Primary feeder line short).
       - **Verification Provenance:** Telemetry confirmation from SNMP relay `gw-sub-a` at 14:12:04.
       - *Note:* If hypothesis is unconfirmed, renders as `SUSPECTED (Evaluating sensor anomalies)` or `UNKNOWN (Diagnostics in progress)`.
    3. **Impact Summary KPIs (4-Card Group):**
       - **Students Displaced:** `438` (`Confirmed by timetable + IR sensors`)
       - **Rooms Locked:** `7 Rooms` (`4 Labs, 3 Lecture Halls`)
       - **Dependent Services Offline:** `3` (`Campus Wi-Fi AP-East`, `HVAC Loop 2`, `Card Access`)
       - **Estimated Duration:** `~90m` (`Based on historical transformer maintenance`)
    4. **Chronological Operational Timeline:**
       ```text
       • 14:12:04 — [OBSERVED] Voltage drop detected on Substation A (Telemetry SNMP)
       • 14:12:40 — [SYSTEM] Incident declared automatically: CRITICAL POWER OUTAGE
       • 14:14:10 — [CALCULATED] Impact engine completed blast radius: 438 students across 7 rooms
       • 14:18:22 — [OPERATOR] Aile Sharma assigned as Incident Commander
       • 14:24:00 — [SYSTEM] 3 Candidate Recovery Plans generated by optimization engine
       ```
  - **Right Column (Action & Contextual Assistant - 35% Width):**
    1. **Action Control Card:**
       - Primary CTA: `[ View Impact & Blast Radius → ]`
       - Secondary CTA: `[ Review Generated Recovery Plans (3) → ]`
       - Simulation Shortcut: `[ "What if recovery takes 120m?" → Run Simulation ]`
    2. **Grounding & AI Context Explanation Panel:**
       - Distinguishes machine facts from narrative explanation:
         > *"Substation A failure isolated power to Building B wings 1 and 2. Because 4 laboratory sessions require dedicated 220V power, standard classrooms cannot absorb these classes without schedule adjustments."*
       - Grounded Chips: `[ 4 Labs Incompatible with Standard Halls ]` `[ Timetable Schedule Synchronized ]`

---

### 4.3 Impact / Blast Radius (`/incidents/[incidentId]/blast-radius`)

- **Primary Goal:** Trace and visualize how a root physical failure propagates across campus operational layers.
- **4-Tier Cascade Model:**
  ```text
  [ TIER 0: ROOT TARGET ]
  Electrical Substation A (Science Complex)
         │
         ▼
  [ TIER 1: DIRECT PHYSICAL FAILURES ]
  └── Building B (Power Loss to Wings 1 & 2)
         ├── 4 Laboratory Rooms (B101, B102, B204, B208)
         └── 3 Lecture Theatres (B301, B302, B305)
         │
         ▼
  [ TIER 2: DEPENDENT INFRASTRUCTURE SERVICES ]
  ├── Campus Wi-Fi Mesh East (AP-B1 through AP-B7 Offline) ──> 1,200 Peripheral Users
  ├── Electronic RFID Card Access (Fail-Secure Lock Mode)
  └── Central Chilled Water HVAC Loop 2
         │
         ▼
  [ TIER 3: SECONDARY HUMAN & SCHEDULE CASCADES ]
  ├── 4 Scheduled Laboratory Classes Disrupted (438 Enrolled Students)
  └── Evening Exam Relocation Constraint (Chemistry 101 Midterm @ 16:00)
  ```
- **Visual Graph Rendering:**
  - Interactive node-link DAG (Directed Acyclic Graph) with color-coded severity rings.
  - Clicking any node opens a slide-over drawer with entity attributes (scheduled courses, occupants, equipment).
- **Mandatory Dual-View Accessible Alternative:**
  - `[ Inspect as Accessible Table ]` toggle button displays:
    ```text
    Entity Node | Cascade Tier | Impact Type | Population Affected | Status / Health | Action
    Substation A | Tier 0 | Root Failure | Direct Grid | OFFLINE (Critical) | [ Inspect ]
    Building B | Tier 1 | Facility Outage | 438 Students | DEGRADED (Critical) | [ Inspect ]
    Campus Wi-Fi East| Tier 2 | Service Loss | 1,200 Peripheral | DEGRADED (High) | [ Inspect ]
    Chem 101 Lab | Tier 3 | Schedule Lock | 112 Students | DISPLACED (Critical)| [ Relocate ]
    ```

---

## 5. 5-Tier Severity System

Every incident is strictly classified into one of 5 standard tiers:

| Severity Tier | Icon | Border / Background Tokens | Operational Definition | Example |
| :--- | :--- | :--- | :--- | :--- |
| **CRITICAL** | `<AlertOctagon />` | `--color-status-critical` (`#ef4444`) | Systemic outage, campus safety risk, or >300 students displaced | Main Substation Failure, Building Fire Alarm |
| **HIGH** | `<AlertTriangle />` | `--color-status-warning` (`#f97316`) | Building-wide service loss, 100–300 students displaced | Major Network Switch Down, HVAC Failure in Summer |
| **MEDIUM** | `<AlertCircle />` | `--color-status-warning` (`#f59e0b`) | Single room/service disruption, 20–100 students displaced | Room B204 Projector & Power Strip Failure |
| **LOW** | `<Info />` | `--color-status-info` (`#38bdf8`) | Minor environmental anomaly, <20 students affected | Sensor Battery Low, Temperature Deviation 2°C |
| **INFORMATIONAL** | `<HelpCircle />` | `--color-status-neutral` (`#64748b`) | Scheduled drill, maintenance notice, zero disruption | Planned Fire Drill in Dormitory Wing |

---

## 6. Incident Lifecycle & Status State Machine

```text
[ DETECTED ] ──> [ INVESTIGATING ] ──> [ IMPACT ASSESSED ] ──> [ MITIGATION IN PROGRESS ] ──> [ RECOVERING ] ──> [ RESOLVED ] ──> [ CLOSED ]
```

| Lifecycle State | Label & Icon | Description & Transition Trigger |
| :--- | :--- | :--- |
| **DETECTED** | `[!] DETECTED` | Telemetry trigger received; awaiting initial system calculation. |
| **INVESTIGATING** | `[⌕] INVESTIGATING` | Incident Commander assigned; verifying root cause telemetry. |
| **IMPACT ASSESSED** | `[⛶] IMPACT ASSESSED` | Blast radius calculated; affected student headcounts confirmed. |
| **MITIGATION IN PROGRESS** | `[⚙] MITIGATION IN PROGRESS` | Recovery plan approved and broadcasted to campus stakeholders. |
| **RECOVERING** | `[↻] RECOVERING` | Physical repairs underway; classes rerouted to satellite rooms. |
| **RESOLVED** | `[✓] RESOLVED` | Primary utility restored; all facilities operational. |
| **CLOSED** | `[⊘] CLOSED` | Post-incident review completed; incident archived. |

---

## 7. Data Trust, Provenance & Confidence Framework

Every impact metric and diagnostic field explicitly communicates certainty:

```text
[ CONFIRMED ]  --> High certainty: Telemetry validated + physical hardware ack
[ ESTIMATED ]  --> Model inference: Schedule timetable + statistical enrollment (±5%)
[ PROJECTED ]  --> Simulation scenario: Projected outcome under assumed conditions
[ UNKNOWN ]    --> Unverified: Telemetry missing / sensor partitioned
```

---

## 8. Seamless Hand-offs to Downstream Workflows

### 8.1 Incident → Recovery Planning (Phase 5)
- Clicking `[ Review Recovery Plans → ]` transitions to `/incidents/[incidentId]/recovery`.
- **Inherited Context:** `incidentId`, `rootEntityId`, `displacedStudentCount (438)`, `specialEquipmentNeeds (Chemistry Lab Hoods)`, `targetBuildings`.
- The operator never re-selects the incident or re-enters constraints.

### 8.2 Incident → What-If Simulation (Phase 6)
- The action panel provides an instant scenario sandbox trigger: `[ "What if power outage extends +60m?" ]`.
- Transitions to `/incidents/[incidentId]/simulation` with all current incident parameters pre-loaded as baseline.

---

## 9. Handling Edge States & Graceful Degradation

| Operational Condition | Visual Manifestation | Preserved Functionality |
| :--- | :--- | :--- |
| **Zero Active Incidents** | Green check illustration: *"Campus operational state is normal. 0 active disruptions."* Displays last resolved incident card (`Resolved 42m ago`). | `[ Create Incident ]` and `[ Schedule Drill ]` buttons active. |
| **Multiple Active Incidents (e.g. 3)** | Stacked triage cards sorted strictly by Severity > Impact > Urgency. Top alert banner summarizes aggregate affected headcounts. | Individual incident isolation preserved. |
| **Impact Calculation Failed** | Impact card shows: *"Impact calculation temporarily unavailable."* Raw telemetry and incident header remain fully accessible. | Operator can manually inspect room list or retry engine. |
| **Stale Incident Telemetry** | Amber banner: *"⚠️ Sensor sync delayed 4m."* Last calculated blast radius remains visible with clear timestamp. | `[ Revalidate Telemetry ]` button available. |

---

## 10. Responsive Specifications

```text
DESKTOP (>= 1280px)                    TABLET (768px - 1023px)                MOBILE (< 768px)
+------------------------------------+  +------------------------------------+  +------------------------------------+
| Pinned Context: [CRITICAL] Bldg B  |  | Pinned Context: [CRITICAL] Bldg B  |  | Status Pill: [CRITICAL] Bldg B (438|
+------------------------------------+  +------------------------------------+  +------------------------------------+
| 2-COLUMN DOSSIER:                  |  | SINGLE COLUMN STACK:               |  | SEVERITY & TITLE (Top Sticky):     |
| [Root Cause Card]   [Actions Panel]|  | [Incident Summary & Root Cause]    |  | • [CRITICAL] Building B Outage     |
| [Impact KPI Strip]  [AI Narrative] |  | [Impact 4-KPI Grid (2x2)]          |  | • 438 Students Affected            |
| [Blast Radius DAG]                 |  | [Blast Radius Canvas (Collapsible)]|  +------------------------------------+
| [Chronological Timeline]           |  | [Action Buttons Strip]             |  | PRIMARY ACTION:                    |
|                                    |  | [Chronological Timeline]           |  | [ View Recovery Plans → ]          |
+------------------------------------+  +------------------------------------+  +------------------------------------+
                                                                                | BLAST RADIUS (Expandable Tree):    |
                                                                                | ▶ Tier 1: Building B (7 Rooms)     |
                                                                                | ▶ Tier 2: Wi-Fi Mesh East          |
                                                                                +------------------------------------+
                                                                                | TIMELINE (Collapsible Drawer)      |
                                                                                +------------------------------------+
```

---

## 11. Accessibility Compliance (WCAG 2.1 AA)

- **Semantic Landmarks:** `<main id="main-content">`, `<section aria-labelledby="root-cause-heading">`, `<section aria-labelledby="blast-radius-heading">`.
- **Keyboard Traversal:** Complete keyboard access across DAG nodes, triage lists, and action buttons.
- **Visible Focus:** 2px sky-blue outline (`#38bdf8`) with 2px offset.
- **Non-Color Exclusivity:** Every severity tier combines an SVG icon, explicit uppercase text (`CRITICAL`), and semantic token borders.
- **Accessible Tree & Table:** Blast Radius DAG is fully traversable via `<ol role="tree">` and convertible to a semantic HTML `<table>`.

---

## 12. Frontend Developer Implementation Notes (for Ishu & Tanisha)

```text
apps/web/src/
├── app/(operator)/incidents/
│   ├── page.tsx                         # Active Incidents Queue
│   └── [incidentId]/
│       ├── page.tsx                     # Incident Details & Root Cause Dossier
│       └── blast-radius/
│           └── page.tsx                 # Blast Radius Cascade Inspector
└── features/incidents/
    ├── components/
    │   ├── PinnedIncidentContextBar.tsx # Persistent top context strip
    │   ├── IncidentTriageCard.tsx       # Queue list item with severity badges
    │   ├── RootCauseCard.tsx            # Confirmed vs Suspected diagnosis panel
    │   ├── ImpactKpiStrip.tsx           # 4-card metric group (font-mono tabular-nums)
    │   ├── BlastRadiusVisualizer.tsx    # Node-link DAG canvas + Table dual-view
    │   ├── IncidentTimeline.tsx         # Chronological audit stream
    │   └── IncidentActionPanel.tsx      # Downstream navigation & confirmation CTAs
    └── hooks/
        ├── useActiveIncidents.ts        # Queue fetching & triage filter hook
        ├── useIncidentDetails.ts        # Incident dossier hook
        └── useBlastRadiusGraph.ts       # Cascade calculation & node traversal hook
```
