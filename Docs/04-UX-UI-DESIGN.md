# EzyKwelez — UX/UI Design Specification

**Document status:** Phase 1 — Locked baseline  
**Version:** 1.0  
**Design direction:** Premium operational intelligence product; calm, precise, highly interactive; not a generic college portal

---

## 1. Design Objective

EzyKwelez must communicate **control under uncertainty**.

The interface should make a complex operational situation understandable within seconds:

```text
What happened?
   ↓
What is affected?
   ↓
How bad is it?
   ↓
What can we do?
   ↓
Which option is best?
```

The visual system should feel closer to a modern mission-control / operations SaaS product than a university ERP.

---

## 2. UX Principles

### 2.1 Decision-first

Every major screen has one primary decision or action.

### 2.2 Progressive disclosure

Show the important result first, then allow the operator to inspect detail.

### 2.3 Evidence before recommendation

A recommendation must be accompanied by the reasons and measurable effect.

### 2.4 No visual noise

Do not fill every area with cards, charts, gradients, or decorative animations.

### 2.5 Status must be immediately legible

Users should identify safe, warning, and critical conditions without reading paragraphs.

### 2.6 Motion explains state

Animation is used to demonstrate impact propagation and simulation changes, not merely for decoration.

### 2.7 Accessible by default

Keyboard navigation, semantic controls, visible focus, sufficient contrast, reduced-motion preferences, and clear non-color status indicators are required.

---

## 3. Visual Identity

### Brand personality

- intelligent;
- calm;
- technical;
- trustworthy;
- decisive;
- modern.

### Avoid

- gaming aesthetics;
- excessive neon;
- fake 3D complexity;
- university-government portal styling;
- excessive glassmorphism;
- decorative AI robot imagery.

---

## 4. Color Semantics

Use semantic status colors consistently.

```text
SAFE       -> success semantic
WARNING    -> warning semantic
CRITICAL   -> danger semantic
INFO       -> informational semantic
NEUTRAL    -> default surface/text
```

Never communicate status through color alone. Pair with:

- icon;
- label;
- shape/badge;
- text description.

The exact palette should be centralized as design tokens rather than hardcoded across components.

---

## 5. Typography

Use a clean modern sans-serif type system with a maximum of two font families.

Hierarchy:

```text
Display
Page title
Section title
Card title
Body
Metadata
Caption
```

Numbers that represent operational metrics should use tabular/monospaced numeral treatment when available so changing values remain visually stable.

---

## 6. Primary Application Shell

### Desktop operator layout

```text
+------------------------------------------------------+
| EzyKwelez | Campus ▼ | Search | Alerts | Profile    |
+------------+-----------------------------------------+
|            |                                         |
| Overview   |             Main workspace              |
| Incidents  |                                         |
| Campus     |                                         |
| Recovery   |                                         |
| Simulations|                                         |
| Audit      |                                         |
|            |                                         |
+------------+-----------------------------------------+
```

Navigation should remain compact. The product's value must come from the work area, not the sidebar.

---

## 7. Operator Command Center

Primary information order:

### Row 1 — Situation summary

- Active incidents
- People affected
- High-impact incidents
- Pending decisions

### Row 2 — Campus state

Interactive campus/zone visualization.

### Row 3 — Priority incidents

Sorted by current impact/severity.

### Row 4 — Recommended actions

Only recommendations with enough evidence should appear.

Example:

```text
HIGH IMPACT
Building B outage

438 students potentially affected
7 rooms unavailable
4 classes disrupted

[ Analyze impact ] [ View recovery ]
```

---

## 8. Incident Detail UX

The incident screen should follow a narrative structure.

```text
INCIDENT HEADER
  Status / severity / time / target

BLAST RADIUS
  Direct impact
  Secondary impact
  Dependency path

IMPACT
  People
  Rooms
  Resources
  Classes

RECOVERY OPTIONS
  Plan A | Plan B | Plan C

SIMULATION
  Before | Proposed | After

DECISION
  Approve / reject / modify
```

The first viewport must communicate the incident and its scale without requiring the user to scroll through technical details.

---

## 9. Interactive Campus Visualization

### Goal

Represent the campus as a **decision map**, not an ornamental map.

Minimum interactions:

- hover building;
- click building;
- highlight affected entities;
- show dependency path;
- focus on blast radius;
- compare baseline vs simulation.

When an incident is analyzed, affected paths may animate outward from the source node.

Example concept:

```text
[POWER]
    |
    +----> [BLOCK B]  !!!
              |
        +-----+------+
        |            |
     [ROOM]       [LAB]
        |            |
     [CLASS]      [RESOURCE]
```

