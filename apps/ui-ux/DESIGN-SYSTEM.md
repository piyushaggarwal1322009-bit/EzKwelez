# EzyKwelez — Design System Specification

**Owner:** Aile Sharma (`Lead UI/UX Designer & Design System Owner`)  
**Status:** Phase 1A Finalized  
**Version:** 1.1  
**Design Philosophy:** Operational Command Intelligence — Calm, Precise, High-Information-Density, Decisive  

---

## 1. Design Principles & Theme Direction

EzyKwelez is an operational campus intelligence platform. When disruptions occur (power outages, structural closures, network failures, severe weather), campus operators must answer:
> **What failed? What depends on it? How bad is the impact? What are our recovery options? Which option is optimal?**

### 1.1 Operational Design Tenets
1. **Decision-First Density:** Every viewport prioritizes actionable operational insight over decorative empty space.
2. **Deterministic Clarity:** The UI visualizes true engine outputs. No decorative "AI magic" animations, fake meters, or ambiguous charts.
3. **Calm Under Crisis:** Deep slate/navy surfaces, crisp typography, and restrained semantic color accents minimize operator fatigue during prolonged crisis coordination.
4. **No Visual Noise:** Avoid generic college ERP styling, template admin dashboards, excessive gradients, glassmorphism blur layers, and oversized rounded corners.

### 1.2 Theme Stance
> **Primary visual direction:** Dark operational command-center theme.  
> *Light theme remains a future architectural/design consideration.*

All token definitions use semantic abstractions (`--color-bg-base`, `--color-surface`, `--color-border`) to ensure future theme extensibility without refactoring component markup.

---

## 2. Semantic Color System & Design Tokens

EzyKwelez uses a calibrated, semantic dark-mode palette designed for high contrast and rapid recognition.

### 2.1 Surfaces & Layout Tokens
```css
--color-bg-base:        #090d16;  /* Canvas background */
--color-bg-surface:     #0f172a;  /* Standard card/panel background */
--color-bg-elevated:    #1e293b;  /* Modals, popovers, elevated surfaces */
--color-bg-subtle:      #131d33;  /* Table alternate rows, input backgrounds */
--color-bg-backdrop:    rgba(9, 13, 22, 0.75); /* Overlay backdrop */
```

### 2.2 Border Tokens
```css
--color-border-subtle:  #1e293b;  /* Hairline card & container borders */
--color-border-strong:  #334155;  /* Focus states, active component boundaries */
--color-border-accent:  #3b82f6;  /* Selected state indicator */
--color-border-focus:   #38bdf8;  /* High-contrast keyboard focus ring */
--color-border-disabled:#1e293b;  /* Disabled control border */
```

### 2.3 Typography & Content Tokens
```css
--color-text-primary:   #f8fafc;  /* High contrast (14.2:1) - Headings, active values, primary text */
--color-text-secondary: #94a3b8;  /* Medium contrast (7.8:1) - Descriptions, labels, secondary metadata */
--color-text-muted:     #64748b;  /* Subdued contrast (4.8:1) - Timestamps, table headers, helper text */
--color-text-inverse:   #090d16;  /* Text on bright status badges or primary buttons */
--color-text-disabled:  #475569;  /* Disabled input and button labels */
```

### 2.4 Brand & Action Tokens
```css
--color-brand-primary:  #2563eb;  /* Primary operator actions, active button */
--color-brand-accent:   #0ea5e9;  /* Secondary accent, active navigation highlight */
--color-brand-subtle:   rgba(37, 99, 235, 0.15); /* Selected row/chip background */
```

### 2.5 Status & Severity System
Status colors must ALWAYS be accompanied by an icon and text label to maintain accessibility.

| Status / Severity | Base Hex | Surface Tint (12%) | Border Tint (35%) | Text Tint | Meaning & Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CRITICAL / DANGER** | `#ef4444` | `rgba(239, 68, 68, 0.12)` | `rgba(239, 68, 68, 0.35)` | `#fca5a5` | Direct failures, room closed, class stranded, critical outage |
| **WARNING / MODERATE** | `#f59e0b` | `rgba(245, 158, 11, 0.12)` | `rgba(245, 158, 11, 0.35)` | `#fde68a` | Degraded capacity, secondary cascade, approaching threshold |
| **SUCCESS / OPTIMAL** | `#10b981` | `rgba(16, 185, 129, 0.12)` | `rgba(16, 185, 129, 0.35)` | `#6ee7b7` | Fully operational, resolved, optimal recovery plan score |
| **INFO / SIMULATION** | `#38bdf8` | `rgba(56, 189, 248, 0.12)` | `rgba(56, 189, 248, 0.35)` | `#bae6fd` | Counterfactual scenario, advisory notice, simulation mode |
| **NEUTRAL / DRAFT** | `#64748b` | `rgba(100, 116, 139, 0.12)` | `rgba(100, 116, 139, 0.35)` | `#cbd5e1` | Draft scenario, unassigned entity, inactive state |
| **FOCUS** | `#38bdf8` | -- | -- | -- | Universal keyboard focus indicator |
| **DISABLED** | `rgba(148, 163, 184, 0.38)` | `rgba(30, 41, 59, 0.4)` | `#1e293b` | `#475569` | Non-interactive elements |

