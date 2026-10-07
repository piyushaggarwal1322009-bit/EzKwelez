"""User profile request and response schemas."""

from typing import Optional
from pydantic import BaseModel, Field


class UserProfileResponse(BaseModel):
    """User profile response schema."""

    id: str = Field(description="User unique identifier (UUID)")
    email: Optional[str] = Field(default=None, description="User email address")
    full_name: Optional[str] = Field(default=None, description="User display or full name")
    role: str = Field(default="student", description="User system role (student, staff, admin)")
    created_at: Optional[str] = Field(default=None, description="Profile creation timestamp")
    updated_at: Optional[str] = Field(default=None, description="Profile last update timestamp")


class UserProfileUpdateRequest(BaseModel):
    """User profile update request schema for normal user self-updates.
    
    SECURITY: Role modification is strictly forbidden via user profile self-updates.
    """

    full_name: Optional[str] = Field(default=None, description="Updated full name")
