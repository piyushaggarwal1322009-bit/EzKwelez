# EzyKwelez — Responsive & Accessibility Finalization Audit

**Owner:** Aile Sharma (`Lead UI/UX Designer & Design System Owner`)  
**Target Audience:** Frontend Engineering (`apps/web/`), QA, Accessibility Auditing, and Product Leadership  
**Status:** Phase 8 Finalized  
**Version:** 1.0  
**Formal Compliance Target:** WCAG 2.1 Level AA (with documented Level AAA enhancements where applicable)

---

## 1. Executive Summary & Compliance Policy

EzyKwelez is an operational campus intelligence and crisis coordination platform. In emergency situations, operators must analyze complex spatial graphs, triage incidents, compare candidate recovery plans, and authorize interventions under extreme cognitive pressure.

This document establishes the **Canonical Responsive & Accessibility Specification** across all 6 core product areas, guaranteeing that every screen operates with equal clarity, determinism, and safety across all hardware devices, input modalities, and assistive technologies.

```text
ACCESSIBILITY & RESPONSIVE FOUNDATION:
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. Formal Standard:     WCAG 2.1 Level AA Baseline (No blanket AAA claims)  │
│ 2. Breakpoint Grid:     4 Canonical Tiers (Mobile, Tablet, Laptop, Desktop) │
│ 3. Touch Minimum:       44 × 44px Interactive Target with ≥8px separation   │
│ 4. Mandatory Dual-View: Every map/graph provides an accessible table/tree   │
│ 5. Multi-Channel State: Triple redundancy (Icon + Text Label + Color Token) │
│ 6. Focus Visibility:    2px sky-blue (#38bdf8) focus ring with 2px offset   │
│ 7. Live Region Policy:  Polite for milestones; Assertive strictly for alerts│
│ 8. Reduced Motion:      Full adherence to prefers-reduced-motion: reduce    │
└─────────────────────────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **Formal Accessibility Statement:** EzyKwelez targets **WCAG 2.1 Level AA** compliance across the entire product suite. Higher-contrast text ratios (e.g. 14.2:1 primary text) and enhanced touch boundaries are implemented as operational quality enhancements, without claiming blanket WCAG 2.1 AAA certification across non-standard data canvas graphics.

---

## 2. Canonical Responsive Breakpoint Contract

EzyKwelez enforces a standardized 4-tier responsive layout contract aligned with modern operational workstation displays, laptops, slates, and field smartphones:

| Breakpoint Tier | Media Query Range | Target Hardware | Primary Architectural Layout |
|---|---|---|---|
| **Mobile (`sm`)** | `< 768px` | Field Smartphones, Student Devices | Single-column vertical stream, sticky top command bar, 5-icon bottom navigation, full-width bottom sheets. |
| **Tablet (`md`)** | `768px – 1023px` | Operations Slates (iPad, Surface Pro) | Stacked 2-column cards, off-canvas navigation menu, touch-optimized slide-over inspection panels. |
| **Laptop (`lg`)** | `1024px – 1279px` | 13"–15" Laptops, Mobile Workstations | 8-column layout, 64px collapsed icon rail navigation, overlay inspection drawers. |
| **Desktop (`xl` / `2xl`)** | `>= 1280px` | 24"+ Monitors, Multi-Monitor NOCs | Full 12-column grid, permanent 240px navigation sidebar, split-screen Map + Queue, pinned right drawers. |

*Zero Arbitrary Breakpoints:* All component and layout styles consume the canonical breakpoint tokens defined above.

---

## 3. Global Responsive Shell & Navigation Architecture

```text
VIEWPORT NAVIGATION SHELL ADAPTATIONS:

DESKTOP (>= 1280px)            LAPTOP (1024-1279px)       TABLET (768-1023px)        MOBILE (< 768px)
┌───────────────────────────┐  ┌────┬──────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐
│ [Logo] EzyKwelez [Search] │  │[=] │ [Logo] [Search]  │  │ [=] EzyKwelez [Alert] │  │ [=] EzyKwelez  [Alert]│
├─────┬─────────────────────┤  ├────┼──────────────────┤  ├───────────────────────┤  ├───────────────────────┤
│ ≡   │ Command Center      │  │ ≡  │                  │  │ (Main Content Stack)  │  │ (Single Column Flow)  │
│ 🗲   │ Incidents           │  │ 🗲  │ (Main Workspace) │  │                       │  │                       │
│ 🗺   │ Live Campus         │  │ 🗺  │                  │  │                       │  ├───────────────────────┤
│ ⚖   │ Recovery            │  │ ⚖  │                  │  ├───────────────────────┤  │ ≡ | 🗲 | 🗺 | ⚖ | ⚙   │
│ 🎛   │ Simulation          │  │ 🎛  │                  │  │ Bottom Drawer on Tap  │  │ (Sticky Bottom Bar)   │
│ ⚙   │ Settings            │  └────┴──────────────────┘  └───────────────────────┘  └───────────────────────┘
└─────┴─────────────────────┘
```

### 3.1 Shell Adaptation Rules
1. **Desktop (`>= 1280px`):** Permanent 240px left sidebar showing icons and full text labels. Collapsible to 64px icon rail. Main content area utilizes split-screen analytical panes.
2. **Laptop (`1024px – 1279px`):** Defaults to 64px icon rail with accessible hover/focus tooltips, reserving horizontal canvas for data tables and spatial schematics.
3. **Tablet (`768px – 1023px`):** Navigation collapses into an off-canvas drawer triggered by a top hamburger button (`≥44x44px`). Detail drawers become touch-friendly overlay sheets.
4. **Mobile (`< 768px`):** 
   - Top Command Bar docks with Logo, active campus emergency badge, and hamburger menu.
   - Pinned Incident Context Bar condenses into an interactive Status Pill Bar.
   - Persistent 5-Icon Bottom Navigation Bar docks at the base of the viewport for rapid single-thumb navigation.
   - Secondary inspection drawers convert to full-width Bottom Sheets.

---

## 4. Responsive Information Priority Framework

When screen real estate contracts, content is prioritized rather than simply scaled down. Every screen strictly follows the **7-Tier Information Priority Rule**:

$$\text{1. Operational Status} \longrightarrow \text{2. Critical Alert} \longrightarrow \text{3. Primary Metric/Decision} \longrightarrow \text{4. Primary Action} \longrightarrow \text{5. Supporting Context} \longrightarrow \text{6. Secondary Inspection} \longrightarrow \text{7. Historical Logs}$$

```text
MOBILE CONTENT RE-ORDERING STACK:
┌─────────────────────────────────────────────────────────────────────────────┐
│ [TIER 1: Operational Status]       ──► Campus Health / Incident Severity   │
│ [TIER 2: Primary Metric]           ──► 438 Displaced Students / Risk Score │
│ [TIER 3: Primary Action CTA]       ──► [ View Recovery Plans → ] (Sticky)  │
│ [TIER 4: Supporting Summary]       ──► 4-KPI Strip / Root Cause Badges     │
│ [TIER 5: Secondary Inspection]     ──► Accessible Tree / Bottom Sheet Data │
│ [TIER 6: Historical Timeline]      ──► Collapsible Accordion Drawer        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Screen-by-Screen Responsive & Accessibility Audit

---

### 5.1 Command Center (`/command-center`)
- **Primary Information Stack:** Campus Status Banner -> Critical Metrics -> Active Disruptions Queue -> Spatial Campus Schematic -> Activity Log.
- **Responsive Adaptations:**
  - *Desktop:* 4-KPI metric strip + 65/35 split view (Interactive Campus Schematic on left, Prioritized Incidents Feed on right).
  - *Tablet:* 2x2 metric card grid; stacked Schematic above the Incidents Feed.
  - *Mobile:* Sticky top status pill (`94% Normal · 1 Critical`); prominent full-width `<IncidentCard />` for the active crisis; schematic collapses into a collapsible section with direct toggle to `<DataTable>`.
- **Accessibility Dual-View:** Interactive SVG schematic includes a direct button: `[ Inspect Campus as Table ]`, providing an HTML table listing all 18 buildings, health status, occupancy, and active anomalies.

---

### 5.2 Live Campus (`/live-campus`)
- **Sub-Views:** Overview (Schematic), Occupancy (Density), Connectivity (Utility Grid).
- **Responsive Adaptations:**
  - *Desktop:* 18-building operational schematic + right-column Notable Condition Changes feed.
  - *Tablet:* 2-column scrollable location card grid; changes feed docks beneath the grid.
  - *Mobile:* Prioritized Watch/Degraded stack: Flagged buildings appear first as full-width cards; nominal buildings group into a collapsible accordion (`16 Healthy Facilities ▼`).
