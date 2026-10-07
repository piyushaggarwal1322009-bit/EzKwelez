# EzyKwelez — Frontend Implementation Contract & Developer Handoff

**Owner:** Aile Sharma (`Lead UI/UX Designer & Design System Owner`)  
**Target Audience:** Ishu, Tanisha & Frontend Engineering Team (`apps/web/`), Backend Engineering (`apps/api/`), QA & Release Governance  
**Status:** Phase 9 Finalized  
**Version:** 3.0  
**Core Purpose:** Complete, unambiguous implementation contract translating the entire EzyKwelez UI/UX system into production-ready Next.js + TypeScript + Tailwind code in `apps/web/` without ambiguity or developer guesswork.

---

## 1. Purpose & Scope

This document establishes the binding implementation contract between the UI/UX design owner (Aile Sharma) and the frontend engineering team (Ishu & Tanisha). It defines:
- The exact operational responsibilities of every component, screen, and route.
- The visual tokens, layout boundaries, and responsive adaptation matrices.
- The multi-dimensional state machine, error recovery paths, and data freshness expectations.
- The strict architectural boundaries separating presentation, deterministic engine calculations, and advisory AI explanations.

> **Fundamental Contract:**  
> **UI/UX specifications are the design source of truth. Frontend code is the strict implementation of those specifications.**

---

## 2. Source-of-Truth Hierarchy & Conflict Resolution

