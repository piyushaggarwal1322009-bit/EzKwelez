"""Health check endpoint."""

from fastapi import APIRouter, Depends
from app.config import Settings
from app.api.dependencies import get_app_settings
from app.schemas.health import HealthCheckResponse

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    summary="Health check",
    description="Check the operational status of the EzyKwelez API backend.",
)
async def health_check(
    settings: Settings = Depends(get_app_settings),
) -> HealthCheckResponse:
    """Return API health status."""
    return HealthCheckResponse(
        status="ok",
        service="ezykwelez-api",
        environment=settings.environment,
    )
