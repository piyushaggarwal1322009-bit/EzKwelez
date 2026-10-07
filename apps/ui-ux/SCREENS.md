# EzyKwelez — Screen Specifications & Operational Inventory

**Owner:** Aile Sharma (`Lead UI/UX Designer & Design System Owner`)  
**Status:** Phase 1B Finalized  
**Version:** 1.2  
**Scope:** Functional and visual specifications for the 6 core product areas across 11 distinct views.

> [!IMPORTANT]
> **Implementation Note:** This document defines screen specifications, 4-level information hierarchies, user goals, and state matrices. The actual implementation belongs to the frontend team in `apps/web/`. Do NOT implement screens prematurely in `apps/ui-ux/`.

---

## Screen Inventory by Product Area

```text
1. Command Center Area
   └── 1.1 Command Center (Overview Dashboard)
2. Live Campus Area
   ├── 2.1 Live Campus: Overview (Spatial Decision Map)
   ├── 2.2 Live Campus: Occupancy (Capacity & Density Monitor)
   └── 2.3 Live Campus: Connectivity (Network & Utilities Infrastructure)
3. Incidents Area
   ├── 3.1 Active Incidents (Incident Feed & Queue)
   ├── 3.2 Incident Details (Incident Deep Dive & Root Cause)
   └── 3.3 Impact / Blast Radius (Cascade Propagation Inspector)
4. Recovery Area
   ├── 4.1 Recovery Plans (Intervention Generator & Strategy List)
   └── 4.2 Compare Recovery Plans (Multi-Plan Trade-off Matrix)
5. Simulation Area
   └── 5.1 What-If Simulation (Counterfactual Scenario Sandbox)
6. Settings Area
   └── 6.1 Settings (Campus Topology, Roles & System Governance)
```

---

### 1.1 Command Center

> **Modular Screen Spec:** See [`screens/command-center.md`](./screens/command-center.md) for full layout blocks, data states, and component contracts.

- **Product Area:** `1. Command Center`
- **User Goal:** High-level operational surveillance; immediately identify active disruptions, aggregate impact scale, and pending recovery decisions.
- **Primary Question Answered:** *"What is happening across campus right now and what requires immediate operator attention?"*
- **4-Level Information Hierarchy:**
  - **Level 1 (Top Takeaway):** Situation Status Banner & KPI Strip (Active Incidents, Displaced Students, Impacted Buildings, Pending Approvals).
  - **Level 2 (Contextual Explanation):** High-Priority Incidents Feed & Spatial Campus Health Map (Green/Amber/Red building polygons).
  - **Level 3 (Actions):** `[ Create Incident ]`, `[ Review High-Priority Recovery Plan ]`, `[ Switch Campus Zone ]`.
  - **Level 4 (Inspection Detail):** Recent audit activity ticker, telemetry sync indicator, quick links to sub-views.
- **Important Components:** `<MetricCard>`, `<IncidentCard>`, `<DecisionMap>`, `<AIAnalystPanel>`, `<StatusPill>`.
- **Expected States:**
  - *All Clear:* Green metrics; "All 18 buildings operational. Zero active disruptions."
  - *Active Crisis:* Prominent red banners, pulsing building nodes, top recommended plan chips.
  - *Loading:* Skeleton shimmers across metric cards and feed containers.
  - *Stale Telemetry:* Amber notice: *"⚠️ Telemetry sync paused. Click to refresh."*
- **Responsive Behavior:** 4-column KPI strip + split map/feed on desktop; stacked 2x2 grid and single-column feed on tablet/mobile.

---

### 2. Live Campus Area

> **Modular Screen Spec:** See [`screens/live-campus.md`](./screens/live-campus.md) for exhaustive layout diagrams, telemetry provenance contracts, and location health matrices.

#### 2.1 Live Campus: Overview
- **Product Area:** `2. Live Campus` (Sub-view: `Overview`)
- **User Goal:** Executive continuous surveillance across all 18 buildings; immediately isolate locations with deteriorating occupancy or connectivity conditions.
- **Primary Question Answered:** *"What is happening across my campus right now and where are operational conditions changing?"*
- **4-Level Information Hierarchy:**
  - **Level 1 (Top Takeaway):** Top Metric Health Strip (Overall Campus Health 94%, Aggregate Occupancy 72%, Grid Connectivity 91%, Freshness Gauge: `LIVE · Synced 12s ago`).
  - **Level 2 (Contextual Explanation):** 18-Building Operational Health Schematic Grid + Notable Condition Changes Feed.
  - **Level 3 (Actions):** `[ Inspect Location ]`, `[ Filter by Status (All / Watch / Degraded / Critical) ]`, `[ Toggle Accessible Table ]`.
  - **Level 4 (Inspection Detail):** Slide-over Location Detail Drawer with 60-minute telemetry delta and linked incident tags.
