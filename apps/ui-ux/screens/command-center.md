# EzyKwelez — Screen Specification: Command Center

**Screen Designation:** `1.1 Command Center (Flagship Operational Console)`  
**Route Mapping:** `app/(operator)/command-center/page.tsx`  
**UI/UX Owner:** Aile Sharma (`Lead UI/UX Designer & Design System Owner`)  
**Target Audience:** Campus Operations Director, Incident Response Lead, Facilities Administrator  
**Status:** Phase 2 Finalized  
**Version:** 1.0  

---

## 1. Executive Screen Purpose & Mental Model

The **Command Center** is the flagship entry screen for EzyKwelez. It answers the single most critical operational question within 5 seconds of viewport load:

> **"What is happening across my campus right now, and what requires my immediate attention?"**

The screen establishes **immediate operational control under crisis**, structuring situational awareness into a disciplined decision loop:
```text
1. Is the campus healthy? ──> [Campus Operational Status Header]
2. Is something wrong?    ──> [Critical Metric Strip: Active Disruptions & Displaced Students]
3. Where is it happening? ──> [Spatial Campus Decision Map / Building Health Schematic]
4. Who/what is affected?  ──> [Priority Active Incidents Feed & Live Conditions Summary]
5. What should I do next? ──> [Contextual Operational Recommendation / Grounded Action]
```

---

## 2. 4-Level Information Hierarchy

```text
+---------------------------------------------------------------------------------------------------------+
| LEVEL 1: CAMPUS OPERATIONAL STATE (Banner)                                                              |
| [CRITICAL DISRUPTION] 1 Critical incident requires operator action · 438 Students affected              |
+---------------------------------------------------------------------------------------------------------+
| LEVEL 2: CONTEXTUAL EXPLANATION & SURVEILLANCE (Metrics + Spatial Map + Incident Feed)                 |
| [ 1 Active Incidents ] [ 438 Displaced Students ] [ 1 Impacted Building ] [ 82/100 Operational Health ]|
|                                                                                                         |
| +-----------------------------------------------+ +---------------------------------------------------+ |
| | SPATIAL CAMPUS OVERVIEW (Building Health Map) | | PRIORITY ACTIVE INCIDENTS FEED                    | |
| | • Building B: [CRITICAL OUTAGE] (Red)         | | [CRITICAL] Building B Power Outage · 24m elapsed  | |
| | • Building A, C, D: [OPERATIONAL] (Green)     | | Target: Main Substation | 7 Rooms Closed          | |
| | • Wing E: [DEGRADED OCCUPANCY] (Amber)        | |                                                   | |
| |                                               | | LIVE CONDITIONS:                                  | |
| | [ Inspect as Accessible Table ]               | | • Occupancy: 72% (Normal)  • Network: 91% (Good)  | |
| +-----------------------------------------------+ +---------------------------------------------------+ |
+---------------------------------------------------------------------------------------------------------+
| LEVEL 3: ACTION & RECOMMENDED INTERVENTION (Contextual Insight)                                         |
| [ RECOMMENDED ACTION ]                                                                                  |
| "Building B outage is affecting 438 students. Plan B reduces displacement by 95%."                       |
| [ View Blast Radius → ]                  [ Review Recovery Plan B → ]                                  |
+---------------------------------------------------------------------------------------------------------+
| LEVEL 4: INSPECTION ON DEMAND (Drawers & Modals)                                                        |
| • Building Detail Slide-Over Drawer • AI Grounding Evidence Panel • Situational Audit Trail            |
+---------------------------------------------------------------------------------------------------------+
```

---

## 3. Detailed Component & Section Specifications

### 3.1 Global Application Shell
- **Top Command Bar (Height: `56px`):**
  - Left: EzyKwelez Wordmark + Campus Selector Dropdown (`Main Campus ▼`).
  - Center: Global Search / Command Palette trigger (`⌘K Search buildings, rooms, incidents...`).
  - Right: Live Alert Ticker (`1 Critical`), Telemetry Sync Status Indicator (`🟢 Synced`), Operator Profile Badge.
