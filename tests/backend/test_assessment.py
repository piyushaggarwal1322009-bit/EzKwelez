"""Integration and unit tests for Phase 5 Blast Radius + Impact Engine.

Golden test scenario uses the synthetic Ezy University dependency graph seeded in
InMemoryDependencyGraphRepository. Node IDs match that seed exactly.

Seed topology (relevant to blast radius test):
  n0000000-…-001 (Main Power Substation Grid B) [UTILITY, CRITICAL]
    -> n0000000-…-002 (Ramanujan Science Block B) [BUILDING, HIGH]
        -> n0000000-…-003 (Physics Main Lecture Hall B101) [ROOM, HIGH]
        -> n0000000-…-004 (Optics & Laser Physics Lab B201) [ROOM, HIGH]
            -> n0000000-…-005 (Precision Spectrometer Rig) [RESOURCE, HIGH]
                -> n0000000-…-006 (PHYS-101 Freshman Physics Practicum) [SERVICE, HIGH]
                    -> n0000000-…-007 (Undergraduate Lab Operations) [OPERATION, MEDIUM]

Depth-from-substation:
  depth 0 -> n001 (direct)
  depth 1 -> n002
  depth 2 -> n003, n004
  depth 3 -> n005
  depth 4 -> n006
  depth 5 -> n007
"""

import sys
from pathlib import Path

# Ensure apps/api is importable
api_path = Path(__file__).resolve().parent.parent.parent / "apps" / "api"
if str(api_path) not in sys.path:
    sys.path.insert(0, str(api_path))

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import get_development_principal, get_graph_repository, get_incident_repository
from app.application.assessment_service import (
    BlastRadiusEngine,
    ImpactScoringPolicy,
    AssessmentService,
)
from app.application.incident_service import IncidentApplicationService, IncidentNotFoundError
from app.domain.assessment.models import ImpactCategory
from app.domain.graph.models import (
    Criticality, DependencyEdge, DependencyGraph, DependencyNode, NodeStatus, NodeType, RelationshipType
)
from app.infrastructure.auth import DevelopmentPrincipal
from app.infrastructure.repositories.in_memory_graph_repository import InMemoryDependencyGraphRepository
from app.infrastructure.repositories.in_memory_incident_repository import InMemoryIncidentRepository
from app.main import app

# ---------------------------------------------------------------------------
# Test client with dev auth override
# ---------------------------------------------------------------------------

client = TestClient(app)
app.dependency_overrides[get_development_principal] = lambda: DevelopmentPrincipal("test-operator")


# ---------------------------------------------------------------------------
# Helper: build a minimal deterministic graph for unit tests
# ---------------------------------------------------------------------------

def _make_node(node_id: str, node_type: NodeType, name: str, criticality: Criticality = Criticality.HIGH) -> DependencyNode:
    return DependencyNode(id=node_id, type=node_type, name=name, criticality=criticality)


def _make_edge(edge_id: str, source: str, target: str, rel: RelationshipType = RelationshipType.FEEDS, criticality: Criticality = Criticality.HIGH) -> DependencyEdge:
    return DependencyEdge(id=edge_id, source_node_id=source, target_node_id=target, relationship=rel, criticality=criticality)


# ===========================================================================
# Unit Tests: BlastRadiusEngine
# ===========================================================================