- **Important Components:** `<CampusHealthMatrix>`, `<ConditionChangesFeed>`, `<LocationHealthBadge>`, `<FreshnessPill>`, `<DataTable>`.
- **Responsive Behavior:** 18-card schematic + sidebar feed on desktop; 2-column scrollable grid on tablet; prioritized Watch/Degraded card stack on mobile.

---

#### 2.2 Live Campus: Occupancy
- **Product Area:** `2. Live Campus` (Sub-view: `Occupancy`)
- **User Goal:** Monitor real-time and scheduled room utilization to identify overflow risks, detect crowding velocity, and discover absorption space for relocations.
- **Primary Question Answered:** *"Which rooms have available capacity to absorb relocated classes right now, and which are approaching capacity?"*
- **4-Level Information Hierarchy:**
  - **Level 1 (Top Takeaway):** Campus Occupancy Velocity Gauge & Overflow Risk Count (`2 Rooms ≥90%`).
  - **Level 2 (Contextual Explanation):** Building-by-building capacity cards with color thresholds (<70% Normal, 70-89% Elevated, ≥90% Overflow Risk) and trajectory trends (Increasing, Stable, Decreasing).
  - **Level 3 (Actions):** `[ Filter by Minimum Free Capacity ]`, `[ Find Available Alternative Rooms ]`, `[ Sort by Proximity to Capacity ]`.
  - **Level 4 (Inspection Detail):** Searchable room inventory `<DataTable>` with sensor provenance badges (`LIVE`, `ESTIMATED`, `SIMULATED`).
- **Important Components:** `<OccupancyScorecard>`, `<UtilizationBar>`, `<TrendBadge>`, `<FilterToolbar>`, `<DataTable>`.
- **Responsive Behavior:** Multi-column data table with utilization bars on desktop; swipeable building cards on tablet/mobile.

---

#### 2.3 Live Campus: Connectivity
- **Product Area:** `2. Live Campus` (Sub-view: `Connectivity`)
- **User Goal:** Inspect campus utility grids (Power Substations, Optical Fiber, IoT Gateways) and identify single points of failure.
- **Primary Question Answered:** *"If this network switch or power substation degrades, what downstream facilities and rooms are at risk?"*
- **4-Level Information Hierarchy:**
  - **Level 1 (Top Takeaway):** Utility Grid Operational Health Index (`91% Utility Health · Substation A Degraded`).
  - **Level 2 (Contextual Explanation):** Node signal health cards (Signal bars + Score 0–100 + States: `EXCELLENT`, `GOOD`, `DEGRADED`, `POOR`, `OFFLINE`, `UNKNOWN`).
  - **Level 3 (Actions):** `[ Trace Downstream Dependencies ]`, `[ Filter by Subsystem (Power / Network / IoT) ]`.
  - **Level 4 (Inspection Detail):** Gateway ping latency (`JetBrains Mono ms`), packet loss %, and dependent room list.
- **Important Components:** `<ConnectivitySignalCard>`, `<SignalBars>`, `<LatencyBadge>`, `<TopologyCanvas>`, `<DataTable>`.
- **Responsive Behavior:** Grid topology visualizer on desktop; hierarchical tree card list on tablet/mobile.

---

#### 2.4 Live Campus: Location Detail
- **Product Area:** `2. Live Campus` (Sub-view: `Location Detail`)
- **User Goal:** Deep dive into a single facility's environmental health, synthesizing occupancy and connectivity into a deterministic verdict.
- **Primary Question Answered:** *"Why is this specific building flagged and what operational action should I take?"*
- **4-Level Information Hierarchy:**
  - **Level 1 (Top Takeaway):** Pinned Location Header (Building Name, Health Badge `WATCH`, Freshness `LIVE · 42s ago`).
  - **Level 2 (Contextual Explanation):** Synchronized Dual-Metric Breakdown (Occupancy 73% Increasing + Connectivity 64% Degraded) + 60m Delta Log.
  - **Level 3 (Actions):** `[ Escalate to Incident Queue ]`, `[ Compare Nearby Available Rooms ]`, `[ Return to Overview ]`.
  - **Level 4 (Inspection Detail):** Room-by-room sensor telemetry grid and IoT gateway ping history.
- **Important Components:** `<LocationDetailDossier>`, `<DualMetricCard>`, `<DeltaLogTimeline>`, `<ActionButtonGroup>`.
- **Responsive Behavior:** Side-by-side metric panels on desktop; sticky header + stacked panels in mobile bottom sheet.

