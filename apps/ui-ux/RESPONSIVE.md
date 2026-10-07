# EzyKwelez — Responsive Layout & Breakpoint Specifications

**Owner:** Aile Sharma (`Lead UI/UX Designer & Design System Owner`)  
**Status:** Phase 1B Finalized  
**Version:** 1.2  
**Design Approach:** Desktop-First for Operator Command Center; Mobile-First for Student Views.

---

## 1. Breakpoint Strategy

EzyKwelez adopts a standardized 4-tier responsive grid aligned with modern operations consoles, laptops, tablets, and field mobile devices.

| Breakpoint Tier | Media Query Range | Target Hardware | Primary UX Mode |
| :--- | :--- | :--- | :--- |
| **Desktop / Multi-Monitor (`2xl`, `xl`)** | `>= 1280px` | 24"+ Monitors, Dual-Screen Ops Centers | Full 12-column grid, permanent 240px sidebar, split-screen Map + Queue, pinned right drawers. |
| **Laptop / Compact Desktop (`lg`)** | `1024px – 1279px` | 13"–15" Laptops, Standard Workstations | 8-column layout, 64px icon rail navigation, overlay inspection drawers. |
| **Tablet / Field Slate (`md`)** | `768px – 1023px` | iPad Pro, Surface Pro, Operations Tablets | 4-column layout, off-canvas menu, stacked cards, touch-optimized bottom sheets. |
| **Mobile / Handheld (`sm`)** | `< 768px` | Field Smartphones, Student Devices | Single-column vertical flow, 5-icon sticky bottom navigation, swipeable comparison cards, modal sheets. |

---

## 2. Global Navigation Adaptation

```text
DESKTOP (>= 1280px)        LAPTOP (1024-1279px)       TABLET (768-1023px)        MOBILE (< 768px)
+-----------------------+  +----+------------------+  +-----------------------+  +-----------------------+
| [Logo] EzyKwelez      |  | [=]| [Logo]           |  | [=] EzyKwelez [Alerts]|  | [=] EzyKwelez  [Alert]|
+----+------------------+  +----+------------------+  +-----------------------+  +-----------------------+
| ≡  | Command Center   |  | ≡  |                  |  | (Main Content Stack)  |  | (Single Column Flow)  |
| 🗲  | Incidents        |  | 🗲  | (Main Workspace) |  |                       |  |                       |
| 🗺  | Live Campus      |  | 🗺  |                  |  |                       |  +-----------------------+
| ⚖  | Recovery         |  | ⚖  |                  |  +-----------------------+  | ≡ | 🗲 | 🗺 | ⚖ | ⚙   |
| 🎛  | Simulation       |  | 🎛  |                  |  | Bottom Drawer on Tap  |  | (Sticky Bottom Bar)   |
| ⚙  | Settings         |  +----+------------------+  +-----------------------+  +-----------------------+
+----+------------------+
```

### Viewport Adaptation Rules
- **Desktop (>= 1280px):** Permanent 240px sidebar with icon + text labels. Collapsible to 64px icon rail.
- **Laptop (1024px – 1279px):** Defaults to 64px icon rail with hover tooltips to maximize room for maps and data tables.
- **Tablet (768px – 1023px):** Off-canvas slide-out menu. Side drawers transition to touch-friendly slide-over modals.
- **Mobile (< 768px):** Sticky top bar (Logo + Alert Badge + Hamburger) + persistent 5-icon bottom navigation bar for quick thumb access.

---

## 3. Pinned Context Bar Responsive Adaptation

- **Desktop / Laptop:** Full horizontal strip locked beneath the top bar: `[CRITICAL] Building B Power Outage · Science Complex · 438 Students Displaced · Elapsed 24m · [← Back]`.
- **Tablet:** Condenses metadata: `[CRITICAL] Building B Outage (438 Students) · [← Back]`.
- **Mobile:** Converts to a compact, tapable **Status Pill Bar** docked at the top. Tapping it opens a bottom sheet with the full incident summary without leaving the current screen.

---

## 4. Component-Level Responsive Behaviors

### 4.1 Operational Data Tables
- **Desktop / Laptop:** Full multi-column grid with sticky headers, sortable columns, and inline action buttons.
- **Tablet:** Secondary columns (e.g. "Created By", "Secondary Entity Count") are hidden or collapsed into expandable row detail.
- **Mobile:** Table transforms into an **Adaptive Card Stack** with key metrics in a 2x2 grid.

