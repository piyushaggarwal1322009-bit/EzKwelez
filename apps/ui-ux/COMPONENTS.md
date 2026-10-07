# EzyKwelez — UI Component Specifications & Design Patterns

**Owner:** Aile Sharma (`Lead UI/UX Designer & Design System Owner`)  
**Status:** Phase 1A Finalized  
**Version:** 1.1  
**Scope:** Universal Primitives and Domain-Specific Operational Visual Patterns.

---

## 1. Universal Component Primitives

---

### 1.1 Button (`<Button />`)
- **Purpose:** Triggers actions, dialog confirmations, or navigation transitions.
- **Anatomy:** `[ Leading Icon (optional) | Label Text | Trailing Icon / Shortcut (optional) ]`
- **Variants:**
  - `primary`: Background `--color-brand-primary` (`#2563eb`), Text `#ffffff`.
  - `secondary`: Background `--color-bg-elevated` (`#1e293b`), Border `--color-border-strong`, Text `#f8fafc`.
  - `danger`: Background `--color-status-danger` (`#ef4444`), Text `#ffffff`.
  - `outline`: Border `1px solid --color-brand-primary`, Background transparent.
  - `ghost`: Transparent surface, Text `--color-text-secondary`, Hover background `rgba(255,255,255,0.05)`.
- **States:**
  - `default`: Base elevation and contrast.
  - `hover`: Surface luminance +10%.
  - `active`: Inset press / scale 0.98.
  - `focus-visible`: 2px sky-blue (`--color-border-focus`) ring with 2px offset.
  - `disabled`: Opacity 45%, cursor `not-allowed`, pointer-events none.
  - `loading`: Replaces icon with 14px spinner, disables clicks, shows active tense (e.g. "Optimizing...").
- **Accessibility:** Native `<button>`, `aria-disabled`, `aria-busy` when loading.
- **Responsive Behavior:** Full-width on mobile modals (`w-full`), auto-width on desktop.

---

### 1.2 Icon Button (`<IconButton />`)
- **Purpose:** Compact single-action trigger for toolbars, table rows, and drawer dismissals.
- **Anatomy:** `[ Centered Icon (16px or 20px) ]`
- **Variants:** `ghost` (default), `secondary` (bordered), `danger` (critical actions).
- **States:** `default`, `hover` (background tint), `active` (scale 0.95), `focus-visible` (focus ring), `disabled` (opacity 40%).
- **Accessibility:** Mandatory `aria-label` attribute describing the exact action; accompanied by accessible `<Tooltip />`.
- **Responsive Behavior:** Minimum touch target `44x44px` on mobile/touch viewports.

---

### 1.3 Input Field (`<Input />`)
- **Purpose:** Textual, numeric, or parameter entry.
- **Anatomy:** `[ Label | Optional Required Indicator ]` -> `[ Leading Icon (opt) | Text Input | Clear Button (opt) ]` -> `[ Helper / Error Message ]`
- **Variants:** `standard` (text), `numeric` (monospace tabular numerals), `password`.
- **States:**
  - `default`: Background `--color-bg-surface`, Border `--color-border-subtle`, Text `--color-text-primary`.
  - `hover`: Border `--color-border-strong`.
  - `focus-visible`: Border `--color-brand-primary`, Ring `2px solid rgba(59, 130, 246, 0.25)`.
  - `disabled`: Background `--color-bg-base`, Text `--color-text-disabled`, Border `--color-border-subtle`.
  - `invalid / error`: Border `--color-status-danger`, displays `<AlertCircle>` and error message.
- **Accessibility:** Associated `<label htmlFor="id">`, `aria-invalid="true"` on error, `aria-describedby` for helper text.
- **Responsive Behavior:** Height `36px` on desktop, `44px` on mobile devices.

---