---

### 3. Incidents Area

> **Modular Screen Spec:** See [`screens/incidents.md`](./screens/incidents.md) for exhaustive layout diagrams, root cause states, 4-tier cascade models, and confidence frameworks.

#### 3.1 Active Incidents Queue
- **Product Area:** `3. Incidents` (Sub-view: `Active Incidents Queue`)
- **User Goal:** Triage, prioritize, and manage all ongoing campus disruptions in a centralized queue sorted by severity and impact score.
- **Primary Question Answered:** *"What are all active disruptions across the campus and what is their triage priority?"*
- **4-Level Information Hierarchy:**
  - **Level 1 (Top Takeaway):** Queue Count & Severity Breakdown (`1 Critical · 1 High · 1 Medium · 0 Low · 0 Info` · `482 Total Displaced Students`).
  - **Level 2 (Contextual Explanation):** Prioritized Incident List sorted by impact score with elapsed time, confidence badges (`Confirmed` / `Estimated`), and direct target entity tags.
  - **Level 3 (Actions):** `[ View Impact / Blast Radius ]`, `[ Review Recovery Plans ]`, `[ Filter by Severity / Building ]`.
  - **Level 4 (Inspection Detail):** Quick-inspect incident preview drawer and audit history link.
- **Important Components:** `<IncidentTriageCard>`, `<SeverityPill>`, `<ImpactKpiStrip>`, `<FilterToolbar>`, `<DataTable>`.
- **Responsive Behavior:** Dense data table with inline actions on desktop; stacked incident cards on mobile.

---

#### 3.2 Incident Details & Root Cause
- **Product Area:** `3. Incidents` (Sub-view: `Incident Details`)
- **User Goal:** Conduct an exhaustive deep dive into a specific disruption, its root cause (CONFIRMED vs. SUSPECTED), timeline, and affected stakeholders.
- **Primary Question Answered:** *"What exactly went wrong, when did it happen, and what is the full scope of disruption?"*
- **4-Level Information Hierarchy:**
  - **Level 1 (Top Takeaway):** Pinned Incident Header (Title, Severity Pill, Direct Target, Status `INVESTIGATING`, Elapsed Time `24m`).
  - **Level 2 (Contextual Explanation):** Root Cause Card (Confirmed/Suspected/Unknown) + 4-KPI Impact Summary (438 Students, 7 Rooms, 3 Services, ~90m Duration) + Chronological Timeline.
  - **Level 3 (Actions):** `[ View Blast Radius → ]`, `[ Review Generated Recovery Plans (3) → ]`, `[ "What if +60m?" Simulation Shortcut ]`.
  - **Level 4 (Inspection Detail):** Grounding Evidence Chips (`[ 4 Labs Incompatible ]`) and AI Context Explanation Panel.
- **Important Components:** `<PinnedIncidentContextBar>`, `<RootCauseCard>`, `<ImpactKpiStrip>`, `<IncidentTimeline>`, `<AIAnalystPanel>`.
- **Responsive Behavior:** 2-column layout (Dossier + Action/AI Panel) on desktop; single-column narrative scroll on mobile.

---

#### 3.3 Impact / Blast Radius
- **Product Area:** `3. Incidents` (Sub-view: `Impact / Blast Radius`)
- **User Goal:** Trace and visualize the precise cascade of consequences triggered by an incident across 4 campus layers (Root -> Physical -> Infrastructure -> Human).
- **Primary Question Answered:** *"How does this failure propagate from the root target to classes, equipment, and people?"*
- **4-Level Information Hierarchy:**
  - **Level 1 (Top Takeaway):** Disruption Severity Score (`98/100 Priority`) & Total Displaced Students Metric (`438 Confirmed`).
  - **Level 2 (Contextual Explanation):** 4-Tier Multi-layer Cascade Graph (Root -> Building B -> Wi-Fi/HVAC -> Disrupted Classes).
  - **Level 3 (Actions):** `[ Proceed to Recovery Planning → ]`, `[ Filter Cascade Depth (Tier 1/2/3) ]`, `[ Toggle Accessible Table ]`.
  - **Level 4 (Inspection Detail):** Affected entities structured `<DataTable>` with CSV export trigger.
- **Important Components:** `<BlastRadiusVisualizer>`, `<CascadeTreeNode>`, `<DataTable>`, `<ScoreBadge>`, `<ConfidencePill>`.
- **Responsive Behavior:** Split-screen (Graph left, Table right) on desktop; expandable tree + bottom modal on mobile.

---

### 4.1 Recovery Plans