class TestBlastRadiusEngine:

    def _make_linear_graph(self) -> DependencyGraph:
        """A → B → C → D (depth 0→3)."""
        nodes = {
            "A": _make_node("A", NodeType.UTILITY, "Power Source", Criticality.CRITICAL),
            "B": _make_node("B", NodeType.BUILDING, "Building", Criticality.HIGH),
            "C": _make_node("C", NodeType.RESOURCE, "Switch", Criticality.HIGH),
            "D": _make_node("D", NodeType.SERVICE, "WiFi", Criticality.MEDIUM),
        }
        edges = [
            _make_edge("e1", "A", "B"),
            _make_edge("e2", "B", "C"),
            _make_edge("e3", "C", "D"),
        ]
        graph = DependencyGraph(nodes=nodes, edges=edges)
        return graph

    def test_single_direct_entity_no_dependents(self):
        """Entity with no outgoing edges → blast radius is just itself."""
        nodes = {"X": _make_node("X", NodeType.SERVICE, "Isolated Service")}
        graph = DependencyGraph(nodes=nodes, edges=[])
        engine = BlastRadiusEngine()
        result = engine.traverse(graph, root_ids=["X"])
        assert len(result.direct_entities) == 1
        assert result.direct_entities[0].entity_id == "X"
        assert result.direct_entities[0].is_direct is True
        assert len(result.transitive_entities) == 0
        assert result.total_affected_count == 1
        assert result.maximum_depth == 0

    def test_linear_chain_depth_tracking(self):
        """A→B→C→D: starting from A, should produce B(depth=1), C(depth=2), D(depth=3)."""
        graph = self._make_linear_graph()
        engine = BlastRadiusEngine()
        result = engine.traverse(graph, root_ids=["A"])
        assert len(result.direct_entities) == 1
        assert result.direct_entities[0].entity_id == "A"
        assert len(result.transitive_entities) == 3

        by_id = {e.entity_id: e for e in result.transitive_entities}
        assert by_id["B"].depth == 1
        assert by_id["C"].depth == 2
        assert by_id["D"].depth == 3
        assert result.maximum_depth == 3
        assert result.total_affected_count == 4

    def test_direct_vs_transitive_distinguished(self):
        """Direct entities have is_direct=True, transitive have is_direct=False."""
        graph = self._make_linear_graph()
        engine = BlastRadiusEngine()
        result = engine.traverse(graph, root_ids=["A"])
        assert all(e.is_direct for e in result.direct_entities)
        assert all(not e.is_direct for e in result.transitive_entities)

    def test_cycle_protection_no_infinite_loop(self):
        """A→B→C→A (cycle): must terminate and not duplicate entities."""
        nodes = {
            "A": _make_node("A", NodeType.UTILITY, "A"),
            "B": _make_node("B", NodeType.BUILDING, "B"),
            "C": _make_node("C", NodeType.RESOURCE, "C"),
        }
        edges = [
            _make_edge("e1", "A", "B"),
            _make_edge("e2", "B", "C"),
            _make_edge("e3", "C", "A"),  # cycle back to root
        ]
        graph = DependencyGraph(nodes=nodes, edges=edges)
        engine = BlastRadiusEngine()
        result = engine.traverse(graph, root_ids=["A"])
        all_ids = [e.entity_id for e in result.direct_entities + result.transitive_entities]
        assert len(all_ids) == len(set(all_ids)), "Duplicate entities in blast radius (cycle protection failed)"
        assert len(all_ids) == 3  # A, B, C each exactly once

    def test_duplicate_path_entity_appears_once(self):
        """Two paths to same entity → entity appears exactly once."""
        nodes = {
            "ROOT": _make_node("ROOT", NodeType.UTILITY, "Root"),
            "PATH1": _make_node("PATH1", NodeType.BUILDING, "Path1"),
            "PATH2": _make_node("PATH2", NodeType.BUILDING, "Path2"),
            "DEST": _make_node("DEST", NodeType.SERVICE, "Destination"),
        }
        edges = [
            _make_edge("e1", "ROOT", "PATH1"),
            _make_edge("e2", "ROOT", "PATH2"),
            _make_edge("e3", "PATH1", "DEST"),
            _make_edge("e4", "PATH2", "DEST"),
        ]
        graph = DependencyGraph(nodes=nodes, edges=edges)
        engine = BlastRadiusEngine()
        result = engine.traverse(graph, root_ids=["ROOT"])
        all_ids = [e.entity_id for e in result.direct_entities + result.transitive_entities]
        dest_count = all_ids.count("DEST")
        assert dest_count == 1, f"DEST appeared {dest_count} times (should be 1)"

    def test_multiple_root_entities(self):
        """Two separate chains from two root entities."""
        nodes = {
            "R1": _make_node("R1", NodeType.UTILITY, "Root1"),
            "C1": _make_node("C1", NodeType.SERVICE, "Child1"),
            "R2": _make_node("R2", NodeType.UTILITY, "Root2"),
            "C2": _make_node("C2", NodeType.SERVICE, "Child2"),
        }
        edges = [
            _make_edge("e1", "R1", "C1"),
            _make_edge("e2", "R2", "C2"),
        ]
        graph = DependencyGraph(nodes=nodes, edges=edges)
        engine = BlastRadiusEngine()
        result = engine.traverse(graph, root_ids=["R1", "R2"])
        direct_ids = {e.entity_id for e in result.direct_entities}
        trans_ids = {e.entity_id for e in result.transitive_entities}
        assert direct_ids == {"R1", "R2"}
        assert trans_ids == {"C1", "C2"}
        assert result.total_affected_count == 4

    def test_empty_root_ids(self):
        """No root entities → empty blast radius."""
        graph = DependencyGraph(nodes={}, edges=[])
        engine = BlastRadiusEngine()
        result = engine.traverse(graph, root_ids=[])
        assert result.total_affected_count == 0
        assert result.maximum_depth == 0

    def test_max_depth_bound(self):
        """BFS stops at max_depth. With max_depth=1, only depth-1 entities are traversed."""
        graph = self._make_linear_graph()  # A→B→C→D
        engine = BlastRadiusEngine()
        result = engine.traverse(graph, root_ids=["A"], max_depth=1)
        all_ids = {e.entity_id for e in result.direct_entities + result.transitive_entities}
        assert "D" not in all_ids  # beyond max_depth=1
        assert "C" not in all_ids  # beyond max_depth=1
        assert "B" in all_ids       # exactly at depth 1

    def test_dependency_strength_preserved(self):
        """The dependency strength (criticality of edge) is preserved in transitive entities."""
        graph = self._make_linear_graph()
        engine = BlastRadiusEngine()
        result = engine.traverse(graph, root_ids=["A"])
        b_entity = next(e for e in result.transitive_entities if e.entity_id == "B")
        # The edge A→B has criticality=HIGH, which maps to Criticality.HIGH via _strength_to_criticality
        assert b_entity.dependency_strength is not None

    def test_unknown_root_id_skipped(self):
        """Unknown root IDs are silently skipped without crashing."""
        graph = DependencyGraph(nodes={}, edges=[])
        engine = BlastRadiusEngine()
        result = engine.traverse(graph, root_ids=["DOES_NOT_EXIST"])
        assert result.total_affected_count == 0


