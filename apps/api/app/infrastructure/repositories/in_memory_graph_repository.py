"""In-memory implementation of DependencyGraphRepository pre-seeded with synthetic topology."""

from typing import Dict, List, Optional
from app.domain.graph.models import (
    Criticality,
    DependencyEdge,
    DependencyGraph,
    DependencyNode,
    NodeStatus,
    NodeType,
    RelationshipType,
)
from app.domain.graph.ports import DependencyGraphRepository


class InMemoryDependencyGraphRepository(DependencyGraphRepository):
    """In-memory graph repository populated with primary demo scenario dependencies."""

    def __init__(
        self,
        nodes: Optional[List[DependencyNode]] = None,
        edges: Optional[List[DependencyEdge]] = None,
    ):
        if nodes is not None:
            self._nodes = {n.id: n for n in nodes}
        else:
            self._nodes = self._init_default_nodes()

        if edges is not None:
            self._edges = list(edges)
        else:
            self._edges = self._init_default_edges()

    def _init_default_nodes(self) -> Dict[str, DependencyNode]:
        node_list = [
            DependencyNode(
                id="n0000000-0000-0000-0000-000000000001",
                type=NodeType.UTILITY,
                name="Main Power Substation Grid B",
                status=NodeStatus.OPERATIONAL,
                criticality=Criticality.CRITICAL,
                location_id="b0000000-0000-0000-0000-000000000002",
                metadata={"substation": "Grid-B-Primary", "feeder": "KV-33"},
            ),
            DependencyNode(
                id="n0000000-0000-0000-0000-000000000002",
                type=NodeType.BUILDING,
                name="Ramanujan Science Block B Structure",
                status=NodeStatus.OPERATIONAL,
                criticality=Criticality.HIGH,
                location_id="b0000000-0000-0000-0000-000000000002",
            ),
            DependencyNode(
                id="n0000000-0000-0000-0000-000000000003",
                type=NodeType.ROOM,
                name="Physics Main Lecture Hall B101",
                status=NodeStatus.OPERATIONAL,
                criticality=Criticality.HIGH,
                location_id="r0000000-0000-0000-0000-000000000001",
            ),
            DependencyNode(
                id="n0000000-0000-0000-0000-000000000004",
                type=NodeType.ROOM,
                name="Optics & Laser Physics Lab B201",
                status=NodeStatus.OPERATIONAL,
                criticality=Criticality.HIGH,
                location_id="r0000000-0000-0000-0000-000000000003",
            ),
            DependencyNode(
                id="n0000000-0000-0000-0000-000000000005",
                type=NodeType.RESOURCE,
                name="Precision Spectrometer Rig",
                status=NodeStatus.OPERATIONAL,
                criticality=Criticality.HIGH,
                location_id="r0000000-0000-0000-0000-000000000003",
            ),
            DependencyNode(
                id="n0000000-0000-0000-0000-000000000006",
                type=NodeType.SERVICE,
                name="PHYS-101 Freshman Physics Practicum",
                status=NodeStatus.OPERATIONAL,
                criticality=Criticality.HIGH,
                location_id="r0000000-0000-0000-0000-000000000003",
            ),
            DependencyNode(
                id="n0000000-0000-0000-0000-000000000007",
                type=NodeType.OPERATION,
                name="Undergraduate Lab Operations",
                status=NodeStatus.OPERATIONAL,
                criticality=Criticality.MEDIUM,
            ),
            DependencyNode(
                id="n0000000-0000-0000-0000-000000000008",
                type=NodeType.ROOM,
                name="Multi-Purpose Seminar Hall C204",
                status=NodeStatus.OPERATIONAL,
                criticality=Criticality.MEDIUM,
                location_id="r0000000-0000-0000-0000-000000000009",
            ),
        ]
        return {n.id: n for n in node_list}

    def _init_default_edges(self) -> List[DependencyEdge]:
        return [
            DependencyEdge(
                id="e0000000-0000-0000-0000-000000000001",
                source_node_id="n0000000-0000-0000-0000-000000000001",  # Power Substation
                target_node_id="n0000000-0000-0000-0000-000000000002",  # Block B
                relationship=RelationshipType.FEEDS,
                criticality=Criticality.CRITICAL,
                weight=1.0,
            ),
            DependencyEdge(
                id="e0000000-0000-0000-0000-000000000002",
                source_node_id="n0000000-0000-0000-0000-000000000002",  # Block B
                target_node_id="n0000000-0000-0000-0000-000000000003",  # Lecture Hall B101
                relationship=RelationshipType.HOSTS,
                criticality=Criticality.HIGH,
                weight=1.0,
            ),
            DependencyEdge(
                id="e0000000-0000-0000-0000-000000000003",
                source_node_id="n0000000-0000-0000-0000-000000000002",  # Block B
                target_node_id="n0000000-0000-0000-0000-000000000004",  # Optics Lab B201
                relationship=RelationshipType.HOSTS,
                criticality=Criticality.HIGH,
                weight=1.0,
            ),
            DependencyEdge(
                id="e0000000-0000-0000-0000-000000000004",
                source_node_id="n0000000-0000-0000-0000-000000000004",  # Optics Lab B201
                target_node_id="n0000000-0000-0000-0000-000000000005",  # Spectrometer Rig
                relationship=RelationshipType.REQUIRES,
                criticality=Criticality.HIGH,
                weight=1.0,
            ),
            DependencyEdge(
                id="e0000000-0000-0000-0000-000000000005",
                source_node_id="n0000000-0000-0000-0000-000000000005",  # Spectrometer Rig
                target_node_id="n0000000-0000-0000-0000-000000000006",  # PHYS-101 Practicum
                relationship=RelationshipType.SERVES,
                criticality=Criticality.HIGH,
                weight=1.0,
            ),
            DependencyEdge(
                id="e0000000-0000-0000-0000-000000000006",
                source_node_id="n0000000-0000-0000-0000-000000000006",  # PHYS-101 Practicum
                target_node_id="n0000000-0000-0000-0000-000000000007",  # Lab Operations
                relationship=RelationshipType.SUPPORTS,
                criticality=Criticality.MEDIUM,
                weight=1.0,
            ),
        ]

    async def get_node_by_id(self, node_id: str) -> Optional[DependencyNode]:
        return self._nodes.get(node_id)

    async def list_nodes(self) -> List[DependencyNode]:
        return list(self._nodes.values())

    async def get_edges(self, node_id: str, direction: str = "outgoing") -> List[DependencyEdge]:
        if direction == "incoming":
            return [e for e in self._edges if e.target_node_id == node_id]
        return [e for e in self._edges if e.source_node_id == node_id]

    async def list_edges(self) -> List[DependencyEdge]:
        return list(self._edges)

    async def get_graph(self) -> DependencyGraph:
        return DependencyGraph(nodes=dict(self._nodes), edges=list(self._edges))