- **Product Area:** `4. Recovery` (Sub-view: `Recovery Plans List`)
- **User Goal:** Review feasible recovery interventions generated by the engine and understand trade-offs.
- **Primary Question Answered:** *"What valid options exist to restore classes and reopen operations?"*
- **4-Level Information Hierarchy:**
  - **Level 1 (Top Takeaway):** Recommended Plan Candidate Card with Disruption Reduction Score (`88/100 ★ Best Feasible`).
  - **Level 2 (Contextual Explanation):** Quantitative impact deltas (`-95% Displaced Students`) & constraint validation badges.
  - **Level 3 (Actions):** `[ Select & Approve Plan ]`, `[ Compare Plans Side-by-Side ]`, `[ Run What-If Simulation ]`.
  - **Level 4 (Inspection Detail):** Expandable `"Why this plan?"` AI grounded rationale drawer with evidence pills.
- **Important Components:** `<RecoveryPlanCard>`, `<ScoreBadge>`, `<AIAnalystPanel>`, `<ConfirmationDialog>`.
- **Responsive Behavior:** 3-column candidate card grid on desktop; swipeable card carousel on mobile.

---

### 4.2 Compare Recovery Plans

- **Product Area:** `4. Recovery` (Sub-view: `Compare Plans Matrix`)
- **User Goal:** Perform a side-by-side trade-off analysis between Baseline (no action) and multiple candidate plans.
- **Primary Question Answered:** *"Why is Plan B better than Plan A, and what are the exact trade-offs in walking distance, room fit, and cost?"*
- **4-Level Information Hierarchy:**
  - **Level 1 (Top Takeaway):** Comparative Metric Matrix (Displaced Students, Schedule Conflicts, Travel Burden, Time to Restore).
  - **Level 2 (Contextual Explanation):** Winning metric badges highlighted in emerald & delta comparison tags.
  - **Level 3 (Actions):** `[ Select & Execute Plan ]`, `[ Toggle 'Show Differences Only' ]`.
  - **Level 4 (Inspection Detail):** Full multi-variable delta breakdown table and constraint satisfaction checklist.
- **Important Components:** `<PlanComparisonMatrix>`, `<DeltaBadge>`, `<RadarChart>`, `<Button>`.
- **Responsive Behavior:** 4-column aligned table on desktop; horizontally scrollable matrix with sticky labels on mobile.

---

### 5.1 What-If Simulation

- **Product Area:** `5. Simulation` (Sub-view: `What-If Scenario Sandbox`)
- **User Goal:** Test counterfactual variables (duration changes, attendee spikes, gate closures) before executing decisions.
- **Primary Question Answered:** *"What happens to campus congestion and room availability if this outage lasts 180 minutes instead of 90?"*
- **4-Level Information Hierarchy:**
  - **Level 1 (Top Takeaway):** Projected Impact Delta (`-95% Displaced Students`, `+30m delay`) in Sky-Blue Simulation Mode.
  - **Level 2 (Contextual Explanation):** Before vs. After split comparison diff & simulated blast radius map overlay.
  - **Level 3 (Actions):** `[ Run Simulation ]`, `[ Apply Simulated Parameters to Active Incident ]`, `[ Reset to Baseline ]`.
  - **Level 4 (Inspection Detail):** Granular scenario sliders (Outage duration: 15m–240m, Crowd multiplier: 1.0x–2.5x).
- **Important Components:** `<SimulationControlSlider>`, `<BeforeAfterDiffCard>`, `<DecisionMap>`, `<Button>`.
- **Responsive Behavior:** Left rail controls + right real-time diff on desktop; top accordion controls + stacked diff on mobile.

---

### 6.1 Settings

- **Product Area:** `6. Settings`
- **User Goal:** Manage campus building blueprints, resource catalogs, user roles, and governance audit trails.
- **Primary Question Answered:** *"How do I configure campus buildings, seed test scenarios, or review audit logs?"*
- **4-Level Information Hierarchy:**
  - **Level 1 (Top Takeaway):** Campus Configuration Summary & Active Synthetic Dataset Status.
  - **Level 2 (Contextual Explanation):** Building/room registry, equipment catalog, and role permission matrices.
  - **Level 3 (Actions):** `[ Save Configuration ]`, `[ Seed Demo Scenario ]`, `[ Download Audit Log (JSON/CSV) ]`.
  - **Level 4 (Inspection Detail):** Granular chronological audit trail with operator identity and timestamp stamps.
- **Important Components:** `<DataTable>`, `<FormInput>`, `<ToggleSwitch>`, `<AuditTrailViewer>`.
- **Responsive Behavior:** Left vertical tab rail on desktop; dropdown section switcher on mobile.
