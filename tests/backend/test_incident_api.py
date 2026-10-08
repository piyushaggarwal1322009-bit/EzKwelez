"""Integration tests for Incident Management API routes."""

import sys
from pathlib import Path

# Add apps/api to Python path
api_path = Path(__file__).resolve().parent.parent.parent / "apps" / "api"
if str(api_path) not in sys.path:
    sys.path.insert(0, str(api_path))

from fastapi.testclient import TestClient
from app.api.dependencies import (
    get_development_principal,
    get_graph_repository,
    get_incident_repository,
)
from app.config import Settings
from app.domain.campus.models import DEFAULT_CAMPUS_ID
from app.domain.graph.models import DependencyNode, NodeType
from app.domain.incidents.models import Incident, IncidentSeverity, IncidentSource, IncidentStatus, IncidentType
from app.infrastructure.repositories.in_memory_incident_repository import InMemoryIncidentRepository
from app.infrastructure.repositories.in_memory_graph_repository import InMemoryDependencyGraphRepository
from app.infrastructure.auth import DevelopmentPrincipal, resolve_development_principal
from app.main import app

client = TestClient(app)
app.dependency_overrides[get_development_principal] = lambda: DevelopmentPrincipal("test-operator")


def test_list_incidents_success():
    response = client.get("/incidents")
    assert response.status_code == 200
    payload = response.json()
    assert "data" in payload
    assert "meta" in payload
    assert isinstance(payload["data"], list)
    assert len(payload["data"]) >= 1
    ids = [inc["id"] for inc in payload["data"]]
    assert "inc-00000000-0000-0000-0000-000000000001" in ids


def test_create_incident_and_lifecycle_transitions():
    # 1. Create incident
    create_payload = {
        "title": "HVAC Chiller Unit Overheating",
        "description": "Chiller 2 cooling capacity dropped drastically in Block C.",
        "type": "equipment_failure",
        "severity": "high",
        "source": "monitoring",
        "status": "reported",
        "locationId": "b0000000-0000-0000-0000-000000000002",
        "rootNodeId": "n0000000-0000-0000-0000-000000000001",
        "dataMode": "simulated",
    }
    create_res = client.post("/incidents", json=create_payload)
    assert create_res.status_code == 201
    inc_data = create_res.json()["data"]
    inc_id = inc_data["id"]
    assert inc_data["title"] == "HVAC Chiller Unit Overheating"
    assert inc_data["status"] == "reported"

    # 2. Transition REPORTED -> TRIAGED
    trans_res = client.post(
        f"/incidents/{inc_id}/transitions",
        json={"targetStatus": "triaged", "actorId": "dispatcher_01", "message": "Assigning technician."},
    )
    assert trans_res.status_code == 200
    assert trans_res.json()["data"]["status"] == "triaged"

    # 3. Invalid Transition TRIAGED -> RESOLVED (must be rejected)
    invalid_res = client.post(
        f"/incidents/{inc_id}/transitions",
        json={"targetStatus": "resolved"},
    )
    assert invalid_res.status_code == 400
    assert invalid_res.json()["detail"]["error"]["code"] == "INVALID_STATUS_TRANSITION"

    # 4. Check audit log updates
    updates_res = client.get(f"/incidents/{inc_id}/updates")
    assert updates_res.status_code == 200
    updates_data = updates_res.json()["data"]
    assert len(updates_data) >= 2
    assert updates_data[0]["type"] == "created"
    assert updates_data[1]["type"] == "status_changed"
    assert updates_data[1]["createdBy"] == "test-operator"

    # 5. Check Impact Analysis Handoff contract
    handoff_res = client.get(f"/incidents/{inc_id}/impact-handoff")
    assert handoff_res.status_code == 200
    handoff_data = handoff_res.json()["data"]
    assert handoff_data["incidentId"] == inc_id
    assert handoff_data["rootNodeId"] == "n0000000-0000-0000-0000-000000000001"
    assert handoff_data["failureType"] == "failure"
    assert handoff_data["severity"] == "high"


def test_incident_idempotency():
    idempotency_key = "idemp-unique-req-999"
    create_payload = {
        "title": "Idempotency Test Incident",
        "description": "Checking duplicate request handling.",
        "type": "network_outage",
        "severity": "low",
    }
    res1 = client.post(
        "/incidents",
        json=create_payload,
        headers={"Idempotency-Key": idempotency_key},
    )
    assert res1.status_code == 201
    id1 = res1.json()["data"]["id"]

    # Duplicate request with same Idempotency-Key
    res2 = client.post(
        "/incidents",
        json=create_payload,
        headers={"Idempotency-Key": idempotency_key},
    )
    assert res2.status_code == 201
    id2 = res2.json()["data"]["id"]
    assert id1 == id2


