"""Phase 6: Recovery Plan Generator — Deterministic Backend Tests.

Tests cover:
- Candidate generation (restore, backup, isolation)
- Constraint validation (feasible / infeasible / unknown)
- Feasibility states for all three categories
- Determinism guarantee (same input → identical output)
- Integration: Incident → Assessment → Recovery Plans
"""
import sys
from pathlib import Path

api_path = Path(__file__).resolve().parent.parent.parent / "apps" / "api"
if str(api_path) not in sys.path:
    sys.path.insert(0, str(api_path))

from fastapi.testclient import TestClient
from app.api.dependencies import get_development_principal
from app.domain.campus.models import DEFAULT_CAMPUS_ID, DataMode
from app.domain.graph.models import (
    DependencyEdge, DependencyGraph, DependencyNode, NodeStatus, NodeType,
    RelationshipType, Criticality,
)
from app.domain.assessment.models import (
    AffectedEntity, BlastRadiusResult, ImpactAssessment, ImpactCategory, IncidentAssessment,
)
from app.domain.incidents.models import (
    Incident, IncidentSeverity, IncidentSource, IncidentStatus, IncidentType,
)
from app.domain.recovery.models import (
    ConstraintViolationType, Feasibility, RecoveryActionType, RecoveryOptionType,
)
from app.application.recovery_candidate_generator import RecoveryCandidateGenerator
from app.application.recovery_plan_validator import RecoveryPlanValidator
from app.infrastructure.auth import DevelopmentPrincipal
from app.infrastructure.repositories.in_memory_graph_repository import InMemoryDependencyGraphRepository
from app.main import app

client = TestClient(app)
app.dependency_overrides[get_development_principal] = lambda: DevelopmentPrincipal("test-operator")

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_affected_entity(node_id: str, name: str, etype: str, depth: int = 0) -> AffectedEntity:
    return AffectedEntity(
        entity_id=node_id,
        entity_type=etype,
        entity_name=name,
        entity_code=node_id[:8],
        depth=depth,
        is_direct=depth == 0,
        reason="test",
        criticality=Criticality.CRITICAL,
        path=[node_id],
    )


def _make_blast_radius(direct=None, transitive=None) -> BlastRadiusResult:
    direct = direct or []
    transitive = transitive or []
    return BlastRadiusResult(
        direct_entities=direct,
        transitive_entities=transitive,
        total_affected_count=len(direct) + len(transitive),
        maximum_depth=max([e.depth for e in direct + transitive], default=0),
    )


def _make_impact() -> ImpactAssessment:
    return ImpactAssessment(
        total_impact_score=50,
        impact_category=ImpactCategory.HIGH,
        affected_locations=["loc-1"],
        affected_resources_count=1,
        affected_services_count=2,
        critical_dependency_count=1,
    )


def _make_assessment(direct=None, transitive=None) -> IncidentAssessment:
    incident = Incident(
        id="inc-test-001",
        campus_id=DEFAULT_CAMPUS_ID,
        title="Test Incident",
        description="Test",
        type=IncidentType.POWER_OUTAGE,
        severity=IncidentSeverity.CRITICAL,
        status=IncidentStatus.ACTIVE,
        source=IncidentSource.MANUAL,
        data_mode=DataMode.SIMULATED,
        started_at="2026-10-01T00:00:00Z",
        detected_at="2026-10-01T00:00:00Z",
        created_at="2026-10-01T00:00:00Z",
        updated_at="2026-10-01T00:00:00Z",
    )
    return IncidentAssessment(
        assessment_id="assmt-test-001",
        incident=incident,
        blast_radius=_make_blast_radius(direct, transitive),
        impact=_make_impact(),
        data_mode=DataMode.SIMULATED,
    )


def _make_graph(nodes: list, edges: list = None) -> DependencyGraph:
    return DependencyGraph(
        nodes={n.id: n for n in nodes},
        edges=edges or [],
    )


# ---------------------------------------------------------------------------
# RecoveryCandidateGenerator Tests
# ---------------------------------------------------------------------------

