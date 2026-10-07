"""API Dependencies."""

from app.config import Settings, get_settings


def get_app_settings() -> Settings:
    """Dependency providing validated application settings."""
    return get_settings()