### 1.4 Select Dropdown (`<Select />`)
- **Purpose:** Selection of a single option from a predefined list (e.g., Campus Zone, Incident Severity).
- **Anatomy:** `[ Label ]` -> `[ Selected Value Text | ChevronDown Icon ]` -> `[ Dropdown Menu Popover ]`
- **Variants:** `standard`, `compact` (for filter toolbars).
- **States:** `default`, `hover`, `open / active`, `focus-visible`, `disabled`.
- **Accessibility:** `role="combobox"`, `aria-expanded`, keyboard arrow key traversal, `Enter` to select, `Escape` to dismiss.
- **Responsive Behavior:** Converts to native mobile picker on touch devices if native ergonomics are preferred.

---

### 1.5 Search Bar (`<Search />`)
- **Purpose:** Filtering datasets, rooms, incidents, and schedules.
- **Anatomy:** `[ Search Icon (16px) | Input Text Placeholder | Clear 'x' Button | ⌘K Keycap Badge ]`
- **Variants:** `inline` (table header filter) and `command` (global command palette trigger).
- **States:** `default`, `hover`, `active / typing` (debounced 200ms), `focus-visible`, `disabled`.
- **Accessibility:** `role="searchbox"`, `aria-label="Search campus entities"`.
- **Responsive Behavior:** Collapses into an icon trigger on mobile top bars; opens full-screen search sheet.

---

### 1.6 Tabs Navigation (`<Tabs />`)
- **Purpose:** Switching views within the same context (e.g., Incident: Overview / Blast Radius / Recovery Plans).
- **Anatomy:** `[ Tab Item 1 | Tab Item 2 (Active with Brand Border) | Tab Item 3 | Badge Count (opt) ]`
- **Variants:** `line` (subtle bottom border) and `pill` (segmented button group).
- **States:** `default`, `hover`, `active / selected`, `focus-visible`, `disabled`.
- **Accessibility:** `role="tablist"`, `role="tab"`, `aria-selected="true"`, `aria-controls="panel-id"`, keyboard Left/Right arrows traverse tabs.
- **Responsive Behavior:** Horizontally scrollable tab bar with hidden scrollbars on mobile.

---

### 1.7 Badge & Tag (`<Badge />`)
- **Purpose:** Categorical metadata, count indicators, and non-status tags.
- **Anatomy:** `[ Icon (opt, 12px) | Text Label (11px uppercase) | Dismiss 'x' (opt) ]`
- **Variants:** `neutral`, `brand`, `outline`.
- **States:** `static`, `hover` (if clickable filter chip), `focus-visible`.
- **Accessibility:** Informative text; `aria-label` when displaying pure numbers.
- **Responsive Behavior:** Flex wrap container with 4px gap.

---

### 1.8 Status Pill (`<StatusPill />`)
- **Purpose:** Real-time operational status communication (Critical, Warning, Success, Simulation, Neutral).
- **Anatomy:** `[ Status Symbol / Icon (12px) | Status Text (11px Bold Uppercase) ]`
- **Variants:**
  - `critical`: Red tint + `AlertOctagon` (`#ef4444`).
  - `warning`: Amber tint + `AlertTriangle` (`#f59e0b`).
  - `success`: Emerald tint + `CheckCircle2` (`#10b981`).
  - `info / simulation`: Sky-blue tint + `Sliders` / `Info` (`#38bdf8`).
  - `neutral`: Slate tint + `Circle` (`#64748b`).
- **States:** `default`, `pulsing` (for live critical telemetry), `disabled / muted`.
- **Accessibility:** Color must NEVER be used without accompanying text and vector icon.
- **Responsive Behavior:** Retains full text label across all breakpoints.

---

### 1.9 Metric Card (`<MetricCard />`)
- **Purpose:** KPI display for high-level campus surveillance and delta comparison.
- **Anatomy:**
  ```text
  +---------------------------------------------+
  | CATEGORY LABEL (11px uppercase)     [ Icon ]|
  | 438                                         |
  | [ +12% vs baseline ] [ Subtext / Context ]  |
  +---------------------------------------------+
  ```
