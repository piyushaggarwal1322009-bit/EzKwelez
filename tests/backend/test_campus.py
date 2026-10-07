"""Phase 3: Campus Model and Dependency Graph Tests."""

import sys
import json
import base64
from pathlib import Path

# Add apps/api to Python path for testing imports
api_path = Path(__file__).resolve().parent.parent.parent / "apps" / "api"
if str(api_path) not in sys.path:
    sys.path.insert(0, str(api_path))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

CAMPUS_ID = "a0000000-0000-0000-0000-000000000001"


def get_auth_header(role: str = "student", sub: str = "user-123") -> dict:
    header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).decode().rstrip("=")
    payload = base64.urlsafe_b64encode(
        json.dumps({
            "sub": sub,
            "email": f"{sub}@campus.edu",
            "app_metadata": {"role": role},
            "role": role,
            "user_metadata": {"full_name": f"{role.capitalize()} User"},
        }).encode()
    ).decode().rstrip("=")
    return {"Authorization": f"Bearer {header}.{payload}.sig"}


# ==============================================================================
# 1. AUTHENTICATION & ACCESS CONTROL
# ==============================================================================

def test_unauthenticated_campus_access_rejected():
    """Verify unauthenticated requests cannot read campus topology."""
    response = client.get("/api/campuses")
    assert response.status_code == 401


