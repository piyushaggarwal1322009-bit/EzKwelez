"""API Dependencies and Dependency Injection Providers."""

from typing import Optional
from fastapi import Depends, Header, HTTPException, status
from app.application.condition_service import ConditionAggregationService
from app.application.campus_state_service import CampusStateService
from app.application.impact_service import (
    BreadthFirstTraversalService,
    DefaultImpactAnalysisService,
)
from app.application.incident_service import IncidentApplicationService
from app.application.assessment_service import AssessmentService
from app.application.recovery_candidate_generator import RecoveryCandidateGenerator
from app.application.recovery_plan_validator import RecoveryPlanValidator
from app.application.recovery_plan_service import RecoveryPlanService
from app.config import Settings, get_settings
from app.domain.campus.ports import CampusRepository, ConnectivityProvider, OccupancyProvider
from app.domain.graph.ports import CampusContextProvider, DependencyGraphRepository
from app.domain.impact.ports import DependencyTraversalService, ImpactAnalysisEngine
from app.domain.incidents.ports import IncidentEventPublisher, IncidentRepository
from app.infrastructure.adapters.campus_context_adapter import CampusContextAdapter
from app.infrastructure.auth import DevelopmentPrincipal, resolve_development_principal
from app.infrastructure.adapters.in_memory_event_publisher import InMemoryIncidentEventPublisher
from app.infrastructure.auth.jwt import AuthenticatedUser, verify_supabase_token
from app.infrastructure.repositories.in_memory_campus_repository import InMemoryCampusRepository
from app.infrastructure.repositories.in_memory_graph_repository import InMemoryDependencyGraphRepository
from app.infrastructure.repositories.in_memory_incident_repository import InMemoryIncidentRepository
from app.infrastructure.telemetry.mock_connectivity_provider import MockConnectivityProvider
from app.infrastructure.telemetry.mock_occupancy_provider import MockOccupancyProvider

# Singleton in-memory instances
_campus_repo = InMemoryCampusRepository()
_graph_repo = InMemoryDependencyGraphRepository()
_incident_repo = InMemoryIncidentRepository()
_incident_event_publisher = InMemoryIncidentEventPublisher()
_mock_occupancy_provider = MockOccupancyProvider()
_mock_connectivity_provider = MockConnectivityProvider()
_traversal_service = BreadthFirstTraversalService()
_campus_context_adapter = CampusContextAdapter(_campus_repo)


def get_app_settings() -> Settings:
    """Dependency providing validated application settings."""
    return get_settings()


def get_development_principal(
    settings: Settings = Depends(get_app_settings),
) -> DevelopmentPrincipal:
    principal = resolve_development_principal(settings)
    if principal is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"error": {"code": "AUTH_NOT_CONFIGURED", "message": "Enable the development auth bypass for local demo mutations."}},
        )
    return principal


def get_campus_repository() -> CampusRepository:
    """Campus repository dependency."""
    return _campus_repo


def get_graph_repository() -> DependencyGraphRepository:
    """Dependency graph repository dependency."""
    return _graph_repo


def get_incident_repository() -> IncidentRepository:
    """Incident repository dependency."""
    return _incident_repo


def get_incident_event_publisher() -> IncidentEventPublisher:
    """Incident event publisher dependency."""
    return _incident_event_publisher


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


def get_incident_service(
    incident_repo: IncidentRepository = Depends(get_incident_repository),
    event_publisher: IncidentEventPublisher = Depends(get_incident_event_publisher),
    graph_repo: DependencyGraphRepository = Depends(get_graph_repository),
    campus_repo: CampusRepository = Depends(get_campus_repository),
) -> IncidentApplicationService:
    """Provide IncidentApplicationService instance."""
    return IncidentApplicationService(
        repository=incident_repo,
        event_publisher=event_publisher,
        graph_repository=graph_repo,
        campus_repository=campus_repo,
    )


def get_campus_state_service(
    campus_repo: CampusRepository = Depends(get_campus_repository),
    graph_repo: DependencyGraphRepository = Depends(get_graph_repository),
    incident_repo: IncidentRepository = Depends(get_incident_repository),
) -> CampusStateService:
    return CampusStateService(
        campus_repository=campus_repo,
        graph_repository=graph_repo,
        incident_repository=incident_repo,
    )


def get_assessment_service(
    incident_service: IncidentApplicationService = Depends(get_incident_service),
    graph_repo: DependencyGraphRepository = Depends(get_graph_repository),
) -> AssessmentService:
    """Provide AssessmentService instance."""
    return AssessmentService(
        incident_service=incident_service,
        graph_repository=graph_repo,
    )


def get_recovery_plan_service(
    assessment_service: AssessmentService = Depends(get_assessment_service),
    graph_repo: DependencyGraphRepository = Depends(get_graph_repository),
) -> RecoveryPlanService:
    """Provide RecoveryPlanService instance."""
    return RecoveryPlanService(
        assessment_service=assessment_service,
        graph_repository=graph_repo,
        candidate_generator=RecoveryCandidateGenerator(),
        plan_validator=RecoveryPlanValidator(),
    )


def get_current_user(
    authorization: Optional[str] = Header(None, alias="Authorization"),
) -> AuthenticatedUser:
    """Validate Bearer token and return current authenticated user."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        return verify_supabase_token(authorization)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