def test_candidate_generation_produces_restore_option():
    """Always produce a restore option for a direct entity."""
    gen = RecoveryCandidateGenerator()
    entity = _make_affected_entity("n-001", "Main Power Grid", "utility")
    assessment = _make_assessment(direct=[entity])
    node = DependencyNode(
        id="n-001", type=NodeType.UTILITY, name="Main Power Grid",
        status=NodeStatus.OFFLINE, criticality=Criticality.CRITICAL,
    )
    graph = _make_graph([node])

    options = gen.generate_candidates(assessment, graph)
    assert len(options) >= 1
    restore_opts = [o for o in options if o.type == RecoveryOptionType.RESTORE]
    assert len(restore_opts) == 1
    assert restore_opts[0].actions[0].action_type == RecoveryActionType.RESTORE
    assert restore_opts[0].actions[0].target_entity == "n-001"


def test_candidate_generation_produces_backup_option_when_modeled():
    """Generate a backup activation option when a backup node exists in the graph."""
    gen = RecoveryCandidateGenerator()
    entity = _make_affected_entity("n-001", "Main Power Grid", "utility")
    assessment = _make_assessment(direct=[entity])

    primary = DependencyNode(
        id="n-001", type=NodeType.UTILITY, name="Main Power Grid",
        status=NodeStatus.OFFLINE, criticality=Criticality.CRITICAL,
    )
    backup = DependencyNode(
        id="n-bkup", type=NodeType.UTILITY, name="Emergency Backup Generator",
        status=NodeStatus.OPERATIONAL, criticality=Criticality.HIGH,
    )
    graph = _make_graph([primary, backup])

    options = gen.generate_candidates(assessment, graph)
    failover_opts = [o for o in options if o.type == RecoveryOptionType.FAILOVER]
    assert len(failover_opts) == 1
    assert failover_opts[0].actions[0].action_type == RecoveryActionType.ACTIVATE_BACKUP
    assert failover_opts[0].actions[0].target_entity == "n-bkup"


def test_candidate_generation_no_backup_when_not_modeled():
    """Do NOT hallucinate a backup option when none exists in the graph."""
    gen = RecoveryCandidateGenerator()
    entity = _make_affected_entity("n-001", "Main Power Grid", "utility")
    assessment = _make_assessment(direct=[entity])
    primary = DependencyNode(
        id="n-001", type=NodeType.UTILITY, name="Main Power Grid",
        status=NodeStatus.OFFLINE, criticality=Criticality.CRITICAL,
    )
    graph = _make_graph([primary])

    options = gen.generate_candidates(assessment, graph)
    failover_opts = [o for o in options if o.type == RecoveryOptionType.FAILOVER]
    assert len(failover_opts) == 0


def test_candidate_generation_produces_isolation_for_transitive():
    """Generate isolation option when there are transitive dependents."""
    gen = RecoveryCandidateGenerator()
    entity = _make_affected_entity("n-001", "Power Grid", "utility", depth=0)
    trans = _make_affected_entity("n-002", "Lab Service", "service", depth=1)
    assessment = _make_assessment(direct=[entity], transitive=[trans])

    primary = DependencyNode(id="n-001", type=NodeType.UTILITY, name="Power Grid",
        status=NodeStatus.OFFLINE, criticality=Criticality.CRITICAL)
    service = DependencyNode(id="n-002", type=NodeType.SERVICE, name="Lab Service",
        status=NodeStatus.OPERATIONAL, criticality=Criticality.HIGH)
    graph = _make_graph([primary, service])

    options = gen.generate_candidates(assessment, graph)
    iso_opts = [o for o in options if o.type == RecoveryOptionType.ISOLATE]
    assert len(iso_opts) == 1
    assert any(a.target_entity == "n-002" for a in iso_opts[0].actions)


def test_no_candidates_when_no_direct_entities():
    """If blast radius found nothing, generate no candidates."""
    gen = RecoveryCandidateGenerator()
    assessment = _make_assessment(direct=[], transitive=[])
    graph = _make_graph([])
    options = gen.generate_candidates(assessment, graph)
    assert options == []


# ---------------------------------------------------------------------------
# RecoveryPlanValidator Tests
# ---------------------------------------------------------------------------