---

## 3. Typography System

We standardize on two typeface families with strict roles:
1. **Primary Interface (`Inter`):** General UI, headings, labels, descriptions, navigation, buttons, and dialog text.
2. **Metrics & Monospace (`JetBrains Mono`):** Tabular figures, capacity ratios, timestamps, node IDs, impact scores, and comparison matrices.  
   *Guidance: Do not overuse monospace typography. Monospace is reserved strictly for structured numeric and technical values where character alignment prevents layout jitter.*

### 3.1 Type Scale Matrix

| Token Role | Font Size | Line Height | Weight | Letter Spacing | Font Family | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Metric (`2xl`)** | `32px` (`2.0rem`) | `36px` (`1.12`) | 700 Bold | `-0.02em` | `JetBrains Mono` | Primary KPI numbers (e.g. `438`, `88/100`) |
| **Page Title (`xl`)** | `24px` (`1.5rem`) | `32px` (`1.33`) | 600 SemiBold | `-0.01em` | `Inter` | Screen `<h1>` titles |
| **Section Header (`lg`)** | `18px` (`1.125rem`)| `24px` (`1.33`) | 600 SemiBold | `-0.005em` | `Inter` | Dashboard row titles, modal headings |
| **Card / Widget Title (`md`)** | `15px` (`0.9375rem`)| `20px` (`1.33`)| 600 SemiBold | `0` | `Inter` | Card titles, navigation items, buttons |
| **Body Primary (`base`)** | `14px` (`0.875rem`)| `20px` (`1.43`) | 400 Regular | `0` | `Inter` | Main copy, form inputs, table cells |
| **Body Medium (`base`)** | `14px` (`0.875rem`)| `20px` (`1.43`) | 500 Medium | `0` | `Inter` | Button labels, table column highlights |
| **Caption / Metadata (`sm`)** | `12px` (`0.75rem`) | `16px` (`1.33`) | 400 Regular | `+0.01em` | `Inter` | Helper text, secondary timestamps |
| **Badge / Micro-label (`xs`)** | `11px` (`0.6875rem`)| `14px` (`1.27`)| 600 SemiBold | `+0.03em` | `Inter` (Uppercase) | Status badges, category tags |
| **Tabular Value / Code (`base`)** | `13px` (`0.8125rem`)| `18px` (`1.38`)| 500 Medium | `0` | `JetBrains Mono` | Table numeric columns, delta values |

### 3.2 Numeric Formatting Guidance
- All numerical figures representing metrics (students displaced, minutes remaining, impact scores) MUST include CSS property `font-variant-numeric: tabular-nums` or Tailwind class `tabular-nums`.
- Prepend deltas with explicit arithmetic symbols: `+12%`, `-95%`, `+45m`.

---

## 4. Spacing System (8pt Grid Philosophy)

EzyKwelez enforces a strict 8pt base grid with a 4px sub-grid for micro-alignments.

```css
--space-0:   0px;
--space-1:   4px;   /* Micro gap (badge icon to text, compact tags) */
--space-2:   8px;   /* Tight element spacing, button padding-y (sm), stack gap */
--space-3:   12px;  /* Form input padding-y, card internal item gap */
--space-4:   16px;  /* Standard container padding, button padding-x, card body gap */
--space-5:   20px;  /* Sub-section gap, toolbar spacing */
--space-6:   24px;  /* Standard card padding, grid gap between dashboard widgets */
--space-8:   32px;  /* Major section separator gap */
--space-10:  40px;  /* Hero section margin, drawer header separation */
--space-12:  48px;  /* Major page area divider */
--space-16:  64px;  /* Viewport edge gutters on wide displays */
```

### 4.1 Spacing Application Matrix
- **Page Margins / Gutters:** `24px` (`--space-6`) on desktop; `16px` (`--space-4`) on mobile.
- **Dashboard Section Gap:** `32px` (`--space-8`) between major rows.
- **Card Padding:** `16px` (`--space-4`) for dense cards; `24px` (`--space-6`) for standard overview cards.
- **Component Internals:** `8px` (`--space-2`) to `12px` (`--space-3`) between internal rows and controls.
- **Data-Dense Tables:** Row vertical padding `6px` (dense) to `10px` (standard); horizontal padding `12px`.

---

## 5. Layout & Grid Architecture

- **Page Max Width:** `1600px` (or 100% fluid with max bounds for multi-monitor command consoles).
- **Header:** Fixed height `56px` (`--color-bg-surface` with bottom border `--color-border-subtle`).
- **Sidebar Navigation:** Fixed width `240px` (Expanded) or `64px` (Collapsed Icon Rail).
- **Main Content Area:** 12-column CSS Grid with `gap: 24px` (`--space-6`).
- **Detail / Inspection Drawer:** Width `400px` to `440px` with persistent right dock (Desktop) or overlay bottom sheet (Mobile).
- **Dialog Max Width:** `540px` for confirmation modals; `840px` for multi-step creation wizards.