# ===========================================================================
# Unit Tests: ImpactScoringPolicy
# ===========================================================================

class TestImpactScoringPolicy:

    def _build_blast_with(self, entities) -> "BlastRadiusResult":
        from app.domain.assessment.models import BlastRadiusResult
        return BlastRadiusResult(
            direct_entities=[],
            transitive_entities=entities,
            total_affected_count=len(entities),
            maximum_depth=max((e.depth for e in entities), default=0),
        )

    def test_empty_blast_radius_minimal_score(self):
        """No affected entities → minimal impact."""
        from app.domain.assessment.models import BlastRadiusResult, AffectedEntity
        blast = BlastRadiusResult(
            direct_entities=[],
            transitive_entities=[],
            total_affected_count=0,
            maximum_depth=0,
        )
        policy = ImpactScoringPolicy()
        result = policy.calculate(blast)
        assert result.total_impact_score == 0
        assert result.impact_category == ImpactCategory.MINIMAL

    def test_critical_entities_raise_score(self):
        """Many critical service entities push score higher."""
        from app.domain.assessment.models import AffectedEntity, BlastRadiusResult
        entities = [
            AffectedEntity(
                entity_id=f"s{i}",
                entity_type="service",
                entity_name=f"Service {i}",
                entity_code=f"SVC-{i}",
                depth=1,
                is_direct=False,
                reason="transitive",
                criticality=Criticality.CRITICAL,
            )
            for i in range(5)
        ]
        blast = BlastRadiusResult(
            direct_entities=[],
            transitive_entities=entities,
            total_affected_count=5,
            maximum_depth=1,
        )
        policy = ImpactScoringPolicy()
        result = policy.calculate(blast)
        assert result.total_impact_score > 40  # at least MODERATE
        assert result.affected_services_count == 5

    def test_resources_and_services_counted(self):
        from app.domain.assessment.models import AffectedEntity, BlastRadiusResult
        entities = [
            AffectedEntity("r1", "resource", "R1", "R1", 1, False, reason="x", criticality=Criticality.MEDIUM),
            AffectedEntity("s1", "service",  "S1", "S1", 1, False, reason="x", criticality=Criticality.HIGH),
            AffectedEntity("s2", "service",  "S2", "S2", 2, False, reason="x", criticality=Criticality.LOW),
        ]
        blast = BlastRadiusResult(direct_entities=[], transitive_entities=entities, total_affected_count=3, maximum_depth=2)
        policy = ImpactScoringPolicy()
        result = policy.calculate(blast)
        assert result.affected_resources_count == 1
        assert result.affected_services_count == 2

    def test_deterministic_repeated_calculation(self):
        """Same blast radius → same result every time."""
        from app.domain.assessment.models import AffectedEntity, BlastRadiusResult
        entities = [
            AffectedEntity("x1", "service", "S", "S", 1, False, reason="r", criticality=Criticality.HIGH),
        ]
        blast = BlastRadiusResult(direct_entities=[], transitive_entities=entities, total_affected_count=1, maximum_depth=1)
        policy = ImpactScoringPolicy()
        r1 = policy.calculate(blast)
        r2 = policy.calculate(blast)
        assert r1.total_impact_score == r2.total_impact_score
        assert r1.impact_category == r2.impact_category

    def test_category_thresholds_are_deterministic(self):
        """Score categories map deterministically to thresholds documented in policy."""
        from app.application.assessment_service import _score_to_category
        assert _score_to_category(100) == ImpactCategory.CRITICAL
        assert _score_to_category(81)  == ImpactCategory.CRITICAL
        assert _score_to_category(80)  == ImpactCategory.HIGH
        assert _score_to_category(61)  == ImpactCategory.HIGH
        assert _score_to_category(60)  == ImpactCategory.MODERATE
        assert _score_to_category(41)  == ImpactCategory.MODERATE
        assert _score_to_category(40)  == ImpactCategory.LOW
        assert _score_to_category(21)  == ImpactCategory.LOW
        assert _score_to_category(20)  == ImpactCategory.MINIMAL
        assert _score_to_category(0)   == ImpactCategory.MINIMAL


