# EzyKwelez — Developer Handoff & Implementation Contract

**Owner:** Aile Sharma (`Lead UI/UX Designer & Design System Owner`)  
**Target Audience:** Ishu, Tanisha & Frontend Engineering Team (`apps/web/`)  
**Status:** Phase 1B Finalized  
**Version:** 1.2  

---

## 1. Purpose & Guiding Principles

This document establishes the official developer handoff between the UI/UX team (Aile Sharma) and the frontend engineering team (Ishu, Tanisha). It defines how specifications in `apps/ui-ux/` translate into clean, performant, and accessible Next.js + TypeScript + Tailwind code in `apps/web/`.

> **Fundamental Principle:**  
> **UI/UX specifications are the design source of truth. Frontend code is the implementation of those specifications.**

---

## 2. Separation of Concerns: Design vs. Implementation Decisions

| Area | Design Decision (Owned by Aile Sharma in `apps/ui-ux/`) | Implementation Decision (Owned by Ishu & Tanisha in `apps/web/`) |
| :--- | :--- | :--- |
| **Information Architecture** | 6 primary product areas, sub-views, 4-level information hierarchy, and context persistence rules. | Next.js App Router folder structure (`app/(operator)/...`), route grouping, URL search params management. |
| **Tokens & Theming** | Canonical color tokens, contrast ratios, font scales, line heights, border radii, spacing scale, elevation levels, motion timings. | CSS variables setup in root stylesheet, Tailwind theme configuration, font loading strategy via `next/font`. |
| **Component Architecture** | Component anatomy, required visual variants, interactive states (5 mandatory states), required props contract, ARIA roles. | Internal React component file structure, custom React hooks, state management (Zustand/React Query), memoization (`useMemo`, `useCallback`). |
| **Screen Layouts** | Visual information hierarchy, card placement, responsive layout breakpoints, primary/secondary action placement. | Next.js App Router layout composition, Server Component vs. Client Component boundaries, data fetching orchestration. |
| **Interactions** | Transition timing, modal behaviors, confirmation step flows, debounced search thresholds, loading/error states. | Event handler implementation, optimistic UI updates, error boundary boundaries, API request retry logic. |
| **Data Visualization** | Node shapes, edge styling, blast radius ring representations, color thresholds for severity, dual-view requirements. | Canvas / SVG rendering library choices (e.g. D3, SVG primitives, Lucide icons), rendering performance optimizations. |
| **Backend Integration** | What information is displayed on screen, how errors are surfaced to users. | HTTP client setup, OpenAPI type generation, caching and revalidation strategies. |

---

## 3. Information Architecture & Route Mapping for Next.js

Frontend engineers must structure App Router routes to match the canonical 6 product areas in [`INFORMATION-ARCHITECTURE.md`](./INFORMATION-ARCHITECTURE.md):

```text
apps/web/src/app/
├── (auth)/
│   └── login/                  # Supabase Auth login
├── (operator)/
│   ├── layout.tsx              # Pinned sidebar navigation + Top command bar
│   ├── command-center/         # 1. Command Center Area
│   │   └── page.tsx
│   ├── live-campus/            # 2. Live Campus Area
│   │   ├── page.tsx            # Sub-view: Overview (Spatial Map)
│   │   ├── occupancy/          # Sub-view: Occupancy
│   │   │   └── page.tsx
│   │   └── connectivity/       # Sub-view: Connectivity
│   │       └── page.tsx
│   ├── incidents/              # 3. Incidents Area
│   │   ├── page.tsx            # Sub-view: Active Incidents Queue
│   │   └── [incidentId]/       # Sub-view: Incident Details (Root dossier)
│   │       ├── page.tsx
│   │       ├── blast-radius/   # Sub-view: Impact / Blast Radius
│   │       │   └── page.tsx
│   │       ├── recovery/       # 4. Recovery Area (Incident-Contextual)
│   │       │   ├── page.tsx    # Sub-view: Recovery Plans List
│   │       │   └── compare/    # Sub-view: Compare Plans Matrix
│   │       │       └── page.tsx
│   │       └── simulation/     # 5. Simulation Area (Contextual Sandbox)
│   │           └── page.tsx
│   ├── simulation/             # 5. Simulation Area (Standalone Sandbox)
│   │   └── page.tsx
│   └── settings/               # 6. Settings Area
│       └── page.tsx
└── (student)/
    └── schedule/               # Student Disruption & Relocation View
        └── page.tsx
```

---

## 4. Design Token Consumption

Frontend developers must configure `tailwind.config.ts` and global CSS in `apps/web/` to consume the canonical tokens defined in [`apps/ui-ux/aile/tokens.json`](./aile/tokens.json) and [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md).

### 4.1 Canonical CSS Variables Setup

