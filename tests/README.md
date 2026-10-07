# EzyKwelez Test Suite

Monorepo testing root directory.

## Layout

- `backend/`: Pytest suite for FastAPI backend endpoints, domain logic, graph traversal, and impact calculation.
- `frontend/`: Component and integration tests for Next.js web application.

## Running Tests

### Backend Tests
```bash
pytest tests/backend
```

### Frontend Tests
```bash
npm run test --workspace=apps/web
```
