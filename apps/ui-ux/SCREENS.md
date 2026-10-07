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

### 2.1 Live Campus: Overview

- **Product Area:** `2. Live Campus` (Sub-view: `Overview`)
- **User Goal:** Visually explore physical campus topology, building health, and infrastructure dependency lines.
- **Primary Question Answered:** *"Where are disruptions physically located and which adjacent facilities are affected?"*
- **4-Level Information Hierarchy:**
  - **Level 1 (Top Takeaway):** Interactive 2D Campus Vector Map with real-time building health color fills.
  - **Level 2 (Contextual Explanation):** Hover tooltips & utility dependency overlay lines (Substation A -> Building B).
  - **Level 3 (Actions):** `[ Select Building to Inspect ]`, `[ Toggle Layer Overlays (Power/Network/HVAC) ]`.
  - **Level 4 (Inspection Detail):** Slide-over Building Detail Drawer (closed rooms, scheduled classes, equipment).
- **Important Components:** `<DecisionMap>`, `<BuildingPolygon>`, `<DependencyEdge>`, `<LayerToggle>`, `<Drawer>`.
- **Responsive Behavior:** Pinned right drawer on desktop; pinch-to-zoom map + bottom sheet modal on mobile.

---

### 2.2 Live Campus: Occupancy

- **Product Area:** `2. Live Campus` (Sub-view: `Occupancy`)
- **User Goal:** Monitor real-time and scheduled room utilization to identify overflow risks and relocation space.
- **Primary Question Answered:** *"Which rooms have available capacity to absorb relocated classes right now?"*
- **4-Level Information Hierarchy:**
  - **Level 1 (Top Takeaway):** Peak Utilization Timeline Chart & Campus-wide Overflow Risk Metric.
  - **Level 2 (Contextual Explanation):** Building-by-building capacity heatmaps with color thresholds (<70% Green, 70-89% Amber, >=90% Red).
  - **Level 3 (Actions):** `[ Find Available Alternative Rooms ]`, `[ Filter by Minimum Capacity ]`.
  - **Level 4 (Inspection Detail):** Searchable room inventory `<DataTable>` with equipment tags and tabular occupant ratios.
- **Important Components:** `<DataTable>`, `<UtilizationBar>`, `<FilterToolbar>`, `<EquipmentBadgeGroup>`.
- **Responsive Behavior:** Full multi-column data grid on desktop; adaptive card stack on mobile.

---

### 2.3 Live Campus: Connectivity

- **Product Area:** `2. Live Campus` (Sub-view: `Connectivity`)
- **User Goal:** Inspect campus utility grids (Power, Optical Fiber, HVAC) and identify single points of failure.
- **Primary Question Answered:** *"If this network switch or power substation fails, what downstream buildings go offline?"*
- **4-Level Information Hierarchy:**
  - **Level 1 (Top Takeaway):** Utility Grid Operational Health Index (`98% Operational`).
  - **Level 2 (Contextual Explanation):** Node-link utility topology diagram (Substations -> Distribution Switches -> Edge Nodes).
  - **Level 3 (Actions):** `[ Trigger Synthetic Outage Test ]`, `[ Trace Downstream Dependencies ]`.
  - **Level 4 (Inspection Detail):** Node latency metrics, load levels (`JetBrains Mono`), and dependent building list.
- **Important Components:** `<DependencyGraphNode>`, `<TopologyCanvas>`, `<HealthMetric>`, `<DataTable>`.
- **Responsive Behavior:** Zoomable canvas on desktop; hierarchical `<ol role="tree">` list on mobile.

---

### 3.1 Active Incidents

- **Product Area:** `3. Incidents` (Sub-view: `Active Incidents Queue`)
- **User Goal:** Triage, filter, and manage all ongoing campus disruptions in a centralized queue.
- **Primary Question Answered:** *"What are all active disruptions across the campus and what is their triage priority?"*
- **4-Level Information Hierarchy:**
  - **Level 1 (Top Takeaway):** Queue Count & Severity Breakdown (`1 Critical · 2 Moderate · 0 Minor`).
  - **Level 2 (Contextual Explanation):** Incident List sorted by impact score with elapsed time and direct target entity tags.
  - **Level 3 (Actions):** `[ Create New Incident ]`, `[ Filter by Severity / Building ]`, `[ Batch Resolve ]`.
  - **Level 4 (Inspection Detail):** Quick-inspect incident preview drawer and audit history link.
- **Important Components:** `<IncidentCard>`, `<DataTable>`, `<SeverityPill>`, `<FilterBar>`, `<SearchInput>`.
- **Responsive Behavior:** Dense data table with inline actions on desktop; stacked incident cards on mobile.

---

### 3.2 Incident Details

- **Product Area:** `3. Incidents` (Sub-view: `Incident Details`)
- **User Goal:** Conduct an exhaustive deep dive into a specific disruption, its root cause, timeline, and affected stakeholders.
- **Primary Question Answered:** *"What exactly went wrong, when did it happen, and what is the full scope of disruption?"*
- **4-Level Information Hierarchy:**
  - **Level 1 (Top Takeaway):** Pinned Incident Header (Title, Severity Pill, Direct Target, Status, Elapsed Time).
  - **Level 2 (Contextual Explanation):** Direct vs. Indirect Impact breakdown scorecard & chronological audit timeline.
  - **Level 3 (Actions):** `[ View Blast Radius ]`, `[ Generate Recovery Plans ]`, `[ Broadcast Student Notice ]`.
  - **Level 4 (Inspection Detail):** Entity dependency tree list and AI Analyst contextual explanation.
- **Important Components:** `<MetricCard>`, `<Timeline>`, `<BadgeGroup>`, `<AIAnalystPanel>`, `<Button>`.
- **Responsive Behavior:** 2-column layout (Dossier + AI Panel) on desktop; single-column narrative scroll on mobile.

---

### 3.3 Impact / Blast Radius

- **Product Area:** `3. Incidents` (Sub-view: `Impact / Blast Radius`)
- **User Goal:** Trace and visualize the precise cascade of consequences triggered by an incident across campus layers.
- **Primary Question Answered:** *"How does this failure propagate from the root target to classes, equipment, and people?"*
- **4-Level Information Hierarchy:**
  - **Level 1 (Top Takeaway):** Disruption Severity Score (0–100 scale) & Total Displaced Students Metric.
  - **Level 2 (Contextual Explanation):** Multi-tier Cascade Graph (Root -> Infrastructure -> Rooms -> Schedules -> Cohorts).
  - **Level 3 (Actions):** `[ Proceed to Recovery Planning ]`, `[ Filter Cascade Depth (Tier 1/2/3) ]`.
  - **Level 4 (Inspection Detail):** Affected entities structured `<DataTable>` with CSV export trigger.
- **Important Components:** `<BlastRadiusVisualizer>`, `<CascadeTreeNode>`, `<DataTable>`, `<ScoreBadge>`.
- **Responsive Behavior:** Split-screen (Graph left, Table right) on desktop; tabbed view switcher on mobile.

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