def test_get_incident_not_found():
    res = client.get("/incidents/inc-non-existent")
    assert res.status_code == 404
    assert res.json()["detail"]["error"]["code"] == "INCIDENT_NOT_FOUND"


def _create_active_campus_incident(title: str, incident_type: str) -> str:
    created = client.post(
        f"/campuses/{DEFAULT_CAMPUS_ID}/incidents",
        json={
            "title": title,
            "description": "Explicit campus state test incident.",
            "type": incident_type,
            "severity": "high",
        },
    )
    assert created.status_code == 201
    incident_id = created.json()["data"]["id"]
    for target_status in ("triaged", "active"):
        transitioned = client.post(
            f"/incidents/{incident_id}/transitions",
            json={"targetStatus": target_status},
        )
        assert transitioned.status_code == 200
    return incident_id


def test_campus_incident_ownership_and_affected_entity_validation():
    created = client.post(
        f"/campuses/{DEFAULT_CAMPUS_ID}/incidents",
        json={
            "title": "Duration validation incident",
            "description": "A duration-bearing campus incident.",
            "type": "network_outage",
            "severity": "info",
            "campusId": "c0000000-0000-0000-0000-000000000099",
            "estimatedDurationMinutes": 90,
        },
    )
    assert created.status_code == 201
    incident = created.json()["data"]
    assert incident["campusId"] == DEFAULT_CAMPUS_ID
    assert incident["estimatedDurationMinutes"] == 90

    incident_id = incident["id"]
    relationship_url = f"/incidents/{incident_id}/affected-entities"
    relationship_payload = {
        "nodeId": "n0000000-0000-0000-0000-000000000008",
        "reason": "Seminar Hall C204 is explicitly affected.",
    }
    attached = client.post(relationship_url, json=relationship_payload)
    assert attached.status_code == 201
    assert attached.json()["data"]["campusId"] == DEFAULT_CAMPUS_ID

    duplicate = client.post(relationship_url, json=relationship_payload)
    assert duplicate.status_code == 409
    assert duplicate.json()["detail"]["error"]["code"] == "DUPLICATE_AFFECTED_ENTITY"

    second_entity = client.post(
        relationship_url,
        json={
            "nodeId": "n0000000-0000-0000-0000-000000000003",
            "reason": "Physics Lecture Hall B101 is also directly affected.",
        },
    )
    assert second_entity.status_code == 201
    listed_entities = client.get(relationship_url)
    assert listed_entities.status_code == 200
    assert len(listed_entities.json()["data"]) == 2

    missing = client.post(
        relationship_url,
        json={"nodeId": "missing-node", "reason": "This entity does not exist."},
    )
    assert missing.status_code == 404

    invalid_type = client.post(
        relationship_url,
        json={
            "nodeId": "some-random-id-that-is-not-found",
            "reason": "This node doesn't exist.",
        },
    )
    assert invalid_type.status_code == 404


def test_resolving_one_incident_preserves_another_incident_entity_state():
    node_id = "n0000000-0000-0000-0000-000000000008"
    power_incident_id = _create_active_campus_incident("C204 power failure", "power_outage")
    network_incident_id = _create_active_campus_incident("C204 network failure", "network_outage")

    for incident_id in (power_incident_id, network_incident_id):
        response = client.post(
            f"/incidents/{incident_id}/affected-entities",
            json={"nodeId": node_id, "reason": f"Direct impact from {incident_id}."},
        )
        assert response.status_code == 201

    resolved = client.post(
        f"/incidents/{power_incident_id}/transitions",
        json={"targetStatus": "resolved"},
    )
    assert resolved.status_code == 200

    state_response = client.get(f"/campuses/{DEFAULT_CAMPUS_ID}/state/{node_id}")
    assert state_response.status_code == 200
    state = state_response.json()["data"]
    assert state["status"] == "disrupted"
    assert state["relatedIncidentIds"] == [network_incident_id]

    client.post(
        f"/incidents/{network_incident_id}/transitions",
        json={"targetStatus": "resolved"},
    )
    restored_state = client.get(f"/campuses/{DEFAULT_CAMPUS_ID}/state/{node_id}").json()["data"]
    assert restored_state["status"] == "operational"
    assert restored_state["relatedIncidentIds"] == []


