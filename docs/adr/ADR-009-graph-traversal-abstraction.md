# ADR-009: Graph Traversal Abstraction & Traversal Policy

- **Status:** Accepted
- **Deciders:** Ishu (System Architecture), Piyush (Backend), Tanisha (Frontend)
- **Date:** 2026-10-07
- **Technical Area:** Algorithmic Abstraction & Graph Traversal

---

## 1. Context and Problem Statement

Graph traversal requirements vary depending on use cases:
- Impact Analysis requires downstream BFS walk up to depth 5–6.
- Upstream Root-Cause Analysis requires reverse incoming edge traversal.
- Simulation What-If Drills may filter by specific relationship types or minimum criticality.

Hardcoding a specific traversal algorithm directly inside application services creates tight coupling and prevents introducing optimized graph algorithms (e.g. Dijkstra, DFS, Weighted Criticality Propagation) later.

---

## 2. Decision Outcome

**Chosen Option:** Define the `DependencyTraversalService` port interface decoupled from the concrete algorithm, parameterized via an explicit `TraversalPolicy`.

### Policy Contract (`TraversalPolicy`):
```python
@dataclass(frozen=True)
class TraversalPolicy:
    max_depth: int = 5
    allowed_relationships: Optional[List[RelationshipType]] = None
    minimum_criticality: Optional[Criticality] = None
    include_degraded: bool = True
    stop_at_failed: bool = False
```

### Abstraction Port:
```python
class DependencyTraversalService(ABC):
    @abstractmethod
    def traverse(
        self,
        root_node: DependencyNode,
        graph: DependencyGraph,
        policy: TraversalPolicy,
    ) -> TraversalResult:
        pass
```

### Baseline Implementation:
* `BreadthFirstTraversalService`: Implements BFS with queue-based depth tracking, visited-set loop prevention, and cycle path logging.

---

## 3. Consequences

### Positive:
* **Extensibility:** Allows introducing Weighted Criticality algorithms or GPU-accelerated traversals without changing `ImpactAnalysisService`.
* **Configurable Boundary:** Callers can limit traversal depth to prevent runaway graph walks.
