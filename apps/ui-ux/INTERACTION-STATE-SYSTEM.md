# EzyKwelez — Cross-Product Interaction & State System

**Owner:** Aile Sharma (`Lead UI/UX Designer & Design System Owner`)  
**Target Audience:** Frontend Engineering (`apps/web/`), Product, QA, and Design System Teams  
**Status:** Phase 7 Finalized  
**Version:** 2.1  
**Core Thesis:** Operational Command Platform Consistency — A unified, deterministic interaction language across all 6 core product areas.

---

## 1. Executive Summary & Core Principles

EzyKwelez operates in high-stakes campus crisis coordination. When an emergency strikes, operators cannot afford ambiguous button behaviors, mysterious loading spinners, silently altered data, or disconnected visual paradigms between screens.

This document defines the **Canonical Cross-Product Interaction & State System** across all 6 primary product areas:
1. **Command Center** (`/command-center`)
2. **Live Campus & Digital Twin** (`/live-campus`)
3. **Incidents & Root Cause Dossier** (`/incidents`, `/incidents/[id]`)
4. **Impact & Blast Radius Cascade** (`/incidents/[id]/blast-radius`)
5. **Recovery & Strategy Comparison** (`/incidents/[id]/recovery`, `/incidents/[id]/recovery/compare`)
6. **What-If Simulation Sandbox** (`/simulation`, `/incidents/[id]/simulation`)

```
   ┌─────────────────────────────────────────────────────────────────────────┐
   │                     EZYKWELEZ INTERACTION CONTRACT                      │
   │                                                                         │
   │  [Predictable]  ──► Every input produces immediate deterministic feedback│
   │  [Grounded]     ──► Data provenance (OBSERVED/PROJECTED/etc.) persists  │
   │  [Guarded]      ──► Operational mutations require structured approval   │
   │  [Transparent]  ──► Stale, partial, and calculating states are visible  │
   │  [Accessible]   ──► Redundant channels: Icon + Label + Semantic Token   │
   └─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Multi-Dimensional State Model

Interaction states are not flat or mutually exclusive; a component operates across distinct orthogonal dimensions simultaneously. For example, a card can be simultaneously **Selected** (Interaction), **Stale** (Data), **Calculating** (Async), and **Guarded** (Permission).

```text
ORTHOGONAL STATE DIMENSIONS:
┌─────────────────────────┬─────────────────────────┬─────────────────────────┐
│ 1. INTERACTION STATE    │ 2. DATA STATE           │ 3. ASYNC STATE          │
│ • Default               │ • Fresh / Current       │ • Idle                  │
│ • Hover                 │ • Stale                 │ • Loading               │
│ • Focus-visible         │ • Partial               │ • Calculating           │
│ • Active / Pressed      │ • Unknown               │ • Success               │
│ • Selected              │ • Unavailable           │ • Error                 │
│ • Disabled              │                         │                         │
├─────────────────────────┼─────────────────────────┴─────────────────────────┤
│ 4. PERMISSION / ACTION  │ 5. CONTENT STATE                                  │
│ • Editable              │ • Populated                                       │
│ • Read-only             │ • Empty                                           │
│ • Guarded               │                                                   │
└─────────────────────────┴───────────────────────────────────────────────────┘
```

### 2.1 State Dimensions Breakdown

#### Dimension 1: Interaction State
Governs pointer, keyboard, and physical control responsiveness:
* **Default:** Baseline visual rest state adhering to canonical contrast tokens.
* **Hover:** Surface luminance elevation using approved design-system hover tokens. Mouse/pointer only; no touch dependency.
* **Focus-Visible:** High-contrast 2px sky-blue focus ring (`--color-border-focus`) with 2px offset.
* **Active / Pressed:** Momentary down-state using the approved motion/transform treatment from the design system.
* **Selected:** Persistent selected indicator (accent border + `--color-brand-subtle` background). Must remain distinguishable without color alone.
* **Disabled:** Control is inert (`aria-disabled="true"`, pointer events suppressed, `--color-text-disabled`).

#### Dimension 2: Data State
Governs data trustworthiness, age, and sensor availability:
* **Fresh / Current:** Real-time authoritative data meeting freshness window requirements.
* **Stale:** Cached data past freshness window. Displays age indicator and revalidation trigger (`[ Revalidate Now ]`).
* **Partial:** Some telemetry channels available; missing channels explicitly labeled `[ Not Available ]` (never defaulted to `0`).
* **Unknown:** Sensor cannot measure or infer the physical state.
* **Unavailable:** Subsystem is offline or disconnected; distinct from empty or zero data.

#### Dimension 3: Async State
Governs operations, queries, and calculation lifecycles:
* **Idle:** No active network request or computation in-flight.
* **Loading:** Data fetching in progress; represented by dimension-matched `<SkeletonLoader />` or button spinner.
* **Calculating:** Mathematical/simulation engine actively computing. Display calculating feedback while the engine is processing; the UI must support fast, slow, and long-running durations gracefully.
* **Success:** Async operation resolved successfully; confirmed state announced politely.
* **Error:** Operation or network query failed; displays actionable recovery CTA (`[ Retry ]`).

#### Dimension 4: Permission / Action State
Governs mutation rights and safety gates:
* **Editable:** Operator has permission to tweak parameters, filters, or values.
* **Read-Only:** Inspection and value copying allowed; mutation controls locked with role explanation.
* **Guarded:** High-consequence action requiring explicit multi-step authorization before execution.

#### Dimension 5: Content State
Governs dataset volume:
* **Populated:** Valid records rendered in appropriate data grids, cards, or graphs.
* **Empty:** Valid dataset containing zero records; renders `<EmptyState />` with one-click reset/creation CTA.

---

## 3. Dimensional State Precedence Model

Precedence is defined **WITHIN and ACROSS RELEVANT DIMENSIONS** rather than as a simplistic flat hierarchy.

```
STATE PRECEDENCE RULES:
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. WITHIN ASYNC:           Async Error supersedes Async Loading.            │
│ 2. WITHIN DATA:            Unavailable supersedes nominal presentation.     │
│ 3. WITHIN INTERACTION:     Disabled supersedes hover/active behaviors.      │
│ 4. ACROSS DIMENSIONS:      Stale remains visibly stale during Calculating.  │
│ 5. MULTI-STATE COEXISTENCE:Selected + Stale + Calculating is valid.         │
│ 6. READ-ONLY ACCESS:       Read-only items remain focusable for inspection. │
│ 7. SYSTEM ALERTS:          Critical Incident Banners supersede Toasts.      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Precedence Resolution Guidelines

