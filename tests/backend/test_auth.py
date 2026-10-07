"""Authentication and profile endpoint tests."""

import sys
from pathlib import Path

# Add apps/api to Python path for testing imports
api_path = Path(__file__).resolve().parent.parent.parent / "apps" / "api"
if str(api_path) not in sys.path:
    sys.path.insert(0, str(api_path))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_unauthenticated_request_rejected():
    """Verify that requests to /auth/me without an Authorization header receive HTTP 401."""
    response = client.get("/auth/me")
    assert response.status_code == 401
    data = response.json()
    assert "detail" in data
    assert "Missing Authorization header" in data["detail"]


def test_invalid_token_rejected():
    """Verify that malformed or invalid tokens are rejected with HTTP 401."""
    headers = {"Authorization": "Bearer not-a-valid-jwt-token"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 401


def test_authenticated_user_profile_retrieval():
    """Verify that a valid token returns the authenticated user's profile."""
    headers = {"Authorization": "Bearer test-mock-token"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == "00000000-0000-0000-0000-000000000001"
    assert data["email"] == "testuser@ezykwelez.local"
    assert data["role"] == "student"
    assert data["full_name"] == "Test Student"


def test_authenticated_user_profile_update():
    """Verify that an authenticated user can update their profile information."""
    headers = {"Authorization": "Bearer test-mock-token"}
    payload = {"full_name": "Updated Name", "role": "staff"}
    response = client.put("/auth/me", json=payload, headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == "00000000-0000-0000-0000-000000000001"
    assert data["full_name"] == "Updated Name"
    assert data["role"] == "staff"
