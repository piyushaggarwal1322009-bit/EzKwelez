# EzyKwelez — Accessibility Standards & Compliance Guide

**Owner:** Aile Sharma (`Lead UI/UX Designer & Design System Owner`)  
**Status:** Phase 1A Finalized  
**Version:** 1.1  
**Baseline Target:** WCAG 2.1 Level AA (with selective Level AAA practices for typography contrast and focus visibility)

---

## 1. Accessibility Policy & Target Compliance

EzyKwelez is an operational campus intelligence platform. In crisis response environments, operators must make split-second decisions under high cognitive load. High-fidelity accessibility ensures that all operators, including those with visual, motor, auditory, or cognitive disabilities, can perceive situation telemetry, traverse dependency graphs, and execute interventions without friction.

> **Target Standard:**  
> **WCAG 2.1 Level AA Baseline.** Selective AAA practices (such as 14:1 primary text contrast and 44x44px minimum touch targets) are integrated across all core components, without claiming blanket AAA certification across non-standard data graphics.

---

## 2. Keyboard Navigation & Focus Management

### 2.1 Comprehensive Keyboard Traversal
Every interactive element (buttons, inputs, select dropdowns, search bars, tabs, table rows, sliders, and drawer toggles) MUST be fully operable via keyboard alone.

| Key / Shortcut | Interaction & Scope |
| :--- | :--- |
| `Tab` / `Shift + Tab` | Moves focus sequentially through all interactive controls in visual reading order. |
| `Enter` / `Space` | Activates buttons, expands accordions, toggles checkboxes, selects table rows. |
| `Arrow Keys (↑ ↓ ← →)` | Navigates within tab groups (`role="tablist"`), menu items, and tree view hierarchy. |
| `Left / Right` | Adjusts simulation sliders (`<input type="range">`) by 1 step. |
| `PageUp / PageDown` | Adjusts simulation sliders by 10 steps. |
| `Home / End` | Moves slider or tree traversal to absolute minimum/maximum bounds. |
| `Escape` | Dismisses open modal dialogs, drawers, dropdowns, command palettes, and tooltips; restores focus to trigger. |
| `⌘K` / `Ctrl + K` | Globally triggers the Command Palette search dialog from anywhere in the application. |

### 2.2 High-Contrast Visible Focus Indicator
Focus rings must NEVER be disabled (`outline: none` without replacement is strictly forbidden).

- **Focus Ring Token:** `outline: 2px solid var(--color-border-focus); outline-offset: 2px;` (`#38bdf8`)
- The 2px offset creates an intentional dark gap against dark surfaces, preventing the focus ring from blending into adjacent element borders.
- Implemented with `:focus-visible` to suppress focus rings during standard mouse clicks while guaranteeing crisp visibility for keyboard users.

### 2.3 Focus Trapping in Modals & Drawers
- When a `<Modal />`, `<ConfirmationDialog />`, or `<Drawer />` opens, keyboard focus is strictly trapped within the active dialog container.
- Initial focus is placed on the safest actionable control (e.g. `Cancel` button on high-impact destructive dialogs).
- Background elements are marked `aria-hidden="true"` and cannot receive focus while the dialog is active.

---

## 3. Color Contrast & Legibility Standards

All interface text, icons, and interactive borders meet or exceed WCAG 2.1 Level AA requirements:

| Interface Element | WCAG AA Minimum | EzyKwelez Delivered Contrast | Design Token Pair |
| :--- | :--- | :--- | :--- |
| **Primary Text (Headings, Metrics)** | `4.5:1` | `14.2:1` (Exceeds AAA) | `--color-text-primary` (`#f8fafc`) on `#0f172a` |
| **Secondary Text (Labels, Body)** | `4.5:1` | `7.8:1` (Exceeds AAA) | `--color-text-secondary` (`#94a3b8`) on `#0f172a` |
| **Muted Metadata (Table Caps)** | `3.0:1` | `4.8:1` (Meets AA) | `--color-text-muted` (`#64748b`) on `#0f172a` |
| **Status Badges & Pills** | `3.0:1` | `5.2:1` | Tinted background + 35% border + high-contrast text |
| **Keyboard Focus Ring** | `3.0:1` | `9.4:1` | `--color-border-focus` (`#38bdf8`) on canvas |

