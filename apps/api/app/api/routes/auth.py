"""Authentication and User Profile Routes."""

from fastapi import APIRouter, Depends
from app.api.dependencies import get_current_user
from app.infrastructure.auth.jwt import AuthenticatedUser
from app.schemas.profile import UserProfileResponse, UserProfileUpdateRequest

router = APIRouter(prefix="/auth", tags=["Authentication & Profile"])


@router.get(
    "/me",
    response_model=UserProfileResponse,
    summary="Get current user profile",
    description="Retrieve the profile of the currently authenticated user.",
)
async def get_my_profile(
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> UserProfileResponse:
    """Return profile for the currently authenticated user."""
    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        created_at=None,
        updated_at=None,
    )


@router.put(
    "/me",
    response_model=UserProfileResponse,
    summary="Update current user profile",
    description="Update permitted personal profile attributes for the currently authenticated user.",
)
async def update_my_profile(
    update_data: UserProfileUpdateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> UserProfileResponse:
    """Update profile attributes for the current user.

    SECURITY: Role cannot be modified by user self-updates. It is strictly preserved from current authenticated context.
    """
    updated_name = update_data.full_name if update_data.full_name is not None else current_user.full_name

    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=updated_name,
        role=current_user.role,
    )
