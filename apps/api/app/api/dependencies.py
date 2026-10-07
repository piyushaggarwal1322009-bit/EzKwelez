"""API Dependencies and Dependency Injection Providers."""

from fastapi import Depends
from app.application.condition_service import ConditionAggregationService
from app.application.impact_service import (
    BreadthFirstTraversalService,
    DefaultImpactAnalysisService,
)
from app.config import Settings, get_settings
from app.domain.campus.ports import CampusRepository, ConnectivityProvider, OccupancyProvider
from app.domain.graph.ports import CampusContextProvider, DependencyGraphRepository
from app.domain.impact.ports import DependencyTraversalService, ImpactAnalysisEngine
from app.infrastructure.adapters.campus_context_adapter import CampusContextAdapter
from app.infrastructure.repositories.in_memory_campus_repository import InMemoryCampusRepository
from app.infrastructure.repositories.in_memory_graph_repository import InMemoryDependencyGraphRepository
from app.infrastructure.telemetry.mock_connectivity_provider import MockConnectivityProvider
from app.infrastructure.telemetry.mock_occupancy_provider import MockOccupancyProvider

# Singleton in-memory instances
_campus_repo = InMemoryCampusRepository()
_graph_repo = InMemoryDependencyGraphRepository()
_mock_occupancy_provider = MockOccupancyProvider()
_mock_connectivity_provider = MockConnectivityProvider()
_traversal_service = BreadthFirstTraversalService()
_campus_context_adapter = CampusContextAdapter(_campus_repo)


def get_app_settings() -> Settings:
    """Dependency providing validated application settings."""
    return get_settings()


def get_campus_repository() -> CampusRepository:
    """Campus repository dependency."""
    return _campus_repo


def get_graph_repository() -> DependencyGraphRepository:
    """Dependency graph repository dependency."""
    return _graph_repo


def get_campus_context_provider(
    campus_repo: CampusRepository = Depends(get_campus_repository),
) -> CampusContextProvider:
    """Campus context provider adapter dependency."""
    return _campus_context_adapter


def get_traversal_service() -> DependencyTraversalService:
    """Graph traversal service dependency."""
    return _traversal_service


def get_occupancy_provider(settings: Settings = Depends(get_app_settings)) -> OccupancyProvider:
    """Resolve occupancy provider based on configuration."""
    return _mock_occupancy_provider


def get_connectivity_provider(settings: Settings = Depends(get_app_settings)) -> ConnectivityProvider:
    """Resolve connectivity provider based on configuration."""
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


def get_impact_analysis_service(
    graph_repo: DependencyGraphRepository = Depends(get_graph_repository),
    traversal_service: DependencyTraversalService = Depends(get_traversal_service),
    campus_context: CampusContextProvider = Depends(get_campus_context_provider),
) -> ImpactAnalysisEngine:
    """Provide ImpactAnalysisEngine instance."""
    return DefaultImpactAnalysisService(
        graph_repo=graph_repo,
        traversal_service=traversal_service,
        campus_context=campus_context,
    )