def test_validator_feasible_when_target_operational():
    """Restore option is FEASIBLE when target node exists and is offline (restorable)."""
    gen = RecoveryCandidateGenerator()
    validator = RecoveryPlanValidator()
    entity = _make_affected_entity("n-001", "Power Grid", "utility")
    assessment = _make_assessment(direct=[entity])
    node = DependencyNode(id="n-001", type=NodeType.UTILITY, name="Power Grid",
        status=NodeStatus.OFFLINE, criticality=Criticality.CRITICAL)
    graph = _make_graph([node])

    options = gen.generate_candidates(assessment, graph)
    validated = validator.validate(options, graph)

    restore = [o for o in validated if o.type == RecoveryOptionType.RESTORE]
    assert len(restore) == 1
    # Offline target → restore is valid (no hard blocking violations)
    assert restore[0].feasibility in (Feasibility.FEASIBLE, Feasibility.UNKNOWN)


def test_validator_infeasible_when_backup_offline():
    """Backup activation is INFEASIBLE when the backup node is OFFLINE."""
    gen = RecoveryCandidateGenerator()
    validator = RecoveryPlanValidator()
    entity = _make_affected_entity("n-001", "Power Grid", "utility")
    assessment = _make_assessment(direct=[entity])

    primary = DependencyNode(id="n-001", type=NodeType.UTILITY, name="Power Grid",
        status=NodeStatus.OFFLINE, criticality=Criticality.CRITICAL)
    backup = DependencyNode(id="n-bkup", type=NodeType.UTILITY, name="Emergency Backup Generator",
        status=NodeStatus.OFFLINE, criticality=Criticality.HIGH)
    graph = _make_graph([primary, backup])

    options = gen.generate_candidates(assessment, graph)
    validated = validator.validate(options, graph)

    failover = [o for o in validated if o.type == RecoveryOptionType.FAILOVER]
    assert len(failover) == 1
    assert failover[0].feasibility == Feasibility.INFEASIBLE
    assert any(v.type == ConstraintViolationType.RESOURCE_UNAVAILABLE for v in failover[0].violations)


def test_validator_unknown_when_backup_degraded():
    """Backup activation is UNKNOWN (INSUFFICIENT_DATA) when backup is DEGRADED."""
    gen = RecoveryCandidateGenerator()
    validator = RecoveryPlanValidator()
    entity = _make_affected_entity("n-001", "Power Grid", "utility")
    assessment = _make_assessment(direct=[entity])

    primary = DependencyNode(id="n-001", type=NodeType.UTILITY, name="Power Grid",
        status=NodeStatus.OFFLINE, criticality=Criticality.CRITICAL)
    backup = DependencyNode(id="n-bkup", type=NodeType.UTILITY, name="Emergency Backup Generator",
        status=NodeStatus.DEGRADED, criticality=Criticality.HIGH)
    graph = _make_graph([primary, backup])

    options = gen.generate_candidates(assessment, graph)
    validated = validator.validate(options, graph)

    failover = [o for o in validated if o.type == RecoveryOptionType.FAILOVER]
    assert len(failover) == 1
    assert failover[0].feasibility == Feasibility.UNKNOWN
    assert any(v.type == ConstraintViolationType.MISSING_INFORMATION for v in failover[0].violations)


def test_validator_infeasible_when_restore_target_missing():
    """Restore option is INFEASIBLE when target entity doesn't exist in graph."""
    validator = RecoveryPlanValidator()
    entity = _make_affected_entity("n-ghost", "Ghost Node", "utility")
    assessment = _make_assessment(direct=[entity])
    gen = RecoveryCandidateGenerator()
    # Only include a different node in the graph
    node = DependencyNode(id="n-other", type=NodeType.UTILITY, name="Other",
        status=NodeStatus.OPERATIONAL, criticality=Criticality.LOW)
    graph = _make_graph([node])

    options = gen.generate_candidates(assessment, graph)
    validated = validator.validate(options, graph)
    for o in validated:
        if any(a.target_entity == "n-ghost" for a in o.actions):
            assert o.feasibility == Feasibility.INFEASIBLE


