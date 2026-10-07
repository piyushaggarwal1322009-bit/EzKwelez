"""Unit tests for Dependency Graph domain models and invariants."""

import sys
from pathlib import Path
import pytest

# Add apps/api to Python path
api_path = Path(__file__).resolve().parent.parent.parent / "apps" / "api"
if str(api_path) not in sys.path:
    sys.path.insert(0, str(api_path))

from app.domain.graph.models import (
    Criticality,
    DependencyEdge,
    DependencyGraph,
    DependencyNode,
    NodeStatus,
    NodeType,
    RelationshipType,
)


def test_dependency_node_creation():
    """Verify DependencyNode dataclass instantiation and default status."""
    node = DependencyNode(
        id="n_power_01",
        type=NodeType.UTILITY,
        name="Main Power Substation",
        criticality=Criticality.CRITICAL,
    )
    assert node.id == "n_power_01"
    assert node.type == NodeType.UTILITY
    assert node.status == NodeStatus.OPERATIONAL
    assert node.criticality == Criticality.CRITICAL


def test_dependency_node_empty_id_rejected():
    """Verify empty node ID raises ValueError."""
    with pytest.raises(ValueError, match="id cannot be empty"):
        DependencyNode(id="", type=NodeType.ROOM, name="Test Room")


def test_self_dependency_edge_rejected():
    """Verify self-dependency (Node A -> Node A) is strictly rejected."""
    with pytest.raises(ValueError, match="Self-dependencies are forbidden"):
        DependencyEdge(
            id="edge_invalid",
            source_node_id="node_a",
            target_node_id="node_a",
            relationship=RelationshipType.DEPENDS_ON,
        )


def test_edge_weight_positive_invariant():
    """Verify non-positive edge weights raise ValueError."""
    with pytest.raises(ValueError, match="Edge weight must be positive"):
        DependencyEdge(
            id="edge_01",
            source_node_id="node_a",
            target_node_id="node_b",
            relationship=RelationshipType.SUPPORTS,
            weight=0.0,
        )


def test_graph_incoming_outgoing_edges():
    """Verify DependencyGraph helper methods for query resolution."""
    n1 = DependencyNode(id="n1", type=NodeType.UTILITY, name="Grid")
    n2 = DependencyNode(id="n2", type=NodeType.BUILDING, name="Block B")
    n3 = DependencyNode(id="n3", type=NodeType.ROOM, name="Lab B201")

    e1 = DependencyEdge(id="e1", source_node_id="n1", target_node_id="n2", relationship=RelationshipType.FEEDS)
    e2 = DependencyEdge(id="e2", source_node_id="n2", target_node_id="n3", relationship=RelationshipType.HOSTS)

    graph = DependencyGraph(nodes={"n1": n1, "n2": n2, "n3": n3}, edges=[e1, e2])

    outgoing_n1 = graph.get_outgoing_edges("n1")
    assert len(outgoing_n1) == 1
    assert outgoing_n1[0].target_node_id == "n2"

    incoming_n3 = graph.get_incoming_edges("n3")
    assert len(incoming_n3) == 1
    assert incoming_n3[0].source_node_id == "n2"
