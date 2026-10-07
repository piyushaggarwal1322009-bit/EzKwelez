"""Authentication and profile endpoint tests."""

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


def generate_mock_jwt(sub: str, role: str = "student", full_name: str = "Test User") -> str:
    """Helper to create a well-formed JWT string for testing."""
    header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).decode().rstrip("=")
    payload = base64.urlsafe_b64encode(
        json.dumps({
            "sub": sub,
            "email": f"{sub}@campus.edu",
            "role": role,
            "user_metadata": {"full_name": full_name, "role": role},
        }).encode()
    ).decode().rstrip("=")
    signature = "mock-signature"
    return f"{header}.{payload}.{signature}"


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


def test_missing_sub_in_jwt_rejected():
    """Verify that a JWT without a 'sub' claim is rejected."""
    header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256"}).encode()).decode().rstrip("=")
    payload = base64.urlsafe_b64encode(json.dumps({"role": "student"}).encode()).decode().rstrip("=")
    token = f"{header}.{payload}.sig"
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 401


def test_authenticated_user_profile_retrieval_dev_token():
    """Verify that a dev token returns the authenticated user's profile."""
    headers = {"Authorization": "Bearer test-mock-token"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == "00000000-0000-0000-0000-000000000001"
    assert data["email"] == "testuser@ezykwelez.local"
    assert data["role"] == "student"
    assert data["full_name"] == "Test Student"


def test_authenticated_user_profile_retrieval_custom_jwt():
    """Verify that a structured JWT with claims parses correctly."""
    user_id = "12345678-1234-5678-1234-567812345678"
    token = generate_mock_jwt(sub=user_id, role="staff", full_name="Dr. Taylor")
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == user_id
    assert data["email"] == f"{user_id}@campus.edu"
    assert data["role"] == "staff"
    assert data["full_name"] == "Dr. Taylor"


def test_authenticated_user_profile_update():
    """Verify that an authenticated user can update their profile information."""
    headers = {"Authorization": "Bearer test-mock-token"}
    payload = {"full_name": "Updated Operator Name", "role": "admin"}
    response = client.put("/auth/me", json=payload, headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == "00000000-0000-0000-0000-000000000001"
    assert data["full_name"] == "Updated Operator Name"
    assert data["role"] == "admin"