---

## 6. Border Radius System

Radii are crisp and architectural. Excessive "bubbly" curves are strictly prohibited.

```css
--radius-none: 0px;
--radius-sm:   2px;   /* Badges, micro status tags */
--radius-md:   4px;   /* Buttons, inputs, dropdown items, table rows */
--radius-lg:   6px;   /* Operational cards, panels, sidebars */
--radius-xl:   8px;   /* Modals, command palette container */
--radius-full: 9999px;/* Pill indicators, avatar rings */
```

---

## 7. Elevation, Shadows & Borders

Elevation in the dark operational console is communicated through **surface lightness** and **1px border contrast**:

```css
/* Elevation 0 (Canvas) */
--surface-0: var(--color-bg-base);
--border-0:  1px solid transparent;

/* Elevation 1 (Cards, Panel Sections) */
--surface-1: var(--color-bg-surface);
--border-1:  1px solid var(--color-border-subtle);
--shadow-1:  0 1px 3px 0 rgba(0, 0, 0, 0.4);

/* Elevation 2 (Dropdowns, Hover Popovers, Active Cards) */
--surface-2: var(--color-bg-elevated);
--border-2:  1px solid var(--color-border-strong);
--shadow-2:  0 4px 12px 0 rgba(0, 0, 0, 0.6);

/* Elevation 3 (Modals, Command Palette Dialogs, Drawers) */
--surface-3: #1a2333;
--border-3:  1px solid #334155;
--shadow-3:  0 12px 32px 0 rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05);
```

---

## 8. Data Visualization Guidelines

EzyKwelez prioritizes **readability, accuracy, rapid comparison, hierarchy, and aesthetics** in that strict order.

### 8.1 Visual Rules
1. **Metric Cards:** Display clear uppercase category labels, large bold tabular figures (`JetBrains Mono`), and explicit delta trend chips.
2. **Progress & Utilization Bars:**
   - `< 70%`: Emerald (`--color-status-success`)
   - `70% – 89%`: Amber (`--color-status-warning`)
   - `>= 90%`: Red (`--color-status-danger`)
3. **Trend & Comparison Charts:**
   - Series 1 (Current / Baseline): `#3b82f6` (Solid Blue)
   - Series 2 (Projected / Simulated): `#38bdf8` (Dashed Sky Blue)
   - Series 3 (Optimal Candidate): `#10b981` (Emerald)
   - Gridlines: `#1e293b` (1px subtle dotted line)
4. **Dependency Graphs:**
   - Node shapes reflect entity types (Diamond = Infrastructure, Rounded Rect = Building/Room, Octagon = Academic Session).
   - Edges represent typed dependency flow with clear arrowheads.
5. **No Misleading Charts:** Never truncate chart axes to exaggerate minor deltas; always provide textual data table equivalents for screen-reader accessibility.

---

## 9. Motion & Animation System

EzyKwelez employs a restrained motion system where animation exists strictly to communicate **state change, transition context, and feedback**. Decorative continuous animations are prohibited.

### 9.1 Motion Tokens
```css
--duration-fast:   100ms; /* Button presses, micro-interactions, tooltip fades */
--duration-normal: 200ms; /* Dropdown menus, accordions, toast appearances */
--duration-slow:   300ms; /* Drawer slide-outs, modal transitions, blast radius waves */

--ease-out:        cubic-bezier(0.16, 1, 0.3, 1); /* Incoming elements, drawers opening */
--ease-in-out:     cubic-bezier(0.4, 0, 0.2, 1);  /* Layout morphs, tab transitions */
```

### 9.2 Reduced Motion Compliance
All motion must respect `prefers-reduced-motion: reduce`. When active:
- Slide and scale animations are replaced with instant 0ms state changes.
- Live pulsing indicators become static icons.
- Blast radius wave ripples are rendered as static concentric boundaries.

---

## 10. Accessibility Contract (WCAG 2.1 AA Baseline)

- **Target Compliance:** WCAG 2.1 Level AA baseline. High-contrast typography and focus rings adopt AAA practices where practical.
- **Contrast Ratios:** Primary text maintains `>= 14:1`; interactive controls `>= 4.5:1`; non-text borders `>= 3:1`.
- **Keyboard Traversal:** Complete keyboard focus order (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Arrows`, `Escape`).
- **Visible Focus:** 2px sky-blue (`#38bdf8`) ring with 2px offset on all interactive elements.
- **Touch Targets:** Minimum `44x44px` on mobile/tablet devices.
- **Dual-View Requirement:** Every spatial map and dependency graph must provide an accessible `<DataTable>` or hierarchical `<ol role="tree">` alternative.
