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

## 5. Incident Selection, Root Cause Diagnosis & Blast Radius Exploration

### 5.1 Incident Queue Triage & Sorting
- **Priority Sorting:** Queue automatically orders disruptions by `Severity > Impact Headcount > Urgency`. Selecting any sort header cycles deterministically without losing active filters.
- **Quick-Inspect Drawer:** Clicking a queue row outside action buttons opens a slide-over preview showing the 4-KPI impact strip and root cause status without unloading the queue view.

### 5.2 Incident-to-Map & Spatial Context Synchronization
- Selecting an incident in the feed immediately synchronizes the global campus map to center on the target entity and highlights downstream affected facilities.

### 5.3 Root Cause Classification & Grounded Diagnosis
- **State Toggling:** Operators with command roles can transition root cause from `SUSPECTED` to `CONFIRMED` upon field technician acknowledgement.
- **AI Narrative Separation:** Machine-verified telemetry facts appear in structured badges; AI diagnostic reasoning appears in a dedicated assistant container with explicit grounding chips.

### 5.4 Blast Radius 4-Tier Cascade Traversal
- **Interactive DAG Exploration:** Hovering over any node highlights its upstream parents (sources) and downstream children (dependencies) with animated pulse rings.
- **Tier Depth Filtering:** Operators can filter the cascade canvas by `Tier 1 (Direct Facilities)`, `Tier 2 (Dependent Services)`, and `Tier 3 (Human Schedules)`.
- **Node Detail Slide-Over:** Clicking any node reveals room numbers, scheduled courses, enrolled students, and offline hardware IDs.

### 5.5 Incident-to-Simulation Shortcut
- The action panel includes a 1-click counterfactual scenario trigger: `[ "What if power outage extends +60m?" ]`. Clicking transfers active incident parameters directly into the What-If simulation engine without manual data re-entry.

---

## 6. Recovery Plan Comparison & Selection

### 6.1 Multi-Plan Side-by-Side Review & Delta Highlighting
- **Matrix Highlighting:** In the comparison matrix, hovering over any metric row (e.g. "Residual Displaced Students" or "Recovery Time") highlights the winning optimal cell across Plan A, Plan B, and Plan C with an emerald border and percentage delta tag.
- **Toggle Differences Only:** A switch control `[ Show Differences Only ]` collapses rows where all plans have identical outcomes (e.g., baseline safety compliance), focusing operator attention on differentiating trade-offs.

### 6.2 Objective Score Factor Inspection & Provenance
- Clicking the `[ Score Breakdown ]` trigger on any candidate card reveals a popover itemizing the 4 multi-objective weights (+Impact Reduction, +Velocity, +Resources, +Risk).
- AI Grounding Narrative: Clicking `"Why this plan?"` expands a contextual rationale separating engine numbers from narrative explanation.

### 6.3 Constraint Warnings & Blocked Action State Handling
- When a candidate violates a hard dependency (e.g. generator out of service), the card displays a red `[ ✕ BLOCKED ]` badge.
- The `[ Approve Recovery ]` button is rendered inert with `aria-disabled="true"` and an informative tooltip: *"Action unavailable: Backup generator blocked until 18:00 maintenance window."*

### 6.4 Stale Recovery Plan Revalidation
- If incident telemetry changes after plan generation (e.g. room power drops further), a persistent amber banner appears: *"⚠️ Incident conditions changed 4m ago. Candidate plans may be outdated."*
- Clicking `[ Recalculate Recovery Plans ]` triggers instant background optimization without losing active filter selections.

---

## 7. What-If Simulation Interactions

### 7.1 Multi-Modal Parameter Adjustment & Companion Inputs
- **Analog + Numeric Synchronization:** Dragging the recovery duration slider (15m–240m) immediately updates the adjacent numeric text box (`<input type="number">`), and typing a numeric value smoothly repositions the slider thumb.
- **Preset Buttons:** Quick buttons `[ Baseline (38m) ]`, `[ +30m (68m) ]`, `[ +60m (98m) ]`, and `[ Max Window (240m) ]` set target assumptions in one click.

### 7.2 Debounced Recalculation & State Feedback
- **Debounce Contract:** Slider adjustments update client input immediately, but recalculation requests use a short client-side debounce before querying the engine; exact timing is implementation-defined.
- **Calculating State Feedback:** While computing, the projected outcome panel displays calculating feedback. The UI does not assume a fixed calculation duration and supports fast, slow, and long-running computations.