- **Variants:** `standard`, `critical-alert` (left 4px red accent), `comparison` (before/after values).
- **States:** `loading` (skeleton pulse), `default`, `hover` (elevates surface on interactive cards).
- **Accessibility:** `aria-label="Total Displaced Students: 438, increased by 12% vs baseline"`. Monospace `JetBrains Mono` numerals.
- **Responsive Behavior:** 4 columns (Desktop), 2 columns (Tablet), 1 column (Mobile).

---

### 1.10 Card Container (`<Card />`)
- **Purpose:** Modular content grouping for operational widgets, lists, and forms.
- **Anatomy:** `[ Header (Title + Actions) ] -> [ Body / Content ] -> [ Footer (opt) ]`
- **Variants:** `standard` (Surface 1), `elevated` (Surface 2), `dense` (reduced padding).
- **States:** `default`, `hover` (if clickable), `selected` (brand border).
- **Accessibility:** Semantic `<article>` or `<section>` with proper `<h3>` heading.
- **Responsive Behavior:** Padding adapts from 24px (desktop) to 16px (mobile).

---

### 1.11 Alert Banner (`<Alert />`)
- **Purpose:** Contextual notices regarding system state, campus warnings, or partial engine outages.
- **Anatomy:** `[ Severity Icon | Title (Bold) + Description Text | Action Button (opt) | Close 'x' (opt) ]`
- **Variants:** `critical`, `warning`, `info`, `success`.
- **States:** `visible`, `dismissing` (100ms fade).
- **Accessibility:** `role="alert"` (for critical warnings) or `role="status"` (for info).
- **Responsive Behavior:** Stacks action button below text on narrow screens.

---

### 1.12 Tooltip (`<Tooltip />`)
- **Purpose:** Concise contextual explanation for icon buttons, truncated text, and graph nodes.
- **Anatomy:** `[ Tooltip Text (12px) | Keyboard Shortcut (opt) ]`
- **Variants:** `standard` (dark elevated surface with 1px border).
- **States:** `hidden`, `visible` (150ms delay).
- **Accessibility:** Triggered on `:focus-visible` and hover; dismissible with `Escape`; `role="tooltip"`.
- **Responsive Behavior:** Suppressed on touch devices in favor of tap-to-open bottom sheets.

---

### 1.13 Modal Dialog (`<Modal />`)
- **Purpose:** Focused user interaction requiring decision before returning to main flow.
- **Anatomy:** `[ Backdrop ] -> [ Dialog Container: Header + Body + Footer Actions ]`
- **Variants:** `confirmation` (540px max), `creation-wizard` (840px max), `danger-alert`.
- **States:** `opening` (fade + zoom 0.98 to 1.0), `open`, `closing`.
- **Accessibility:** `role="dialog"` or `role="alertdialog"`, focus trapped, `Escape` key dismisses, autofocus on `Cancel` for danger dialogs.
- **Responsive Behavior:** Converts to docked bottom sheet on mobile screens (`< 768px`).

---

### 1.14 Drawer / Side Panel (`<Drawer />`)
- **Purpose:** Deep-dive entity inspection, AI analyst panel, and blast-radius breakdown.
- **Anatomy:** `[ Header (Title + Status + Close 'x') ] -> [ Scrollable Body ] -> [ Sticky Footer Actions ]`
- **Variants:** `right-docked` (400px–440px wide).
- **States:** `closed`, `entering` (300ms ease-out slide), `open`, `exiting`.
- **Accessibility:** `role="region"`, `aria-label="Entity Details Inspector"`, focus trap when in overlay mode.
- **Responsive Behavior:** Pinned right rail on desktop; full-screen overlay sheet on mobile.

---

### 1.15 Table (`<Table />`) & Operational Data Table (`<DataTable />`)
- **Purpose:** High-density structured operational data (affected rooms, course schedules, audit events).
- **Anatomy:** `[ Toolbar (Search, Filter, Column Config, Export) ] -> [ Table Header with Sort Indicators ] -> [ Data Rows ] -> [ Pagination / Summary Footer ]`
- **Variants:** `standard` (44px row height), `dense` (36px row height).
- **States:** `loading` (table skeleton rows), `empty` (empty state graphic + message), `error` (retry trigger), `row-selected`, `sorting`.
- **Accessibility:** Native `<table>`, `<th>` with `aria-sort`, full keyboard row traversal, right-aligned numbers in `JetBrains Mono`.
- **Responsive Behavior:** Horizontal scroll container with sticky left identifier column; transforms to Card Stack on mobile.

