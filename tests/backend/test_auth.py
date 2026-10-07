"""Authentication and profile endpoint security tests."""

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


def generate_mock_jwt(
    sub: str,
    app_role: str = None,
    user_meta_role: str = None,
    full_name: str = "Test User",
) -> str:
    """Helper to create a well-formed JWT string for security testing."""
    header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).decode().rstrip("=")
    
    payload_data = {
        "sub": sub,
        "email": f"{sub}@campus.edu",
        "user_metadata": {"full_name": full_name},
        "app_metadata": {},
    }
    
    if app_role:
        payload_data["app_metadata"]["role"] = app_role
        payload_data["role"] = app_role
        
    if user_meta_role:
        payload_data["user_metadata"]["role"] = user_meta_role

    payload = base64.urlsafe_b64encode(json.dumps(payload_data).encode()).decode().rstrip("=")
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
    """Verify that a dev token returns the authenticated user's profile with default student role."""
    headers = {"Authorization": "Bearer test-mock-token"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == "00000000-0000-0000-0000-000000000001"
    assert data["email"] == "testuser@ezykwelez.local"
    assert data["role"] == "student"
    assert data["full_name"] == "Test Student"


def test_client_cannot_self_promote_role_via_profile_update():
    """SECURITY TEST: Verify that a client cannot elevate their role to admin via profile updates."""
    headers = {"Authorization": "Bearer test-mock-token"}
    
    # Attempt to send role = 'admin' in update request
    payload = {"full_name": "Updated User Name", "role": "admin"}
    response = client.put("/auth/me", json=payload, headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == "00000000-0000-0000-0000-000000000001"
    assert data["full_name"] == "Updated User Name"
    # Role must remain 'student'
    assert data["role"] == "student"
    assert data["role"] != "admin"


def test_client_user_metadata_cannot_escalate_to_admin():
    """SECURITY TEST: Verify that client-provided user_metadata in JWT cannot escalate to admin."""
    user_id = "11111111-2222-3333-4444-555555555555"
    # Attacker crafts JWT with user_metadata containing role = 'admin'
    token = generate_mock_jwt(sub=user_id, user_meta_role="admin", full_name="Malicious User")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == user_id
    # Server must ignore client user_metadata role and default securely to 'student'
    assert data["role"] == "student"
    assert data["role"] != "admin"


def test_server_app_metadata_role_respected():
    """SECURITY TEST: Verify that server-controlled app_metadata legitimately sets privileged roles."""
    admin_id = "99999999-8888-7777-6666-555555555555"
    # Server-issued token with app_metadata role = 'admin'
    token = generate_mock_jwt(sub=admin_id, app_role="admin", full_name="Authorized Admin")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == admin_id
    assert data["role"] == "admin"
    assert data["full_name"] == "Authorized Admin"
