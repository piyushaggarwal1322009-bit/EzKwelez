"""API Dependencies and Security Context."""

from typing import Optional
from fastapi import Depends, HTTPException, Header, status
from app.config import Settings, get_settings
from app.infrastructure.auth.jwt import AuthenticatedUser, verify_supabase_token


def get_app_settings() -> Settings:
    """Dependency providing validated application settings."""
    return get_settings()


async def get_current_user(
    authorization: Optional[str] = Header(None, description="Bearer authorization token"),
) -> AuthenticatedUser:
    """Dependency enforcing authenticated user context via Bearer token."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header. Please sign in to access this resource.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        return verify_supabase_token(authorization)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired authentication credentials: {str(exc)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_optional_current_user(
    authorization: Optional[str] = Header(None, description="Bearer authorization token"),
) -> Optional[AuthenticatedUser]:
    """Dependency providing optional authenticated user context."""
    if not authorization:
        return None
    try:
        return verify_supabase_token(authorization)
    except ValueError:
        return None


async def require_admin_or_staff(
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> AuthenticatedUser:
    """Dependency restricting mutation operations to staff or admin roles."""
    if current_user.role not in ("admin", "staff"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Administrative or staff privileges are required to perform this action.",
        )
    return current_user
