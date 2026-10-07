"""Abstract ports for Dependency Graph repository and Campus context provider."""

from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.graph.models import DependencyEdge, DependencyGraph, DependencyNode


class DependencyGraphRepository(ABC):
    """Abstract port for querying and persisting dependency graph topology."""

    @abstractmethod
    async def get_node_by_id(self, node_id: str) -> Optional[DependencyNode]:
        """Fetch a single node by its unique ID."""
        pass

    @abstractmethod
    async def list_nodes(self) -> List[DependencyNode]:
        """List all registered dependency nodes."""
        pass

    @abstractmethod
    async def get_edges(self, node_id: str, direction: str = "outgoing") -> List[DependencyEdge]:
        """Get edges for a specific node (outgoing = downstream dependents, incoming = upstream providers)."""
        pass

    @abstractmethod
    async def list_edges(self) -> List[DependencyEdge]:
        """List all registered dependency edges."""
        pass

    @abstractmethod
    async def get_graph(self) -> DependencyGraph:
        """Fetch the complete graph topology snapshot."""
        pass


class CampusContextProvider(ABC):
    """Abstract port enabling the Graph/Impact domain to query campus context without direct DB coupling."""

    @abstractmethod
    async def get_location_name(self, location_id: str) -> Optional[str]:
        """Resolve a location ID to human-readable facility name."""
        pass

    @abstractmethod
    async def get_location_occupancy(self, location_id: str) -> Optional[int]:
        """Fetch current occupant headcount for a location."""
        pass

    @abstractmethod
    async def is_campus_data_stale(self, threshold_minutes: int = 15) -> bool:
        """Check if underlying campus telemetry is stale."""
        pass