1. **Async Dimension Precedence:**
   - When an in-flight operation fails, **Async Error** immediately terminates **Async Loading / Calculating** and renders the error state with actionable retry options.
2. **Data Freshness during Recalculation:**
   - When recalculating fresh outputs from stale baselines, the existing stale data remains visible under an intermediate treatment while the calculating state pulses. If calculation fails, the system transitions to **Async Error** while preserving cached context.
3. **Interaction & Disabled Precedence:**
   - **Disabled** supersedes hover, active, and pressed interactions. Disabled controls do not trigger actions, but if focusable for accessibility, provide an explanatory tooltip.
4. **Coexistence Across Dimensions:**
   - A component can be **Selected** (Interaction) and **Stale** (Data) at the same time. Selecting a stale card must not clear its stale badge.
   - A **Read-Only** component remains focusable for keyboard navigation and inspection, but prevents mutation.
5. **Notification Precedence:**
   - High-severity operational alerts in the Top Command Bar take visual and semantic precedence over transient toast notifications.

---

## 4. Comprehensive Feedback System

EzyKwelez categorizes user feedback into 5 structured UI patterns. Each pattern has strict inclusion and exclusion criteria.

```text
FEEDBACK PATTERNS OVERVIEW:
┌───────────────────────────────────────────────────────────────────────────────┐
│ [1. Inline Feedback]  ──► Field validation, constraint tags, calculation delta│
│ [2. Toast Feedback]   ──► Low-risk transient notices, clipboard copy, reset   │
│ [3. System Banner]    ──► Stale global telemetry, sandbox mode, severe outages│
│ [4. Guarded Dialog]   ──► Consequential recovery approvals, building shutdown │
│ [5. Drawer / Sheet]   ──► Entity inspection, node dependencies, AI rationale  │
└───────────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Pattern Specification Matrix

| Feedback Pattern | Placement & Geometry | Duration / Dismissal | Primary Allowed Use Cases | Strictly Prohibited Use Cases |
|---|---|---|---|---|
| **Inline Feedback** | Direct proximity to target control (e.g. beneath input, adjacent to metric). | Persistent while condition is true. Clears on correction. | • Field validation errors.<br>• Scenario parameter constraint bounds.<br>• Directional deltas (`↑ +92 Displaced`).<br>• Local recalculation badges. | • Global system outages.<br>• Irreversible confirmation triggers.<br>• Multi-building status summaries. |
| **Toast Feedback** | Bottom-right viewport, standard toast placement. | Auto-dismisses after standard timeout. Pause on hover. Has dismiss `✕`. | • Saved filter presets.<br>• Copied node/incident ID to clipboard.<br>• Scenario reset confirmation.<br>• Low-risk non-blocking background sync. | • **CRITICAL INCIDENT ALERTS**.<br>• High-impact recovery approvals.<br>• Building evacuation notices.<br>• Unrecoverable API errors. |
| **System Banner** | Full-width anchored beneath Top Command Bar. | Persistent until condition resolves or manual dismiss. | • Stale telemetry notice (`⚠️ Sync paused`).<br>• Simulation Sandbox indicator (`🎛 Advisory Sandbox`).<br>• Campus-wide emergency broadcast active.<br>• Degraded backend subsystem. | • Transient button-click feedback.<br>• Form validation messages.<br>• Single-entity metadata. |
| **Guarded Dialog** | Centered modal (desktop) / Bottom sheet (mobile). | Requires explicit user action (`[ Cancel ]` or `[ Approve & Execute ]`). | • Recovery plan execution on live campus.<br>• Building/facility closure dispatch.<br>• Emergency notification broadcast.<br>• Consequential operational interventions. | • Routine navigation.<br>• Informational notices that require no decision.<br>• Simple filter applications. |
| **Drawer / Sheet** | Desktop inspection drawer using approved sizing tokens / Bottom sheet on mobile. | Dismissed via `Escape`, close `✕`, or switching primary entity. | • Incident root-cause dossier inspection.<br>• Blast radius node dependency drilldown.<br>• "Why this plan?" AI rationale inspection.<br>• Room occupancy/connectivity telemetry. | • High-consequence final execution approvals.<br>• Critical system error announcements. |

---

## 5. Modal, Drawer, and Overlay Interaction Contract

Overlays must **never destroy the operator's mental model or operational context**. When an operator is deep in an incident response flow, closing an inspection drawer or dialog must seamlessly return them to their exact prior position.

### 5.1 Overlay Lifecycle & Focus Rules

1. **Trigger & Focus Entry:**
   - On open, the system saves a reference to `document.activeElement` (the triggering control).
   - Focus shifts into the overlay container immediately.
   - For informational drawers: Focus lands on the first focusable interactive element or the close button.
   - For guarded dialogs: Focus lands on the **`[ Cancel ]`** button by default to prevent accidental double-tap execution.
2. **Focus Trapping:**
   - Keyboard traversal (`Tab` / `Shift+Tab`) wraps within the boundary of the topmost active overlay.
   - DOM outside the overlay is tagged `aria-hidden="true"`.
3. **Dismissal & Outside-Click Rules:**
   - **Allowed Outside-Click Dismissal:** Read-only inspection drawers (e.g. Node Detail Drawer, "Why this plan?" Drawer, Location Telemetry Sheet).
   - **Strictly Disabled Outside-Click Dismissal:** High-consequence Guarded Approval Modals and forms with dirty/uncommitted scenario parameters. Clicking the backdrop on these modals triggers a subtle animation to communicate required explicit action.
4. **Escape Key Handling:**
   - Pressing `Escape` closes the topmost active overlay in nested scenarios.
   - If unsaved changes exist in an editable form, an inline confirmation asks *"Discard unsaved simulation parameters?"*.
5. **Scroll Locking:**
   - The body element is styled with `overflow: hidden` while modals/drawers are open, preserving the background scroll position exactly.

---

## 6. Guarded Action & Explicit Approval Model

High-impact operational decisions follow the **5-Step Guarded Action Protocol**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 5-STEP GUARDED ACTION PROTOCOL                              │
│                                                                             │
│  [1. REVIEW]                                                                │
│  Operator reviews candidate trade-off matrix, metrics, and constraint checks │
│       │                                                                     │
│       ▼                                                                     │
│  [2. UNDERSTAND CONSEQUENCES]                                               │
│  Modal surfaces explicit blast radius delta, affected entities, and scope    │
│       │                                                                     │
│       ▼                                                                     │
│  [3. EXPLICIT APPROVAL]                                                     │
│  Operator reviews acknowledgement details and provides deliberate approval   │
│       │                                                                     │
│       ▼                                                                     │
│  [4. EXECUTE OPERATIONAL ACTION]                                            │
│  Final action executes with explicit label: [ Approve & Execute Recovery ]  │
│       │                                                                     │
│       ▼                                                                     │
│  [5. RESULT & AUDIT]                                                        │
│  System transitions to Live Execution state, logs audit record, and updates  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.1 Guarded Execution Specification & Authorization Principles
- **No Checkbox-As-Authorization:** A checkbox within the modal serves solely as an acknowledgement of reviewed consequences during step 3; it **does NOT constitute authorization** by itself.
- **Explicit Final Action:** Authorization occurs through the deliberate activation of the final action button, which must carry an unambiguous label such as **`[ Approve & Execute Recovery ]`**.
- **Required Information Surface:** The guarded UI must clearly communicate:
  1. What will happen upon execution.
  2. What physical facilities, services, or cohorts will be affected.
  3. Whether the operational action is reversible.
  4. Which specific candidate plan or dataset is being executed.
  5. The final operational consequence.

### 6.2 Simulation Isolation Rule
* **Absolute Safety Boundary:** The What-If Simulation Sandbox (`/simulation`) **CANNOT DIRECTLY EXECUTE** a live campus operational mutation.
* **Implementation-Neutral Pipeline:**
  $$\text{Simulation Sandbox} \longrightarrow \text{Branch Draft Plan} \longrightarrow \text{Recovery Review} \longrightarrow \text{Guarded Approval} \longrightarrow \text{Execute Operational Action} \longrightarrow \text{Result \& Audit}$$

---

## 7. Asynchronous Loading, Calculating & Recalculation Flow

To keep the operational console responsive under analytical workloads, operations execute asynchronously without freezing stable viewport components.

```
SIMULATION RECALCULATION CYCLE:
[ 1. Modified Input ]  ──(Short Debounce)──►  [ 2. Pending Recalculation Badge ]
                                                      │