### 7.3 Directional Delta Calculation & Non-Color Semantics
- **Explicit Delta Tags:** Delta values always couple signed numerals with vector arrows:
  - `↑ +92 Students` (Deterioration / Warning)
  - `↓ -54 Students` (Improvement / Success)
  - `→ 0 Delta` (Neutral baseline match)
- Deltas compute against the active baseline in real-time.

### 7.4 Reset to Baseline & Safeguard
- Clicking `[ Reset to Baseline ]` restores all assumptions to current active recovery parameters.
- If multiple assumptions were modified, a lightweight confirmation toast confirms: *"Reset all scenario assumptions to active baseline?"*.

### 7.5 Advisory Simulation Safety & Recovery Branching
- **Advisory Isolation:** Persistent sky-blue top banner clearly states: *"SIMULATION SANDBOX · No live campus mutations are made."*
- **Branching Action:** Clicking `[ Branch Recovery Plan with Scenario Assumptions → ]` routes to `/recovery` with pre-loaded assumptions and initiates the **Guarded Approval Flow** to ensure consequential interventions are authorized prior to live execution.

---

## 8. Confirmation & High-Impact Guardrails

### 8.1 Explicit Approval for High-Impact Recovery Execution
Executing an operational recovery plan affects campus facilities, services, and student cohorts. The system enforces structured safeguards:
1. **Trigger:** Operator clicks `[ Review & Approve Plan A ]`.
2. **Modal Presentation:** Displays a dedicated `<GuardedApprovalModal>` outlining:
   - What will happen upon execution.
   - Specific facilities, classrooms, or services affected.
   - Whether the operational intervention is reversible.
   - Specific plan or data dataset being executed.
   - Final operational consequence.
3. **Explicit Review & Acknowledgement:** Operator acknowledges reviewed operational deltas and potential disruption risks.
4. **Explicit Approval Action:** Authorization occurs strictly upon clicking the final action button, explicitly labeled **`[ Approve & Execute Recovery ]`** (or context-specific equivalent). A checkbox alone does not constitute authorization.
5. **Focus Safety:** Default keyboard focus is placed on the `[ Cancel ]` button to prevent accidental execution via rapid `Enter` key presses.

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
| **Stale Telemetry Sync** | Amber banner: *"⚠️ Telemetry sync paused."* | Action: `[ Refresh Sync ]` button immediately forces background revalidation. |
| **Telemetry Outage / Error** | Red alert banner: *"Unable to load live campus graph."* | Action: `[ Retry Connection ]` button with exponential backoff indicator. |
| **No Feasible Recovery Plans** | Warning panel: *"Zero rooms satisfy specialized lab equipment constraint."* | Action: `[ Relax Constraints ]` or `[ Open What-If Simulation ]`. |
| **Incident Resolved** | Green badge: *"Incident resolved. Recovery plan executed."* | Actions: `[ View Audit Trail ]` or `[ Return to Command Center ]`. |

---

## 10. Live Campus Telemetry & Location Inspection Interactions

### 10.1 Location Health Selection & Dual-View Inspection
- **Schematic-to-Table Dual-View Toggle:** Operators can switch between the visual 18-building operational schematic and an accessible `<DataTable>` with a single click. The active selection persists across view switches.
- **Location Detail Drawer:** Clicking any building card or table row triggers a slide-over drawer using approved drawer sizing tokens, showing dual-metric breakdowns (Occupancy + Connectivity) and a 60-minute environmental delta timeline.

### 10.2 Continuous Telemetry Sync & Stale Revalidation
- **Polling Cadence:** Telemetry polls continuously in active viewports and drops to reduced frequency when backgrounded.
- **Stale State Recovery:** When telemetry exceeds the fresh window, the freshness badge turns amber (`STALE`). Clicking the badge initiates background revalidation without clearing existing UI data.

### 10.3 Telemetry-to-Incident Escalation Boundary
- **Separation Principle:** Observed anomalies (e.g. Substation A voltage drop) display as *"Potential Operational Concern"*, not an automatic incident.
- **Escalation Interaction:** Clicking `[ Escalate to Incident Queue → ]` in the Location Detail panel opens the Incident Creation modal with pre-populated building ID, current occupancy, and affected utility node.