- **Data Freshness Guarantee:** Stale telemetry timestamps (`STALE · 18m ago`) and disconnected indicators (`[ Unavailable ]`) remain visible and high-contrast at all breakpoints; never omitted for space.
- **Accessibility Dual-View:** All spatial heatmaps and signal cards have 1:1 accessible data table representations with sortable columns.

---

### 5.3 Incidents & Blast Radius (`/incidents`, `/incidents/[id]/blast-radius`)
- **Primary Information Stack:** Incident Severity & Pinned Bar -> 4-KPI Impact Summary -> Root Cause Hypothesis -> Blast Radius Cascade DAG -> Chronological Timeline.
- **Responsive Adaptations:**
  - *Desktop:* Split 2-column view (Dossier + Impact Canvas); interactive multi-tier DAG canvas with node traversal.
  - *Tablet:* Single-column stacked flow; zoomable DAG with slide-over inspection drawer.
  - *Mobile:* Prioritized crisis stream; sticky CTA button `[ View Recovery Plans → ]`; DAG automatically transforms into an **Expandable 4-Tier Hierarchy Tree** (`<ol role="tree">`).
- **Accessibility Tree Alternative:** The 4-tier DAG cascade (`Facilities -> Services -> Schedules -> Cohorts`) is fully navigable using arrow keys in the tree view alternative.

---

### 5.4 Recovery Plan Comparison & Approval (`/incidents/[id]/recovery`)
- **Primary Information Stack:** Recommended Plan A Card -> Multi-Plan Trade-off Comparison Matrix -> Constraint Checklist -> AI Rationale -> Guarded Approval Modal.
- **Responsive Adaptations:**
  - *Desktop:* 4-column side-by-side comparison matrix (`Metrics | Baseline | Plan A | Plan B`).
  - *Tablet:* Horizontally scrollable matrix with sticky left metric label column.
  - *Mobile:* Converts to a **Swipeable Plan Carousel** with a sticky bottom bar showing delta against baseline. Primary CTA `[ Review & Approve Plan A ]` docks above bottom navigation.
- **Guarded Modal Accessibility:** `<GuardedApprovalModal>` traps focus, places initial focus on `[ Cancel ]`, and requires explicit activation of `[ Approve & Execute Recovery ]`. Consequence details never collapse or truncate on mobile.

---

### 5.5 What-If Simulation Sandbox (`/simulation`)
- **Primary Information Stack:** Simulation Advisory Header -> Scenario Assumptions -> Baseline Scorecard -> Projected Scorecard -> Directional Deltas -> Branch Action.
- **Responsive Adaptations:**
  - *Desktop:* 2-column layout (Left: Parameter sliders & switches; Right: Live scorecard, delta pills, multi-scenario matrix).
  - *Tablet:* Stacked single column; parameter controls pinned above scorecard.
  - *Mobile:* Top sticky banner (`SIMULATION SANDBOX`); parameter sliders with companion numeric inputs; bottom-sheet comparison matrix; primary action `[ Branch Recovery Plan Draft → ]` docked at bottom.
- **Simulation Safety Boundary:** Sky-blue advisory header (`SIMULATION SANDBOX · No live mutations`) remains permanently pinned across all screen sizes.

---

## 6. Touch Ergonomics & Input Modality Contracts

1. **Minimum Interactive Hit Target:** Every interactive element (buttons, tabs, table row triggers, slider thumbs, icon buttons) measures at least **$\ge 44 \times 44\text{ px}$** on touch viewports (`sm` and `md`).
2. **Hit Target Separation:** Adjacent interactive touch targets maintain a minimum **$8\text{px}$** margin to prevent mis-taps.
3. **Touch Slider Ergonomics:**
   - Sliders feature an enlarged thumb target with a touch hit radius of $\ge 44\text{px}$.
   - Every slider is paired with a companion `<input type="number">` field for precise direct entry without motor strain.
4. **Zero Gesture-Only Interventions:** Swipe, drag, and pinch gestures are optional progressive enhancements; every action has an accessible, high-contrast button alternative.
5. **No Hover Dependency:** All tooltips, decision factor expansions, and score breakdowns revealed via hover on desktop are accessible via direct tap on touch viewports.

---

## 7. Keyboard Navigation & Focus Management

The documented interaction contracts define the full decision flow as keyboard-operable without requiring obscure keybindings.