[ 4. Projected Output ] ◄──(Update Scorecard)── [ 3. Calculating Feedback ]
         │
    (Engine Error) ──►  [ 5. Calculation Failed (Actionable Retry CTA) ]
```

### 7.1 Timing & Calculation Contracts
- **Debounce Contract:** Use a short client-side debounce before requesting recalculation; exact timing is implementation-defined.
- **Duration Contract:** Display calculating feedback while the simulation engine is processing. The UI must not assume a fixed calculation duration. The UI must correctly support fast, slow, and long-running calculations.
- **Non-Blocking Behavior:** Operators retain full access to stable information and adjacent parameter controls while dynamic content recalculates.
- **Calculation Failure Contract:** If recalculation fails, the system renders an explicit error with retry guidance. A failed calculation is never displayed as a valid projection or neutral zero.

---

## 8. Stale, Partial, and Unavailable Data Contracts

Crisis response telemetry fluctuates as networks fail and sensors report intermittently. The UI explicitly distinguishes data freshness levels.

```text
DATA FRESHNESS TAXONOMY:
┌─────────────────────────────────────────────────────────────────────────────┐
│ [STALE]        ──► Value was measured previously; age is clearly displayed  │
│ [UNAVAILABLE]  ──► Subsystem is offline or disconnected; no data exists     │
│ [UNKNOWN]      ──► Condition cannot be determined by the sensor network     │
│ [PARTIAL]      ──► Some subsystem dimensions are online; others offline    │
│ [PROJECTED]    ──► Value is a mathematical scenario simulation output       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.1 Distinct State Specifications
1. **Stale Telemetry:** Cached value remains visible, accompanied by a timestamp indicator and an explicit revalidation CTA (`[ Revalidate Now ]`).
2. **Partial Data:** Available telemetry channels display live figures; disconnected channels are explicitly labeled `[ Not Available ]` (never defaulted to `0`).
3. **Unavailable Data:** Muted subsystem state indicating complete sensor disconnection; distinct from empty or zero data.
4. **Data Provenance Indicators:** Every metric card and data row maintains its authoritative provenance badge: `[ OBSERVED ]`, `[ CALCULATED ]`, `[ PROJECTED ]`, `[ ASSUMED ]`, or `[ MANUAL ]`.