- **Sidebar Rail (Width: `240px` / `64px` collapsed):**
  - Active Item: `Command Center` (Highlighted `--color-brand-primary` left border + tint).

---

### 3.2 Section A: Campus Operational Status Banner
- **Purpose:** Immediate Level 1 situational verdict.
- **Anatomy:**
  ```text
  [ Status Symbol (24px) | Headline Title (18px Bold) | Supporting Metric Description | Freshness Stamp ]
  ```
- **State Matrix:**
  - **CRITICAL (Active Disruption):**
    - Background: `rgba(239, 68, 68, 0.12)`, Border: `1px solid rgba(239, 68, 68, 0.35)`.
    - Icon: `<AlertOctagon className="text-status-critical" />` (Pulsing 6px indicator).
    - Headline: `CRITICAL CAMPUS DISRUPTION`
    - Subtext: `1 critical power failure in Building B affecting 438 students across 7 rooms.`
    - Freshness: `Updated 10s ago · Live Telemetry`
  - **DEGRADED (Elevated Load / Warnings):**
    - Background: `rgba(245, 158, 11, 0.12)`, Border: `1px solid rgba(245, 158, 11, 0.35)`.
    - Icon: `<AlertTriangle className="text-status-warning" />`
    - Headline: `DEGRADED OPERATIONAL CAPACITY`
    - Subtext: `High occupancy threshold reached in Science Complex Wing C (92% capacity).`
  - **NORMAL (All Clear):**
    - Background: `rgba(16, 185, 129, 0.12)`, Border: `1px solid rgba(16, 185, 129, 0.35)`.
    - Icon: `<CheckCircle2 className="text-status-success" />`
    - Headline: `CAMPUS OPERATING NORMALLY`
    - Subtext: `All 18 buildings operational. Zero active disruption alerts across academic facilities.`

---

### 3.3 Section B: Critical Metrics KPI Strip
- **Layout:** 4-column responsive grid (`gap-4`).
- **Metric Cards:**
  1. **Active Disruptions:** `1` (Severity: Critical) | Subtext: `+1 in last hour` | Icon: `<AlertCircle />`
  2. **Students Affected:** `438` (Tabular Mono) | Subtext: `across 4 scheduled classes` | Icon: `<Users />`
  3. **Impacted Facilities:** `1 Building / 7 Rooms` | Subtext: `Science Complex` | Icon: `<Building2 />`
  4. **Operational Health Index:** `82 / 100` | Subtext: `Target: >= 95` | Icon: `<Activity />`
- **Rule:** Monospace numerals (`JetBrains Mono tabular-nums`) prevent layout jitter during polling refreshes.

---

### 3.4 Section C: Campus Operational Overview (Decision Map)
- **Purpose:** Spatial decision map answering *"Where is the disruption physically located?"*
- **Visual Design:**
  - 2D Vector Schematic showing major campus building polygons with clear status fills:
    - Normal: Slate fill (`#0f172a`), Subtle border (`#1e293b`).
    - Warning: Amber tint (`rgba(245, 158, 11, 0.15)`), Border (`#f59e0b`).
    - Critical Failure: Red tint (`rgba(239, 68, 68, 0.2)`), Red border (`#ef4444`), Subtle animated pulse.
    - Stale / Unknown: Slate-muted fill (`#131d33`), Dashed border (`#475569`).
  - Active utility overlay lines connecting power distribution nodes to building envelopes.
- **Interactions:**
  - Hovering a building displays a micro-card: `Building B · 7 Rooms Closed · 4 Classes Affected`.
  - Clicking a building opens the **Building Detail Drawer (Level 4)** on the right rail.
- **Dual-View Accessibility Requirement:**
  - A toggle button `[ Inspect as Accessible Table ]` switches the schematic into a semantic `<DataTable />` listing buildings, current health status, closed rooms, and student counts.

---

