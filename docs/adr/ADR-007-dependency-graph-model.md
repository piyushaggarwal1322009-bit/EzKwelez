# ADR-007: Dependency Graph Model & Invariants

- **Status:** Accepted
- **Deciders:** Ishu (System Architecture), Piyush (Backend), Tanisha (Frontend)
- **Date:** 2026-10-07
- **Technical Area:** Dependency Graph Architecture & Topology Modeling

---

## 1. Context and Problem Statement

EzyKwelez models a university campus not merely as isolated physical coordinates, but as an interconnected operational dependency graph (e.g., Power Substation $\rightarrow$ Building $\rightarrow$ Labs $\rightarrow$ Spectrometer Resource $\rightarrow$ Academic Class Session).

To perform deterministic blast-radius calculations and recovery planning, we must define the formal domain structure for vertices (`DependencyNode`), directed relationships (`DependencyEdge`), criticality scales, operational node statuses, and strict graph integrity invariants.

---

## 2. Decision Drivers

1. **Multi-Domain Topology:** Support physical structures (buildings, rooms), logical utilities (power, internet), specialized resources (spectrometers, fume hoods), and academic operations (lectures, labs) in a single unified graph.
2. **Decoupled Node State:** Node operational status (`operational`, `degraded`, `disrupted`, `failed`, `unknown`) must be decoupled from incident lifecycle status (`reported`, `active`, `resolved`).
3. **Graph Invariant Enforcement:** Self-dependencies ($A \rightarrow A$) and non-positive edge weights must be forbidden at the domain model level.
4. **Cycle Mitigation:** Real-world campus infrastructure can contain cyclic redundancies (e.g., dual-ring power feeds); traversal must detect and warn rather than crashing or infinitely looping.

---

## 3. Considered Options

* **Option A:** External Graph Database (Neo4j / Amazon Neptune)
* **Option B:** Relational Edge List in PostgreSQL + Pure In-Memory Python Graph Engine (NetworkX/BFS)
* **Option C:** Ad-hoc Parent-Child References inside Campus Location table

---

## 4. Decision Outcome

**Chosen Option:** Option B — Unified `DependencyNode` and `DependencyEdge` entities persisted in PostgreSQL and traversed via deterministic in-memory domain engines.

### Node Structure:
* `id`: Unique identifier.
* `type`: `NodeType` (`infrastructure`, `utility`, `network`, `building`, `room`, `service`, `system`, `resource`, `operation`).
* `status`: `NodeStatus` (`operational`, `degraded`, `disrupted`, `failed`, `unknown`).
* `criticality`: `Criticality` (`low`, `medium`, `high`, `critical`).
* `location_id`: Optional foreign key linking node to `CampusLocation`.

### Edge Structure:
* `source_node_id` & `target_node_id`: Explicit directed dependency endpoints.
* `relationship`: `RelationshipType` (`depends_on`, `supports`, `feeds`, `connects`, `hosts`, `serves`, `requires`, `alternative_to`).
* `criticality` & `weight`: Numeric propagation multipliers ($>0$).

---

## 5. Consequences

### Positive:
* **Zero Distributed DB Overhead:** Eliminates the complexity and hosting cost of a separate Neo4j cluster for MVP.
* **Sub-Millisecond Traversal:** In-memory DAG representation enables sub-millisecond propagation analysis.
* **Type-Safe Invariants:** Domain models enforce valid references, positive weights, and prevent self-referential loops.

### Negative / Tradeoffs:
* Extremely large multi-university graphs ($>100,000$ vertices) would eventually require specialized sparse matrix or graph DB engines in future phases.

---

## 6. Compliance and Verification

* Unit tests in `tests/backend/test_graph_domain.py` assert that self-dependencies and negative weights raise domain validation errors.
