# EzyKwelez

**Campus Disruption-Response & Recovery Engine**

EzyKwelez is an operational intelligence and decision-support platform designed to answer one critical question:
> **When something goes wrong on campus, what else will be affected, and what is the best way to recover?**

The system models a campus as an interconnected dependency network. When an operational disruption occurs (e.g. power failure, network outage, room closure, severe weather), EzyKwelez traces dependencies, calculates blast radius, evaluates constraint-validated recovery options, simulates outcomes, recommends optimal interventions, and generates explainable briefings.

---

## Authoritative Documentation (Phase 0)

The foundational architecture and operational requirements are defined in the locked Phase 0 specification documents:

1. [01-PRD.md](file:///c:/Users/Admin/Desktop/EzyKwelez/docs/01-PRD.md) — Product Requirements Document & core principles
2. [02-SRD.md](file:///c:/Users/Admin/Desktop/EzyKwelez/docs/02-SRD.md) — Software Requirements Document & system capabilities
3. [03-ARCHITECTURE.md](file:///c:/Users/Admin/Desktop/EzyKwelez/docs/03-ARCHITECTURE.md) — System Architecture, domain boundaries & dependency inversion
4. [04-UX-UI-DESIGN.md](file:///c:/Users/Admin/Desktop/EzyKwelez/docs/04-UX-UI-DESIGN.md) — UX/UI Design specifications & interaction standards
5. [05-ENGINEERING-STANDARDS.md](file:///c:/Users/Admin/Desktop/EzyKwelez/docs/05-ENGINEERING-STANDARDS.md) — Engineering standards & SOLID principles

---

## Core Decision Loop

```text
Campus Data
   ↓
Dependency Graph
   ↓
Incident
   ↓
Blast Radius
   ↓
Impact Calculation
   ↓
Recovery Plans
   ↓
Optimization
   ↓
What-If Simulation
   ↓
Recommendation
   ↓
AI Explanation
```

---

## Team Ownership

### Ownership Areas

* **Piyush**
  * **Role:** Backend / Integration
  * **Primary area:** `apps/api/`, `supabase/`, `tests/backend/`
* **Aile**
  * **Role:** UI/UX
  * **Primary area:** `apps/ui-ux/`
* **Ishu**
  * **Role:** Frontend
  * **Primary area:** `apps/web/src/features/ishu/` (Command Center, Campus Graph, Blast Radius)
* **Tanisha**
  * **Role:** Frontend
  * **Primary area:** `apps/web/src/features/tanisha/` (Recovery Comparison, Simulation Runner, AI Briefings)

### Ownership Enforcement Model

> **Important Git Ownership Rule:**  
> GitHub repositories do not provide true folder-level write permissions inside a single repository. Ownership boundaries are enforced through:
> 1. Protected `main` branch
> 2. Feature branches (`feature/<member>-<description>`)
> 3. Strict Pull Request workflow
> 4. GitHub `CODEOWNERS` review enforcement
> 5. Clear team communication and respect for modular boundaries

No developer pushes directly to `main`. All work merges via reviewed Pull Requests.

---

## Repository Structure

```text
EzyKwelez/
├── apps/
│   ├── web/                        # Next.js + TypeScript + Tailwind Frontend
│   │   ├── src/
│   │   │   ├── components/         # Reusable UI primitives & layout
│   │   │   ├── features/
│   │   │   │   ├── ishu/           # Ishu feature area
│   │   │   │   └── tanisha/        # Tanisha feature area
│   │   │   ├── pages/              # Application pages & routing
│   │   │   ├── styles/             # Tailwind & CSS styling
│   │   │   └── lib/                # API client & utility functions
│   │   └── README.md
│   │
│   ├── api/                        # FastAPI Modular Monolith Backend
│   │   ├── app/
│   │   │   ├── api/                # API routing & dependencies
│   │   │   ├── application/        # Application services orchestrating use cases
│   │   │   ├── domain/             # Pure domain contracts (Graph, Impact, Recovery)
│   │   │   ├── infrastructure/     # External adapters (Postgres, LLM, Auth)
│   │   │   ├── schemas/            # Request/response schemas
│   │   │   ├── config.py           # Typed settings & environment validation
│   │   │   └── main.py             # FastAPI entrypoint
│   │   └── README.md
│   │
│   └── ui-ux/                      # UI/UX Specifications & Assets
│       ├── aile/                   # Design tokens, themes & component guidelines
│       └── README.md
│
├── packages/
│   └── shared/                     # Shared TypeScript contracts, enums & types
│       ├── src/
│       │   ├── enums/
│       │   ├── types/
│       │   └── constants/
│       └── README.md
│
├── docs/                           # Authoritative Phase 0 Documentation
│   ├── 01-PRD.md
│   ├── 02-SRD.md
│   ├── 03-ARCHITECTURE.md
│   ├── 04-UX-UI-DESIGN.md
│   └── 05-ENGINEERING-STANDARDS.md
│
├── supabase/                       # Database migrations & synthetic seed data
│   ├── migrations/
│   └── seed/
│
├── tests/                          # Automated test suites
│   ├── backend/                    # Pytest integration & unit tests
│   └── frontend/                   # Frontend test specs
│
├── scripts/                        # Utility & dev orchestration scripts
│   ├── run-api.ps1
│   └── README.md
│
├── .github/
│   ├── workflows/                  # CI workflow (lint, typecheck, tests)
│   ├── CODEOWNERS                  # Team ownership mapping
│   └── pull_request_template.md    # PR review checklist
│
├── .env.example                    # Environment variable template
├── .gitignore                      # Git ignore rules
├── README.md                       # Monorepo documentation
└── package.json                    # Workspace scripts & orchestration
```

---

## Development Prerequisites

* **Node.js**: `v20.x` or higher
* **npm**: `v10.x` or higher
* **Python**: `3.11` or higher
* **Git**: `2.x` or higher

---

## Local Setup

### 1. Clone & Setup Environment

```bash
git clone https://github.com/piyushaggarwal1322009-bit/EzKwelez.git
cd EzKwelez
cp .env.example .env
```

### 2. Install Node Dependencies

```bash
npm install
npm run build:shared
```

### 3. Install Python Dependencies

```bash
pip install -r apps/api/requirements.txt -r apps/api/requirements-dev.txt
```

---

## Startup Commands

### Frontend Startup (Next.js)

Run from root:
```bash
npm run dev:web
```
The frontend will be available at [http://localhost:3000](http://localhost:3000).

### Backend Startup (FastAPI)

Run from root:
```bash
python -m uvicorn app.main:app --app-dir apps/api --reload --host 0.0.0.0 --port 8000
```
Or via script:
```powershell
.\scripts\run-api.ps1
```
The API will be available at [http://localhost:8000](http://localhost:8000) (Docs at [http://localhost:8000/docs](http://localhost:8000/docs) and [http://localhost:8000/api/docs](http://localhost:8000/api/docs)).

---

## Verification & Quality Commands

```bash
# Typecheck & Build Shared + Web
npm run typecheck
npm run build

# Run Backend Tests
pytest tests/backend
```

---

## Vercel Multi-Service Deployment

EzyKwelez is configured to deploy as a unified Vercel project using **Vercel Services** defined in [vercel.json](file:///c:/Users/Admin/Desktop/EzyKwelez/vercel.json):

* **Web Service (`web`)**: Next.js 14 frontend in `apps/web`
* **API Service (`api`)**: FastAPI backend in `apps/api`
* **Routing**: Top-level rewrites route `/api/(.*)` to the `api` service and all other routes `/(.*)` to the `web` service on a single unified domain.
* **Same-Origin API Calls**: In production, browser requests target `/api/*` directly on the same domain without CORS overhead.
* **Runtime Note**: Backend state uses in-memory repositories during prototype phase. Supabase persistence adapters will replace in-memory state in subsequent phases.

---

## Git Workflow & Branching Strategy

All team members must follow the standard branch naming convention:

* `feature/<member>-<short-description>` (e.g., `feature/piyush-graph-traversal`, `feature/ishu-command-center`)
* `fix/<member>-<short-description>`
* `refactor/<member>-<short-description>`
* `docs/<member>-<short-description>`

### Golden Rules:
1. **Never commit directly to `main`**.
2. **Never force-push (`git push --force`)**.
3. Always create a Pull Request filling out the `.github/pull_request_template.md`.
4. Ensure all CI checks (typecheck, lint, test) pass prior to merge.
5. Respect team ownership areas and coordinate cross-boundary modifications.
