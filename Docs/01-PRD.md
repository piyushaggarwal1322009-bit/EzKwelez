# EzyKwelez — Product Requirements Document (PRD)

**Document status:** Phase 1 — Locked baseline  
**Product:** EzyKwelez  
**Product type:** Campus disruption-response and recovery decision system  
**Primary audience:** Campus operations/admin teams  
**Secondary audience:** Students affected by operational disruptions  
**Version:** 1.0

---

## 1. Executive Summary

EzyKwelez is a campus operations intelligence platform designed to answer one high-value question:

> **When something goes wrong on campus, what else will be affected, and what is the best way to recover?**

The product models a campus as a dependency network connecting infrastructure, buildings, rooms, academic activities, resources, and people. When an incident is introduced—such as a power outage, network outage, room closure, gate closure, or severe weather scenario—the system traces the dependency graph, calculates the incident's blast radius and operational impact, generates feasible recovery plans, simulates those plans, and recommends the best intervention.

EzyKwelez is intentionally **not** a complaint portal, generic campus chatbot, generic dashboard, or autonomous control system.

Its differentiator is the closed decision loop:

```text
Incident
  -> Dependency traversal
  -> Blast radius
  -> Impact analysis
  -> Recovery candidates
  -> Constraint validation
  -> Simulation
  -> Optimization
  -> Recommended intervention
  -> Explainable decision
```

The hackathon MVP will use a realistic, fully connected **synthetic campus dataset** so the system can demonstrate the full workflow without claiming access to real campus infrastructure or personally identifiable movement data.

---

## 2. Problem Statement

College campuses are interconnected operational systems. A disruption to one component can cascade into academic, infrastructure, logistical, and student-level consequences.

Typical systems focus on individual incidents:

- report an outage;
- close a room;
- send an announcement;
- move a class manually;
- ask staff to find an alternative.

The missing layer is **dependency-aware response planning**.

An operator needs to know:

1. What directly failed?
2. What depends on it?
3. How many rooms, classes, resources, staff, and students are affected?
4. How severe is the disruption?
5. What valid recovery options exist?
6. Which option creates the least total disruption?
7. Why is that option better than the alternatives?

EzyKwelez exists to answer those questions in one workflow.

---

## 3. Product Vision

> **Turn campus disruption response from reactive coordination into explainable, dependency-aware decision support.**

Long-term, EzyKwelez can expand beyond education to other complex facilities such as large corporate campuses, hospitals, event venues, and multi-building institutions. That expansion is intentionally outside the hackathon MVP.

---

## 4. Product Principles

### 4.1 Engine first, AI second

The source of truth for facts, counts, constraints, scores, and simulation outcomes is the deterministic application engine. The AI layer explains and queries those trusted outputs; it must not fabricate operational facts.

### 4.2 Explain every important decision

Any major score or recommendation must expose the factors that produced it.

### 4.3 Optimize for disruption reduction

Recovery plans are evaluated against measurable objectives such as students displaced, time lost, resource conflicts, and travel burden.

### 4.4 Simulation is not reality

Demo scenarios are clearly labelled as simulated. The product must never present synthetic data as live campus telemetry.

### 4.5 Privacy by design

The MVP does not track individual student locations. Any crowd or impact estimate uses aggregate counts or synthetic data.

### 4.6 Human-in-the-loop

EzyKwelez recommends. A responsible operator approves and applies a recovery plan.

### 4.7 Professional simplicity

The product should feel like an operational command product, not a collection of hackathon widgets.

---

## 5. Target Users

### Primary — Campus Operator / Administrator

Responsible for facilities, academic operations, event operations, or incident coordination.

**Goals:**
- understand impact quickly;
- compare recovery options;
- act before disruption spreads;
- retain a record of decisions;
- communicate the resulting change clearly.

### Secondary — Student

A student who needs an authoritative view of how a disruption affects their class or location.

**Goals:**
- know whether a disruption affects them;
- know the updated room or action;
- understand the reason without seeing internal operational details.

### Future users — Out of MVP scope

- Facilities manager
- Event coordinator
- Security team
- Academic scheduler
- Multi-campus administrator

---

## 6. Primary Use Cases

### UC-01 — Simulate an infrastructure failure

An operator selects a building and triggers a power outage with a duration. EzyKwelez calculates downstream dependencies and displays the blast radius.

### UC-02 — Analyze a live-style incident

An operator creates a structured incident and sees affected entities, severity, and estimated disruption. For the MVP, this can be a manually entered scenario.

### UC-03 — Generate recovery plans

The system identifies alternative rooms/resources and creates feasible plans respecting capacity, equipment, timetable, and other constraints.

### UC-04 — Compare recovery strategies

The operator compares multiple plans using the same measurable objective function.

### UC-05 — Simulate an intervention

The operator runs a counterfactual scenario to see expected results before applying the plan.

### UC-06 — Understand a recommendation

The operator asks the AI Operations Analyst why a plan was selected and receives an explanation grounded in structured engine outputs.

### UC-07 — View student-facing impact

A student sees an affected class and the confirmed recovery action without exposure to confidential operational data.

---

## 7. Hackathon MVP Scope

