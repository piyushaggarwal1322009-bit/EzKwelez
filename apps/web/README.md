# @ezykwelez/web

The primary frontend client application for EzyKwelez, built with **Next.js**, **TypeScript**, and **Tailwind CSS**.

## Structure

```text
src/
├── components/
│   ├── ui/             # Reusable UI primitives (Badge, Card, Button, etc.)
│   └── layout/         # Shared layout components
├── features/
│   ├── ishu/           # Assigned feature ownership (Command Center, Graph, Blast Radius)
│   └── tanisha/        # Assigned feature ownership (Recovery Plans, Simulation, AI Explanations)
├── lib/
│   ├── api/            # Typed API client
│   └── utils/          # Formatting & class merging utilities
├── pages/              # Application routing & page views
└── styles/             # Global CSS and Tailwind directives
```

## Team Feature Ownership

- **Ishu (`@ISHU_GITHUB_USERNAME`):** `src/features/ishu/`
- **Tanisha (`@TANISHA_GITHUB_USERNAME`):** `src/features/tanisha/`

## Development Commands

Run from monorepo root:
```bash
npm run dev:web
```

Or from `apps/web`:
```bash
npm run dev
```

## Quality Commands

```bash
npm run typecheck
npm run lint
npm run build
```
