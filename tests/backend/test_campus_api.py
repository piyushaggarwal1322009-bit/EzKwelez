"""Integration tests for Campus Facilities & Conditions API routes."""

import sys
from pathlib import Path

# Add apps/api to Python path
api_path = Path(__file__).resolve().parent.parent.parent / "apps" / "api"
if str(api_path) not in sys.path:
    sys.path.insert(0, str(api_path))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_list_campus_locations():
    """Verify GET /campus/locations returns pre-seeded facilities with envelope."""
    response = client.get("/campus/locations")
    assert response.status_code == 200

    payload = response.json()
    assert "data" in payload
    assert "meta" in payload
    assert isinstance(payload["data"], list)
    assert len(payload["data"]) >= 10

    # Verify Library and Canteen are present
    names = [loc["name"] for loc in payload["data"]]
    assert any("Library" in name for name in names)
    assert any("Canteen" in name for name in names)


def test_get_live_campus_conditions():
    """Verify GET /campus/conditions returns aggregated conditions and summary."""
    response = client.get("/campus/conditions")
    assert response.status_code == 200

    payload = response.json()
    assert "data" in payload
    assert "meta" in payload

    data = payload["data"]
    assert "locations" in data
    assert "summary" in data
    assert data["summary"]["totalLocations"] >= 10
    assert data["summary"]["totalOccupancy"] > 0
    assert data["summary"]["averageOccupancyRate"] > 0
    assert data["dataMode"] in ["simulated", "live"]

    # Check for specific facility condition detail
    lib_condition = next(
        (item for item in data["locations"] if "Library" in item["location"]["name"]),
        None,
    )
    assert lib_condition is not None
    assert lib_condition["occupancy"]["capacity"] == 200
    assert lib_condition["connectivity"]["quality"] in ["Good", "Excellent"]


def test_get_specific_location_condition():
    """Verify GET /campus/conditions/{locationId} returns single condition."""
    # Library location ID
    lib_id = "r0000000-0000-0000-0000-000000000010"
    response = client.get(f"/campus/conditions/{lib_id}")
    assert response.status_code == 200

    payload = response.json()
    assert payload["data"]["location"]["id"] == lib_id
    assert "Central Library" in payload["data"]["location"]["name"]
    assert payload["data"]["occupancy"]["capacity"] == 200
    assert payload["data"]["connectivity"]["signalScore"] > 0


def test_get_nonexistent_location_returns_404():
    """Verify GET /campus/conditions/{nonexistent} returns structured 404."""
    response = client.get("/campus/conditions/nonexistent-id-999")
    assert response.status_code == 404

    payload = response.json()
    assert "detail" in payload
    assert payload["detail"]["error"]["code"] == "LOCATION_NOT_FOUND"
