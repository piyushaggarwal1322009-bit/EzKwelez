# EzyKwelez — UI/UX Workspace & Design Foundation

**UI/UX Owner:** Aile Sharma (`Lead UI/UX Designer & Design System Owner`)  
**Status:** Phase 2 Finalized  
**Scope:** Canonical Design System, Information Architecture, Component Specifications, Screen Inventories, and Developer Handoff Contracts.

---

## 1. Purpose of this Directory

The `apps/ui-ux/` workspace is the single authoritative source of truth for the visual design, user experience architecture, information architecture, navigation models, interaction models, responsive behaviors, accessibility standards, and design system tokens of **EzyKwelez**.

EzyKwelez is an operational campus intelligence product. Its mission is to transform campus disruption response from reactive manual coordination into explainable, dependency-aware decision support. The design workspace defines the visual and behavioral foundation that guarantees clarity, trust, operational speed, and reliable decision-making across all product surfaces.

---

## 2. UI/UX Ownership & Boundaries

### 2.1 Ownership
- **Lead Owner:** Aile Sharma
- **Domain:** Design System tokens, information architecture, navigation hierarchy, component specifications, screen workflows, interaction models, responsive layouts, accessibility compliance, design handoff documentation, and UI assets.

### 2.2 What Belongs Here
- Information architecture maps, user journeys, navigation models, and context persistence rules.
- Modular screen specifications (e.g. `screens/command-center.md`).
- Design tokens (colors, typography scales, spacing units, elevations, radii, motion timings).
- Component anatomy, state matrices, and usage specifications.
- Comprehensive screen inventories and operational workflow definitions.
- Micro-interaction, feedback, and error state specifications.
- Responsive breakpoint and adaptation rules.
- WCAG 2.1 AA accessibility guidelines and implementation contracts.
- Developer handoff guidelines and design review checklists.
- Static vector assets, schematic maps, and diagram specifications.

### 2.3 What Does NOT Belong Here
- Production frontend application source code (HTML, TSX, React components, Next.js page routes) — this belongs strictly in `apps/web/`.
- Backend API implementation, database models, or server routes — these belong in `apps/api/` and `supabase/`.
- Mock API servers or synthetic data generators — these belong in `packages/shared/` or `apps/api/`.
- Ad-hoc, unreviewed CSS style overrides.

---

## 3. Relationship Between UI/UX Specifications and Frontend Implementation

> **Core Axiom:**  
> **UI/UX specifications are the design source of truth. Frontend code is the implementation of those specifications.**

1. **Unidirectional Authority:** Frontend engineers must not invent new visual styles, colors, spacing units, navigation routes, or interaction behaviors on the fly. All UI components and screen layouts implemented in `apps/web/` must map directly to the specifications defined in this workspace.
2. **Deterministic UI:** The UI does not invent operational facts or disguise system failures with ornamental animations. Every UI element exists to communicate state, dependency, or decision context clearly.
3. **Change Management:** Any evolution in styling, component variants, or operational screen layouts must be drafted and approved in `apps/ui-ux/` before being implemented in the codebase.

---

## 4. Workspace Document Map

| Document | Purpose | Primary Audience |
| :--- | :--- | :--- |
| [`INFORMATION-ARCHITECTURE.md`](./INFORMATION-ARCHITECTURE.md) | Canonical product mental model, 6 top-level areas, 4-level information hierarchy, user journeys, screen relationship map, and context preservation rules. | Product, Frontend, Designers, QA |
| [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md) | Canonical design tokens, visual language, typography, color semantics, and atomic styling rules. | Frontend Engineers, Designers |
| [`COMPONENTS.md`](./COMPONENTS.md) | Component inventory with anatomy, variants, states, interactions, accessibility, and usage rules. | Frontend Engineers |
| [`SCREENS.md`](./SCREENS.md) | Comprehensive 6-area screen inventory, user goals, key information hierarchy, and primary actions. | Product, Frontend, QA |
| [`screens/command-center.md`](./screens/command-center.md) | Flagship Command Center operational specification, component layout, and state matrices. | Frontend Engineers, QA |
| [`INTERACTIONS.md`](./INTERACTIONS.md) | Interaction principles for navigation, filtering, graph exploration, simulation, destructive actions, and feedback. | Frontend Engineers, QA |
| [`RESPONSIVE.md`](./RESPONSIVE.md) | Breakpoint strategies, layout adaptations, responsive tables, side panels, and mobile vs. desktop workflows. | Frontend Engineers |
| [`ACCESSIBILITY.md`](./ACCESSIBILITY.md) | Production-grade accessibility standards: keyboard navigation, screen reader semantics, contrast, and reduced motion. | Frontend Engineers, QA |
| [`DEVELOPER-HANDOFF.md`](./DEVELOPER-HANDOFF.md) | Guide for translating UI/UX specifications into Next.js/Tailwind code, design review checklist, and token mapping. | Frontend Engineers |
| [`assets/`](./assets/) | Centralized SVG assets, campus schematics, branding, and diagram graphics. | Designers, Developers |

---

## 5. How Frontend Developers Should Use These Documents

1. **Before Structuring App Routes & Layouts:**
   - Refer to [`INFORMATION-ARCHITECTURE.md`](./INFORMATION-ARCHITECTURE.md) for top-level product areas, sub-routes, navigation hierarchy, and context persistence rules.
2. **Before Building Screen Features:**
   - Refer to modular screen specifications like [`screens/command-center.md`](./screens/command-center.md) for layout blocks, component props, and state matrices.
3. **Before Building a Component:**
   - Refer to [`COMPONENTS.md`](./COMPONENTS.md) for anatomy, variants, and states (loading, empty, error, disabled, active).
   - Use the token values in [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md) and [`aile/tokens.json`](./aile/tokens.json).
   - Check [`ACCESSIBILITY.md`](./ACCESSIBILITY.md) for required ARIA roles, keyboard triggers, and focus management.
4. **Before Submitting a PR:**
   - Review against the checklist in [`DEVELOPER-HANDOFF.md`](./DEVELOPER-HANDOFF.md).

---

## 6. Design-Review Expectations

Every UI implementation PR in `apps/web/` is subject to design review by Aile Sharma or the designated UI/UX reviewer. A PR is approved only when:

- [ ] It adheres strictly to the design tokens and layout grids (no magic CSS values or unregistered arbitrary Tailwind classes).
- [ ] It conforms to the 6 core product areas and routing hierarchy defined in `INFORMATION-ARCHITECTURE.md`.
- [ ] Non-color status indicators are present alongside semantic colors.
- [ ] All 5 standard component states (Default, Hover/Focus, Active/Loading, Disabled, Empty/Error) are implemented.
- [ ] Keyboard navigation and visible focus rings meet WCAG 2.1 AA requirements.
- [ ] Visual hierarchy prioritizes operational decision-making over decorative styling.
- [ ] Motion supports `prefers-reduced-motion` media queries.