def test_unaffected_seeded_entity_starts_operational():
    response = client.get(
        f"/campuses/{DEFAULT_CAMPUS_ID}/state/n0000000-0000-0000-0000-000000000008"
    )
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "operational"
    assert response.json()["data"]["relatedIncidentIds"] == []


def test_cross_campus_affected_entity_is_rejected():
    foreign_node = DependencyNode(
        id="node-foreign-campus",
        type=NodeType.ROOM,
        name="Foreign Campus Room",
        campus_id="c0000000-0000-0000-0000-000000000099",
    )
    app.dependency_overrides[get_graph_repository] = lambda: InMemoryDependencyGraphRepository(
        nodes=[foreign_node], edges=[]
    )
    try:
        incident_id = _create_active_campus_incident("Cross campus guard", "power_outage")
        response = client.post(
            f"/incidents/{incident_id}/affected-entities",
            json={"nodeId": foreign_node.id, "reason": "Must be rejected."},
        )
        assert response.status_code == 400
        assert response.json()["detail"]["error"]["code"] == "CROSS_CAMPUS_ENTITY"
    finally:
        app.dependency_overrides.pop(get_graph_repository, None)


def test_unknown_campus_incident_and_state_routes_return_404():
    invalid_create = client.post(
        "/campuses/unknown-campus/incidents",
        json={
            "title": "Unknown campus incident",
            "description": "The campus must be validated.",
            "type": "operational",
            "severity": "low",
        },
    )
    assert invalid_create.status_code == 404
    assert invalid_create.json()["detail"]["error"]["code"] == "CAMPUS_NOT_FOUND"

    response = client.get("/campuses/unknown-campus/incidents")
    assert response.status_code == 404
    assert response.json()["detail"]["error"]["code"] == "CAMPUS_NOT_FOUND"

    state_response = client.get("/campuses/unknown-campus/state")
    assert state_response.status_code == 404
    assert state_response.json()["detail"]["error"]["code"] == "CAMPUS_NOT_FOUND"


def test_incident_type_and_severity_are_controlled_values():
    base_payload = {
        "title": "Invalid controlled value",
        "description": "Invalid incident categories are rejected.",
        "type": "power_outage",
        "severity": "high",
    }
    invalid_type = client.post(
        f"/campuses/{DEFAULT_CAMPUS_ID}/incidents",
        json={**base_payload, "type": "unlisted_type"},
    )
    assert invalid_type.status_code == 422

    invalid_severity = client.post(
        f"/campuses/{DEFAULT_CAMPUS_ID}/incidents",
        json={**base_payload, "severity": "urgent"},
    )
    assert invalid_severity.status_code == 422


def test_incident_root_node_must_belong_to_the_campus():
    response = client.post(
        f"/campuses/{DEFAULT_CAMPUS_ID}/incidents",
        json={
            "title": "Invalid root node",
            "description": "An incident root must exist in the selected campus.",
            "type": "power_outage",
            "severity": "high",
            "rootNodeId": "missing-root-node",
        },
    )
    assert response.status_code == 400
    assert response.json()["detail"]["error"]["code"] == "INVALID_CAMPUS_REFERENCE"


def test_development_principal_requires_explicit_nonproduction_bypass():
    assert resolve_development_principal(
        Settings(environment="development", EZYKWELEZ_DEV_AUTH_BYPASS=True)
    ) == DevelopmentPrincipal()
    assert resolve_development_principal(
        Settings(environment="development", EZYKWELEZ_DEV_AUTH_BYPASS=False)
    ) is None
    assert resolve_development_principal(
        Settings(environment="production", EZYKWELEZ_DEV_AUTH_BYPASS=True)
    ) is None


def test_incident_from_another_campus_is_not_accessible():
    foreign_incident = Incident(
        id="inc-foreign-campus",
        campus_id="c0000000-0000-0000-0000-000000000099",
        title="Foreign campus incident",
        description="Must not be visible to the demo campus principal.",
        type=IncidentType.POWER_OUTAGE,
        severity=IncidentSeverity.HIGH,
        status=IncidentStatus.ACTIVE,
        source=IncidentSource.MANUAL,
    )
    app.dependency_overrides[get_incident_repository] = lambda: InMemoryIncidentRepository(
        incidents=[foreign_incident],
        updates=[],
        affected_entities=[],
    )
    try:
        response = client.get(f"/incidents/{foreign_incident.id}")
        assert response.status_code == 404
        assert response.json()["detail"]["error"]["code"] == "INCIDENT_NOT_FOUND"
    finally:
        app.dependency_overrides.pop(get_incident_repository, None)
