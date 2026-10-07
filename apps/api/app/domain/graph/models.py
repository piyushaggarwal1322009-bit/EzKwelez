"""Dependency Graph Domain Entities, Value Objects, and Graph Invariants."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional


class NodeType(str, Enum):
    INFRASTRUCTURE = "infrastructure"
    UTILITY = "utility"
    NETWORK = "network"
    BUILDING = "building"
    ROOM = "room"
    SERVICE = "service"
    SYSTEM = "system"
    RESOURCE = "resource"
    OPERATION = "operation"


class RelationshipType(str, Enum):
    DEPENDS_ON = "depends_on"
    SUPPORTS = "supports"
    FEEDS = "feeds"
    CONNECTS = "connects"
    HOSTS = "hosts"
    SERVES = "serves"
    REQUIRES = "requires"
    ALTERNATIVE_TO = "alternative_to"


class Criticality(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class NodeStatus(str, Enum):
    """Operational Node State (Decoupled from Incident Lifecycle)."""
    OPERATIONAL = "operational"
    DEGRADED = "degraded"
    DISRUPTED = "disrupted"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"
    FAILED = "failed"
    UNKNOWN = "unknown"


@dataclass(frozen=True)
class DependencyNode:
    """Represents a discrete functional entity, resource, or service in the campus graph."""
    id: str
    type: NodeType
    name: str
    status: NodeStatus = NodeStatus.OPERATIONAL
    criticality: Criticality = Criticality.MEDIUM
    location_id: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    campus_id: Optional[str] = None

    def __post_init__(self):
        if not self.id or not self.id.strip():
            raise ValueError("DependencyNode id cannot be empty.")
        if not self.name or not self.name.strip():
            raise ValueError("DependencyNode name cannot be empty.")


@dataclass(frozen=True)
class DependencyEdge:
    """Represents a directed dependency or supporting relationship between two graph nodes."""
    id: str
    source_node_id: str
    target_node_id: str
    relationship: RelationshipType
    direction: str = "directed"
    criticality: Criticality = Criticality.MEDIUM
    weight: float = 1.0
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def __post_init__(self):
        if not self.id or not self.id.strip():
            raise ValueError("DependencyEdge id cannot be empty.")
        if self.source_node_id == self.target_node_id:
            raise ValueError(f"Self-dependencies are forbidden: node '{self.source_node_id}' cannot depend on itself.")
        if self.weight <= 0:
            raise ValueError(f"Edge weight must be positive, got {self.weight}")


@dataclass(frozen=True)
class DependencyGraph:
    """Represents a connected subgraph or full topology snapshot."""
    nodes: Dict[str, DependencyNode]
    edges: List[DependencyEdge]

    def get_outgoing_edges(self, node_id: str) -> List[DependencyEdge]:
        """Get all edges originating from node_id (nodes that depend on or are fed by this node)."""
        return [edge for edge in self.edges if edge.source_node_id == node_id]

    def get_incoming_edges(self, node_id: str) -> List[DependencyEdge]:
        """Get all edges pointing to node_id."""
        return [edge for edge in self.edges if edge.target_node_id == node_id]