### 10.4 Relocation & Absorption Space Finder
- In the Occupancy view, clicking `[ Find Available Alternative Rooms ]` filters rooms with utilization `<60%`, compatible equipment tags, and sorts them by shortest walking distance from the source building.

---

## 11. Multi-Dimensional Interaction State Model & Precedence

All interactions in EzyKwelez map directly to the **5 Orthogonal State Dimensions** defined in [`apps/ui-ux/INTERACTION-STATE-SYSTEM.md`](./INTERACTION-STATE-SYSTEM.md):
1. **Interaction State:** Default, Hover, Focus-visible, Active/Pressed, Selected, Disabled.
2. **Data State:** Fresh/Current, Stale, Partial, Unknown, Unavailable.
3. **Async State:** Idle, Loading, Calculating, Success, Error.
4. **Permission/Action State:** Editable, Read-only, Guarded.
5. **Content State:** Populated, Empty.

### Dimensional Precedence Rules:
- **Async Error** supersedes **Async Loading**.
- **Unavailable Data** supersedes normal fresh presentations.
- **Disabled** supersedes standard hover/active behaviors.
- **Stale Data** remains visibly stale while background recalculation occurs.
- A **Selected** component can simultaneously be **Stale** and **Calculating**.
- A **Read-Only** component remains focusable for inspection.

---

## 12. Asynchronous Calculation & Simulation Recalculation Flow

To prevent UI lockup and layout jitter during analytical processing:

```text
SIMULATION RECALCULATION CYCLE:
[ 1. Modified Input ]  ──(Short Debounce)──►  [ 2. Pending Recalculation Badge ]
                                                      │
[ 4. Projected Output ] ◄──(Update Scorecard)── [ 3. Calculating Feedback ]
         │
    (Engine Error) ──►  [ 5. Calculation Failed (Actionable Retry CTA) ]
```

- **Non-Blocking Rule:** Operators can continue adjusting adjacent controls while background calculation is in-flight.
- **Calculation Duration:** The UI does not assume a fixed calculation duration and gracefully supports fast, slow, and long-running operations.
- **Failed Calculation Rule:** A failed calculation is never displayed as a valid projection or zero delta.

---

## 13. Guarded Action Protocol & Simulation Isolation

High-consequence operational mutations enforce the **5-Step Guarded Protocol**:

$$\text{Review Plan} \longrightarrow \text{Understand Consequences} \longrightarrow \text{Explicit Approval} \longrightarrow \text{Execute Operational Action} \longrightarrow \text{Result \& Audit}$$

- **Simulation Isolation:** The What-If Simulation Sandbox (`/simulation`) is strictly non-destructive and cannot directly execute live operations. It branches into recovery review first:
  $$\text{Simulation} \longrightarrow \text{Branch Draft Plan} \longrightarrow \text{Recovery Review} \longrightarrow \text{Guarded Approval} \longrightarrow \text{Execute Operational Action} \longrightarrow \text{Result \& Audit}$$

---

## 14. Action Priority & Dominant CTA Hierarchy

Every decision surface enforces a strict action priority to eliminate operator hesitation:
- **Primary CTA (1 Max per view):** Solid brand primary (`--color-brand-primary`). Dominant next step.
- **Secondary CTA:** Elevated bordered surface (`--color-bg-elevated`). Exploration/Comparison.
- **Tertiary CTA:** Ghost or icon trigger (`--color-text-secondary`). Filtering, export, inspection.
- **Destructive / Guarded CTA:** Solid danger red (`--color-status-danger`) coupled with mandatory `<GuardedApprovalModal>`.

---

## 15. AI Containment & Advisory Boundary

- **Advisory Role:** Strictly advisory summarization and contextualization grounded in authoritative system results and available operational context. AI translates calculated optimization trade-offs into plain-text explanations and drafts communications for operator review.
- **Zero Authority Guardrail:** AI is strictly barred from autonomous state mutations, plan approvals, constraint overrides, or live database writes. AI has **zero state-mutation, authorization, or decision-making authority**.
- **Grounding Requirement:** AI insights are rendered in dedicated `<AIAssistantContainer />` panels and remain strictly grounded in authoritative system results and available operational context.



