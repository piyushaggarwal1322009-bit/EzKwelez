# EzyKwelez — Engineering Standards & Development Contract

**Document status:** Phase 1 — Locked baseline  
**Version:** 1.0  
**Audience:** Human developers + Antigravity coding agent  
**Purpose:** Prevent architectural drift, unsafe shortcuts, and AI-generated overengineering

---

## 1. Non-Negotiable Rule

> **Implement the simplest architecture that can correctly support the EzyKwelez decision loop.**

Do not add technology because it looks impressive in a hackathon.

Prefer a tested modular monolith over unnecessary distributed systems.

Prefer explicit domain logic over clever abstractions.

Prefer measured behavior over invented metrics.

---

## 2. SOLID Principles — Required

EzyKwelez must follow SOLID principles pragmatically. The purpose is maintainability, substitutability, testability, and clear responsibilities—not creating interfaces for every class.

Microsoft's guidance describes SOLID as Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion; Microsoft also describes dependency inversion as directing dependencies toward abstractions rather than implementation details. citeturn763248search12turn763248search13

### S — Single Responsibility Principle

A module/class/function should have one coherent reason to change.

Good:

```text
BlastRadiusCalculator
RecoveryPlanGenerator
ConstraintValidator
RecoveryOptimizer
SimulationRunner
```

Bad:

```text
CampusManager
```

if it contains authentication, database access, graph traversal, scoring, and LLM calls.

### O — Open/Closed Principle

Core behavior should be extensible without repeatedly modifying stable logic.

Examples:

- new incident types should plug into a stable incident abstraction;
- new AI providers should implement the AI provider contract;
- new optimization strategies should be composable without rewriting the entire recovery service.

Do not over-engineer for theoretical future requirements.

### L — Liskov Substitution Principle

Implementations of an abstraction must remain valid substitutes.

Example:

```text
AIProvider
   ├── ProviderA
   └── MockAIProvider
```

A mock provider used in tests must obey the same contract expected by the application service.

### I — Interface Segregation Principle

Prefer small, purpose-specific interfaces.

Good:

```text
CampusReader
IncidentReader
IncidentWriter
AIProvider
AuditWriter
```

Avoid:

```text
EverythingServiceInterface
```

unless the domain genuinely requires it.

### D — Dependency Inversion Principle

High-level domain/application logic must not depend directly on low-level SDKs.

Example:

```text
RecoveryOptimizer
     ↓
abstract repository / policy
     ↓
Supabase implementation
```

not:

```text
RecoveryOptimizer
     ↓
supabase.client.query(...)
```

This makes domain tests independent of Supabase and vendor SDKs.

---

## 3. Domain-Driven Boundaries

Keep these concerns separate:

```text
Campus
Incident
Dependency Graph
Impact
Recovery
Simulation
AI
Audit
```

If a change primarily affects one concern, it should not require editing unrelated modules.

---

## 4. Business Logic Rules

### Rule 1

No important business rule lives only in the frontend.

### Rule 2

No important business rule lives only in an LLM prompt.

### Rule 3

No core calculation should require a network call.

### Rule 4

The optimizer cannot select an invalid plan.

### Rule 5

Simulation must not silently mutate authoritative campus state.

### Rule 6

Every recommendation must be traceable to structured inputs.

---

## 5. Code Quality Rules

### Type safety

TypeScript should run with strict typing.

Python should use type hints on application/domain boundaries.

Avoid `any`, untyped dictionaries, and loosely structured payloads across major boundaries unless there is a documented reason.

### Naming

Names must communicate domain meaning.

Prefer:

```text
calculate_blast_radius()
validate_room_capacity()
rank_recovery_plans()
```

over:

```text
process_data()
handle_it()
runThing()
```

### Functions

Prefer small cohesive functions with explicit inputs and outputs.

### Comments

Comment **why**, not what.

Bad:

```text
# loop through rooms
```

Good:

```text
# Ignore already visited nodes so cyclic infrastructure dependencies cannot recurse forever.
```

---

## 6. Testing Standard

The following components must have unit tests:

- dependency graph traversal;
- cycle handling;
- blast-radius calculation;
- impact scoring;
- candidate generation;
- constraint validation;
- optimization/ranking;
- simulation isolation;
- authorization logic where practical;
- AI context construction;
- AI provider fallback behavior.

Integration tests should cover:

- authentication;
- protected API routes;
- core incident workflow;
- database operations;
- recovery plan approval.

End-to-end tests should cover the primary demo path when practical.

---

## 7. Test Data Rules

Synthetic data must be deterministic for tests.

Use stable fixtures/factories such as:

```text
small campus
primary demo campus
conflict-heavy campus
no-recovery-option scenario
```

Tests must not depend on the presence of a live LLM or production database unless explicitly marked as integration tests.

---

## 8. Security Standards

Follow OWASP API Security principles. The OWASP API Security Top 10 includes risks such as Broken Object Level Authorization, Broken Authentication, Broken Object Property Level Authorization, Unrestricted Resource Consumption, Broken Function Level Authorization, Security Misconfiguration, Improper Inventory Management, and Unsafe Consumption of APIs. citeturn763248search1

### Required controls

- server-side authentication checks;
- object-level authorization checks for ID-based access;
- role/function authorization;
- request validation;
- sane resource limits for expensive operations;
- no secret values in frontend bundles;
- no service-role keys in browser code;
- safe handling of third-party API output;
- explicit CORS configuration;
- production debug endpoints disabled or protected;
- documented API inventory.

