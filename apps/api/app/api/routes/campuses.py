"""Campus Aggregate and Graph Management API Routes."""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.api.dependencies import get_current_user
from app.application.services.campus_service import CampusService
from app.application.services.dependency_graph_service import DependencyGraphService
from app.application.services.location_service import LocationService
from app.application.services.resource_service import ResourceService
from app.application.services.service_catalog import ServiceCatalogService
from app.domain.campus.exceptions import (
    CampusNotFoundError,
    DuplicateDependencyError,
    EntityNotFoundError,
    InvalidDependencyError,
    SelfDependencyError,
)
from app.domain.campus.models import (
    Campus,
    CampusEntityType,
    CampusGraph,
    Dependency,
    DependencyStrength,
    DependencyType,
    Location,
    Resource,
    CampusService as CampusServiceModel,
)
from app.infrastructure.auth.jwt import AuthenticatedUser


router = APIRouter(prefix="/api/campuses", tags=["Campuses & Graph Administration"])


# Service singletons / providers
_campus_service = CampusService()
_location_service = LocationService()
_resource_service = ResourceService()
_service_catalog = ServiceCatalogService()
_graph_service = DependencyGraphService()


def require_admin(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
    """Ensure current authenticated user has administrative privileges."""
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required to perform this action",
        )
    return user


class CampusCreateRequest(BaseModel):
    name: str
    code: str
    description: Optional[str] = None


class CreateDependencyRequest(BaseModel):
    source_type: CampusEntityType
    source_id: str
    target_type: CampusEntityType
    target_id: str
    dependency_type: DependencyType
    strength: DependencyStrength = DependencyStrength.CRITICAL
    description: Optional[str] = None


# ------------------------------------------------------------------------------
# 1. Campus Management
# ------------------------------------------------------------------------------

@router.get(
    "",
    response_model=List[Campus],
    summary="List all campuses",
)
async def list_campuses(
    user: AuthenticatedUser = Depends(get_current_user),
) -> List[Campus]:
    """Retrieve list of registered campus aggregate roots."""
    return _campus_service.list_campuses()


@router.post(
    "",
    response_model=Campus,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new campus",
)
async def create_campus(
    payload: CampusCreateRequest,
    user: AuthenticatedUser = Depends(require_admin),
) -> Campus:
    """Create a new campus boundary (Admin only)."""
    return _campus_service.create_campus(
        name=payload.name,
        code=payload.code,
        description=payload.description,
    )


# ------------------------------------------------------------------------------
# 2. Campus Sub-entities
# ------------------------------------------------------------------------------

@router.get(
    "/{campus_id}/locations",
    response_model=List[Location],
    summary="List campus locations",
)
async def list_campus_locations(
    campus_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
) -> List[Location]:
    """Retrieve physical zones and locations for a campus."""
    try:
        return _location_service.list_locations(campus_id)
    except CampusNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get(
    "/{campus_id}/resources",
    response_model=List[Resource],
    summary="List campus resources",
)
async def list_campus_resources(
    campus_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
) -> List[Resource]:
    """Retrieve infrastructure resources for a campus."""
    try:
        return _resource_service.list_resources(campus_id)
    except CampusNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get(
    "/{campus_id}/services",
    response_model=List[CampusServiceModel],
    summary="List campus services",
)
async def list_campus_services(
    campus_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
) -> List[CampusServiceModel]:
    """Retrieve operational services for a campus."""
    try:
        return _service_catalog.list_services(campus_id)
    except CampusNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get(
    "/{campus_id}/dependencies",
    response_model=List[Dependency],
    summary="List campus dependency edges",
)
async def list_campus_dependencies(
    campus_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
) -> List[Dependency]:
    """Retrieve dependency graph edges for a campus."""
    try:
        return _graph_service.list_dependencies(campus_id)
    except CampusNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


# ------------------------------------------------------------------------------
# 3. Graph Reconstruction & Traversal
# ------------------------------------------------------------------------------

@router.get(
    "/{campus_id}/graph",
    summary="Reconstruct campus dependency graph",
)
async def get_campus_graph(
    campus_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
) -> Dict[str, Any]:
    """Reconstruct complete campus dependency graph with summary and node collections."""
    try:
        graph = _graph_service.get_campus_graph(campus_id)
        locations = _location_service.list_locations(campus_id)
        resources = _resource_service.list_resources(campus_id)
        services = _service_catalog.list_services(campus_id)
        deps = _graph_service.list_dependencies(campus_id)

        nodes = [node.model_dump() for node in graph.nodes.values()]
        edges = [edge.model_dump() for edge in graph.edges]

        return {
            "campus_id": campus_id,
            "summary": {
                "total_locations": len(locations),
                "total_resources": len(resources),
                "total_services": len(services),
                "total_dependencies": len(deps),
            },
            "nodes": nodes,
            "edges": edges,
        }
    except CampusNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get(
    "/{campus_id}/dependencies/{entity_type}/{entity_id}/dependencies",
    summary="Traverse upstream dependencies",
)
async def get_upstream_dependencies(
    campus_id: str,
    entity_type: str,
    entity_id: str,
    max_depth: Optional[int] = Query(default=None),
    user: AuthenticatedUser = Depends(get_current_user),
) -> Dict[str, Any]:
    """Traverse what feeds into this entity."""
    try:
        ctype = CampusEntityType(entity_type.lower())
        return _graph_service.get_upstream_dependencies(
            campus_id=campus_id,
            entity_type=ctype,
            entity_id=entity_id,
            max_depth=max_depth,
        )
    except (CampusNotFoundError, EntityNotFoundError) as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get(
    "/{campus_id}/dependencies/{entity_type}/{entity_id}/dependents",
    summary="Traverse downstream dependents",
)
async def get_downstream_dependents(
    campus_id: str,
    entity_type: str,
    entity_id: str,
    max_depth: Optional[int] = Query(default=None),
    user: AuthenticatedUser = Depends(get_current_user),
) -> Dict[str, Any]:
    """Traverse what depends on this entity."""
    try:
        ctype = CampusEntityType(entity_type.lower())
        return _graph_service.get_downstream_dependents(
            campus_id=campus_id,
            entity_type=ctype,
            entity_id=entity_id,
            max_depth=max_depth,
        )
    except (CampusNotFoundError, EntityNotFoundError) as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post(
    "/{campus_id}/dependencies",
    response_model=Dependency,
    status_code=status.HTTP_201_CREATED,
    summary="Create dependency edge",
)
async def create_dependency(
    campus_id: str,
    payload: CreateDependencyRequest,
    user: AuthenticatedUser = Depends(require_admin),
) -> Dependency:
    """Create a new directed dependency edge between entities (Admin only)."""
    try:
        return _graph_service.create_dependency(
            campus_id=campus_id,
            source_type=payload.source_type,
            source_id=payload.source_id,
            target_type=payload.target_type,
            target_id=payload.target_id,
            dependency_type=payload.dependency_type,
            strength=payload.strength,
            description=payload.description,
        )
    except SelfDependencyError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except DuplicateDependencyError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except (EntityNotFoundError, CampusNotFoundError) as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except InvalidDependencyError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
