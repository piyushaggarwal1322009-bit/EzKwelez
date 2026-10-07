# EzyKwelez — Screen Specification: Live Campus

**Screen Designation:** `2.0 Live Campus (Operational Surveillance & Environmental Health Console)`  
**Route Mapping:** `app/(operator)/live-campus/` (`page.tsx`, `occupancy/page.tsx`, `connectivity/page.tsx`, `[locationId]/page.tsx`)  
**UI/UX Owner:** Aile Sharma (`Lead UI/UX Designer & Design System Owner`)  
**Target Audience:** Campus Operations Lead, Environmental Monitoring Specialist, Facilities Engineer  
**Status:** Phase 3 Finalized  
**Version:** 1.0  

---

## 1. Executive Purpose & Mental Model

The **Live Campus** suite is the continuous operational monitoring environment for EzyKwelez. It answers the fundamental question:

> **"What is happening across my campus right now, and where are operational conditions changing?"**

Live Campus provides continuous situational surveillance without requiring an active declared crisis. It bridges the gap between raw physical telemetry and actionable operational awareness.

### 1.1 Decision Progression Model
```text
Campus Overview ──> Target Location ──> Current Conditions ──> Supporting Telemetry ──> Operational Action
 (Macro Summary)     (Micro Building)    (Occ & Connect)       (Trends & Freshness)     (Concern vs. Incident)
```

### 1.2 Telemetry Reliability Axiom
> **"Never visually imply live sensor telemetry when data is simulated, estimated, stale, or unavailable."**

Every telemetry figure strictly declares its provenance, freshness, and calculation tier.

---

## 2. Information Architecture: 4 Connected Views

```text
Live Campus (app/(operator)/live-campus/)
├── 2.1 Overview (page.tsx)
│   ├── Campus-wide Operational Health Matrix (18 Buildings)
│   ├── Aggregate Occupancy & Grid Connectivity Summary
│   ├── Notable Condition Changes Feed
│   └── Quick Jump Filters (All, Watch, Degraded, Critical)
├── 2.2 Occupancy Monitor (occupancy/page.tsx)
│   ├── Building & Room Utilization Scorecard
│   ├── Capacity Threshold Heatmap (<70% Normal, 70–89% Elevated, ≥90% Overflow Risk)
│   ├── Utilization Velocity / Trajectory (Increasing, Stable, Decreasing)
│   └── Proximity to Capacity Rankings
├── 2.3 Connectivity & Infrastructure (connectivity/page.tsx)
│   ├── Utility Grid Signal Health (Power Substation, Fiber Backbone, IoT Gateways)
│   ├── Normalized Connection Score (0–100) & Status (Excellent, Good, Degraded, Poor, Offline)
│   ├── Latency Metrics (ms) & Packet Reliability
│   └── Single Point of Failure (SPOF) Dependency Links
└── 2.4 Location Detail ([locationId]/page.tsx or Slide-Over Drawer)
    ├── Unified Location Health Verdict (NORMAL, WATCH, DEGRADED, CRITICAL, UNKNOWN)
    ├── Synchronized Dual-Metric Breakdown (Occupancy + Connectivity)
    ├── Recent Telemetry Delta Log (Last 60m)
    ├── Linked Disruption Context (Declared Incident vs. Unacknowledged Concern)
    └── Operational Triage Actions
```

---

## 3. View Specifications

### 3.1 Live Campus Overview (`/live-campus`)

- **Primary Goal:** Executive surveillance across all physical campus zones with immediate identification of deteriorating conditions.
- **Top Metric Summary Bar:**
  - **Overall Campus Health:** `94% Operational` | `16 Normal · 2 Watch · 0 Critical`
  - **Aggregate Occupancy:** `72%` (`4,320 / 6,000 Seats Occupied`) · Trend: `Stable`
  - **Grid Connectivity:** `91%` (`35 / 38 Nodes Healthy`) · Trend: `Degraded (Substation A)`
  - **Freshness Gauge:** `LIVE · Synced 12s ago`
- **Operational Building Schematic & Matrix:**
  - **Visual Mode (Schematic Grid):** 18 responsive building cards arranged in physical campus clusters (Academic Core, Science Complex, Residential Quad, Athletics, Student Union).
  - **Accessible Dual-View Mode:** Semantic HTML table listing:
    ```text
    Location | Overall Health | Occupancy (% / Max) | Connectivity | Freshness | Action
    Science Complex B | WATCH | 73% (438/600) Increasing | 64% Degraded | LIVE (42s) | [ Inspect ]
    Library Main | NORMAL | 88% (880/1000) Stable | 98% Excellent | LIVE (10s) | [ Inspect ]
    Engineering C | NORMAL | 42% (210/500) Decreasing | 95% Good | ESTIMATED (3m)| [ Inspect ]
    ```
