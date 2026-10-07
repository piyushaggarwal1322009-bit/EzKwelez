"""Configuration management for EzyKwelez API."""

from functools import lru_cache
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings and environment validation."""

    app_name: str = "EzyKwelez API"
    environment: str = "development"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    development_auth_bypass: bool = Field(default=False, alias="EZYKWELEZ_DEV_AUTH_BYPASS")
    
    # CORS Configuration
    cors_origins_raw: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        alias="CORS_ORIGINS",
    )

    # Supabase Integration (Optional in Phase 1 Foundation)
    supabase_url: str = Field(default="", alias="SUPABASE_URL")
    supabase_anon_key: str = Field(default="", alias="SUPABASE_ANON_KEY")
    supabase_service_role_key: str = Field(default="", alias="SUPABASE_SERVICE_ROLE_KEY")
    database_url: str = Field(default="", alias="DATABASE_URL")

    # Telemetry Providers (mock by default)
    occupancy_provider: str = Field(default="mock", alias="OCCUPANCY_PROVIDER")
    connectivity_provider: str = Field(default="mock", alias="CONNECTIVITY_PROVIDER")

    # AI Engine Provider (mock by default)
    ai_provider: str = Field(default="mock", alias="AI_PROVIDER")
    ai_api_key: str = Field(default="", alias="AI_API_KEY")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins_raw.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings instance."""
    return Settings()