### Included

- Supabase authentication;
- Student and Operator roles;
- Synthetic campus dataset;
- Campus buildings, rooms, resources, classes, events, and dependencies;
- Structured incident creation;
- Dependency graph traversal;
- Blast-radius calculation;
- Transparent impact/severity calculation;
- Recovery plan generation;
- Constraint validation;
- Recovery plan scoring/optimization;
- Counterfactual simulation;
- Interactive campus visualization;
- Operator command center;
- Student incident/status view;
- AI explanation/query layer;
- Audit trail for major operator actions;
- Production deployment to Vercel + Render + Supabase.

### Explicitly excluded from MVP

- Real IoT/sensor integrations;
- Facial recognition;
- Individual GPS tracking;
- automatic physical control of infrastructure;
- autonomous schedule changes without human approval;
- training a bespoke ML model on real student data;
- mobile native apps;
- multi-institution SaaS billing;
- complex 3D digital-twin rendering;
- computer-vision crowd counting.

These may be future integrations, not MVP dependencies.

---

## 8. Core Demo Scenario

The primary demonstration scenario is:

> **A 90-minute power outage makes Building B unavailable during a high-load academic period.**

The seeded campus should contain enough realistic structure to produce a non-trivial chain of consequences.

Illustrative chain:

```text
Power outage
    -> Building B
    -> 6–8 affected rooms
    -> 3–5 scheduled classes/labs
    -> required equipment unavailable
    -> affected students/faculty
    -> disruption severity HIGH
    -> alternative rooms identified
    -> several valid recovery plans
    -> optimizer recommends one
    -> simulation shows reduced impact
```

The exact counts must come from seeded data and the actual engine, not hardcoded presentation text.

---

## 9. Differentiation

EzyKwelez should differentiate on the following technical/product combination:

1. **Dependency-aware blast radius** instead of isolated incident tickets.
2. **Constraint-aware recovery planning** instead of generic AI suggestions.
3. **Counterfactual simulation** instead of static analytics.
4. **Optimization of interventions** instead of only prediction.
5. **Explainable recommendations** instead of opaque AI outputs.

The product should not claim that any individual underlying technique is globally novel. The defensible hackathon differentiation is the focused integration and working end-to-end workflow.

---

## 10. Success Metrics for the MVP

### Product metrics

- Operator can create an incident in <= 30 seconds.
- Blast-radius result appears in <= 2 seconds for the seeded campus.
- At least 3 valid recovery plans can be produced for the primary scenario.
- The optimizer selects a plan with a measurable improvement over the baseline.
- Every recommendation exposes at least 3 contributing reasons.
- Student-facing impact is updated after an approved recovery plan.

### Engineering metrics

- Backend unit tests cover graph traversal, impact scoring, constraint validation, and optimizer logic.
- No business-critical calculations are performed only in the frontend.
- AI responses are grounded in structured engine context.
- Secrets are absent from source control.
- Protected API endpoints enforce authorization server-side.

### Demo metrics

The primary judge flow must work from a clean deployment:

```text
Login
 -> Open operator command center
 -> Create outage
 -> View blast radius
 -> Compare recovery plans
 -> Run simulation
 -> Apply/approve best plan
 -> Show before/after impact
 -> Ask AI why it chose the plan
```

---

## 11. Non-Goals

EzyKwelez is not intended to become a general-purpose ERP, attendance system, campus social network, helpdesk, navigation application, or generic AI assistant.

Features are rejected from the MVP when they do not strengthen the incident -> impact -> intervention -> simulation -> decision loop.

---

## 12. Product Constraints

- Use the agreed stack: Next.js + TypeScript + Tailwind for web, FastAPI for backend, Supabase for Auth/Postgres, Vercel for frontend deployment, Render for backend deployment.
- The backend remains the authority for business rules.
- The database schema must be reproducible through migrations/seed data.
- The product must work with synthetic campus data without requiring paid infrastructure.
- Any external AI provider must be abstracted behind a backend interface/adapter.

---

## 13. Future Direction

Potential post-MVP extensions:

- live occupancy integrations;
- timetable integrations;
- weather feeds;
- IoT building telemetry;
- automated incident ingestion;
- predictive pre-incident warnings;
- multi-campus benchmarking;
- learned calibration of impact models;
- integrations with campus communication systems.

These are intentionally not part of the first build.

---

## 14. Reference Principles

- SOLID principles are mandatory engineering guidance for maintainable components; see `05-ENGINEERING-STANDARDS.md`.
- Security decisions should be informed by the OWASP API Security Top 10, especially object-level authorization, authentication, unrestricted resource consumption, function-level authorization, security configuration, inventory management, and safe third-party API consumption.

---

## 15. Definition of Product Done

The MVP is considered product-complete when a judge can independently observe this end-to-end behavior on the deployed application:

> **A structured campus disruption is created, its dependency-driven blast radius is computed from real application data, multiple feasible recovery strategies are generated and scored, a counterfactual simulation shows measurable impact reduction, the operator approves a plan, and the AI can explain the decision using the system's structured facts.**

That is the product. Anything else is supporting infrastructure or polish.
