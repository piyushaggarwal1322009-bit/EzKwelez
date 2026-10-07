"""Health check endpoint integration tests."""

import sys
from pathlib import Path

# Add apps/api to Python path for testing imports
api_path = Path(__file__).resolve().parent.parent.parent / "apps" / "api"
if str(api_path) not in sys.path:
    sys.path.insert(0, str(api_path))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_endpoint():
    """Verify that /health returns HTTP 200 and expected status."""
    response = client.get("/health")
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "ezykwelez-api"
    assert "environment" in data
    assert "timestamp" in data


def test_root_endpoint():
    """Verify that root / returns service metadata."""
    response = client.get("/")
    assert response.status_code == 200
    
    data = response.json()
    assert data["service"] == "ezykwelez-api"
    assert data["status"] == "online"