---

## 9. Action Priority & Dominant CTA Hierarchy

Every decision surface enforces a strict action priority to eliminate operator hesitation:
- **Primary CTA (1 Max per view):** Dominant next step using `--color-brand-primary`.
- **Secondary CTA:** High-utility alternative or comparison action using `--color-bg-elevated`.
- **Tertiary CTA:** Inspection, filtering, or export action using ghost/icon styling.
- **Destructive / Guarded CTA:** Consequential mutation using `--color-status-danger` coupled with mandatory `<GuardedApprovalModal>`.

---

## 10. Comprehensive Keyboard Interaction Model

EzyKwelez is fully operable without a mouse. Standard operational keybindings conform to desktop accessibility conventions without introducing unnecessary shortcuts.

| Key / Key Combination | Component Target | Interaction Behavior |
|---|---|---|
| `Tab` | Entire Application | Moves focus to next interactive element in visual DOM order. |
| `Shift + Tab` | Entire Application | Moves focus to previous interactive element in reverse order. |
| `Enter` | Buttons, Links, Table Rows | Activates primary trigger or expands selected record. |
| `Space` | Checkboxes, Toggles, Sliders | Toggles checkbox state or activates focused button. |
| `Escape` | Modals, Drawers, Menus, Tooltips | Dismisses the topmost overlay and returns focus to its trigger. |
| `⌘K` / `Ctrl+K` | Global Search Trigger | Opens the global Command Palette from anywhere in the app. |
| `Arrow Up (↑)` / `Arrow Down (↓)` | Menus, Command Palette, Tree Nodes | Navigates sequentially through item list. |
| `Arrow Left (←)` / `Arrow Right (→)` | Tabs, Segmented Controls, Sliders | Switches active tab panel; adjusts slider by 1 step. |
| `Page Up` / `Page Down` | Simulation Sliders | Adjusts slider by larger step increment. |
| `Home` / `End` | Sliders, Trees, Data Tables | Jumps to minimum/maximum bound or start/end of list. |

