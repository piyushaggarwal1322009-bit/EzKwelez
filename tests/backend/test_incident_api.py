"""Integration tests for Incident Management API routes."""

import sys
from pathlib import Path

# Add apps/api to Python path
api_path = Path(__file__).resolve().parent.parent.parent / "apps" / "api"
if str(api_path) not in sys.path:
    sys.path.insert(0, str(api_path))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_list_incidents_success():
    response = client.get("/incidents")
    assert response.status_code == 200
    payload = response.json()
    assert "data" in payload
    assert "meta" in payload
    assert isinstance(payload["data"], list)
    assert len(payload["data"]) >= 1
    assert payload["data"][0]["id"] == "inc-00000000-0000-0000-0000-000000000001"


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
