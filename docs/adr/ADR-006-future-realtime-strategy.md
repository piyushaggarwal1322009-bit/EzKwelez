# ADR-006: Real-Time Communication Strategy & Evolution Roadmap

- **Status:** Accepted
- **Deciders:** Ishu (System Architecture), Piyush (Backend), Tanisha (Frontend)
- **Date:** 2026-10-07
- **Technical Area:** Client-Server Communication, Polling & Real-Time Sync

---

## 1. Context and Problem Statement

Campus conditions (occupancy fluctuations, Wi-Fi connectivity dips) and incident states (outage reported, recovery plan approved) change over time. Operators in a command center and students viewing live class status benefit from fresh information.

However, introducing full bidirectional WebSocket infrastructure or complex event brokers (Kafka/RabbitMQ/Redis PubSub) prematurely introduces connection management overhead, stateful server scaling complexities, firewall traversal issues, and increased infrastructure costs.

We must define the real-time strategy for Phase 1 MVP and articulate a clear architectural extension path for Phase 2 and beyond.

---

## 2. Decision Drivers

1. **Simplicity and Reliability:** The MVP must be robust, easy to deploy on Render + Vercel, and function reliably behind corporate/university proxies.
2. **Resource Efficiency:** Avoid persistent idle WebSocket connection costs on free/starter cloud tiers.
3. **Smooth Evolution:** Ensure frontend API client abstractions can transition from polling to push notifications without rewriting UI components.
4. **Bandwidth Optimization:** Avoid transmitting heavy payloads when campus conditions have not changed.

---

## 3. Technology Evaluation

| Mechanism | Latency | Complexity | Scalability on Serverless/Render | Best Used For |
| :--- | :--- | :--- | :--- | :--- |
| **Controlled Polling (SWR/React Query)** | Low-Medium (5-15s) | Lowest | High (Stateless HTTP/Cacheable) | **Phase 1 MVP Baseline** |
| **Server-Sent Events (SSE)** | Low (<500ms) | Low-Medium | High (Unidirectional HTTP Stream) | **Phase 2 AI Streaming & Incident Alerts** |
| **Supabase Realtime (Postgres CDC)** | Low (<500ms) | Low | Managed (Supabase handles sockets) | **Phase 2 Multi-Operator Collaboration** |
| **Custom WebSockets (FastAPI WS)** | Ultra-low (<100ms) | High | Requires Stateful Instances/Redis | Specialized high-frequency IoT streaming |

---

## 4. Decision Outcome

**Chosen Strategy:** Phased Evolution Strategy.

### Phase 1 (MVP Baseline):
* **Frontend:** Controlled, jittered polling via SWR/React Query on live campus condition endpoints (`/api/campus/conditions`) with 10–15s refresh intervals while the browser tab is focused.
* **Backend:** Fast, indexed database queries with HTTP `Cache-Control` / ETag validation to return `304 Not Modified` when snapshots have not changed.

### Phase 2 (Real-Time Push Extensions):
* **AI Output Streaming:** Server-Sent Events (`GET /api/ai/stream`) for streaming long-form explanations token-by-token.
* **Collaborative Command Center:** Supabase Realtime subscriptions on the `incidents` and `recovery_plans` tables for instantaneous operator synchronization when multiple staff manage an incident simultaneously.

---

## 5. Architectural Extension Point & Interface

The frontend client encapsulates real-time updates inside a custom hook interface:

```typescript
// Abstraction allows swapping polling for SSE/Supabase Realtime under the hood
export function useLiveCampusConditions(options?: { refreshIntervalMs?: number }) {
  // Currently implements SWR polling; easily swapped to Supabase Realtime channel in Phase 2
  return useConditionsStore();
}
```

---

## 6. Consequences

### Positive:
* **Zero Infrastructure Overhead for MVP:** Runs seamlessly on standard serverless/container platforms without stateful socket session managers.
* **Deterministic Behavior:** Eliminates socket reconnect, zombie connection, and heartbeat timeout bugs during critical hackathon evaluations.
* **Clear Migration Path:** The architecture anticipates and isolates the upgrade path.

### Negative / Tradeoffs:
* 5–10 second propagation delay for live condition changes in MVP (well within the acceptable tolerance for physical campus building movement).

---

## 7. Compliance and Verification

* Frontend integration tests verify that polling intervals pause when the window is out of focus.
* Backend route benchmarks confirm `GET /api/campus/conditions` executes in < 50ms for cached/indexed reads.
