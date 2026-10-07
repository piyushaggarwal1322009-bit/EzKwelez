# ADR-003: RESTful API Contract Strategy & Envelope Standard

- **Status:** Accepted
- **Deciders:** Ishu (System Architecture), Piyush (Backend), Tanisha (Frontend)
- **Date:** 2026-10-07
- **Technical Area:** API Boundaries, Serialization & Error Handling

---

## 1. Context and Problem Statement

The frontend client (Next.js/React) and backend services (FastAPI) require unambiguous, stable, type-safe communication contracts. In distributed development across team members (Tanisha on frontend, Piyush on backend), inconsistent endpoint structures, ad-hoc JSON shapes, duplicate endpoints, and unhandled runtime error formats cause integration friction.

We must define a canonical RESTful API standard, standard response envelopes, consistent error contracts, timestamp conventions, pagination guidelines, and explicit ownership boundaries.

---

## 2. Decision Drivers

1. **Contract Stability & Type Safety:** Shared TypeScript definitions in `@ezykwelez/shared` must mirror backend Pydantic DTOs.
2. **Single Source of Truth:** Eliminate duplicate endpoints that return conflicting subsets of the same domain concept.
3. **Consistent Error Envelope:** Frontend UI components must reliably parse errors, display user-friendly notifications, and retain debugging correlation IDs (`requestId`).
4. **Security & Zero Leakage:** Internal database schemas, raw stack traces, and environment variables must never leak to clients.

---

## 3. Considered Options

* **Option A:** Direct Supabase Client Queries from Browser (Bypassing API)
* **Option B:** GraphQL API
* **Option C (Selected):** Resource-Oriented RESTful JSON API with Standardized Envelope and Error Schemas

---

## 4. Decision Outcome

**Chosen Option:** Option C — RESTful JSON API over HTTPS with strict Pydantic/TypeScript contract symmetry.

### Canonical Endpoint Topology:

```http
# Health & Status
GET    /api/health

# Campus & Live Conditions
GET    /api/campus/locations
GET    /api/campus/conditions               # Canonical aggregated conditions (occupancy + connectivity)
GET    /api/campus/conditions/{locationId} # Granular location condition detail
GET    /api/campus/graph                    # Topology nodes and dependency edges

# Incidents
GET    /api/incidents
POST   /api/incidents
GET    /api/incidents/{id}
PATCH  /api/incidents/{id}
POST   /api/incidents/{id}/analyze          # Trigger blast-radius & impact analysis

# Recovery Planning & Simulation
GET    /api/incidents/{id}/recovery-plans   # List candidate plans
POST   /api/incidents/{id}/recovery-plans/generate
POST   /api/recovery-plans/{id}/simulate    # Counterfactual simulation
POST   /api/recovery-plans/{id}/approve     # Operator approval

# AI Explanation
POST   /api/ai/explain                      # Grounded operational explanation
```

### Standard Success Response Envelope:

```json
{
  "data": { ... },
  "meta": {
    "requestId": "req_01h8x9p4k2",
    "timestamp": "2026-10-07T12:00:00.000Z",
    "dataMode": "live",
    "cached": false
  }
}
```

### Standard Error Response Envelope:

```json
{
  "error": {
    "code": "CAMPUS_DATA_UNAVAILABLE",
    "message": "Campus conditions are temporarily unavailable. Please retry shortly.",
    "requestId": "req_01h8x9p4k2",
    "details": {
      "locationId": "loc_library_01",
      "retryAfterSeconds": 30
    }
  }
}
```

### Conventions:
* **Timestamps:** ISO 8601 UTC format (`YYYY-MM-DDTHH:mm:ss.sssZ`).
* **Pagination:** Standard cursor or limit/offset (`limit=20&offset=0`).
* **HTTP Codes:** 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable Entity, 500 Internal Server Error, 503 Service Unavailable.

---

## 5. Consequences

### Positive:
* **Predictable Client Consumption:** Frontend client handles loading, errors, and metadata in a centralized fetch client interceptor.
* **Elimination of Redundant Endpoints:** One canonical `/api/campus/conditions` endpoint fulfills live condition feeds, preventing split-brain metrics.
* **Safe Error Propagation:** Error codes allow internationalization and structured client display without exposing internal stack traces.

### Negative / Tradeoffs:
* Requires maintaining Pydantic schemas in FastAPI alongside TypeScript interfaces in `packages/shared`.
* Slight payload overhead due to envelope metadata wrapping.

---

## 6. Compliance and Verification

* Contract validation tests in `tests/backend/` assert that every route returns payloads adhering to the `ApiResponseEnvelope` or `ApiErrorEnvelope` shape.