- **Notable Condition Changes Feed (Right Column / Secondary Panel):**
  - Displays deterministic, timestamped environmental events:
    - `[ 3m ago ] Connectivity degraded: Science Complex B (94% → 64%)`
    - `[ 8m ago ] High occupancy warning: Library 2nd Floor (88% capacity)`
    - `[ 14m ago ] Substation B2 recovered: Power restored to Humanities Wing`

---

### 3.2 Occupancy Monitor (`/live-campus/occupancy`)

- **Primary Goal:** Identify room and building capacity pressures, find available absorption space for relocations, and track crowd migration velocity.
- **Key Data Attributes per Location:**
  - **Current Occupancy:** `438 students` (`JetBrains Mono tabular-nums`)
  - **Total Design Capacity:** `600 seats`
  - **Utilization Percentage:** `73%`
  - **Utilization State:**
    - `Optimal`: `< 70%` (Green fill / `--color-status-success`)
    - `Elevated`: `70% – 89%` (Amber fill / `--color-status-warning`)
    - `Overflow Risk`: `≥ 90%` (Red fill / `--color-status-critical`)
  - **Velocity Trend:** `Increasing (+14% / 10m)` | `Stable (±2%)` | `Decreasing (-8% / 10m)`
  - **Data Provenance Badge:** `LIVE (IR Sensor)` | `ESTIMATED (Timetable Fallback)` | `SIMULATED`
- **Curated Operational Filters:**
  - `Approaching Capacity (≥85%)`
  - `Highest Available Space (Top Absorption Targets)`
  - `Rapidly Increasing Utilization`
  - `Sensor Discrepancy / Fallback Mode`

---

### 3.3 Connectivity & Infrastructure (`/live-campus/connectivity`)

- **Primary Goal:** Monitor network backbones, power distribution relays, and IoT gateways to preempt systemic campus failures.
- **Key Data Attributes per Subsystem / Node:**
  - **Normalized Connection Score:** `0 – 100` (`JetBrains Mono tabular-nums`)
  - **Connection State:**
    - `EXCELLENT`: `95–100%` (4 full signal bars, Green)
    - `GOOD`: `80–94%` (3 bars, Green/Cyan)
    - `DEGRADED`: `50–79%` (2 bars, Amber)
    - `POOR`: `20–49%` (1 bar, Amber/Red)
    - `OFFLINE`: `0–19%` (0 bars + exclamation icon, Red)
    - `UNKNOWN`: `--` (Dashed bars, Muted Slate)
  - **Telemetry Metrics:** Latency `24ms` (p95 `48ms`), Packet Loss `0.02%`, Active APs `42/44`
  - **Data Provenance Badge:** `LIVE (SNMP Telemetry)` | `STALE (Last seen 18m ago)` | `UNAVAILABLE`

---

### 3.4 Location Detail (`/live-campus/[locationId]`)

- **Primary Goal:** Complete contextual profile of a single building or room for rapid diagnosis.
- **Anatomy:**
  ```text
  +-----------------------------------------------------------------------------------+
  | SCIENCE BUILDING (Building B)                           Status: WATCH (Amber)     |
  | Campus Zone: Science & Technology Quad                   Freshness: LIVE · 42s ago  |
  +-----------------------------------------------------------------------------------+
  | [ OCCUPANCY ]                                   | [ CONNECTIVITY ]                |
  | 438 / 600 Seats (73% Utilization)               | 64 / 100 Health Score           |
  | Trend: Increasing (+8% in last 10m)             | State: DEGRADED (Substation A)  |
  | Source: Live IR Mesh (7/7 Rooms Online)         | Source: Live SNMP Relay         |
  +-------------------------------------------------+---------------------------------+
  | RECENT CONDITION CHANGES (Last 60m):                                              |
  | • 14:48 — Connectivity dropped below 70% threshold (Substation A voltage drop)    |
  | • 14:42 — Room B204 crossed 90% occupancy threshold (Lecture in progress)        |
  +-----------------------------------------------------------------------------------+
  | LINKED INCIDENT CONTEXT:                                                          |
  | ⚠️ Potential Operational Concern: Unacknowledged power fluctuation detected.      |
  | [ Link to Incident Workflow → ]             [ Compare Nearby Available Rooms → ] |
  +-----------------------------------------------------------------------------------+
  ```

