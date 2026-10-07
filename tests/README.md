# EzyKwelez Test Suite

Monorepo testing root directory.

## Layout

- `backend/`: Pytest suite for FastAPI backend endpoints, domain logic, authentication context, and profiles.
  - `test_health.py`: Verifies service status and root metadata endpoints.
  - `test_auth.py`: Verifies JWT authentication context, protected routes, unauthorized rejections, and profile updates.
- `frontend/`: Component and integration tests for Next.js web application.

## Running Tests

### Backend Tests
```bash
pytest tests/backend
```

### Frontend Checks
```bash
npm run typecheck
npm run build
```