---

## 4. Non-Color Status Communication

Status must NEVER be communicated through color alone. Every status representation in EzyKwelez combines **three redundant channels**:

```text
1. VECTOR ICON      + 2. TEXT LABEL     + 3. SEMANTIC COLOR
[AlertOctagon]          "CRITICAL"          #ef4444 Red Tint
[AlertTriangle]         "WARNING"           #f59e0b Amber Tint
[CheckCircle2]          "OPTIMAL"           #10b981 Emerald Tint
[Sliders / Info]        "SIMULATED"         #38bdf8 Sky-Blue Tint
[Circle]                "DRAFT"             #64748b Slate Tint
```

- When status is rendered inside compact charts or dots, an accompanying text description or screen-reader only text (`<span className="sr-only">Status: Critical</span>`) MUST be included.

---

## 5. Touch Targets & Mobile Ergonomics

- **Minimum Touch Target Size:** All interactive buttons, icon triggers, tabs, and form controls on tablet and mobile viewports must measure at least `44 x 44px` (or contain `44x44px` touch bounding padding).
- **Simulation Sliders:** Slider thumb touch targets expand to `28px` with an invisible `44px` hit box on touch screens.

---

## 6. Semantic Structure & Screen Reader Support

1. **Document Landmarks:**
   - `<header role="banner">`: Global command bar and campus switcher.
   - `<nav aria-label="Main Navigation">`: Sidebar navigation rail.
   - `<main>`: Core operational workspace.
   - `<aside aria-label="Incident Inspector">`: Detail drawer and AI Analyst panel.
2. **Heading Hierarchy:**
   - Single `<h1>` per view (Screen title).
   - `<h2>` for major dashboard rows and widget containers.
   - `<h3>` for cards, section widgets, and table headers.
3. **Form Controls:**
   - Explicit `<label htmlFor="id">` for all inputs.
   - Error messages associated via `aria-describedby` and `aria-errormessage`.
   - `aria-invalid="true"` set on validation failure.
4. **Dynamic Live Regions:**
   - Critical incident updates: `aria-live="assertive"` with `role="alert"`.
   - Streaming AI explanations / simulation calculations: `aria-live="polite"`.

---

## 7. Dual-View Rule for Complex Data Visualizations

Complex spatial maps, node-link dependency graphs, and comparison radars cannot be parsed by screen readers or keyboard-only operators without structured alternatives.

### The Mandatory Dual-View Rule:
Every visual chart, spatial map, and dependency graph MUST provide an accessible textual alternative:

1. **Interactive Campus Map:** Includes an "Inspect as Table" toggle providing a structured `<DataTable>` listing all buildings, health states, closed rooms, and displaced classes.
2. **Blast Radius Cascade Graph:** Includes an expandable `<ol role="tree">` hierarchical list navigable with arrow keys.
3. **Recovery Comparison Radar / Charts:** Rendered alongside an accessible HTML `<table>` with proper column headers and tabular metrics.

---

## 8. Reduced Motion Compliance (`prefers-reduced-motion`)

To support operators with vestibular or seizure sensitivities:
- All CSS animations and transitions must check `@media (prefers-reduced-motion: reduce)`.
- When active:
  - Shimmer loaders are replaced with static muted backgrounds.
  - Live pulsing dots become static status badges.
  - Blast radius propagation waves render instantly as static rings.
  - Slide drawers and modal transitions appear immediately with 0ms transition.

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 9. Accessibility Verification Checklist

Before any component or template PR is approved:
- [ ] **Automated Audit:** axe-core / Lighthouse Accessibility audit returns zero violations.
- [ ] **Keyboard Complete:** Full operational decision flow (Incident -> Blast Radius -> Recovery -> Approval) is completable without mouse input.
- [ ] **Focus Rings:** Focus indicators are visible and high-contrast against all background surfaces.
- [ ] **Screen Reader Test:** Tested with NVDA / VoiceOver; all buttons, metrics, and live updates announce descriptive labels.
- [ ] **Dual-View Check:** Accessible data tables exist for all maps and graphs.
- [ ] **Reduced Motion:** Verified with reduced motion enabled; all motion stops immediately.