```css
/* apps/web/src/styles/globals.css */
:root {
  /* Surfaces */
  --color-bg-base: #090d16;
  --color-bg-surface: #0f172a;
  --color-bg-elevated: #1e293b;
  --color-bg-subtle: #131d33;
  --color-bg-backdrop: rgba(9, 13, 22, 0.75);

  /* Borders */
  --color-border-subtle: #1e293b;
  --color-border-strong: #334155;
  --color-border-accent: #3b82f6;
  --color-border-focus: #38bdf8;
  --color-border-disabled: #1e293b;

  /* Typography */
  --color-text-primary: #f8fafc;
  --color-text-secondary: #94a3b8;
  --color-text-muted: #64748b;
  --color-text-inverse: #090d16;
  --color-text-disabled: #475569;

  /* Brand */
  --color-brand-primary: #2563eb;
  --color-brand-accent: #0ea5e9;
  --color-brand-subtle: rgba(37, 99, 235, 0.15);

  /* Status Semantics */
  --color-status-critical: #ef4444;
  --color-status-critical-bg: rgba(239, 68, 68, 0.12);
  --color-status-critical-border: rgba(239, 68, 68, 0.35);
  --color-status-critical-text: #fca5a5;

  --color-status-warning: #f59e0b;
  --color-status-warning-bg: rgba(245, 158, 11, 0.12);
  --color-status-warning-border: rgba(245, 158, 11, 0.35);
  --color-status-warning-text: #fde68a;

  --color-status-success: #10b981;
  --color-status-success-bg: rgba(16, 185, 129, 0.12);
  --color-status-success-border: rgba(16, 185, 129, 0.35);
  --color-status-success-text: #6ee7b7;

  --color-status-info: #38bdf8;
  --color-status-info-bg: rgba(56, 189, 248, 0.12);
  --color-status-info-border: rgba(56, 189, 248, 0.35);
  --color-status-info-text: #bae6fd;

  --color-status-neutral: #64748b;
  --color-status-neutral-bg: rgba(100, 116, 139, 0.12);
  --color-status-neutral-border: rgba(100, 116, 139, 0.35);
  --color-status-neutral-text: #cbd5e1;

  /* Radii */
  --radius-none: 0px;
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 6px;
  --radius-xl: 8px;
  --radius-full: 9999px;
}
```

### 4.2 Tailwind Config Setup

```typescript
// apps/web/tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: 'var(--color-bg-base)',
          surface: 'var(--color-bg-surface)',
          elevated: 'var(--color-bg-elevated)',
          subtle: 'var(--color-bg-subtle)',
          backdrop: 'var(--color-bg-backdrop)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
          strong: 'var(--color-border-strong)',
          accent: 'var(--color-border-accent)',
          focus: 'var(--color-border-focus)',
          disabled: 'var(--color-border-disabled)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          inverse: 'var(--color-text-inverse)',
          disabled: 'var(--color-text-disabled)',
        },
        brand: {
          primary: 'var(--color-brand-primary)',
          accent: 'var(--color-brand-accent)',
          subtle: 'var(--color-brand-subtle)',
        },
        status: {
          critical: 'var(--color-status-critical)',
          'critical-bg': 'var(--color-status-critical-bg)',
          'critical-border': 'var(--color-status-critical-border)',
          'critical-text': 'var(--color-status-critical-text)',
          warning: 'var(--color-status-warning)',
          'warning-bg': 'var(--color-status-warning-bg)',
          'warning-border': 'var(--color-status-warning-border)',
          'warning-text': 'var(--color-status-warning-text)',
          success: 'var(--color-status-success)',
          'success-bg': 'var(--color-status-success-bg)',
          'success-border': 'var(--color-status-success-border)',
          'success-text': 'var(--color-status-success-text)',
          info: 'var(--color-status-info)',
          'info-bg': 'var(--color-status-info-bg)',
          'info-border': 'var(--color-status-info-border)',
          'info-text': 'var(--color-status-info-text)',
          neutral: 'var(--color-status-neutral)',
          'neutral-bg': 'var(--color-status-neutral-bg)',
          'neutral-border': 'var(--color-status-neutral-border)',
          'neutral-text': 'var(--color-status-neutral-text)',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      borderRadius: {
        none: 'var(--radius-none)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      }
    }
  }
};
export default config;
```

---

## 5. Universal Component State Contracts

Every component developed by the frontend team must implement all 5 mandatory states:

1. **Default:** Stable baseline appearance adhering to contrast tokens.
2. **Hover / Focus-Visible:** Luminance elevation on hover; 2px sky-blue (`--color-border-focus`) ring on focus.
3. **Active / Loading:** Interactive elements become inert (`aria-busy="true"`), show 14px spinner, and present continuous action text (e.g., `Simulating...`).
4. **Disabled:** Opacity 45%, `cursor: not-allowed`, pointer events suppressed (`aria-disabled="true"`).
5. **Empty / Error:** Clear descriptive explanation with immediate retry or filter-reset trigger.

---

## 6. Design Review & PR Quality Gate

Every frontend Pull Request must pass the design review checklist before merging into `main`:

### PR Checklist
- [ ] **IA Compliance:** Routes and navigation match `INFORMATION-ARCHITECTURE.md` hierarchy.
- [ ] **Zero Magic CSS:** No arbitrary colors (e.g. `bg-[#0a0f1d]`); all styles map to semantic tokens.
- [ ] **Tabular Metrics:** All metric numbers, capacity values, and coordinates use `font-mono tabular-nums`.
- [ ] **WCAG 2.1 AA Baseline:** Passes automated axe-core audit with zero errors.
- [ ] **Keyboard Navigable:** Entire screen flow is completable without mouse interaction.
- [ ] **Visible Focus:** Focus rings are clearly visible on dark surfaces.
- [ ] **Dual-View Rule:** All spatial maps and graphs offer accessible data table alternatives.
- [ ] **Reduced Motion:** Verified under `prefers-reduced-motion: reduce`.
