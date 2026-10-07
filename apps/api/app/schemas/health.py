"""Health check response schema."""

from pydantic import BaseModel, Field
from datetime import datetime, timezone


class HealthCheckResponse(BaseModel):
    """Health check response model."""

    status: str = Field(default="ok", description="Service health status")
    service: str = Field(default="ezykwelez-api", description="Service identifier")
    environment: str = Field(default="development", description="Current running environment")
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="UTC timestamp of response",
    )
