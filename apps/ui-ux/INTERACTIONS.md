# EzyKwelez — Interaction Specifications & Behavior Contracts

**Owner:** Aile Sharma (`Lead UI/UX Designer & Design System Owner`)  
**Status:** Phase 1B Finalized  
**Version:** 1.2  
**Core Interaction Principle:** Predictable, deterministic, zero-surprise operational response.

---

## 1. Interaction Principles & Guidelines

1. **Deterministic Feedback:** Every user input (clicking a node, dragging a slider, filtering an incident) must produce immediate visual feedback within 100ms and deterministic data updates.
2. **Reversible Exploration vs. Guarded Execution:** Analytical exploration (traversing graphs, comparing plans, tweaking simulation variables) is fluid, instant, and frictionless. State mutations (approving recovery plans, closing buildings, broadcasting notices) are guarded by explicit confirmation steps.
3. **Context Preservation Across Workflows:** Navigating across the decision chain (`Incident -> Blast Radius -> Recovery -> Simulation`) must preserve the active incident context in the Pinned Context Bar and URL route hierarchy.

---

## 2. Navigation & View Routing Interactions

### 2.1 Primary & Secondary Navigation
- **Sidebar Rail:** Pinned left navigation (240px expanded; 64px icon mode). Switching top-level areas executes a 150ms cross-fade transition.
- **Secondary Sub-View Tabs:** Horizontal segmented tabs switch views within an area (e.g. Live Campus: `Overview` | `Occupancy` | `Connectivity`) without reloading page assets.
- **URL Synchronization:** All active filters, tab selections, and entity IDs synchronize with the browser address bar (e.g. `/live-campus?view=occupancy&building=B`).

### 2.2 Pinned Incident Context Bar
- When an operator navigates through the incident response workflow, a persistent Context Bar locks beneath the top command bar.
- **Interactions:**
  - Displays: `[CRITICAL] Building B Power Outage · Science Complex · 438 Students Displaced · Elapsed 24m`.
  - Quick Action: `[ ← Back to Incident Details ]` or `[ View Blast Radius ]`.
  - Clicking the title opens a quick-summary overlay without losing current recovery or simulation work.

### 2.3 Purposeful Breadcrumb Navigation
- Used strictly for deep multi-step decision chains:
  ```text
  Incidents  >  Building B Power Outage  >  Blast Radius  >  Recovery Plans  >  Compare Plans
  ```
- Clicking any parent crumb returns to that calculation step without triggering expensive recalculations.

### 2.4 Global Command Palette (`⌘K` / `Ctrl+K`)
- **Activation:** `⌘K` (Mac) or `Ctrl+K` (Windows/Linux) or clicking the top search trigger.
- **Keyboard Navigation:** `↑` and `↓` arrows navigate; `Enter` executes; `Escape` dismisses.
- **Searchable Index:**
  - Direct area jumps (`Go to Command Center`, `Go to Live Campus / Occupancy`).
  - Physical entities (`Building B`, `Room B204`, `Main Substation`).
  - Active disruptions (`Building B Power Outage`).
  - Operational shortcuts (`Create Incident`, `Run What-If Simulation`, `Export Audit CSV`).

---

## 3. Filtering, Sorting & Search Interactions

### 3.1 Filtering
- **Multi-Facet Filter Bar:** Allows filtering by Severity (`Critical`, `Warning`, `Info`), Building/Zone, Status, and Affected Entity Type.
- **Active Filter Chips:** Selected filters render as dismissible chips with an `x` button and a clear "Reset All Filters" trigger.

### 3.2 Sorting
- **Data Tables:** Clicking column headers cycles through `Ascending` -> `Descending` -> `Default/Unsorted`.
- **Indicator:** Active sort column displays a persistent arrow icon (`▲` or `▼`) and subtle column background tint. Numeric columns sort on exact numeric value, not string representation.

### 3.3 Search
- **Debounced Execution:** Text search inputs debounce for 200ms before triggering local/backend filtering to prevent keystroke lag.
- **Clear Button:** An inline `Clear` button (`x`) appears whenever search text is non-empty.

---

## 4. Expanding Details & Progressive Disclosure

### 4.1 Side Drawers / Inspectors
- **Trigger:** Clicking an entity row, map building polygon, or incident card opens a right-hand slide-over drawer (400px wide).
- **Behavior:** Pinned right rail on desktop; overlay with backdrop on tablet; full-screen modal on mobile.
- **Dismissal:** Pressing `Escape`, clicking the backdrop, or clicking the close `x` icon closes the drawer and restores focus to the trigger.

### 4.2 "Why this plan?" Decision Factor Disclosure
- Clicking the expansion trigger on any `<RecoveryPlanCard />` reveals the machine-derived factors evaluated by the engine.
- Animation: Crisp height transition (150ms `ease-out`).

---

## 5. Incident Selection & Blast Radius Exploration

### 5.1 Incident-to-Map Synchronization
- Selecting an incident in the feed immediately centers the interactive campus map on the incident's target entity and highlights downstream affected rooms.

### 5.2 Blast Radius Cascade Traversal
- **Hover Interaction:** Hovering over a dependency node highlights its immediate upstream parents (what powers it) and downstream children (what depends on it).
- **Tier Depth Slider:** Operators can toggle between `Tier 1 (Direct Failures)`, `Tier 2 (Secondary Cascades)`, and `Tier 3 (Systemic Constraints)`.
- **Node Click:** Opens the entity drawer showing scheduled classes, current occupant counts, and equipment inventory.