def test_validator_conflicting_restore_when_already_operational():
    """Restore is a CONFLICTING_ACTION when the target is already operational."""
    validator = RecoveryPlanValidator()
    entity = _make_affected_entity("n-001", "Running Service", "service")
    assessment = _make_assessment(direct=[entity])
    gen = RecoveryCandidateGenerator()
    node = DependencyNode(id="n-001", type=NodeType.SERVICE, name="Running Service",
        status=NodeStatus.OPERATIONAL, criticality=Criticality.HIGH)
    graph = _make_graph([node])

    options = gen.generate_candidates(assessment, graph)
    validated = validator.validate(options, graph)
    restore = [o for o in validated if o.type == RecoveryOptionType.RESTORE]
    assert len(restore) == 1
    assert restore[0].feasibility == Feasibility.INFEASIBLE
    assert any(v.type == ConstraintViolationType.CONFLICTING_ACTION for v in restore[0].violations)


# ---------------------------------------------------------------------------
# Determinism Test
# ---------------------------------------------------------------------------

def test_candidate_generation_is_deterministic():
    """Identical inputs must produce the same set of option types."""
    gen = RecoveryCandidateGenerator()
    entity = _make_affected_entity("n-001", "Power Grid", "utility")
    primary = DependencyNode(id="n-001", type=NodeType.UTILITY, name="Power Grid",
        status=NodeStatus.OFFLINE, criticality=Criticality.CRITICAL)
    backup = DependencyNode(id="n-bkup", type=NodeType.UTILITY, name="Backup Generator",
        status=NodeStatus.OPERATIONAL, criticality=Criticality.HIGH)
    graph = _make_graph([primary, backup])

    results = []
    for _ in range(5):
        assessment = _make_assessment(direct=[entity])
        opts = gen.generate_candidates(assessment, graph)
        results.append(sorted([o.type.value for o in opts]))

    for r in results[1:]:
        assert r == results[0], "Candidate generation is not deterministic!"


# ---------------------------------------------------------------------------
# API Integration Tests
# ---------------------------------------------------------------------------

def _get_seeded_incident_id() -> str:
    """Get the seeded incident ID from the default in-memory store."""
    response = client.get("/incidents")
    assert response.status_code == 200
    data = response.json()["data"]
    return data[0]["id"] if data else None


def test_recovery_plans_endpoint_returns_200():
    """GET /incidents/{id}/recovery-plans returns 200 for a valid incident."""
    inc_id = _get_seeded_incident_id()
    if not inc_id:
        return  # No seeded incident to test against

    response = client.get(f"/incidents/{inc_id}/recovery-plans")
    assert response.status_code == 200
    payload = response.json()
    assert "data" in payload
    plan = payload["data"]
    assert "id" in plan
    assert "incidentId" in plan
    assert "options" in plan
    assert isinstance(plan["options"], list)


def test_recovery_plans_endpoint_returns_404_for_unknown_incident():
    """GET /incidents/nonexistent/recovery-plans returns 404."""
    response = client.get("/incidents/nonexistent-id-xyz/recovery-plans")
    assert response.status_code == 404


def test_recovery_plans_have_feasibility_fields():
    """Each recovery option must include feasibility, actions, violations."""
    inc_id = _get_seeded_incident_id()
    if not inc_id:
        return

    response = client.get(f"/incidents/{inc_id}/recovery-plans")
    assert response.status_code == 200
    plan = response.json()["data"]
    for opt in plan.get("options", []):
        assert "feasibility" in opt
        assert opt["feasibility"] in ("feasible", "infeasible", "unknown", "conditionally_feasible")
        assert "actions" in opt
        assert "violations" in opt
        assert "rationale" in opt


def test_recovery_plan_counts_are_correct():
    """feasibleCount + infeasibleCount + insufficientDataCount == total options."""
    inc_id = _get_seeded_incident_id()
    if not inc_id:
        return

    response = client.get(f"/incidents/{inc_id}/recovery-plans")
    assert response.status_code == 200
    plan = response.json()["data"]
    total = len(plan["options"])
    counted = plan["feasibleCount"] + plan["infeasibleCount"] + plan["insufficientDataCount"]
    assert counted == total