---

### 1.16 Skeleton Loader (`<SkeletonLoader />`)
- **Purpose:** Visual placeholder preventing layout shifts during data loading.
- **Anatomy:** Shimmer wave gradient across `#131d33` to `#1e293b`.
- **Variants:** `text`, `avatar / circle`, `metric-card`, `table-row`, `graph-canvas`.
- **States:** `active-shimmer` (disabled under `prefers-reduced-motion`).
- **Accessibility:** `aria-hidden="true"`, accompanied by visually hidden `<span className="sr-only">Loading content...</span>`.

---

### 1.17 Empty State (`<EmptyState />`)
- **Purpose:** Informs operator when no data exists (e.g. zero active incidents, empty search).
- **Anatomy:** `[ Neutral Schematic Icon | Title (SemiBold) | Description | Action Button (e.g. 'Clear Filters') ]`
- **Variants:** `all-clear` (operational normal), `no-results` (filtered out), `unconfigured`.
- **Accessibility:** Clear readable text, accessible focus on the action button.

---

### 1.18 Error State (`<ErrorState />`)
- **Purpose:** Surfaces operational errors, failed telemetry connections, or calculation timeouts.
- **Anatomy:** `[ AlertOctagon Icon (Amber or Red) | Error Title | Detailed Technical Reason | Retry Action Button ]`
- **Variants:** `inline-widget` (for isolated component errors) and `full-page` (for network/auth failures).
- **Accessibility:** `role="alert"`, clear retry trigger.

---

### 1.19 Toast Notification (`<Toast />`)
- **Purpose:** Temporary system feedback for asynchronous actions (e.g. "Simulation completed", "Recovery plan approved").
- **Anatomy:** `[ Status Icon | Title | Optional Description | Action Link (e.g. 'View in Audit Log') | Dismiss 'x' ]`
- **Variants:** `success`, `info`, `warning`, `danger`.
- **States:** `entering`, `visible` (auto-dismiss after 4000ms for info/success; persistent for danger), `exiting`.
- **Accessibility:** Rendered in `aria-live="polite"` (or `assertive` for critical alerts) landmark region.

---

## 2. EzyKwelez Domain Component Patterns

---

### 2.1 Incident Component Pattern (`<IncidentPattern />`)
- **Supported Severity Levels:**
  1. `Informational`: Blue badge (`#38bdf8`), `Info` icon. Scheduled maintenance or low-impact notice.
  2. `Low`: Slate/Blue badge, `Info` icon. Minor delay, zero class displacement.
  3. `Medium`: Amber badge (`#f59e0b`), `AlertTriangle` icon. Single room closure, 1 class affected.
  4. `High`: Orange/Red badge, `AlertCircle` icon. Multiple rooms closed, >100 students displaced.
  5. `Critical`: Red badge (`#ef4444`), `AlertOctagon` icon, live pulse. Building offline, power outage, high cascade.
- **Visual Pattern:**
  - Header: Severity Pill + Incident Title + Elapsed Time (`JetBrains Mono`).
  - Target: Direct target entity (e.g. `Main Transformer Substation · Building B`).
  - Impact Counter Group: `[ 7 Rooms Closed ] [ 4 Classes Displaced ] [ 438 Students ]`.
  - Actions: `[ Analyze Blast Radius ]` and `[ View Recovery Plans ]`.

---

### 2.2 Occupancy Component Pattern (`<OccupancyPattern />`)
- **Data Display:**
  - Current Occupant Count vs. Max Capacity (e.g. `45 / 60`).
  - Utilization Percentage bar with color thresholds (`< 70%` Green, `70-89%` Amber, `>= 90%` Red).
  - Trend Indicator (`↑ Rising (+15/hr)` or `↓ Clearing`).
  - Data Freshness Timestamp (`Updated 2m ago` or `⚠️ Stale telemetry`).