---

## 11. Live Regions & Screen Reader Dynamic Feedback

Dynamic asynchronous telemetry keeps vision-impaired operators informed without flooding audio channels with continuous sensor ticks.
- **`aria-live="assertive" role="alert"`:** Reserved strictly for critical campus-wide emergencies and imminent safety warnings.
- **`aria-live="polite"`:** Used for discrete async milestones (recalculation completed, stale state detected, recovery plan generated, filter applied).
- **`aria-hidden="true"`:** Applied to decorative pulses, real-time animation waves, and background telemetry polling pings.

---

## 12. Motion System & Reduced-Motion Contracts

Transitions convey spatial relationships using approved design-system motion tokens (`--motion-fast`, `--motion-normal`, `--motion-slow`) and curves:
- **Reduced Motion:** When `@media (prefers-reduced-motion: reduce)` is detected, animated durations collapse to zero, shimmer effects become static muted fills, and state changes execute instantaneously with crisp opacity/border updates.

---

## 13. AI Interaction & Explainability Boundary

- **Advisory Role:** Strictly advisory summarization and contextualization grounded in authoritative system results and available operational context. AI translates calculated optimization trade-offs into plain-text explanations and drafts communications for operator review.
- **Zero Authority Guardrail:** AI is **strictly barred from autonomous state mutations**, executing recovery plans, overriding safety constraints, modifying live operational data, or independently authorizing actions. AI has **zero state-mutation, authorization, or decision-making authority**.
- **Grounding Requirement:** All AI explanations appear in dedicated `<AIAssistantContainer />` panels and remain strictly grounded in authoritative system results and available operational context.