### 7.1 Standard Keyboard Traversal Matrix

| Key / Keybinding | Target Component | Interaction Contract |
|---|---|---|
| `Tab` | Entire Application | Moves focus to next interactive element in visual DOM order. |
| `Shift + Tab` | Entire Application | Moves focus to previous interactive element in reverse DOM order. |
| `Enter` | Buttons, Links, Rows | Activates primary trigger, opens modal, or expands record. |
| `Space` | Checkboxes, Toggles | Toggles selection state without scrolling page. |
| `Escape` | Modals, Drawers, Sheets | Closes topmost active overlay and restores focus to triggering element. |
| `⌘K` / `Ctrl+K` | Global Search Trigger | Opens global Command Palette from anywhere in the application. |
| `Arrow Up (↑)` / `Arrow Down (↓)` | Menus, Lists, Trees | Traverses items in dropdowns, command palette, and cascade tree. |
| `Arrow Left (←)` / `Arrow Right (→)` | Tabs, Sliders | Switches active tab panel; steps slider value by 1 increment. |
| `Page Up` / `Page Down` | Sliders | Steps slider value by 10 increments. |
| `Home` / `End` | Sliders, Trees | Jumps to minimum/maximum bound or first/last list item. |

### 7.2 Focus Trapping & Restoration
- **Focus Trapping:** When a `<GuardedApprovalModal />` or `<DrawerInspector />` opens, focus is strictly trapped within the dialog container. Background elements receive `aria-hidden="true"`.
- **Focus Restoration:** Upon closing an overlay, focus immediately returns to the triggering button or node, preserving the operator's mental context.
- **Guarded Action Safety:** Default keyboard focus in `<GuardedApprovalModal />` lands on the **`[ Cancel ]`** button to prevent accidental execution via rapid `Enter` key presses.

---

## 8. Focus Visibility System

Focus visibility is guaranteed across all surfaces and dark backgrounds:
- **Canonical Focus Token:** `outline: 2px solid var(--color-border-focus); outline-offset: 2px;` (`#38bdf8`)
- **Offset Contrast:** The 2px offset creates an intentional dark gap against dark container borders, ensuring crisp visibility against `#090d16`, `#0f172a`, and `#1e293b`.
- **`:focus-visible` Standard:** Focus rings appear for keyboard users while suppressing outline rings during mouse clicks. Focus rings are **never removed** (`outline: none` without replacement is strictly forbidden).

---

## 9. Screen Reader Structure & Semantic Landmarks

EzyKwelez utilizes semantic HTML5 markup to allow screen readers (NVDA, JAWS, VoiceOver, TalkBack) to navigate efficiently:

```html
<!-- Canonical Document Landmark Structure -->
<header role="banner">
  <!-- Global Command Bar & Campus Switcher -->
</header>

<nav aria-label="Main Navigation">
  <!-- Sidebar / Bottom Navigation Bar -->
</nav>

<main id="main-content">
  <!-- Single <h1> per screen -->
  <h1>Operational Command Center</h1>
  
  <section aria-labelledby="situation-status-heading">
    <h2 id="situation-status-heading">Campus Operational Health</h2>
    <!-- KPI Strip & Telemetry -->
  </section>

  <section aria-labelledby="incidents-feed-heading">
    <h2 id="incidents-feed-heading">Active Disruptions Queue</h2>
    <!-- Incident Cards List -->
  </section>
</main>

<aside aria-label="Incident Inspector" aria-hidden="true">
  <!-- Slide-over Drawer / AI Assistant Panel -->
</aside>
```

### Heading Hierarchy Rules
- Exactly one `<h1>` per view (Screen title).
- `<h2>` for major dashboard regions, sections, and widget containers.
- `<h3>` for cards, table column headers, and accordion headers.
- Visual typography size is decoupled from semantic heading levels via utility tokens (`text-xl font-semibold` applied to `<h2>`).

---

## 10. Complex Visualization Accessibility (The Dual-View Rule)

To prevent visual-only barriers, every complex visualization provides an accessible non-visual alternative:

```text
COMPLEX VISUALIZATION ACCESSIBLE PAIRINGS:
┌─────────────────────────────────┬───────────────────────────────────────────┐
│ Visual Graphic Canvas           │ Accessible Non-Visual Equivalent          │
├─────────────────────────────────┼───────────────────────────────────────────┤
│ 1. Campus Spatial Schematic     │ Accessible Location Table (`<DataTable>`) │
│ 2. Blast Radius 4-Tier DAG      │ Hierarchical Tree View (`<ol role="tree">`)│
│ 3. Multi-Plan Comparison Radar  │ Semantic Comparison Matrix (`<table>`)    │
│ 4. Simulation Scenario Graph    │ Tabular Baseline vs. Projected Scorecard  │
│ 5. Utility Connectivity Grid    │ Subsystem Hierarchy List (`<ul>`)         │
└─────────────────────────────────┴───────────────────────────────────────────┘
```

1. **Location Health Schematic:** Toggle button `[ Inspect as Table ]` displays an accessible table listing building names, status badges, room counts, and student headcounts.
2. **Blast Radius Cascade DAG:** Toggle button `[ View Hierarchy List ]` renders an expandable `<ol role="tree">` where child nodes announce their dependency relationship (e.g. *"Substation A powers Science Building B, affecting 438 students"*).
3. **Multi-Plan Comparison Radar:** Accompanied by an HTML `<table>` with explicit column headers (`<th scope="col">`) and row headers (`<th scope="row">`).

---

## 11. Multi-Channel Color & Non-Color Communication

Status and severity are NEVER communicated through color alone. Every operational indicator uses **Triple-Channel Redundancy**:

```text
TRIPLE-CHANNEL STATUS REPRESENTATION:
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. VECTOR ICON      + 2. TEXT LABEL     + 3. SEMANTIC COLOR TOKEN           │
├─────────────────────┼───────────────────┼───────────────────────────────────┤
│ [AlertOctagon]      │ "CRITICAL"        │ #ef4444 (Red Surface + Border)    │
│ [AlertTriangle]     │ "WARNING"         │ #f59e0b (Amber Surface + Border)  │
│ [CheckCircle2]      │ "OPTIMAL / NORMAL"│ #10b981 (Emerald Surface + Border)│
│ [Sliders]           │ "SIMULATED"       │ #38bdf8 (Sky-Blue Tint)           │
│ [Clock]             │ "STALE"           │ #f59e0b (Amber Dashed Border)     │
│ [WifiOff]           │ "UNAVAILABLE"     │ #64748b (Muted Slate Hatch)       │
└─────────────────────────────────────────────────────────────────────────────┘
```

*Screen Reader Protection:* In compact icon-only badges or status dots, screen-reader text is injected via `<span className="sr-only">Status: Critical</span>`.

---

## 12. Data Provenance & Freshness Accessibility

Data provenance and freshness labels remain persistent across all responsive transformations and assistive outputs:
- **Authoritative Provenance Tags:** `[ OBSERVED ]`, `[ CALCULATED ]`, `[ PROJECTED ]`, `[ ASSUMED ]`, `[ MANUAL ]`.
- **Freshness Taxonomy:**
  - `STALE`: Telemetry is cached; age is explicitly shown (`STALE · 18m ago`) with `[ Revalidate Now ]`.
  - `UNAVAILABLE`: Hardware sensor is disconnected; labeled `[ Not Available ]` (never defaulted to `0`).
  - `UNKNOWN`: Environmental condition cannot be determined by sensor network.
- **Screen Reader Provenance Announcement:** Projected values in simulation scorecards announce their origin (e.g. `<span className="sr-only">Projected outcome: 176 students displaced</span>`).

---

## 13. Live Region Strategy & Politeness Calibration

To keep operators informed without creating audio clutter, dynamic updates adhere to calibrated live-region rules:

| Operational Event | Live Region Contract | Speech Announcement Template |
|---|---|---|
| **Emergency Campus Broadcast** | `aria-live="assertive" role="alert"` | *"Critical Alert: Building B power outage confirmed. 438 students displaced."* |
| **Simulation Recalculation** | `aria-live="polite" role="status"` | *"Recalculation complete. Projected displaced students: 176."* |
| **Recovery Plan Generated** | `aria-live="polite" role="status"` | *"3 recovery plans generated. Plan A recommended with score 88 out of 100."* |
| **Stale Telemetry Detected** | `aria-live="polite" role="status"` | *"Warning: Science Building B telemetry is 18 minutes stale."* |
| **Filter Applied** | `aria-live="polite" role="status"` | *"Filters updated. Showing 3 critical incidents in Science Complex."* |
| **Continuous Sensor Polling** | `aria-hidden="true"` | *Suppressed (Prevents audio flooding).* |
| **Canvas Animation Waves** | `aria-hidden="true"` | *Suppressed.* |