---

## 4. Location Health Calculation & Separation of Tiers

Location health is a deterministic synthesis of environmental vectors, strictly distinguishing between raw telemetry, calculated scores, and system interpretations:

```text
+-----------------------------------------------------------------------------+
| 1. OBSERVED DATA (Raw Telemetry)                                            |
|    • Occupancy: 438 persons (IR Gateway ID: `ir-bldg-b`)                   |
|    • Connectivity: 64/100 (Ping latency: 142ms to Gateway `gw-sub-a`)       |
+-----------------------------------------------------------------------------+
| 2. CALCULATED CONDITION (Deterministic Rules Engine)                         |
|    • Utilization Ratio = 438 / 600 = 73% (Elevated)                         |
|    • Connectivity Status = 64/100 (Degraded)                                |
|    • Location Verdict = Max(OccupancyRisk, ConnectivityRisk) = WATCH        |
+-----------------------------------------------------------------------------+
| 3. SYSTEM INTERPRETATION (Grounded Context)                                  |
|    "Elevated occupancy in Room B204 combined with Substation A degradation  |
|    creates a vulnerability for 438 students if power drops further."         |
+-----------------------------------------------------------------------------+
```

### Health Verdict Matrix:
| Occupancy State | Connectivity State | Combined Location Health | UI Treatment |
| :--- | :--- | :--- | :--- |
| Normal (`<70%`) | Excellent / Good (`≥80%`) | **NORMAL** | Green border, CheckCircle icon |
| Elevated (`70–89%`)| Good / Degraded (`50–79%`) | **WATCH** | Amber border, AlertTriangle icon |
| Overflow (`≥90%`) | Degraded (`50–79%`) | **DEGRADED** | Amber/Orange border, AlertTriangle icon |
| Any | Offline / Critical (`<20%`) | **CRITICAL** | Red border, AlertOctagon icon |
| Unavailable | Unavailable | **UNKNOWN** | Muted dashed border, HelpCircle icon |

---

## 5. Data Freshness & Reliability Framework

Every metric displayed across Live Campus must explicitly render its freshness pill.

```text
[ LIVE · 30s ago ]       --> Green dot + text: Real-time validated telemetry feed
[ SIMULATED · 10s ago ]  --> Sky-blue dot + text: Scenario engine sandbox values
[ ESTIMATED · 4m ago ]   --> Purple dot + text: Timetable / historical model inference
[ STALE · 18m ago ]      --> Amber warning dot + text: Telemetry sync delayed / idle
[ UNAVAILABLE ]          --> Muted grey dot + text: Sensor offline / network partition
```

### Visual & Behavioral Degradation Rules:
1. **Stale Telemetry (`> 5 minutes without sync`):** Metric card dims by 20% luminance; an amber warning pill appears with a `[ Refresh ]` trigger.
2. **Partial Sensor Outage:** If occupancy is live but connectivity is offline, the card renders: `Occupancy: LIVE (73%)` | `Connectivity: UNAVAILABLE (--)` | `Overall: UNKNOWN`. The UI never invents composite numbers when partial data is missing.
3. **Sensor Discrepancy:** If IR sensors disagree with scheduled timetable headcount by >50%, an `[ Anomaly Detected ]` badge prompts operator verification.

---

## 6. Relationship Between Live Conditions & Incidents

Live Campus maintains a strict boundary between continuous telemetry surveillance and formal crisis management:

```text
+---------------------------------------------------------------------------+
| OBSERVED TELEMETRY                           DECLARED INCIDENT             |
| (Live Campus Area)                           (Incidents Area)              |
|                                                                           |
| "Connectivity degraded (64%)"   ───────>     "Building B Power Failure"    |
| "Elevated Occupancy (73%)"                   "438 Students Displaced"      |
|                                              "Recovery Plan B Pending"     |
| [ Potential Operational Concern ]            [ Active Incident #INC-104 ]  |
+---------------------------------------------------------------------------+
```

- **Unacknowledged Concerns:** Displayed with the neutral label *"Condition requires attention"*.
- **Direct Incident Escalation:** Operators can click `[ Escalate to Incident Queue → ]` to pre-populate an incident report with live telemetry values from that building.
- **Linked Active Incidents:** If an incident is already declared for a location, the Live Campus card displays a pulsing badge `[ Linked: Incident #INC-104 (Critical) → ]`.