### 3.5 Section D: Priority Active Incidents Feed
- **Purpose:** Ordered triage list sorted by calculated impact severity.
- **Incident Card Anatomy:**
  ```text
  +---------------------------------------------------------------------------------+
  | [CRITICAL] Building B Power Outage                              24m ago · Active|
  | Location: Science Complex · Building B                                          |
  | Direct Root: Main Transformer Substation                                        |
  | Cascade Impact: [ 7 Rooms Closed ] [ 4 Classes Stranded ] [ 438 Students ]     |
  | ------------------------------------------------------------------------------- |
  | [ View Blast Radius → ]                            [ Review Recovery Plans → ]  |
  +---------------------------------------------------------------------------------+
  ```
- **States:** Hover border luminance elevation; click transitions to Incident Details (`/incidents/inc-bldg-b-outage`).

---

### 3.6 Section E: Live Campus Conditions Summary
- **Purpose:** Compact executive surveillance for environmental factors without overwhelming the screen.
- **Widgets:**
  1. **Campus Occupancy Index:**
     - Value: `72% Overall Utilization` (Normal).
     - Progress Bar: 72% fill (Green `<70%`, Amber `70-89%`, Red `>=90%`).
     - Action Link: `[ Open Occupancy Monitor → ]` (routes to `/live-campus/occupancy`).
  2. **Campus Connectivity & Utilities:**
     - Value: `91% Utility Health` (Power Substation A Degraded).
     - Signal Bar: 4/4 bars with amber warning badge.
     - Action Link: `[ Inspect Grid Connectivity → ]` (routes to `/live-campus/connectivity`).

---

### 3.7 Section F: Operational Insight & Recommended Next Action
- **Purpose:** High-value decision assistance separating deterministic engine facts from AI explanations.
- **Visual Design:**
  - Border: `1px solid var(--color-brand-primary)` with subtle blue gradient tint.
  - Header: `<Compass className="text-brand-accent" /> Recommended Operational Action`.
  - Core Rationale:
    > *"Building B power failure is currently displacing 438 students across 7 laboratory rooms. The optimizer has evaluated 3 recovery options: **Plan B (Satellite Relocation)** resolves 100% of laboratory equipment requirements and reduces student displacement to 21 (-95%)."*
  - Grounded Evidence Chips: `[ 7 Rooms Evaluated ]` `[ 0 Schedule Conflicts in Plan B ]` `[ +45m Avg Walk ]`
  - Action Controls:
    - Primary: `[ Review & Approve Recovery Plan B → ]` (routes directly to `/incidents/inc-bldg-b-outage/recovery`).
    - Secondary: `[ Simulate 60m Outage Extension ]` (routes to `/incidents/inc-bldg-b-outage/simulation`).

---

## 4. Comprehensive Data State Specifications

| Operational State | Visual Manifestation | Primary CTA Provided |
| :--- | :--- | :--- |
| **1. Active Critical Crisis** (Default Demo) | Red Status Banner, pulsing Building B node, 438 students affected metric, Plan B recommendation. | `[ Review Recovery Plan B ]` |
| **2. Normal / All Clear** | Green Status Banner: *"Campus operating normally. 0 active disruptions across 18 buildings."* | `[ Create Scheduled Drill / Incident ]` |
| **3. Multiple Incidents** | Stacked triage cards sorted by impact score (`Critical` top, `Moderate` second). Metrics aggregate total counts. | `[ Filter by Severity ]` |
| **4. Loading State** | Skeleton shimmer placeholders matching exact dimensions of KPI strip, map canvas, and cards. | None (Interactive navigation preserved) |
| **5. Stale Telemetry** | Amber top strip: *"⚠️ Telemetry sync paused (network idle 60s)."* Data retains last known values. | `[ Refresh Telemetry Sync ]` |
| **6. Partial Telemetry Outage** | Card alert: *"IoT Occupancy sensors offline for Wing D. Estimated values based on schedule timetable."* | `[ View Timetable Fallback ]` |
| **7. Error State** | Red alert container: *"Failed to connect to campus operational database."* No fake data presented. | `[ Retry Connection ]` |

---

## 5. Responsive Layout Behavior