---

## 14. Responsive & Touch Interaction Adaptation

- **Touch Target Dimensions:** All interactive controls on touch viewports meet the minimum $\ge 44 \times 44\text{ px}$ target size with adequate separation.
- **Drawer Adaptation:** Desktop inspection drawers use the approved drawer sizing token and preserve the responsive layout contract, adapting to full-width bottom sheets on mobile.
- **Touch Slider Ergonomics:** Touch sliders feature an enlarged thumb target and remain paired with companion `<input type="number">` fields for precise direct entry.
- **Zero Gesture-Only Actions:** Critical operations never depend solely on swipe or pinch gestures; accessible visible button alternatives are always present.

---

## 15. Cross-Screen Consistency Standards

| Screen Area | Normalized Interaction Standard |
|---|---|
| **Command Center** | Standardized on `<EmptyState />` with one-click `[ Reset All Filters ]` CTA. |
| **Live Campus** | Distinguishes `<StaleTelemetryBanner />` (usable cache) from `<SensorUnavailableBadge />` (offline hardware). |
| **Incidents Dossier** | Grounded telemetry facts separated into structured badges; AI hypothesis quarantined in `<AIAssistantCard />`. |
| **Blast Radius** | Interactive DAG canvas offers an accessible `<ol role="tree">` hierarchical list alternative. |
| **Recovery Plans** | Constrained/blocked plans render `[ ✕ BLOCKED ]` badge, disable execution CTA, and explain missing prerequisite. |
| **Compare Plans** | Multi-plan matrix includes `[ Show Differences Only ]` switch to collapse identical rows. |
| **What-If Simulation** | Persistent advisory sandbox banner + implementation-neutral guarded branching pipeline. |

---

## 16. Developer Handoff Checklist & Acceptance Criteria

Frontend engineers implementing `apps/web/` must verify compliance against the following criteria:

- [ ] **State Dimensions:** Component states map cleanly to the 5 orthogonal dimensions.
- [ ] **State Precedence:** Precedence rules within and across dimensions are respected.
- [ ] **Guarded Execution:** High-consequence mutations enforce explicit final approval (`[ Approve & Execute Recovery ]`); default focus on `[ Cancel ]`.
- [ ] **Simulation Sandbox Isolation:** Sandbox routes cannot directly mutate live operational states.
- [ ] **Calculation UX:** Short client-side debounce and non-blocking calculating feedback supported for variable processing durations.
- [ ] **Zero Dead-End Guarantee:** Empty, stale, and error states provide immediate, actionable recovery buttons.
- [ ] **Data Provenance Preservation:** All metrics maintain `OBSERVED`, `CALCULATED`, `PROJECTED`, `ASSUMED`, or `MANUAL` badges.
- [ ] **Touch Target Sizing:** All interactive elements on mobile/tablet meet or exceed `44x44px`.
- [ ] **Keyboard Accessibility:** All workflows are fully traversable using standard keyboard conventions.
- [ ] **Design Tokens Canonical:** All styles and animations utilize canonical tokens from `DESIGN-SYSTEM.md`.

---

**End of Specification — Phase 7 Canonical Interaction & State System**