Supabase Auth and RLS should work together. Supabase recommends enabling RLS on exposed application tables and validating policies with allow/deny tests. citeturn692117search1turn692117search2

---

## 9. Privacy Standard

MVP policy:

> **Do not track individual student movement.**

Use:

- synthetic identities;
- cohort-level counts;
- aggregate occupancy;
- room/building counts;
- de-identified operational data.

Do not create a feature that depends on collecting sensitive location histories from individual students.

---

## 10. AI Engineering Contract

### AI is not authoritative

The deterministic engine owns:

```text
counts
scores
constraints
graph traversal
optimization
simulation outcomes
```

AI owns:

```text
explanation
summarization
natural-language querying
communication wording
```

### AI input

Construct a structured context object.

Do not concatenate arbitrary database dumps into a prompt.

### AI output

Prefer structured JSON/schema validation before converting to UI text.

### AI failure

If AI fails:

```text
Core analysis: works
AI explanation: unavailable
```

Never fake an AI result.

### Prompt management

Keep system prompts and domain instructions versioned in code or dedicated configuration files. Do not bury critical business logic in prompts.

---

## 11. Database Standards

- schema changes go through migrations;
- seed data is reproducible;
- foreign keys enforce important relationships;
- indexes are added for demonstrated access paths;
- status values are explicit;
- timestamps use a consistent timezone strategy;
- RLS policies are version-controlled;
- test important allow/deny paths.

Supabase's current RLS documentation explicitly recommends enabling RLS on exposed tables and testing select/insert/update/delete policies for anonymous and authenticated roles. citeturn692117search2

---

## 12. API Standards

Use:

- clear resource-oriented routes;
- Pydantic schemas for FastAPI input/output;
- consistent error responses;
- pagination where a collection can grow;
- filtering/sorting only where useful;
- rate/resource controls around expensive simulations and AI calls.

Do not expose raw database rows as the application's public contract.

---

## 13. Git Standards

### Branches

Use focused branches such as:

```text
main
phase/01-foundation
phase/02-auth-db
phase/03-campus-model
...
```

Feature branches may be created beneath a phase when useful.

### Commits

Prefer descriptive commits:

```text
feat: add dependency graph traversal
feat: add blast radius analysis
fix: prevent cyclic graph traversal
refactor: isolate recovery optimizer
```

Avoid:

```text
update
changes
final
final2
working
```

### Pull/merge discipline

Before merging a phase:

- tests pass;
- lint/type checks pass;
- README/docs reflect major changes;
- secrets are absent;
- no unfinished placeholders remain in critical paths.

---

## 14. Environment Management

Use `.env.example` with variable names and descriptions only.

Never commit:

```text
API keys
service-role keys
JWT secrets
passwords
private database URLs
```

Separate public browser variables from server-only variables.

---

## 15. Error and Logging Standards

Errors should be structured and safe.

Logs should include:

```text
request_id
operation
actor_id when appropriate
entity_id
status
latency
```

Do not log:

- secrets;
- tokens;
- full authorization headers;
- unnecessary student personal data;
- raw AI credentials.

---

## 16. Performance Standards

Do not optimize prematurely.

First make behavior correct.

For expensive work:

- avoid repeated graph traversal where one traversal can be reused;
- avoid N+1 database access patterns;
- bound simulation size;
- keep optimization inputs compact;
- do not send raw large datasets to an LLM.

---

## 17. Frontend Engineering Rules

- feature/domain organization over page-only organization;
- reusable UI primitives;
- typed API client;
- centralized error handling;
- no business logic hidden in JSX expressions;
- no direct secret-bearing API calls from the browser;
- avoid duplicated fetch logic;
- optimistic UI only when failure recovery is safe.

---

## 18. Antigravity Instructions

Antigravity must:

1. read all Phase 1 project documents before creating or modifying architecture;
2. preserve the product scope;
3. prefer existing project patterns over introducing libraries;
4. explain any architectural deviation before implementing it;
5. not silently change the database model because a shortcut is easier;
6. not invent APIs, integrations, or data sources that do not exist;
7. create tests for non-trivial domain logic;
8. follow SOLID principles pragmatically;
9. keep business logic outside route handlers and UI components;
10. keep AI isolated behind an adapter;
11. keep simulated data clearly identifiable;
12. never commit secrets;
13. never use a hardcoded fake result where a real engine calculation is required;
14. keep the demo path stable while building new features.

---

## 19. Definition of Engineering Done

A feature is not considered complete merely because the UI renders.

A feature is complete when:

```text
Requirement understood
      ↓
Domain behavior implemented
      ↓
Validation implemented
      ↓
Authorization considered
      ↓
Persistence integrated if required
      ↓
API exposed cleanly
      ↓
UI connected
      ↓
Tests added
      ↓
Error states handled
      ↓
Documentation updated
```

---

## 20. Sources / Engineering References

- Microsoft Learn — SOLID principles and practical implications: https://learn.microsoft.com/en-us/archive/msdn-magazine/2014/may/csharp-best-practices-dangers-of-violating-solid-principles-in-csharp
- Microsoft Learn — architectural dependency inversion: https://learn.microsoft.com/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles
- OWASP API Security Top 10: https://owasp.org/www-project-api-security/
- Supabase Auth: https://supabase.com/docs/guides/auth
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Next.js documentation: https://nextjs.org/docs
- Render FastAPI deployment documentation: https://render.com/docs/deploy-fastapi