Animation should stop quickly enough that it does not become distracting.

---

## 10. Recovery Comparison UX

The recovery planner is the product's signature screen.

Use a comparison layout:

```text
              BASELINE     PLAN A     PLAN B ⭐
-------------------------------------------------
Students       438          96          21
Classes          4           2           0 conflicts
Impact          82           51          36
Move burden     --          +120m       +60m
-------------------------------------------------
                         [ Select Plan B ]
```

Each plan must have a visible:

> **Why this plan?**

Expansion reveals the machine-readable decision factors.

---

## 11. Simulation UX

The primary interaction is:

```text
Current situation
        ↓
Change a variable
        ↓
Run simulation
        ↓
Observe campus
        ↓
Compare outcomes
```

Scenario controls should include only variables that the engine actually supports.

Example:

```text
Outage duration
[ 30m ----●----- 180m ]

Additional attendees
[ 0 -----●-------- 1000 ]

Gate 2
[ OPEN ▼ ]
```

Never display a control that changes a value without causing a real recalculation.

---

## 12. AI Operations Analyst UX

The AI should appear as an **analyst panel**, not as the product's homepage centerpiece.

Example:

```text
Operations Analyst

Why is this incident high impact?

> Building B supplies 7 rooms. Four of those rooms
  have scheduled classes during the outage window.
  Two require lab equipment unavailable elsewhere.

Evidence
[ 7 rooms ] [ 4 classes ] [ 438 students ]
```

Recommended questions can be contextual chips:

- Why is the impact high?
- Why was Plan C selected?
- What changes if the outage lasts 60 more minutes?
- Summarize this for an administrator.

The AI must not be visually presented as an autonomous controller.

---

## 13. Student Experience

The student interface is intentionally simpler.

Primary view:

```text
Good afternoon

Your campus has 1 active disruption affecting your schedule.

Physics Lab
B204 -> C204

Temporary Building B outage
Effective 2:00 PM

[ View details ]
```

Do not expose internal optimization complexity unless useful to the student.

---

## 14. Interaction States

Every important component must define:

### Loading

Use skeletons for dashboards and inline progress for analysis/simulation.

### Empty

Explain why there is no data and what the user can do next.

### Error

Show a concise explanation + recovery action.

### Success

Confirm the completed action and its effect.

### Partial failure

For example, AI unavailable but impact engine successful:

> Analysis complete. Analyst explanation is temporarily unavailable.

The system must never replace a real error with fake successful-looking data.

---

## 15. Motion Design

Use motion for three purposes:

1. incident propagation;
2. before/after simulation changes;
3. context-preserving navigation/transitions.

Recommended principles:

- 150–300 ms for micro-interactions;
- slightly longer for major state transitions;
- respect `prefers-reduced-motion`;
- do not continuously animate static dashboard elements.

---

## 16. Component Rules

All reusable visual primitives should be centralized:

```text
Button
Badge
Card
Metric
DataTable
StatusPill
Modal
Drawer
Tooltip
Tabs
CommandPalette
Skeleton
Toast
```

Domain components should compose those primitives rather than create unrelated visual patterns.

---

## 17. Responsive Rules

### Operator

Desktop-first.

At narrower widths:

- collapse navigation;
- stack metric groups;
- turn comparisons into horizontally scrollable/stacked cards;
- preserve the primary action.

### Student

Mobile-first responsive behavior.

---

## 18. Accessibility Requirements

Minimum:

- semantic HTML;
- keyboard focus order;
- visible focus state;
- labels for form controls;
- accessible names for icon buttons;
- status not conveyed by color alone;
- no essential information hidden only in hover states;
- reduced motion support;
- charts/map interactions require accessible textual alternatives.

---

## 19. Design System Implementation

Design tokens should cover:

```text
colors
spacing
radii
shadows
typography
z-index
motion durations
breakpoints
```

Avoid arbitrary one-off values whenever an existing token can serve the need.

Tailwind utilities may be used, but repeated patterns should become components/tokens rather than copy-pasted class strings.

---

## 20. UX Definition of Done

The UI is ready for the final demo when:

- the primary incident flow can be completed without guidance;
- the blast radius is visually understandable within 5–10 seconds;
- plans can be compared without opening multiple unrelated pages;
- the recommended plan's reasoning is discoverable;
- simulation produces visible before/after change;
- error states are credible and graceful;
- the interface remains readable with reduced motion;
- no screen depends on fake placeholder values once connected to the backend.