---

## 7. Responsive Specifications

```text
DESKTOP (>= 1280px)                    TABLET (768px - 1023px)                MOBILE (< 768px)
+------------------------------------+  +------------------------------------+  +------------------------------------+
| [Campus Health Strip: 94% Normal]  |  | [Campus Health Strip: 94%]         |  | [Health: 94% · 2 Watch Locations]  |
+------------------------------------+  +------------------------------------+  +------------------------------------+
| 18-Building Operational Schematic  |  | 2-Column Building Card Grid        |  | Filter Chips: [All][Watch][Degraded|
| (Visual Status Grid)               |  | (Scrollable container)             |  +------------------------------------+
|                                    |  +------------------------------------+  | WATCH LOCATIONS (Card Stack):      |
|                                    |  | Notable Condition Changes Feed     |  | • Science Building B               |
| +--------------------------------+ |  | (Below grid)                       |  |   Occ: 73% · Conn: 64% (Degraded)  |
| | Recent Condition Changes Feed   | |  +------------------------------------+  |   [ View Location Details → ]      |
| +--------------------------------+ |                                          +------------------------------------+
+------------------------------------+                                          | NORMAL LOCATIONS (Collapsed Accord)|
                                                                                +------------------------------------+
                                                                                | Bottom Nav: [Overview][Occ][Conn]  |
                                                                                +------------------------------------+
```

---

## 8. Accessibility Compliance (WCAG 2.1 AA)

- **Landmarks:** Screen uses `<main id="main-content">`, `<section aria-labelledby="occupancy-heading">`, `<section aria-labelledby="connectivity-heading">`.
- **Accessible Data Table Alternative:** All schematic maps and grid views provide an immediate toggle to render as a fully accessible semantic HTML `<table>` with headers and `aria-sort`.
- **Non-Color Reliance:** Every status pill and cell pairs color with an SVG icon (`CheckCircle2`, `AlertTriangle`, `AlertOctagon`, `HelpCircle`) and text (`NORMAL`, `WATCH`, `DEGRADED`, `CRITICAL`, `UNKNOWN`).
- **Screen Reader Announcements:** Dynamic telemetry updates utilize `aria-live="polite"` so screen reader users are not interrupted during navigation.
- **Keyboard Traversal:** Logical tab order across filter tabs, table rows, and action triggers with 2px sky-blue (`#38bdf8`) focus rings.

---

## 9. Developer Implementation Contract (for Ishu & Tanisha)

```text
apps/web/src/
├── app/(operator)/live-campus/
│   ├── page.tsx                         # Live Campus Overview
│   ├── occupancy/page.tsx               # Occupancy Deep Dive
│   ├── connectivity/page.tsx            # Connectivity Deep Dive
│   └── [locationId]/page.tsx            # Location Detail Dossier
└── features/live-campus/
    ├── components/
    │   ├── CampusHealthMatrix.tsx       # 18-building operational grid + Table view
    │   ├── OccupancyScorecard.tsx       # Utilization bar, capacity, trend badge
    │   ├── ConnectivitySignalCard.tsx   # Signal bars, latency, uptime status
    │   ├── LocationHealthBadge.tsx      # Unified status badge (Normal/Watch/Degraded)
    │   ├── FreshnessPill.tsx            # Provenance badge (Live/Simulated/Estimated/Stale)
    │   └── ConditionChangesFeed.tsx     # Timestamped environmental delta list
    └── hooks/
        ├── useLiveCampusOverview.ts     # Aggregated overview hook
        ├── useOccupancyTelemetry.ts     # Occupancy query & poll hook
        └── useConnectivityTelemetry.ts  # Connectivity query & poll hook
```

---

## 10. Summary Verification

- [x] Answers *"What is happening across campus and where are conditions changing?"*
- [x] Equal representation of **Occupancy** and **Connectivity**.
- [x] Explicit **Freshness & Provenance** states (`LIVE`, `SIMULATED`, `ESTIMATED`, `STALE`, `UNAVAILABLE`, `UNKNOWN`).
- [x] Deterministic **Location Health** calculation (`NORMAL`, `WATCH`, `DEGRADED`, `CRITICAL`, `UNKNOWN`).
- [x] Separates observed telemetry from declared incidents.
- [x] Accessible table dual-view for all spatial/grid representations.
- [x] Complies with Design System tokens (`#090d16` canvas, Inter, JetBrains Mono).