When discrepancies, conflicting requirements, or edge-case ambiguities arise during implementation, the following strict hierarchy governs:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SOURCE-OF-TRUTH HIERARCHY                             │
│                                                                             │
│  [RANK 1: Product / System Requirements] (docs/01-PRD.md, docs/02-SRD.md)   │
│       │                                                                     │
│       ▼                                                                     │
│  [RANK 2: Architecture & Standards] (docs/03-ARCHITECTURE, 05-STANDARDS)    │
│       │                                                                     │
│       ▼                                                                     │
│  [RANK 3: UI/UX Design System] (apps/ui-ux/DESIGN-SYSTEM.md)                │
│       │                                                                     │
│       ▼                                                                     │
│  [RANK 4: UI/UX Implementation Contract] (apps/ui-ux/IMPLEMENTATION-CONTRACT)│
│       │                                                                     │
│       ▼                                                                     │
│  [RANK 5: Screen-Specific UX Specs] (apps/ui-ux/screens/*.md)               │
│       │                                                                     │
│       ▼                                                                     │
│  [RANK 6: Component Specs] (apps/ui-ux/COMPONENTS.md)                       │
│       │                                                                     │
│       ▼                                                                     │
│  [RANK 7: Frontend Implementation] (apps/web/src/...)                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Escalation Protocol:
1. A lower-ranking implementation must **never silently invent undocumented behavior**, tokens, weights, or states.
2. If a screen specification lacks an edge-case contract, developers must consult `IMPLEMENTATION-CONTRACT.md` and `INTERACTION-STATE-SYSTEM.md`.
3. If an unresolvable contradiction exists, the developer must open a design issue referencing the conflicting files and assign Aile Sharma for resolution.

---

## 3. Ownership & Responsibility Boundaries

Clear separation of ownership guarantees system modularity, maintainability, and clean code reviews:

| Area / Layer | Primary Owner | Scope & Authority | Forbidden Actions |
|---|---|---|---|
| **UI/UX Specification & Tokens** | Aile Sharma | `apps/ui-ux/` — Layouts, component contracts, tokens, accessibility, responsive priorities, interaction states. | Modifying production web/backend code, altering database schemas. |
| **Frontend Implementation** | Ishu & Tanisha | `apps/web/` — Next.js App Router, React components, client hooks, Tailwind token consumption, local UI state. | Inventing non-token CSS values, duplicating backend optimization algorithms, altering design hierarchies. |
| **Backend & Engine Services** | Backend Team | `apps/api/`, `packages/shared/` — REST/FastAPI endpoints, graph traversal, blast radius calculations, recovery optimization, simulation compute. | Presenting UI formatting, hardcoding client layout decisions. |
| **Database & Auth** | Data Team | `supabase/` — Postgres schemas, RLS security policies, real-time replication channels. | Embedding presentation logic in database triggers. |

---

## 4. Design Token Contract

Frontend engineers in `apps/web/` **must strictly consume the canonical CSS custom properties and Tailwind tokens** defined in [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md) and [`DEVELOPER-HANDOFF.md`](./DEVELOPER-HANDOFF.md).

### 4.1 Token Consumption Rules
1. **Zero Magic Values:** Arbitrary one-off hex values (e.g. `bg-[#0a0f1d]`, `text-[#ff2200]`), arbitrary margin numbers (`m-[13px]`), or non-standard border widths are strictly prohibited.
2. **Semantic Color Usage:**
   - Base canvas: `var(--color-bg-base)` (`#090d16`)
   - Surface cards: `var(--color-bg-surface)` (`#0f172a`)
   - Elevated modals/popovers: `var(--color-bg-elevated)` (`#1e293b`)
   - Subtle rows/inputs: `var(--color-bg-subtle)` (`#131d33`)
   - High-contrast text: `var(--color-text-primary)` (`#f8fafc`)
   - Secondary text: `var(--color-text-secondary)` (`#94a3b8`)
   - Muted metadata: `var(--color-text-muted)` (`#64748b`)
   - Primary action brand: `var(--color-brand-primary)` (`#2563eb`)
   - Accent highlight: `var(--color-brand-accent)` (`#0ea5e9`)
   - Focus ring: `var(--color-border-focus)` (`#38bdf8`) with 2px offset
3. **Typography Tokens:**
   - Body & Headings: `font-sans` (`Inter`, sans-serif)
   - Tabular Numerals & Metrics: `font-mono tabular-nums` (`JetBrains Mono`, monospace) for all headcounts, percentages, timestamps, room codes, and coordinates to prevent layout jitter.
4. **Spacing & Radii Scale:** Use standard tokens: `radius-none` (0px), `radius-sm` (2px), `radius-md` (4px), `radius-lg` (6px), `radius-xl` (8px), `radius-full` (9999px).

---

## 5. Universal Component Implementation Contracts

Frontend developers must build universal components in `apps/web/src/components/primitives/` adhering to the conceptual contracts below:

```text
UNIVERSAL COMPONENT INVENTORY:
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ <Button />      │ <IconButton />  │ <Input />       │ <Select />      │
│ <Tabs />        │ <Badge />       │ <StatusPill />  │ <Card />        │
│ <MetricCard />  │ <DataTable />   │ <Tooltip />     │ <Toast />       │
│ <Banner />      │ <Modal />       │ <Drawer />      │ <BottomSheet /> │
│ <Slider />      │ <SkeletonLoader>│ <EmptyState />  │ <ErrorState />  │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

| Component | Responsibility | Expected Props / Inputs | Required State Subset | Responsive Behavior | Accessibility Contract | Forbidden Implementation |
|---|---|---|---|---|---|---|
| **`<Button />`** | Action triggers, dialog confirmation, form submit. | `variant` (primary, secondary, danger, outline, ghost), `size`, `isLoading`, `disabled`, `leadingIcon`, `trailingIcon`. | Default, Hover, Focus, Active, Disabled, Loading. | Full-width on mobile modals (`w-full`), auto-width on desktop. | Native `<button>`, `aria-disabled`, `aria-busy` when loading. | Bypassing semantic disabled tokens; omitting loading spinner. |
| **`<IconButton />`** | Compact triggers for toolbars, table rows, drawer close. | `icon`, `aria-label`, `variant`, `size`, `disabled`. | Default, Hover, Focus, Active, Disabled. | Hit area $\ge 44 \times 44\text{px}$ on touch viewports. | Mandatory `aria-label` and companion tooltip on desktop hover. | Icon buttons without accessible textual label. |
| **`<Input />`** | Textual, numeric, and search parameter entry. | `type`, `label`, `value`, `onChange`, `error`, `helperText`, `isMonospace`, `disabled`, `readOnly`. | Default, Hover, Focus, Disabled, Error, Read-only. | Height 36px on desktop, 44px on mobile devices. | `<label htmlFor="id">`, `aria-invalid="true"`, `aria-describedby="error-id"`. | Hiding error text and relying solely on red border. |
| **`<Select />`** | Predefined option selection (Zones, Severity). | `label`, `options`, `value`, `onChange`, `disabled`, `placeholder`. | Default, Hover, Focus, Active, Disabled. | Native mobile picker or touch sheet on small screens. | `role="combobox"`, `aria-expanded`, keyboard arrow traversal. | Non-keyboard navigable custom divs. |
| **`<Tabs />`** | View switching within the same context. | `tabs: { id, label, count? }[]`, `activeTab`, `onChange`. | Default, Hover, Focus, Selected, Disabled. | Horizontally scrollable container with hidden scrollbar. | `role="tablist"`, `role="tab"`, `aria-selected="true"`, arrow navigation. | Page reloads upon switching tabs. |
| **`<DataTable />`** | High-density operational data presentation. | `columns`, `data`, `sortColumn`, `sortDirection`, `onSort`, `isStickyHeader`. | Default, Loading, Empty, Stale, Error. | Collapses to Adaptive Card Stack on viewports $<768\text{px}$. | `<table>`, `<th scope="col">`, `<th scope="row">`, sort announcements. | Truncating cell text without accessible full-view drawer. |
| **`<MetricCard />`** | Primary KPI summary blocks. | `title`, `value`, `unit?`, `delta?`, `provenance`, `status`, `trend?`. | Default, Hover, Focus, Stale, Partial. | 4-col desktop, 2x2 tablet, stacked 1-col mobile. | Announced as structured metric; tabular figures (`font-mono`). | Displaying uncalculated/missing values as "0". |
| **`<Modal />`** | Consequential decisions, guarded approvals. | `isOpen`, `onClose`, `title`, `severity`, `children`, `footerActions`. | Focus-trapped, Open, Closing. | Centered modal (max-w 540–640px) on desktop; bottom sheet on mobile. | `role="dialog"`, focus-trapped, `Escape` closes, restores focus to trigger. | Disabling `Escape` or focus trapping. |
| **`<Drawer />`** | Level 4 slide-over inspection for entities/telemetry. | `isOpen`, `onClose`, `title`, `children`, `footer?`. | Open, Slide-in, Closing. | Desktop side rail; transforms into mobile bottom sheet. | `role="region"`, `aria-label`, `Escape` closes, returns focus. | Destroying underlying workspace route state. |
| **`<SkeletonLoader />`**| Visual loading placeholder for cards and tables. | `variant` (card, row, text, chart), `count`. | Shimmer animation / Static in reduced motion. | Dimension-matched to incoming content. | `aria-busy="true"`, `aria-label="Loading data"`. | Random sizing that causes layout shifts after loading. |
| **`<EmptyState />`**| Zero-record guidance for filters/queues. | `icon`, `title`, `description`, `actionLabel`, `onAction`. | Default. | Centered padded container. | High-contrast text, keyboard-accessible action CTA. | Leaving white/empty screen without recovery action. |

---

## 6. Domain Component Implementation Contracts

Domain components in `apps/web/src/features/` encapsulate specialized campus crisis workflows:

```text
DOMAIN COMPONENT INVENTORY:
┌──────────────────────────┬──────────────────────────┬──────────────────────────┐
│ <IncidentDossierCard />  │ <OccupancyHeatmap />     │ <ConnectivityNodeCard /> │
│ <BlastRadiusDAG />       │ <RecoveryMatrix />       │ <ScenarioControlSlider />│
│ <GuardedApprovalModal /> │ <StaleTelemetryBanner /> │ <AIAssistantContainer /> │
└──────────────────────────┴──────────────────────────┴──────────────────────────┘
```

### 6.1 Domain Component Specifications

1. **`<IncidentDossierCard />` (`features/incidents/`):**
   - *Responsibility:* Displays incident severity, impacted headcount, affected facility, root cause status, and primary action.
   - *Data Expected:* `IncidentRecord` (ID, title, severity, headcount, facility, rootCause: `SUSPECTED | CONFIRMED`, timestamps).
   - *Provenance:* Authoritative `[ OBSERVED ]` (telemetry) + `[ MANUAL ]` (technician confirmed).
   - *Forbidden Logic:* Frontend must not recalculate severity or infer root cause autonomously.

2. **`<OccupancyHeatmap />` (`features/live-campus/`):**
   - *Responsibility:* Renders building/room capacity ratios, utilization thresholds (`<70%` Green, `70-89%` Amber, `≥90%` Red), and directional trends.
   - *Dual-View Requirement:* Accompanied by `<DataTable>` toggle for non-visual accessibility.
   - *Data Freshness:* Displays age badge if data is cached; renders `[ Unavailable ]` if sensor offline.

3. **`<BlastRadiusDAG />` (`features/incidents/`):**
   - *Responsibility:* Visualizes the 4-tier dependency propagation canvas (`Facilities -> Services -> Schedules -> Cohorts`).
   - *Accessibility Contract:* Provides an accessible toggle to `<ol role="tree">` hierarchical list navigable via arrow keys.
   - *Forbidden Logic:* Frontend must not compute graph edges; graph topology is provided strictly by the backend API.

4. **`<RecoveryMatrix />` (`features/recovery/`):**
   - *Responsibility:* Side-by-side comparison of Plan A (Recommended), Plan B, and Plan C against the Disruption Baseline.
   - *Features:* `[ Show Differences Only ]` switch to collapse identical rows; score breakdown popovers.
   - *Forbidden Logic:* Frontend must not calculate plan scores or ranking weights.

5. **`<ScenarioControlSlider />` (`features/simulation/`):**
   - *Responsibility:* Analog adjustment of simulation parameters (15m–240m duration, 1.0x–2.5x crowd multiplier).
   - *Paired Input:* Always synchronized with companion `<input type="number">` field.
   - *Debounce Contract:* Short client-side debounce before triggering engine recalculation.
   - *Touch Hit Area:* Minimum $\ge 44\text{px}$ touch target on slider thumb.

6. **`<GuardedApprovalModal />` (`features/recovery/`):**
   - *Responsibility:* Enforces the 5-step safety verification before executing high-impact live operational changes.
   - *Authorization Contract:* Checkbox is strictly an acknowledgement of reviewed consequences; authorization occurs solely upon activating **`[ Approve & Execute Recovery ]`**.
   - *Focus Safety:* Default keyboard focus binds to **`[ Cancel ]`**.

7. **`<AIAssistantContainer />` (`features/shared/`):**
   - *Responsibility:* Displays strictly advisory summarization and contextualization grounded in authoritative system results and available operational context.
   - *Grounding Requirement:* Translates machine optimization trade-offs and root-cause factors into operator-friendly language.
   - *Strict Boundary:* AI container **has zero state-mutation, authorization, or decision-making authority**.

---

## 7. Screen Implementation Contracts

Frontend engineers must structure App Router routes and page components according to the table below:

```text
APP ROUTER ROUTE STRUCTURE:
apps/web/src/app/
├── (auth)/login/
├── (operator)/
│   ├── command-center/page.tsx
│   ├── live-campus/
│   │   ├── page.tsx (Overview)
│   │   ├── occupancy/page.tsx
│   │   └── connectivity/page.tsx
│   ├── incidents/
│   │   ├── page.tsx (Queue)
│   │   └── [incidentId]/
│   │       ├── page.tsx (Dossier)
│   │       ├── blast-radius/page.tsx
│   │       ├── recovery/
│   │       │   ├── page.tsx
│   │       │   └── compare/page.tsx
│   │       └── simulation/page.tsx
│   ├── simulation/page.tsx (Standalone)
│   └── settings/page.tsx
└── (student)/schedule/page.tsx
```

### Screen Contracts Matrix

| Screen Route | Primary User Question | Required Regions & Hierarchy | Primary Action (1 Max) | Secondary Actions | Responsive Transformation | Accessible Dual-View | Forbidden Frontend Logic |
|---|---|---|---|---|---|---|---|
| **`/command-center`** | *"What is happening across campus right now and what requires immediate attention?"* | L1: Situation Status & KPI Strip<br>L2: Spatial Schematic + Incidents Feed<br>L3: Primary Recovery Action<br>L4: Activity Audit Ticker | `[ Investigate Critical Incident ]` | `[ View Queue ]`<br>`[ Filter Zone ]` | Split-view desktop -> 2x2 KPI grid + stacked single-column mobile. | `[ Inspect Campus as Table ]` toggle. | Calculating campus health percentage on client. |
| **`/live-campus`** | *"What is happening across my 18 buildings and where are conditions changing?"* | L1: Campus Health Strip & Sync Age<br>L2: 18-Building Schematic Grid<br>L3: Filter Status Chips<br>L4: Location Detail Slide-Over | `[ Filter Degraded Locations ]` | `[ Toggle Dual-View ]`<br>`[ Re-sync Now ]` | 18-card grid -> prioritized Watch/Degraded stack on mobile. | `<DataTable>` listing all 18 buildings with live metrics. | Inferring building status from raw sensor thresholds. |
| **`/live-campus/occupancy`**| *"Which rooms have available capacity right now to absorb relocations?"* | L1: Occupancy Velocity Gauge<br>L2: Building Capacity Cards<br>L3: Free Capacity Filter Toolbar<br>L4: Room Inventory `<DataTable>` | `[ Find Alternative Rooms ]` | `[ Filter Min Free ]`<br>`[ Sort Proximity ]` | Multi-col table -> swipeable building cards on touch. | Semantic HTML `<DataTable>` with sortable columns. | Computing walking distances or room suitability. |
| **`/live-campus/connectivity`**| *"If this utility node degrades, what facilities are at risk?"* | L1: Utility Health Index<br>L2: Node Signal Health Cards<br>L3: Subsystem Filter (Power/Net)<br>L4: Gateway Latency & Packet Loss | `[ Trace Dependencies ]` | `[ Filter Subsystem ]`<br>`[ Re-ping Node ]` | Interactive topology -> stacked node cards on mobile. | Subsystem hierarchy list (`<ul>`) with latency values. | Simulating network packet loss on client. |
| **`/incidents`** | *"What disruptions are active and which require triage?"* | L1: Priority Queue Header<br>L2: Incident Dossier Cards Stack<br>L3: Multi-Facet Filter Toolbar<br>L4: Quick-Inspect Preview Drawer | `[ Triage Top Incident ]` | `[ Filter Severity ]`<br>`[ Create Incident ]` | Multi-column queue table -> prioritized card stack on mobile. | Accessible data table with keyboard row expansion. | Sorting incidents by non-deterministic client metrics. |
| **`/incidents/[id]`** | *"What failed, what caused it, and what is the exact blast radius?"* | L1: Pinned Severity Context Bar<br>L2: 4-KPI Impact Strip + Root Cause<br>L3: Next-Step Action Panel<br>L4: Chronological Timeline Feed | `[ View Blast Radius Cascade → ]` | `[ Confirm Root Cause ]`<br>`[ Share Dossier ]` | Split 2-col -> stacked crisis stream with sticky top bar. | Accessible description lists (`<dl>`) for impact KPIs. | Modifying root cause without technician confirmation. |
| **`/incidents/[id]/blast-radius`**| *"What downstream services, schedules, and cohorts are impacted?"* | L1: Pinned Context Bar<br>L2: 4-Tier Interactive DAG Canvas<br>L3: Tier Depth Filter (1, 2, 3)<br>L4: Node Detail Slide-Over | `[ Generate Recovery Plans → ]` | `[ Filter Tier Depth ]`<br>`[ Zoom In/Out ]` | Visual DAG canvas -> Expandable 4-Tier Tree (`<ol role="tree">`). | Expandable hierarchical tree navigable via arrow keys. | Calculating node blast radius depth on client. |
| **`/incidents/[id]/recovery`** | *"What are our recovery options and which is mathematically optimal?"* | L1: Recommended Plan A Card<br>L2: Candidate Strategy Cards List<br>L3: Action: `[ Review & Approve ]`<br>L4: Score Factors Popover | `[ Review & Approve Plan A ]` | `[ Compare Top 3 Plans ]`<br>`[ Why This Plan? ]` | Side-by-side cards -> swipeable carousel with sticky CTA. | Semantic table with objective score factors. | Recomputing multi-objective optimization weights. |
| **`/incidents/[id]/recovery/compare`**| *"What are the exact trade-offs between Plan A and Plan B?"* | L1: Pinned Context Bar<br>L2: Side-by-Side Comparison Matrix<br>L3: Switch: `[ Show Differences Only ]`<br>L4: Constraint Satisfaction List | `[ Select Recommended Plan ]` | `[ Show Differences Only ]`<br>`[ Export Matrix ]` | 4-column matrix -> horizontally scrollable sticky table. | Structured HTML `<table>` with column and row headers. | Hiding violated constraints from matrix display. |
| **`/simulation`** | *"What happens if outage extends +60m or crowd increases 1.5x?"* | L1: Sky-Blue Sandbox Safety Header<br>L2: Controlled Assumption Sliders<br>L3: Live Scorecard + Delta Pills<br>L4: Multi-Scenario Matrix | `[ Run Simulation Drill ]` | `[ Branch Recovery Draft → ]`<br>`[ Reset to Baseline ]` | 2-column sandbox -> stacked sliders + bottom sheet matrix. | Accessible scorecard diff table (`font-mono`). | Mutating live database records from simulation. |
| **`/settings`** | *"How do I configure campus buildings, roles, and audit logs?"* | L1: Settings Overview<br>L2: Building Registry & Equipment<br>L3: Action: `[ Save Config ]`<br>L4: Granular Audit Trail Table | `[ Save Configuration ]` | `[ Seed Test Scenario ]`<br>`[ Export Audit CSV ]` | Left tab rail -> mobile dropdown section switcher. | Accessible form controls and audit table. | Bypassing RBAC permission checks on client. |

---

## 8. Responsive Implementation Contract

Frontend implementation must strictly adhere to the 4 canonical breakpoint tiers:

```text
BREAKPOINT TIERS & COMPONENT TRANSFORMATIONS:
┌────────────────────┬────────────────────────────────────────────────────────┐
│ Mobile (<768px)    │ • 5-Icon sticky bottom navigation docked at base.      │
│                    │ • Sticky top command bar with condensed status pill.   │
│                    │ • Side drawers transform into full-width Bottom Sheets.│
│                    │ • Data tables transform into Adaptive Card Stacks.     │
│                    │ • Primary CTA pinned above bottom nav.                 │
├────────────────────┼────────────────────────────────────────────────────────┤
│ Tablet (768-1023px)│ • Off-canvas slide-out hamburger navigation menu.      │
│                    │ • Stacked 2-column card layouts; overlay side drawers. │
├────────────────────┼────────────────────────────────────────────────────────┤
│ Laptop (1024-1279) │ • 64px collapsed icon rail with hover/focus tooltips.  │
│                    │ • Preserves horizontal canvas for data tables.         │
├────────────────────┼────────────────────────────────────────────────────────┤
│ Desktop (>=1280px) │ • Permanent 240px navigation sidebar.                  │
│                    │ • Split-screen analytical workspaces (Map + Queue).   │
│                    │ • Pinned right-rail Level 4 inspection drawers.        │
└────────────────────┴────────────────────────────────────────────────────────┘
```

### Mobile Information Priority Stack:
$$\text{Operational Status} \longrightarrow \text{Critical Alert} \longrightarrow \text{Primary Metric} \longrightarrow \text{Primary Action} \longrightarrow \text{Supporting Context} \longrightarrow \text{Secondary Inspection} \longrightarrow \text{Historical Logs}$$

---

## 9. Accessibility Implementation Contract

Frontend implementation must satisfy the **WCAG 2.1 Level AA** design requirements:

1. **Document Landmarks:** Every page must render `<header role="banner">`, `<nav aria-label="Main Navigation">`, `<main id="main-content">`, and `<aside aria-label="Inspection Panel">`.
2. **Heading Hierarchy:** Enforce a single `<h1>` per view, `<h2>` for major dashboard regions, and `<h3>` for cards/widgets.
3. **Keyboard Operability:** The documented interaction contracts define the full decision flow as keyboard-operable (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`, `Arrow` keys).
4. **Visible Focus:** Focus ring must use `outline: 2px solid var(--color-border-focus); outline-offset: 2px;` (`#38bdf8`). Focus rings are never removed.
5. **Focus Trapping & Restoration:** Modals and bottom sheets must trap focus and restore focus to the triggering element upon dismissal. `<GuardedApprovalModal>` must bind initial focus to **`[ Cancel ]`**.
6. **Triple-Channel Status:** Status indicators must never rely on color alone; every indicator combines **Vector Icon + Text Label + Semantic Color Token**.
7. **Mandatory Dual-View Rule:** Every visual map, DAG, or comparison radar must provide an accessible HTML table or tree alternative.
8. **Touch Targets:** All interactive touch targets measure $\ge 44 \times 44\text{ px}$ with $\ge 8\text{px}$ separation.
9. **Live Regions:** Discrete milestones use `aria-live="polite" role="status"`; emergency alerts use `aria-live="assertive" role="alert"`; background telemetry ticks are suppressed (`aria-hidden="true"`).
10. **Reduced Motion:** When `@media (prefers-reduced-motion: reduce)` is active, animations collapse to `0.01ms` and shimmers become static fills.

---

## 10. Multi-Dimensional Interaction & State Contract

Components operate simultaneously across **5 Orthogonal State Dimensions**:

```typescript
// 1. Interaction State
export type InteractionState = 'default' | 'hover' | 'focus-visible' | 'active' | 'selected' | 'disabled';

// 2. Data State
export type DataState = 'current' | 'stale' | 'partial' | 'unknown' | 'unavailable';

// 3. Async State
export type AsyncState = 'idle' | 'loading' | 'calculating' | 'success' | 'error';

// 4. Permission / Action State
export type PermissionState = 'editable' | 'read-only' | 'guarded';

// 5. Content State
export type ContentState = 'populated' | 'empty';
```

### Dimensional Precedence Rules:
- **Async Error** supersedes **Async Loading** (terminates spinners and shows retry CTA).
- **Unavailable Data** supersedes normal fresh data rendering.
- **Disabled** supersedes standard hover/active interactions.
- **Stale Data** remains visibly stale with timestamp while background recalculation occurs.
- A **Selected** card can simultaneously be **Stale** and **Calculating**.
- A **Read-Only** component remains focusable for inspection.

---

## 11. Data Provenance & Freshness Contract

The UI must explicitly preserve and display data provenance across all metric cards and tables:

| Provenance Tag | Visual Representation | Meaning & Data Source |
|---|---|---|
| **`[ OBSERVED ]`** | Solid Emerald Tag | Real-time physical telemetry (IoT sensors, Wi-Fi AP density, card swipes). |
| **`[ CALCULATED ]`** | Solid Brand Tag | Deterministic engine output (DAG blast radius depth, objective score). |
| **`[ PROJECTED ]`** | Sky-Blue Tag | What-If simulation mathematical scenario output. |
| **`[ ASSUMED ]`** | Amber Tag | Operator-modified scenario parameter (e.g. +60m outage delay). |
| **`[ MANUAL ]`** | Slate Tag | Human field technician verification. |
| **`[ STALE ]`** | Amber Dashed Tag | Cached telemetry past freshness window (`STALE · 18m ago`) + `[ Re-sync ]`. |
| **`[ UNAVAILABLE ]`** | Muted Hatch Tag | Subsystem is offline/disconnected; displayed as `[ Not Available ]` (never `0`). |
| **`[ UNKNOWN ]`** | Slate Tag | Environmental condition cannot be determined by the network. |

---

## 12. Frontend ↔ Backend Boundary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SYSTEM ARCHITECTURAL BOUNDARIES                       │
│                                                                             │
│  [FRONTEND (apps/web/)]                                                     │
│  • Presentation, typography, responsive layouts, CSS tokens                 │
│  • Keyboard focus trapping, ARIA semantics, accessible dual-views           │
│  • Local UI state (tab selection, filter chips, drawer open/close)          │
│  • Displaying backend provenance badges and timestamps                      │
│                                                                             │
│  [BACKEND & DETERMINISTIC ENGINES (apps/api/, packages/shared/)]            │
│  • Authoritative campus data models and persistence (Supabase)              │
│  • 4-tier dependency graph traversal and blast radius propagation          │
│  • Multi-objective recovery plan generation and scoring optimization        │
│  • Simulation calculations and scenario evaluation                          │
│  • Role-based authorization enforcement                                     │
│                                                                             │
│  [AI EXPLANATION LAYER (Advisory Only)]                                     │
│  • Strictly advisory summarization and contextualization grounded in        │
│    authoritative system results and available operational context.          │
│  • AI has zero state-mutation, authorization, or decision-making authority. │
│  • Translates calculated optimization trade-offs into plain-text rationales. │
│  • Drafts suggested student notification communications for operator review.│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 13. Deterministic Engine Boundary

The frontend **must never duplicate or approximate deterministic engine logic**:
- **Blast Radius:** DAG graph edges, tier depths (1, 2, 3), and affected student counts are calculated strictly by the backend engine.
- **Recovery Optimization:** Candidate plan scoring, multi-objective trade-off weights, and constraint satisfaction checks are computed on the server.
- **Simulation Models:** Counterfactual scenario projections are calculated by the backend simulation service.
- **Strict Prohibition:** Frontend code must not contain hardcoded heuristic formulas or optimization weights.

---

## 14. AI Explanation Boundary

AI assistance is strictly advisory and explanatory:
- **Authorized Role:** Strictly advisory summarization and contextualization grounded in authoritative system results and available operational context. AI translates technical outputs into operator-friendly language, explains recovery trade-offs, and drafts communications.
- **Zero Execution Authority:** AI is **strictly barred from autonomous state mutations**, executing recovery plans, overriding safety constraints, modifying live operational data, or independently authorizing actions. AI has **zero state-mutation, authorization, or decision-making authority**.
- **Grounding Requirement:** All AI explanations must appear in dedicated `<AIAssistantContainer />` panels and remain strictly grounded in authoritative system results and available operational context. AI must not invent facts, override deterministic results, or become the authoritative source of truth.


---

## 15. Loading, Error, Stale, Partial & Unavailable Contracts

| Condition | Visual & Interaction Presentation | Actionable Recovery Option | Forbidden Implementation |
|---|---|---|---|
| **Loading** | Dimension-matched `<SkeletonLoader />` in target region; workspace remains interactive. | Navigation remains active; allows view switching. | Full-screen blocking spinners that freeze the entire interface. |
| **Calculating** | Pulsing brand glow + status text (`"Calculating..."`); parameters stay adjustable. | Cancel calculation or revert parameter adjustment. | Displaying intermediate state as a valid finished projection. |
| **Stale** | Cached data rendered with 50% opacity mask + amber badge (`STALE · 18m ago`). | `[ Revalidate Now ]` / `[ Refresh Telemetry ]` button. | Silently presenting stale data as fresh real-time telemetry. |
| **Partial** | Available channels display live data; missing channels render `[ Not Available ]`. | `[ Retry Missing Channel ]`. | Fabricating fallback data or displaying missing sensors as `0`. |
| **Unavailable** | Muted container with diagonal micro-hatch pattern; status *"Sensor Offline"*. | `[ Check Gateway ]` / `[ Manual Override ]`. | Showing generic empty screen or unhandled error page. |
| **Error** | Red border `--color-status-critical-border` + explicit diagnostic explanation. | `[ Retry Connection ]` / `[ Return to Incident ]`. | Generic *"Something went wrong"* without actionable retry CTA. |
| **Empty** | Centered `<EmptyState />` container with icon, description, and action button. | `[ Reset All Filters ]` / `[ Create Incident ]`. | Blank empty box with zero operator guidance. |

---

## 16. Navigation & URL State Contract

All sub-views, active filters, selected incident IDs, and tab selections synchronize with the browser address bar:

```text
CANONICAL ROUTE HIERARCHY:
/command-center
/live-campus?view=overview&zone=science
/live-campus/occupancy?building=B&filter=overflow
/live-campus/connectivity?subsystem=power
/incidents?severity=critical&status=active
/incidents/inc-402
/incidents/inc-402/blast-radius?tier=2
/incidents/inc-402/recovery
/incidents/inc-402/recovery/compare?plans=plan-a,plan-b
/incidents/inc-402/simulation?duration=98&multiplier=1.5
/simulation (Standalone Sandbox)
/settings?tab=governance
```

- **Pinned Incident Context Bar:** When navigating the incident workflow (`/incidents/[id]/*`), the pinned context bar locks beneath the command bar, preserving active incident identity across all decision steps.

---

## 17. Guarded Action Implementation Contract

High-consequence operational mutations (approving recovery plans, shutting down buildings, broadcasting mass emergency notices) enforce the **5-Step Guarded Action Protocol**:

$$\text{Review} \longrightarrow \text{Understand Consequences} \longrightarrow \text{Explicit Approval} \longrightarrow \text{Execute Operational Action} \longrightarrow \text{Result \& Audit}$$

```text
┌────────────────────────────────────────────────────────────────────────┐
│ <GuardedApprovalModal>                                            [✕]  │
│                                                                        │
│ ⚠️ HIGH-IMPACT OPERATIONAL ACTION                                      │
│ Apply Recovery Plan A to Live Campus Operations                        │
│                                                                        │
│ CONSEQUENCES & OPERATIONAL DELTAS:                                     │
│ • Facilities Affected: Science Complex (Building B) isolated           │
│ • Displaced Cohorts: 354 rerouted to Hall C & D; 84 virtualized        │
│ • Dispatched Resources: Maintenance Crew Alpha assigned to Substation B│
│ • Operational Broadcast: Automated student notice drafted for 438 cohort│
│ • Reversibility: Action is guarded; rollback requires Plan C execution │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ [x] I acknowledge the reviewed operational consequences and risks. │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ [ Cancel (Default Focus) ]             [ Approve & Execute Recovery → ]│
└────────────────────────────────────────────────────────────────────────┘
```

- **Authorization Principle:** The acknowledgement checkbox confirms impact review, but **does not authorize execution**. Authorization occurs strictly upon deliberate click of **`[ Approve & Execute Recovery ]`**.
- **Simulation Sandbox Isolation:** The What-If Simulation Sandbox (`/simulation`) **cannot directly mutate live operations**. It must branch to recovery review:
  $$\text{Simulation} \longrightarrow \text{Branch Draft Plan} \longrightarrow \text{Recovery Review} \longrightarrow \text{Guarded Approval} \longrightarrow \text{Execute Operational Action} \longrightarrow \text{Result \& Audit}$$

---

## 18. Mock & Fixture Contract

Frontend engineers developing `apps/web/` prior to backend API readiness must consume realistic mock fixtures in `apps/web/src/mocks/`:
1. **Schema Conformity:** Mock fixtures must strictly match backend TypeScript interfaces exported from `@ezykwelez/shared`.
2. **Provenance Inclusion:** Mock records must include valid provenance tags (`OBSERVED`, `CALCULATED`, `PROJECTED`, `STALE`).
3. **State Variety:** Mocks must provide fixtures for nominal baseline, active crisis, stale telemetry, partial sensor failure, and empty filter results.
4. **No Mock Bleed:** Mock data must be injected via modular mock provider layers, easily swapped for production fetch clients without altering component presentation logic.

---

## 19. Implementation Acceptance Criteria

A frontend Pull Request in `apps/web/` is acceptable for merge only if:
- [ ] **Token Fidelity:** All styles consume canonical CSS variables and Tailwind tokens from `DESIGN-SYSTEM.md`. Zero magic CSS.
- [ ] **Screen & Hierarchy Fidelity:** Layout blocks and 4-level information hierarchies match screen specifications.
- [ ] **Responsive Breakpoint Fidelity:** Tested across Mobile (`<768px`), Tablet (`768-1023px`), Laptop (`1024-1279px`), and Desktop (`>=1280px`).
- [ ] **WCAG 2.1 AA Compliance:** Verified against the documented WCAG 2.1 AA design requirements (zero axe-core errors).
- [ ] **Keyboard Navigability:** Full decision flow is operable via standard keyboard traversal.
- [ ] **Visible Focus:** 2px sky-blue focus ring with 2px offset visible on all dark surfaces.
- [ ] **Mandatory Dual-View:** Accessible data table/tree alternatives implemented for all visual maps, DAGs, and radar charts.
- [ ] **Guarded Action Protocol:** Consequential mutations enforce the 5-step modal with deliberate `[ Approve & Execute Recovery ]` button; default focus on `[ Cancel ]`.
- [ ] **Simulation Sandbox Isolation:** Simulation views cannot directly mutate live database records.
- [ ] **Zero Dead-End Guarantee:** Empty, stale, and error states provide immediate, actionable recovery buttons.
- [ ] **Data Provenance Preservation:** Provenance badges (`OBSERVED`, `CALCULATED`, `PROJECTED`, `STALE`) render on all metrics.
- [ ] **Touch Target Sizing:** All interactive touch elements measure $\ge 44 \times 44\text{ px}$ with $\ge 8\text{px}$ separation.
- [ ] **Zoom Resilience:** Layout remains functional and readable up to 200% browser zoom.

---

## 20. PR & Code Review Governance

1. **Contract Selection:** Developer identifies target screen/component contract in `IMPLEMENTATION-CONTRACT.md`.
2. **Implementation:** Code is written strictly inside `apps/web/` consuming shared contracts from `packages/shared/`.
3. **Self-Audit:** Developer verifies against Section 19 Implementation Acceptance Criteria.
4. **PR Submission:** PR template includes link to target screen specification in `apps/ui-ux/screens/*.md`.
5. **Design Review:** UI/UX Owner (Aile Sharma) reviews visual, responsive, and accessibility fidelity.
6. **Engineering Review:** Tech Leads (Ishu/Tanisha) review state management, performance, and API integration.
7. **Merge:** PR merges into `main` only upon approval by both Design and Engineering reviewers.

---

## 21. Anti-Patterns & Prohibited Implementations

```text
STRICTLY FORBIDDEN IMPLEMENTATION ANTI-PATTERNS:
┌─────────────────────────────────────────────────────────────────────────────┐
│ ✕ Hardcoding arbitrary hex colors (e.g. bg-[#112233]) instead of tokens     │
│ ✕ Frontend reimplementation of blast radius or graph propagation logic      │
│ ✕ Frontend calculation of multi-objective recovery optimization scores     │
│ ✕ AI autonomously mutating operational states or executing recovery plans    │
│ ✕ Treating consequence acknowledgement checkboxes as execution authorization │
│ ✕ Allowing What-If simulation sandbox to directly mutate live campus state  │
│ ✕ Displaying disconnected/missing sensor metrics as "0" instead of [N/A]    │
│ ✕ Presenting cached/stale data as fresh real-time telemetry                 │
│ ✕ Inaccessible visual charts without accompanying accessible dual-view table│
│ ✕ Squeezing desktop 12-column layouts onto mobile viewports without stacking │
│ ✕ Blocking the entire screen with full-page loading spinners                │
│ ✕ Claiming unperformed browser runtime accessibility test results           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 22. Phase 9 Definition of Done

Phase 9 is formally complete with the delivery of this document:
- `apps/ui-ux/IMPLEMENTATION-CONTRACT.md` is published and fully cross-referenced.
- Source-of-truth hierarchies, component contracts, screen specifications, and architectural boundaries are finalized.
- All Phase 1–8 UI/UX documentation is internally consistent, accessible, and implementation-ready.
- Zero frontend, backend, or database code was modified.

---

**End of Implementation Contract — EzyKwelez Phase 9 Finalized**