---

## 6. Recovery Plan Comparison & Selection

### 6.1 Multi-Plan Side-by-Side Review
- **Matrix Highlighting:** In the comparison matrix, hovering over a metric row (e.g. "Student Walking Burden") highlights trade-off deltas across Plan A, Plan B, and Plan C.
- **Winning Indicators:** Mathematically optimal values receive a green badge and checkmark.

### 6.2 Decision Factor Inspection
- Clicking "Explain Score" opens the AI Analyst Panel with pre-populated prompts specifically addressing why the recommended plan outperforms alternatives.

---

## 7. What-If Simulation Interactions

### 7.1 Parameter Adjustment
- **Slider Interaction:** Dragging the outage duration slider (15m–240m) or crowd multiplier (1.0x–2.5x) provides immediate visual feedback.
- **Debounced Recalculation:** The UI displays a subtle "Calculating projection..." indicator, updating projected blast radius and displaced student counts within <500ms.
- **Reset Trigger:** A "Reset to Baseline" button allows operators to clear experimental adjustments with a single click.

### 7.2 Counterfactual Comparison
- The simulation screen provides a split view toggle between `Before vs. After (Split)` and `Overlay Difference (Heatmap)`.

---

## 8. Confirmation & High-Impact Guardrails

### 8.1 Two-Step Confirmation for High-Impact Actions
Executing a recovery plan or shutting down a building affects hundreds of students and faculty. The system requires structured safeguards:
1. **Trigger:** Operator clicks `Approve & Execute Recovery Plan`.
2. **Modal Presentation:** Displays a dedicated `<ConfirmationDialog>` outlining:
   - Specific rooms to be locked/opened.
   - Total number of classes and students to be rerouted.
   - Student notification broadcast preview.
3. **Explicit Verification:** Requires checking: `[x] I confirm this intervention will be applied to live campus operations`.
4. **Action:** `Confirm & Execute` button activates only after verification.

### 8.2 Destructive Action Safeguards
- Destructive buttons use `--color-status-danger` (`#ef4444`).
- Default keyboard focus is placed on the `Cancel` button to prevent accidental execution via rapid `Enter` key presses.

---

## 9. State-Driven Navigation & Dead-End Prevention

EzyKwelez enforces a **Zero Dead-End Guarantee**:

| State Condition | Visual Representation | Navigation Recovery Action |
| :--- | :--- | :--- |
| **Loading State** | Dimension-matched `<SkeletonLoader />` in content grid | Navigation remains interactive; allows switching views or canceling request. |
| **Zero Active Incidents** | Green all-clear illustration: *"All 18 buildings operational. Zero active disruptions."* | Actions: `[ Create Incident ]` or `[ Run What-If Drill ]`. |
| **Empty Search / Filter** | Neutral filter graphic: *"No incidents match filter: Severity = Critical in Humanities."* | Action: `[ Reset All Filters ]` immediately restores default list. |
| **Stale Telemetry Sync** | Amber banner: *"⚠️ Telemetry sync paused (network idle 60s)."* | Action: `[ Refresh Sync ]` button immediately forces background revalidation. |
| **Telemetry Outage / Error** | Red alert banner: *"Unable to load live campus graph."* | Action: `[ Retry Connection ]` button with exponential backoff indicator. |
| **No Feasible Recovery Plans** | Warning panel: *"Zero rooms satisfy specialized lab equipment constraint."* | Action: `[ Relax Constraints ]` or `[ Open What-If Simulation ]`. |
| **Incident Resolved** | Green badge: *"Incident resolved 12m ago. Recovery plan executed."* | Actions: `[ View Audit Trail ]` or `[ Return to Command Center ]`. |

---

## 10. Live Campus Telemetry & Location Inspection Interactions

### 10.1 Location Health Selection & Dual-View Inspection
- **Schematic-to-Table Dual-View Toggle:** Operators can switch between the visual 18-building operational schematic and an accessible `<DataTable>` with a single click. The active selection persists across view switches.
- **Location Detail Drawer:** Clicking any building card or table row triggers a 400px Level 4 slide-over drawer showing dual-metric breakdowns (Occupancy + Connectivity) and a 60-minute environmental delta timeline.

### 10.2 Continuous Telemetry Sync & Stale Revalidation
- **Polling Cadence:** Telemetry polls every 15s in active viewports. When the tab is backgrounded, polling drops to 60s.
- **Stale State Recovery:** If sync exceeds 5m, the freshness badge turns amber (`STALE · 18m ago`). Clicking the badge initiates an instant background revalidation without clearing existing UI data.

### 10.3 Telemetry-to-Incident Escalation Boundary
- **Separation Principle:** Observed anomalies (e.g. Substation A voltage drop) display as *"Potential Operational Concern"*, not an automatic incident.
- **Escalation Interaction:** Clicking `[ Escalate to Incident Queue → ]` in the Location Detail panel opens the Incident Creation modal with pre-populated building ID, current occupancy (438), and affected utility node.

### 10.4 Relocation & Absorption Space Finder
- In the Occupancy view, clicking `[ Find Available Alternative Rooms ]` filters rooms with utilization `<60%`, compatible equipment tags, and sorts them by shortest walking distance from the source building.