def test_student_can_read_campus_data():
    """Verify authenticated students can read campus structure."""
    headers = get_auth_header(role="student")
    response = client.get("/api/campuses", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["id"] == CAMPUS_ID
    assert data[0]["code"] == "EZY-MAIN"


def test_student_mutation_rejected_with_forbidden():
    """Verify students cannot mutate campus infrastructure (403 Forbidden)."""
    headers = get_auth_header(role="student")
    payload = {
        "name": "Unauthorized Campus",
        "code": "UNAUTH",
        "description": "Attempted write",
    }
    response = client.post("/api/campuses", json=payload, headers=headers)
    assert response.status_code == 403


def test_admin_can_create_campus():
    """Verify administrators can create campus boundaries."""
    headers = get_auth_header(role="admin")
    payload = {
        "name": "North Annex Campus",
        "code": "EZY-NORTH",
        "description": "Satellite science campus",
    }
    response = client.post("/api/campuses", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "North Annex Campus"
    assert data["code"] == "EZY-NORTH"


# ==============================================================================
# 2. SEED TOPOLOGY VERIFICATION
# ==============================================================================

def test_locations_retrieval_and_seed_content():
    """Verify seeded locations exist and have correct capacities."""
    headers = get_auth_header(role="student")
    response = client.get(f"/api/campuses/{CAMPUS_ID}/locations", headers=headers)
    assert response.status_code == 200
    locs = response.json()
    assert len(locs) == 9

    codes = {l["code"] for l in locs}
    assert "LOC-LIB" in codes
    assert "LOC-CAN" in codes
    assert "LOC-ACAD-A" in codes


def test_resources_retrieval_and_seed_content():
    """Verify seeded infrastructure resources exist."""
    headers = get_auth_header(role="student")
    response = client.get(f"/api/campuses/{CAMPUS_ID}/resources", headers=headers)
    assert response.status_code == 200
    resources = response.json()
    assert len(resources) == 8

    res_types = {r["resource_type"] for r in resources}
    assert "power" in res_types
    assert "network" in res_types
    assert "water" in res_types


def test_services_retrieval_and_seed_content():
    """Verify seeded services exist."""
    headers = get_auth_header(role="student")
    response = client.get(f"/api/campuses/{CAMPUS_ID}/services", headers=headers)
    assert response.status_code == 200
    services = response.json()
    assert len(services) == 7

    codes = {s["code"] for s in services}
    assert "SVC-WIFI-LIB" in codes
    assert "SVC-POS-CAN" in codes
    assert "SVC-SIS" in codes


def test_dependencies_retrieval_and_seed_content():
    """Verify seeded dependency edges exist."""
    headers = get_auth_header(role="student")
    response = client.get(f"/api/campuses/{CAMPUS_ID}/dependencies", headers=headers)
    assert response.status_code == 200
    deps = response.json()
    assert len(deps) >= 15


# ==============================================================================
# 3. GRAPH RECONSTRUCTION & TRAVERSAL
# ==============================================================================

def test_campus_graph_reconstruction():
    """Verify full graph reconstruction with nodes, edges, and summary."""
    headers = get_auth_header(role="student")
    response = client.get(f"/api/campuses/{CAMPUS_ID}/graph", headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert data["campus_id"] == CAMPUS_ID
    assert data["summary"]["total_locations"] == 9
    assert data["summary"]["total_resources"] == 8
    assert data["summary"]["total_services"] == 7
    assert data["summary"]["total_dependencies"] >= 15
    assert len(data["nodes"]) == 24  # 9 + 8 + 7


def test_upstream_dependencies_traversal():
    """Verify upstream traversal: What feeds into Library Wi-Fi (SVC-WIFI-LIB)?"""
    headers = get_auth_header(role="student")
    wifi_service_id = "d0000000-0000-0000-0000-000000000002"

    response = client.get(
        f"/api/campuses/{CAMPUS_ID}/dependencies/service/{wifi_service_id}/dependencies",
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()

    assert data["root_entity"]["id"] == wifi_service_id
    assert data["direction"] == "dependencies"
    found_names = {node["name"] for node in data["nodes"]}

    # Direct dependencies
    assert "Library Wi-Fi AP" in found_names
    assert "Main Library" in found_names
    # Multi-hop upstream dependencies
    assert "Library Network Switch" in found_names
    assert "Network Core Switch" in found_names
    assert "Campus Internet" in found_names


def test_downstream_dependents_traversal():
    """Verify downstream traversal: What depends on the Main Transformer (RES-TX-01)?"""
    headers = get_auth_header(role="student")
    transformer_id = "c0000000-0000-0000-0000-000000000001"

    response = client.get(
        f"/api/campuses/{CAMPUS_ID}/dependencies/resource/{transformer_id}/dependents",
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()

    assert data["root_entity"]["id"] == transformer_id
    assert data["direction"] == "dependents"
    found_names = {node["name"] for node in data["nodes"]}

    # Hop 1: Electrical Panel A
    assert "Electrical Panel A" in found_names
    # Hop 2: Locations & Services powered by Panel A
    assert "Main Library" in found_names
    assert "Central Canteen" in found_names
    assert "Library Access System" in found_names


def test_bounded_graph_traversal():
    """Verify max_depth bounding restricts traversal distance."""
    headers = get_auth_header(role="student")
    transformer_id = "c0000000-0000-0000-0000-000000000001"

    response = client.get(
        f"/api/campuses/{CAMPUS_ID}/dependencies/resource/{transformer_id}/dependents?max_depth=1",
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()

    assert data["max_depth"] == 1
    assert data["total_found"] == 1
    assert data["nodes"][0]["name"] == "Electrical Panel A"
    assert data["nodes"][0]["depth"] == 1


# ==============================================================================
# 4. DEPENDENCY VALIDATION RULES
# ==============================================================================

def test_self_dependency_rejected():
    """Verify self-dependency (A -> A) is rejected with 400 Bad Request."""
    headers = get_auth_header(role="admin")
    loc_id = "b0000000-0000-0000-0000-000000000001"

    payload = {
        "source_type": "location",
        "source_id": loc_id,
        "target_type": "location",
        "target_id": loc_id,
        "dependency_type": "operational",
        "strength": "critical",
    }
    response = client.post(
        f"/api/campuses/{CAMPUS_ID}/dependencies", json=payload, headers=headers
    )
    assert response.status_code == 400
    assert "cannot create a self-referencing dependency" in response.json()["detail"]


def test_duplicate_dependency_edge_rejected():
    """Verify creating an identical dependency edge is rejected with 409 Conflict."""
    headers = get_auth_header(role="admin")
    # Existing edge: Main Transformer -> Electrical Panel A [power]
    payload = {
        "source_type": "resource",
        "source_id": "c0000000-0000-0000-0000-000000000001",
        "target_type": "resource",
        "target_id": "c0000000-0000-0000-0000-000000000002",
        "dependency_type": "power",
        "strength": "required",
    }
    response = client.post(
        f"/api/campuses/{CAMPUS_ID}/dependencies", json=payload, headers=headers
    )
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]


def test_nonexistent_endpoint_rejected():
    """Verify dependencies referencing non-existent entity IDs are rejected with 404."""
    headers = get_auth_header(role="admin")
    payload = {
        "source_type": "resource",
        "source_id": "00000000-ffff-ffff-ffff-000000000000",
        "target_type": "location",
        "target_id": "b0000000-0000-0000-0000-000000000001",
        "dependency_type": "power",
    }
    response = client.post(
        f"/api/campuses/{CAMPUS_ID}/dependencies", json=payload, headers=headers
    )
    assert response.status_code == 404