---

## 14. Reduced Motion & Vestibular Safety

EzyKwelez fully supports operators with vestibular sensitivities via `@media (prefers-reduced-motion: reduce)`:
- **Instantaneous Transitions:** Durations collapse to `0.01ms`; modals and slide drawers appear immediately.
- **Static Shimmers:** Shimmering skeleton loaders become static muted backgrounds.
- **Static Pulse Glyphs:** Live pulsing dots become static status badges.
- **Preserved Status Communication:** Status changes occur with crisp opacity and border shifts rather than animated transitions.

---

## 15. Text, Content & Zoom Resilience (Up to 200%)

The UI layout is engineered to withstand content variability and user browser zoom up to 200%:
1. **Dynamic Text Container Heights:** Containers avoid fixed pixel heights (`h-10`); flex containers and `min-h` utilities allow multi-line text expansion without clipping.
2. **Long Entity Name Resilience:** Building names (e.g. *"Bio-Molecular Science & High-Performance Computing Complex"*) wrap cleanly across lines without overlapping adjacent metric badges.
3. **Tabular Numerals Alignment:** Monospace fonts (`JetBrains Mono tabular-nums`) prevent layout jitter when numeric values change rapidly.
4. **No Critical Truncation:** Essential identifiers, room codes, and timestamps are never truncated with ellipses (`...`) without providing an immediate expansion or tooltip mechanism.

---

## 16. Dense Data Surfaces & Operational Tables

Operational data tables preserve semantic relationships across all screen sizes:
- **Desktop / Laptop:** Sticky headers (`<thead className="sticky top-0">`), sortable columns, and high-density rows.
- **Tablet:** Secondary metadata columns collapse into expandable row details (`▼ More Details`).
- **Mobile:** Tables gracefully transform into **Adaptive Card Stacks**, grouping primary metrics, status pills, and action buttons into clear 2x2 grid cards.
- **Preserved Semantics:** Mobile card stacks retain `<div role="table">`, `<div role="row">`, and `<div role="cell">` or structured description lists (`<dl>`) to ensure semantic relationships survive transformation.

---

## 17. Contextual Drawers, Modals & Mobile Bottom Sheets

- **Desktop Side Drawers:** Open as right-rail slide-overs, preserving the underlying main operational workspace in view.
- **Mobile Bottom Sheets:** Transform into full-width bottom sheets docked at the base of the screen, featuring an accessible top grab handle and explicit `[ Close ✕ ]` trigger.
- **Scroll Lock & Background Safety:** While an overlay is active, background page scrolling is locked (`overflow: hidden`), and background elements are marked `aria-hidden="true"`.

---

## 18. Developer Handoff Checklist & Acceptance Verification

Frontend developers in `apps/web/` must verify compliance against the following design requirements prior to merging:

- [ ] **WCAG 2.1 AA Baseline:** Verified against the documented WCAG 2.1 AA design requirements (requires zero axe-core audit errors prior to release).
- [ ] **4-Tier Breakpoint Fidelity:** Screen layout adheres to Mobile (`<768px`), Tablet (`768-1023px`), Laptop (`1024-1279px`), and Desktop (`>=1280px`).
- [ ] **Touch Target Sizing:** All interactive touch elements measure $\ge 44 \times 44\text{ px}$ with $\ge 8\text{px}$ separation.
- [ ] **Zero Hover Dependencies:** Every metric breakdown and tooltip is accessible via touch tap and keyboard activation.
- [ ] **Visible Focus Rings:** High-contrast 2px sky-blue (`#38bdf8`) focus rings with 2px offset on all interactive elements.
- [ ] **Dual-View Rule:** All spatial maps, DAGs, and comparison charts offer accessible data table alternatives.
- [ ] **Triple-Channel Status:** No status is communicated by color alone (Vector Icon + Label + Token).
- [ ] **Live Region Politeness:** Telemetry noise suppressed; discrete milestones use `aria-live="polite"`.
- [ ] **Reduced Motion:** Verified against the documented `prefers-reduced-motion: reduce` design requirements.
- [ ] **Zoom Resilience:** Layout remains functional and readable up to 200% text/browser zoom.

---

**End of Audit Specification — Phase 8 Responsive & Accessibility Finalization**

