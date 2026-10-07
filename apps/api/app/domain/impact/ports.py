"""Abstract ports for Graph Traversal and Impact Analysis services."""

from abc import ABC, abstractmethod
from typing import Optional
from app.domain.graph.models import DependencyGraph, DependencyNode
from app.domain.impact.models import FailureEvent, ImpactReport, TraversalPolicy, TraversalResult


class DependencyTraversalService(ABC):
    """Abstract port for graph traversal algorithms (BFS, DFS, Weighted)."""

    @abstractmethod
    def traverse(
        self,
        root_node: DependencyNode,
        graph: DependencyGraph,
        policy: TraversalPolicy,
    ) -> TraversalResult:
        """Traverse graph starting from root_node according to policy."""
        pass


class ImpactAnalysisEngine(ABC):
    """Abstract port for executing end-to-end failure impact evaluation."""

    @abstractmethod
    async def analyze_failure(
        self,
        failure: FailureEvent,
        policy: Optional[TraversalPolicy] = None,
    ) -> ImpactReport:
        """Evaluate downstream blast radius and construct structured ImpactReport."""
        pass