- **Visual Pattern:**
  - Compact room occupancy pill: `[ Room B204 | 75% | 45/60 | Lab Ready ]`.
  - Expanded heatmap card for building wings.

---

### 2.3 Connectivity Component Pattern (`<ConnectivityPattern />`)
- **Data Display:**
  - Signal Quality Indicator (4-bar signal icon or percentage meter: `98% Operational`).
  - Status Pill: `Online`, `Degraded`, `Offline`, `Stale / Unreachable`.
  - Latency / Load Metric in `JetBrains Mono` (e.g. `12ms`, `840 Mbps`).
  - Freshness / Stale Warning indicator.
- **Visual Pattern:**
  - Network Node Card: Node ID + Utility Type + Status Pill + Downstream Dependent Buildings list.

---

### 2.4 Impact / Blast Radius Component Pattern (`<ImpactPattern />`)
- **Data Display:**
  - Aggregate displaced students count.
  - Affected physical locations (Buildings, Wings, Specific Rooms).
  - Disrupted services (Power, WiFi, HVAC, Specialized Lab Equipment).
  - Calculated Disruption Severity Score (0–100 scale).
  - Dependency Flow Path (`Substation A -> Building B -> Lab B204 -> Physics 101`).
- **Visual Pattern:**
  - Multi-tier Cascade Tree view paired with an interactive summary scorecard.

---

### 2.5 Recovery Plan Component Pattern (`<RecoveryPattern />`)
- **Data Display:**
  - Plan Rank & Designation (`Plan B: Satellite Relocation ★ Recommended`).
  - Objective Disruption Reduction Score (e.g. `88/100`).
  - Quantitative Impact Metrics (Displaced Students: `21` vs `438` baseline; Unresolved Classes: `0`).
  - Estimated Recovery Time & Student Travel Burden (`+45m avg walking distance`).
  - Confidence Score & Constraint Satisfaction Checklist (`100% Lab Equipment Matched`).
  - Grounded Rationale Summary: Concise, machine-derived explanation of why this plan outperforms alternatives.
- **Visual Pattern:**
  - Highlighted emerald candidate card with expandable `"Why this plan?"` drawer and direct `[ Select & Approve ]` trigger.

---

### 2.6 Simulation Component Pattern (`<SimulationPattern />`)
- **Data Display:**
  - Scenario Inputs (Outage duration slider: `15m – 240m`, Attendee multiplier: `1.0x – 2.5x`, Infrastructure switches).
  - Baseline Metric vs. Projected Simulated Outcome.
  - Calculated Delta (`-417 Displaced Students (-95%)`, `+30 min restoration delay`).
  - Side-by-Side Comparison Diff Matrix.
- **Visual Pattern:**
  - Sky-blue accented simulation sandbox with instant debounced recalculation feedback and "Apply to Incident" workflow.

---

## 3. Phase 7 Feedback & Guarded Overlay Component Patterns

---

### 3.1 Guarded Approval Modal (`<GuardedApprovalModal />`)
- **Purpose:** Enforces the mandatory 5-step safety protocol before executing high-impact recovery plans, facility closures, or operational interventions.
- **Anatomy:**
  ```text
  [ Modal Header: Severity Icon + Consequential Title ]
  [ Impact Summary: Displaced headcount, affected facilities, dispatched resources ]
  [ Blast Radius Delta Strip: Baseline vs. Post-Intervention ]
  [ Consequence Acknowledgement: Checkbox confirming reviewed operational impacts ]
  [ Footer Actions: [ Cancel (Default Focus) ] | [ Approve & Execute Recovery ] ]
  ```
