"""API Dependencies and Dependency Injection Providers."""

from fastapi import Depends
from app.application.condition_service import ConditionAggregationService
from app.config import Settings, get_settings
from app.domain.campus.ports import CampusRepository, ConnectivityProvider, OccupancyProvider
from app.infrastructure.repositories.in_memory_campus_repository import InMemoryCampusRepository
from app.infrastructure.telemetry.mock_connectivity_provider import MockConnectivityProvider
from app.infrastructure.telemetry.mock_occupancy_provider import MockOccupancyProvider

# Singleton in-memory instances
_campus_repo = InMemoryCampusRepository()
_mock_occupancy_provider = MockOccupancyProvider()
_mock_connectivity_provider = MockConnectivityProvider()


def get_app_settings() -> Settings:
    """Dependency providing validated application settings."""
    return get_settings()


def get_campus_repository() -> CampusRepository:
    """Campus repository dependency."""
    return _campus_repo


def get_occupancy_provider(settings: Settings = Depends(get_app_settings)) -> OccupancyProvider:
    """Resolve occupancy provider based on configuration."""
    # Expandable to RealOccupancyProvider when settings.occupancy_provider == "real"
    return _mock_occupancy_provider


def get_connectivity_provider(settings: Settings = Depends(get_app_settings)) -> ConnectivityProvider:
    """Resolve connectivity provider based on configuration."""
    # Expandable to RealConnectivityProvider when settings.connectivity_provider == "real"
    return _mock_connectivity_provider


def get_condition_service(
    campus_repo: CampusRepository = Depends(get_campus_repository),
    occupancy_provider: OccupancyProvider = Depends(get_occupancy_provider),
    connectivity_provider: ConnectivityProvider = Depends(get_connectivity_provider),
) -> ConditionAggregationService:
    """Provide ConditionAggregationService instance."""
    return ConditionAggregationService(
        campus_repo=campus_repo,
        occupancy_provider=occupancy_provider,
        connectivity_provider=connectivity_provider,
    )
