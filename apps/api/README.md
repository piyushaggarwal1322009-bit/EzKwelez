# @ezykwelez/api

FastAPI modular monolith backend powering the EzyKwelez campus disruption-response and recovery engine.

## Architecture

Following the Phase 0 architecture standards, the API is organized with clean domain boundaries and dependency inversion:

```text
app/
├── api/                # HTTP boundary (routes, router aggregation, dependencies)
├── application/        # Application services orchestrating use cases
├── domain/             # Pure domain contracts & models (no framework dependencies)
│   ├── campus/         # Campus infrastructure models
│   ├── incidents/      # Incident lifecycle & events
│   ├── graph/          # Typed dependency traversal
│   ├── impact/         # Blast radius & impact scoring
│   ├── recovery/       # Candidate generation & optimization
│   ├── simulation/     # Counterfactual scenario execution
│   └── common/         # Base abstractions & contracts
├── infrastructure/     # External adapters (Postgres, Supabase, LLM providers)
│   ├── repositories/
│   ├── auth/
│   ├── llm/
│   └── persistence/
├── schemas/            # Pydantic request/response models
├── config.py           # Typed environment & settings management
└── main.py             # FastAPI entrypoint
```

## Primary Ownership

- **Piyush (`@PIYUSH_GITHUB_USERNAME`):** Backend Lead & API Integration

## Running Locally

From monorepo root:
```bash
python -m uvicorn app.main:app --app-dir apps/api --reload --port 8000
```

Or from `apps/api`:
```bash
uvicorn app.main:app --reload --port 8000
```

## Testing

```bash
pytest tests/backend
```