- **Authorization Contract:** A consequence acknowledgement checkbox within the modal confirms review of the impact details, but **does not constitute authorization**. Authorization occurs solely upon deliberate activation of the primary action button, explicitly labeled **`[ Approve & Execute Recovery ]`** (or domain equivalent).
- **States:**
  - `unreviewed`: Confirm button inert (`aria-disabled="true"`). Default focus on `[ Cancel ]`.
  - `reviewed`: Consequence acknowledgement confirmed; primary button activates with solid brand color.
  - `executing`: Primary button transitions to loading feedback (`aria-busy="true"`).
  - `error`: Inline alert surfaces execution failure while preserving operator context.
- **Accessibility:** Focus-trapped, `role="alertdialog"`, `aria-describedby="consequence-summary"`, `Escape` dismisses.

---

### 3.2 Stale Telemetry Banner (`<StaleTelemetryBanner />`)
- **Purpose:** Informs the operator when displayed telemetry is cached/outdated without destroying access to usable data.
- **Anatomy:** `[ Clock Icon (Amber) | Message: "Telemetry stale" | CTA: [ Re-sync Now ] ]`
- **Variants:** `inline` (inside card header) and `global` (full-width banner beneath Command Bar).
- **Accessibility:** `role="status"`, `aria-live="polite"`.

---

### 3.3 Empty State Container (`<EmptyState />`)
- **Purpose:** Guarantees zero dead-ends when queries, filters, or active incidents return zero rows.
- **Anatomy:** `[ Neutral Graphic / Icon | Primary Heading | Guidance Description | Action Recovery CTA ]`
- **Examples:**
  - All-Clear: `<CheckCircle2>` *"All 18 buildings operational. Zero active disruptions."* -> `[ Run What-If Drill ]`.
  - Filter Reset: `<Filter>` *"No incidents match filter: Severity = Critical in Humanities"* -> `[ Reset All Filters ]`.

---

### 3.4 Contextual Inspection Drawer (`<DrawerInspector />`)
- **Purpose:** Slide-over detail inspection for incident root cause, node DAG properties, and AI "Why this plan?" rationales.
- **Anatomy:** `[ Pinned Header: Title + Subtitle + Close '✕' ]` -> `[ Scrollable Body: Metrics, Telemetry, AI Rationale ]` -> `[ Pinned Footer: Primary Secondary Actions ]`
- **Behavior:**
  - Desktop: Uses the approved drawer sizing token and preserves the existing responsive layout contract.
  - Tablet/Mobile: Converts to bottom-sheet modal.
  - Dismissal: `Escape`, close button, or backdrop tap. Restores focus to triggering element.

---

## 4. Component State Applicability Matrix (By Dimension)

Components implement the subset of states applicable to their functional role across the 5 orthogonal dimensions:

| Component | Interaction States | Data States | Async States | Permission States | Content States |
|---|---|---|---|---|---|
| `<Button />` | Default, Hover, Focus, Active, Disabled | Current | Idle, Loading, Success | Editable | Populated |
| `<Input />` | Default, Hover, Focus, Active, Disabled | Current | Idle, Error | Editable, Read-only | Populated, Empty |
| `<Tabs />` | Default, Hover, Focus, Active, Selected, Disabled | Current | Idle | Editable | Populated |
| `<IncidentCard />` | Default, Hover, Focus, Active, Selected | Current, Stale | Idle, Loading, Error, Success | Editable, Guarded | Populated |
| `<OccupancyPattern />` | Default, Hover, Focus, Selected | Current, Stale, Partial, Unavailable | Idle, Loading, Error | Read-only | Populated, Empty |
| `<ConnectivityPattern />`| Default, Hover, Focus, Selected | Current, Stale, Partial, Unavailable | Idle, Loading, Error | Read-only | Populated, Empty |
| `<RecoveryPattern />` | Default, Hover, Focus, Active, Selected, Disabled | Current, Stale, Partial | Idle, Loading, Calculating, Success, Error | Guarded | Populated, Empty |
| `<SimulationPattern />` | Default, Hover, Focus, Active, Disabled | Current, Stale, Partial | Idle, Loading, Calculating, Success, Error | Editable | Populated |
| `<GuardedApprovalModal />`| Default, Focus, Active, Disabled | Current | Idle, Loading, Error, Success | Guarded | Populated |