# ===========================================================================
# Integration Test: Full API pipeline with seeded graph
# ===========================================================================

def test_blast_radius_and_assessment_e2e_golden():
    """
    GOLDEN TEST — Phase 5 End-to-End Assessment

    Uses the InMemoryDependencyGraphRepository seeded topology:
      n001 (Power Substation, UTILITY, CRITICAL) [root]
        → n002 (Science Block B, BUILDING, HIGH)      [depth 1]
            → n003 (Lecture Hall B101, ROOM, HIGH)    [depth 2]
            → n004 (Optics Lab B201, ROOM, HIGH)      [depth 2]
                → n005 (Spectrometer Rig, RESOURCE, HIGH) [depth 3]
                    → n006 (PHYS-101 Practicum, SERVICE, HIGH) [depth 4]
                        → n007 (Lab Operations, OPERATION, MEDIUM) [depth 5]

    Assertions check:
    - Exact direct entity
    - Minimum transitive entity count
    - Traversal depths
    - No duplicate entities
    - Score > 0
    - Impact category is not MINIMAL (6 downstream entities, several critical)
    """
    ROOT_NODE = "n0000000-0000-0000-0000-000000000001"

    # 1. Create the incident
    resp = client.post("/incidents", json={
        "title": "Power Substation Grid B Failure",
        "description": "Complete loss of power to Science Block B",
        "type": "power_outage",
        "severity": "critical",
        "rootNodeId": ROOT_NODE,
    })
    assert resp.status_code == 201, resp.text
    incident_id = resp.json()["data"]["id"]

    # 2. Attach the substation as directly affected entity
    resp = client.post(f"/incidents/{incident_id}/affected-entities", json={
        "nodeId": ROOT_NODE,
        "reason": "Power substation is the direct source of the outage",
    })
    assert resp.status_code == 201, resp.text

    # 3. Get assessment
    resp = client.get(f"/incidents/{incident_id}/assessment")
    assert resp.status_code == 200, resp.text
    data = resp.json()["data"]

    # --- Incident block ---
    assert data["incident"]["id"] == incident_id

    # --- Blast radius block ---
    blast = data["blastRadius"]
    direct = blast["directEntities"]
    transitive = blast["transitiveEntities"]

    # Exactly 1 direct entity: the substation
    assert len(direct) == 1
    assert direct[0]["entityId"] == ROOT_NODE
    assert direct[0]["isDirect"] is True
    assert direct[0]["depth"] == 0

    # At least 5 transitive entities (n002 through n006 minimum, n007 if depth allows)
    assert len(transitive) >= 5, f"Expected >= 5 transitive entities, got {len(transitive)}: {[e['entityId'] for e in transitive]}"

    # No duplicates
    all_ids = [e["entityId"] for e in direct] + [e["entityId"] for e in transitive]
    assert len(all_ids) == len(set(all_ids)), "Duplicate entities found in blast radius!"

    # Depth tracking: n002 must be at depth 1
    n002 = next((e for e in transitive if e["entityId"] == "n0000000-0000-0000-0000-000000000002"), None)
    assert n002 is not None, "n002 (Science Block B) not found in transitive entities"
    assert n002["depth"] == 1

    # n006 is a SERVICE at depth 4
    n006 = next((e for e in transitive if e["entityId"] == "n0000000-0000-0000-0000-000000000006"), None)
    assert n006 is not None, "n006 (PHYS-101 Practicum) not found"
    assert n006["entityType"] == "service"

    # Maximum depth ≥ 4 (substation→block→lab→rig→service = 4 hops)
    assert blast["maximumDepth"] >= 4

    # --- Impact block ---
    impact = data["impact"]
    assert impact["totalImpactScore"] > 0
    assert impact["impactCategory"] != "minimal"
    assert impact["affectedServicesCount"] >= 1
    assert impact["criticalDependencyCount"] >= 1
    # Explanation metadata present
    assert "scoring_policy" in impact["explanationMetadata"]


def test_assessment_incident_not_found():
    """Non-existent incident returns 404."""
    resp = client.get("/incidents/does-not-exist/assessment")
    assert resp.status_code == 404


def test_assessment_no_affected_entities():
    """Incident with zero affected entities → empty blast radius, minimal impact."""
    resp = client.post("/incidents", json={
        "title": "Test incident with no affected entities",
        "description": "Testing edge case",
        "type": "other",
        "severity": "low",
    })
    assert resp.status_code == 201, resp.text
    incident_id = resp.json()["data"]["id"]

    resp = client.get(f"/incidents/{incident_id}/assessment")
    assert resp.status_code == 200, resp.text
    data = resp.json()["data"]
    blast = data["blastRadius"]
    assert blast["totalAffectedCount"] == 0
    assert data["impact"]["impactCategory"] == "minimal"
    assert data["impact"]["totalImpactScore"] == 0