```text
DESKTOP (>= 1280px)                    TABLET (768px - 1023px)                MOBILE (< 768px)
+------------------------------------+  +------------------------------------+  +------------------------------------+
| [Status Banner: CRITICAL OUTAGE]   |  | [Status Banner: CRITICAL OUTAGE]   |  | [Status Banner: CRITICAL]          |
+------------------------------------+  +------------------------------------+  +------------------------------------+
| [Metric 1][Metric 2][Met 3][Met 4] |  | [Metric 1][Metric 2]               |  | [Metric Carousel: 438 Displaced]   |
+------------------+-----------------+  | [Metric 3][Metric 4]               |  +------------------------------------+
| SPATIAL MAP      | ACTIVE INCIDENT |  +------------------------------------+  | PRIORITY INCIDENT:                 |
| (Interactive     | (Feed + Action) |  | SPATIAL MAP (300px fixed height)   |  | • Building B Power Outage          |
|  Vector Canvas)  |                 |  +------------------------------------+  | • 438 Students Affected            |
|                  | LIVE CONDITIONS |  | ACTIVE INCIDENT FEED               |  | [ Review Recovery Plan → ]         |
|                  | (Occ & Connect) |  | LIVE CONDITIONS                    |  +------------------------------------+
+------------------+-----------------+  +------------------------------------+  | LIVE CONDITIONS:                   |
| RECOMMENDED OPERATIONAL ACTION     |  | RECOMMENDED OPERATIONAL ACTION     |  | • Occupancy: 72%  • Network: 91%   |
+------------------------------------+  +------------------------------------+  +------------------------------------+
                                                                                | [ View Interactive Map (Sheet) ]   |
                                                                                +------------------------------------+
```

- **Mobile Specific Ergonomics:**
  - Sticky Level 1 Status Banner locked at top.
  - Active incident card takes full viewport width with high-contrast primary CTA.
  - Map transforms into a tapable button `[ View Spatial Campus Map ]` opening a full-screen interactive sheet with pinch-to-zoom.

---

## 6. Accessibility Compliance (WCAG 2.1 AA)

- **Semantic Landmarks:** Header `<header role="banner">`, Navigation `<nav aria-label="Main Navigation">`, Main content `<main id="main-content">`, Alert `<div role="alert" aria-live="assertive">`.
- **Keyboard Traversal:** Full tab stop order: Top Bar Search -> KPI Cards -> Map Buildings -> Incident Actions -> Recommended Action.
- **Focus Rings:** Visible 2px sky-blue ring (`#38bdf8`) with 2px offset on all interactive buttons and map polygons.
- **Non-Color Redundancy:** Every status indicator pairs color with a vector icon (`AlertOctagon`, `AlertTriangle`, `CheckCircle2`) and explicit uppercase text.
- **Screen Reader Dual-View:** Campus decision map includes an `aria-label="Campus Spatial Health Schematic"` and a dedicated toggle button exposing a semantic HTML `<table>` with building status summaries.

---

## 7. Frontend Developer Implementation Notes (for Ishu & Tanisha)

- **Component File Structure:**
  ```text
  apps/web/src/
  ├── app/(operator)/command-center/
  │   └── page.tsx                         # Command Center layout container
  ├── features/command-center/
  │   ├── components/
  │   │   ├── CampusStatusBanner.tsx       # Level 1 Operational state header
  │   │   ├── CriticalMetricsStrip.tsx     # 4-card KPI strip
  │   │   ├── SpatialDecisionMap.tsx       # 2D SVG building health schematic
  │   │   ├── PriorityIncidentFeed.tsx     # Ordered triage list
  │   │   ├── LiveConditionsSummary.tsx    # Occupancy & Connectivity widgets
  │   │   └── RecommendedActionPanel.tsx   # Grounded decision recommendation
  │   └── hooks/
  │       └── useCommandCenterState.ts     # Aggregated view state hook
  ```
- **Tokens & CSS:** Strictly use tokens mapped in `DEVELOPER-HANDOFF.md`. All metric counts must include `font-mono tabular-nums`.
- **SOLID Compliance:** `SpatialDecisionMap` and `PriorityIncidentFeed` are purely presentational and receive typed props with event callbacks (`onSelectBuilding`, `onSelectIncident`, `onApproveRecovery`).
