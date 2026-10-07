"""Integration tests for Impact Analysis and Dependency Traversal."""

import sys
from pathlib import Path

# Add apps/api to Python path
api_path = Path(__file__).resolve().parent.parent.parent / "apps" / "api"
if str(api_path) not in sys.path:
    sys.path.insert(0, str(api_path))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_list_dependency_nodes():
    """Verify GET /dependencies/nodes returns registered vertices."""
    response = client.get("/dependencies/nodes")
    assert response.status_code == 200

    payload = response.json()
    assert "data" in payload
    assert len(payload["data"]) >= 5

    names = [n["name"] for n in payload["data"]]
    assert any("Power Substation" in name for name in names)
    assert any("Ramanujan" in name for name in names)


def test_get_graph_snapshot():
    """Verify GET /dependencies/graph returns complete topology."""
    response = client.get("/dependencies/graph")
    assert response.status_code == 200

    payload = response.json()
    data = payload["data"]
    assert "nodes" in data
    assert "edges" in data
    assert data["totalNodes"] >= 5
    assert data["totalEdges"] >= 4


def test_impact_analysis_power_outage():
    """Verify POST /impact-analysis on Power Substation propagates to Building B, Labs, and Practicum."""
    power_node_id = "n0000000-0000-0000-0000-000000000001"
    response = client.post(
        "/impact-analysis",
        json={
            "rootNodeId": power_node_id,
            "failureType": "outage",
            "severity": "critical",
            "options": {"maxDepth": 5},
        },
    )
    assert response.status_code == 200

    payload = response.json()
    report = payload["data"]

    assert report["rootNode"]["id"] == power_node_id
    assert report["severity"] in ["high", "critical"]
    assert report["propagationDepth"] >= 3
    assert len(report["impactedNodes"]) >= 4

    # Verify downstream impacted entities
    impacted_names = [n["nodeName"] for n in report["impactedNodes"]]
    assert any("Block B" in name for name in impacted_names)
    assert any("PHYS-101" in name for name in impacted_names)
    assert any("Spectrometer" in name for name in impacted_names)

    # Verify provenance data mode is simulated
    assert report["dataMode"] == "simulated"
    assert report["provenance"]["graphDataMode"] == "simulated"


def test_impact_analysis_missing_root_node_returns_404():
    """Verify POST /impact-analysis with invalid root node returns 404."""
    response = client.post(
        "/impact-analysis",
        json={
            "rootNodeId": "invalid-root-id-999",
            "failureType": "outage",
            "severity": "high",
        },
    )
    assert response.status_code == 404
    payload = response.json()
    assert payload["detail"]["error"]["code"] == "ROOT_NODE_NOT_FOUND"
