# ADR-005: AI Explanation Boundary & Deterministic Source of Truth

- **Status:** Accepted
- **Deciders:** Ishu (System Architecture), Piyush (Backend), Tanisha (Frontend)
- **Date:** 2026-10-07
- **Technical Area:** AI Architecture, Operational Safety & Grounding

---

## 1. Context and Problem Statement

Generative AI and Large Language Models (LLMs) are exceptionally proficient at natural language synthesis, complex query interpretation, and executive summarization. However, LLMs suffer from non-determinism, hallucinations, and unreliability when performing graph traversal, capacity math, or constraint solving.

In campus continuity operations, a single hallucinated room capacity or invented power link could direct hundreds of students into an occupied or hazardous room during an emergency.

We must establish the exact operational boundary for AI in EzyKwelez: what the deterministic engine owns versus what the AI layer is permitted to do.

---

## 2. Decision Drivers

1. **Safety and Reliability:** Operational decisions (room moves, outage blast radius, resource allocation) must be 100% deterministic and mathematically sound.
2. **Auditability:** Operators must be able to inspect the exact mathematical factors that generated a recommendation.
3. **Graceful Degradation:** If the LLM provider is down, rate-limited, or misconfigured, the entire core platform (incident analysis, optimization, approval, simulation) must continue operating seamlessly.
4. **Data Minimization:** No unnecessary PII or unbounded database dumps should be transmitted to third-party LLM APIs.

---

## 3. Considered Options

* **Option A:** Autonomous Agentic AI (LLM makes operational decisions and writes directly to database)
* **Option B:** No AI (Purely static tables and formula displays)
* **Option C (Selected):** Engine-First, AI-Grounded Explanation Architecture

---

## 4. Decision Outcome

**Chosen Option:** Option C — The deterministic backend engine is the sole source of truth. The AI layer acts strictly as a read-only translator and summarizer of structured engine facts.

```text
               ┌─────────────────────────────────────────┐
               │          Deterministic Engine           │
               │  • Graph Traversal (NetworkX/Python)    │
               │  • Constraint Validation                │
               │  • Blast Radius & Impact Scores         │
               │  • Multi-Objective Plan Optimization   │
               └────────────────────┬────────────────────┘
                                    │
                                    │ Structured Fact Context (JSON)
                                    ▼
               ┌─────────────────────────────────────────┐
               │           AI Explanation Layer          │
               │  • Natural language synthesis           │
               │  • Grounded narrative explanations      │
               │  • Operator Q&A on verified facts       │
               │  • Read-only, zero database mutation    │
               └─────────────────────────────────────────┘
```

### Strict Rules of Engagement:

1. **AI NEVER Decides:** The AI model is strictly prohibited from ranking recovery plans, calculating blast radius, or approving interventions.
2. **Strict Context Grounding:** The backend compiles a minimal, verified `AnalysisContext` payload containing only calculated metrics, affected IDs, and top-ranked plans. The system prompt instructs the model to cite only numbers present in the context.
3. **No Direct Database Writes:** The AI service has zero write credentials or mutations to the PostgreSQL database.
4. **Provider Abstraction:** The AI service interacts with an abstract `AIProvider` interface. If OpenAI/Anthropic/Gemini fails, the system returns structured fallback text without failing the primary API request.

---

## 5. Consequences

### Positive:
* **Zero Hallucination Danger:** Decisions are backed by unit-tested deterministic code.
* **100% High Availability:** Primary campus operations remain fully functional during cloud LLM outages.
* **Cost & Latency Efficiency:** Expensive LLM tokens are consumed only on-demand when an operator requests a natural language summary or asks a specific question.

### Negative / Tradeoffs:
* The backend team must maintain comprehensive structured context generators to feed rich data to the LLM.
* AI cannot dynamically create novel recovery heuristics outside what the optimization engine generates.

---

## 6. Compliance and Verification

* Unit tests assert that the core incident analysis and recovery generation work when `AIProvider` is completely disabled or throws exceptions.
* Evaluation tests ensure system prompts enforce factual grounding.