### 4.2 Recovery Plan Comparison Matrix
- **Desktop (>= 1280px):** 4-column side-by-side grid (`Metrics` | `Baseline` | `Plan A` | `Plan B Recommended`).
- **Tablet (768px – 1023px):** Horizontally scrollable container with sticky left column for metric labels.
- **Mobile (< 768px):** Converts to a **Swipeable Plan Carousel** with a fixed bottom bar displaying delta against baseline.

### 4.3 Interactive Decision Map & Topology Graphs
- **Desktop / Laptop:** Large interactive SVG canvas with mouse pan, zoom wheel, hovering tooltips, and right-rail inspection drawer.
- **Tablet / Mobile:** Touch pinch-to-zoom and two-finger pan enabled; minimum tap target radius `44x44px`; tapping a node opens a modal bottom sheet.

### 4.4 Modals & Confirmation Dialogs
- **Desktop / Tablet:** Centered modal with max-width `540px` and elevation shadow.
- **Mobile:** Converts to a **Bottom Sheet Dialog** docked to the bottom with `100%` width and rounded top corners (`radius-xl`), keeping buttons within easy thumb reach.

### 4.5 Live Campus Telemetry Matrix & Mobile Health Stack
- **Desktop (>= 1280px):** 18-building operational schematic + right-column Notable Condition Changes feed.
- **Tablet (768px – 1023px):** 2-column scrollable building card grid; changes feed docks beneath the grid.
- **Mobile (< 768px):** Prioritized Attention Stack:
  1. Top sticky status strip (`94% Normal · 2 Watch Locations`).
  2. Filter chips (`[ All ] [ Watch (2) ] [ Degraded (0) ]`).
  3. Prominent full-width cards for flagged locations (`Science Building B · Watch`).
  4. Collapsible accordion group for all healthy/normal buildings (`16 Healthy Facilities ▼`).
  5. 3-segment sub-view tab docked above bottom nav (`Overview` | `Occupancy` | `Connectivity`).

### 4.6 Incident Dossier & Blast Radius Cascade Adaptation
- **Desktop (>= 1280px):** Split 2-column layout (65% Dossier, 35% Action & AI Panel); full interactive DAG canvas with node traversal.
- **Tablet (768px – 1023px):** Stacked single column; 2x2 Impact KPI grid; zoomable DAG with slide-over inspection drawers.
- **Mobile (< 768px):** Prioritized Crisis Stream:
  1. Sticky top status bar with severity badge and student count (`[CRITICAL] Building B · 438 Displaced`).
  2. Prominent primary CTA button: `[ View Recovery Plans → ]`.
  3. Blast Radius DAG automatically converts to an **Expandable 4-Tier Hierarchy Tree** (`<ol role="tree">`) or accessible data table.
  4. Chronological timeline collapses into a modal bottom sheet.

### 4.7 What-If Simulation Sandbox Responsive Adaptation
- **Desktop (>= 1280px):** 2-column sandbox (Left: Sliders & presets; Right: Scorecard, directional delta pills, AI grounding panel, multi-scenario matrix).
- **Tablet (768px – 1023px):** Stacked single column; scenario controls pinned above projected scorecard; comparison matrix in a slide-over drawer.
- **Mobile (< 768px):** Focused Scenario Stream:
  1. Top sticky status banner with projected headcounts (`Projected: 176 Students · ↑ +92 Delta`).
  2. Primary duration slider with companion numeric input and touch target thumb (28px).
  3. Action buttons `[ Run Simulation ]` and `[ Reset to Baseline ]` docked above bottom navigation.
  4. Multi-scenario comparison matrix converts to an expandable bottom sheet modal.

---

## 5. Responsive Validation Checklist

- [ ] Multi-monitor (`1920x1080` & `2560x1440`): Max container bounds respected; no awkward layout stretching.
- [ ] Standard laptop (`1366x768`): Icon rail preserves workspace; no vertical clipping of modals.
- [ ] Tablet (`768x1024`): Touch targets >= 44px; side drawer transitions to overlay.
- [ ] Mobile (`375x667` to `414x896`): Bottom navigation bar sticky; zero horizontal window scroll overflow; tables render as card stacks.
