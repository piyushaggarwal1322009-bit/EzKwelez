"""FastAPI Routes for Campus Domain and Dependency Graph."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.api.dependencies import get_current_user, require_admin_or_staff
from app.application.services.campus_service import CampusService
from app.application.services.dependency_graph_service import DependencyGraphService
from app.application.services.location_service import LocationService
from app.application.services.resource_service import ResourceService
from app.application.services.service_catalog import ServiceCatalogService
from app.domain.campus.exceptions import (
    CampusDomainError,
    CampusNotFoundError,
    DuplicateDependencyError,
    EntityNotFoundError,
    InvalidDependencyError,
    SelfDependencyError,
)
from app.domain.campus.models import CampusEntityType
from app.infrastructure.auth.jwt import AuthenticatedUser
from app.schemas.campus import (
    CampusCreateRequest,
    CampusGraphResponseSchema,
    CampusResponse,
    DependencyCreateRequest,
    DependencyResponse,
    DependencyTraversalResponseSchema,
    LocationCreateRequest,
    LocationResponse,
    ResourceCreateRequest,
    ResourceResponse,
    ServiceCreateRequest,
    ServiceResponse,
)

router = APIRouter(tags=["Campus & Dependency Graph"])

# Instantiate application services
campus_service = CampusService()
location_service = LocationService()
resource_service = ResourceService()
service_catalog = ServiceCatalogService()
graph_service = DependencyGraphService()


# ==============================================================================
# 1. CAMPUS ENDPOINTS
# ==============================================================================

@router.get(
    "/api/campuses",
    response_model=List[CampusResponse],
    summary="List all campuses",
)
async def list_campuses(
    _: AuthenticatedUser = Depends(get_current_user),
) -> List[CampusResponse]:
    campuses = campus_service.list_campuses()
    return [
        CampusResponse(
            id=c.id,
            name=c.name,
            code=c.code,
            description=c.description,
            created_at=c.created_at,
            updated_at=c.updated_at,
        )
        for c in campuses
    ]


@router.post(
    "/api/campuses",
    response_model=CampusResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new campus boundary (Admin/Staff only)",
)
async def create_campus(
    payload: CampusCreateRequest,
    _: AuthenticatedUser = Depends(require_admin_or_staff),
) -> CampusResponse:
    campus = campus_service.create_campus(
        name=payload.name,
        code=payload.code,
        description=payload.description,
    )
    return CampusResponse(
        id=campus.id,
        name=campus.name,
        code=campus.code,
        description=campus.description,
        created_at=campus.created_at,
        updated_at=campus.updated_at,
    )


@router.get(
    "/api/campuses/{campus_id}",
    response_model=CampusResponse,
    summary="Get campus details by ID",
)
async def get_campus(
    campus_id: str,
    _: AuthenticatedUser = Depends(get_current_user),
) -> CampusResponse:
    try:
        c = campus_service.get_campus(campus_id)
        return CampusResponse(
            id=c.id,
            name=c.name,
            code=c.code,
            description=c.description,
            created_at=c.created_at,
            updated_at=c.updated_at,
        )
    except CampusNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


# ==============================================================================
# 2. LOCATION ENDPOINTS
# ==============================================================================

@router.get(
    "/api/campuses/{campus_id}/locations",
    response_model=List[LocationResponse],
    summary="List locations within a campus",
)
async def list_locations(
    campus_id: str,
    _: AuthenticatedUser = Depends(get_current_user),
) -> List[LocationResponse]:
    try:
        locs = location_service.list_locations(campus_id)
        return [
            LocationResponse(
                id=l.id,
                campus_id=l.campus_id,
                name=l.name,
                code=l.code,
                location_type=l.location_type,
                description=l.description,
                capacity=l.capacity,
                status=l.status,
                created_at=l.created_at,
                updated_at=l.updated_at,
            )
            for l in locs
        ]
    except CampusNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.post(
    "/api/campuses/{campus_id}/locations",
    response_model=LocationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new location (Admin/Staff only)",
)
async def create_location(
    campus_id: str,
    payload: LocationCreateRequest,
    _: AuthenticatedUser = Depends(require_admin_or_staff),
) -> LocationResponse:
    try:
        loc = location_service.create_location(
            campus_id=campus_id,
            name=payload.name,
            code=payload.code,
            location_type=payload.location_type,
            description=payload.description,
            capacity=payload.capacity,
            status=payload.status,
        )
        return LocationResponse(
            id=loc.id,
            campus_id=loc.campus_id,
            name=loc.name,
            code=loc.code,
            location_type=loc.location_type,
            description=loc.description,
            capacity=loc.capacity,
            status=loc.status,
            created_at=loc.created_at,
            updated_at=loc.updated_at,
        )
    except CampusNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.get(
    "/api/locations/{location_id}",
    response_model=LocationResponse,
    summary="Get location details",
)
async def get_location(
    location_id: str,
    _: AuthenticatedUser = Depends(get_current_user),
) -> LocationResponse:
    try:
        l = location_service.get_location(location_id)
        return LocationResponse(
            id=l.id,
            campus_id=l.campus_id,
            name=l.name,
            code=l.code,
            location_type=l.location_type,
            description=l.description,
            capacity=l.capacity,
            status=l.status,
            created_at=l.created_at,
            updated_at=l.updated_at,
        )
    except EntityNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


# ==============================================================================
# 3. RESOURCE / INFRASTRUCTURE ENDPOINTS
# ==============================================================================

@router.get(
    "/api/campuses/{campus_id}/resources",
    response_model=List[ResourceResponse],
    summary="List infrastructure resources in a campus",
)
async def list_resources(
    campus_id: str,
    _: AuthenticatedUser = Depends(get_current_user),
) -> List[ResourceResponse]:
    try:
        res_list = resource_service.list_resources(campus_id)
        return [
            ResourceResponse(
                id=r.id,
                campus_id=r.campus_id,
                location_id=r.location_id,
                name=r.name,
                code=r.code,
                resource_type=r.resource_type,
                description=r.description,
                status=r.status,
                created_at=r.created_at,
                updated_at=r.updated_at,
            )
            for r in res_list
        ]
    except CampusNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.post(
    "/api/campuses/{campus_id}/resources",
    response_model=ResourceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new resource component (Admin/Staff only)",
)
async def create_resource(
    campus_id: str,
    payload: ResourceCreateRequest,
    _: AuthenticatedUser = Depends(require_admin_or_staff),
) -> ResourceResponse:
    try:
        res = resource_service.create_resource(
            campus_id=campus_id,
            name=payload.name,
            code=payload.code,
            resource_type=payload.resource_type,
            location_id=payload.location_id,
            description=payload.description,
            status=payload.status,
        )
        return ResourceResponse(
            id=res.id,
            campus_id=res.campus_id,
            location_id=res.location_id,
            name=res.name,
            code=res.code,
            resource_type=res.resource_type,
            description=res.description,
            status=res.status,
            created_at=res.created_at,
            updated_at=res.updated_at,
        )
    except (CampusNotFoundError, EntityNotFoundError) as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.get(
    "/api/resources/{resource_id}",
    response_model=ResourceResponse,
    summary="Get resource details",
)
async def get_resource(
    resource_id: str,
    _: AuthenticatedUser = Depends(get_current_user),
) -> ResourceResponse:
    try:
        r = resource_service.get_resource(resource_id)
        return ResourceResponse(
            id=r.id,
            campus_id=r.campus_id,
            location_id=r.location_id,
            name=r.name,
            code=r.code,
            resource_type=r.resource_type,
            description=r.description,
            status=r.status,
            created_at=r.created_at,
            updated_at=r.updated_at,
        )
    except EntityNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


# ==============================================================================
# 4. SERVICE CATALOG ENDPOINTS
# ==============================================================================

@router.get(
    "/api/campuses/{campus_id}/services",
    response_model=List[ServiceResponse],
    summary="List operational services for a campus",
)
async def list_services(
    campus_id: str,
    _: AuthenticatedUser = Depends(get_current_user),
) -> List[ServiceResponse]:
    try:
        svc_list = service_catalog.list_services(campus_id)
        return [
            ServiceResponse(
                id=s.id,
                campus_id=s.campus_id,
                location_id=s.location_id,
                name=s.name,
                code=s.code,
                service_type=s.service_type,
                description=s.description,
                status=s.status,
                created_at=s.created_at,
                updated_at=s.updated_at,
            )
            for s in svc_list
        ]
    except CampusNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.post(
    "/api/campuses/{campus_id}/services",
    response_model=ServiceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new service (Admin/Staff only)",
)
async def create_service(
    campus_id: str,
    payload: ServiceCreateRequest,
    _: AuthenticatedUser = Depends(require_admin_or_staff),
) -> ServiceResponse:
    try:
        svc = service_catalog.create_service(
            campus_id=campus_id,
            name=payload.name,
            code=payload.code,
            service_type=payload.service_type,
            location_id=payload.location_id,
            description=payload.description,
            status=payload.status,
        )
        return ServiceResponse(
            id=svc.id,
            campus_id=svc.campus_id,
            location_id=svc.location_id,
            name=svc.name,
            code=svc.code,
            service_type=svc.service_type,
            description=svc.description,
            status=svc.status,
            created_at=svc.created_at,
            updated_at=svc.updated_at,
        )
    except (CampusNotFoundError, EntityNotFoundError) as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.get(
    "/api/services/{service_id}",
    response_model=ServiceResponse,
    summary="Get service details",
)
async def get_service(
    service_id: str,
    _: AuthenticatedUser = Depends(get_current_user),
) -> ServiceResponse:
    try:
        s = service_catalog.get_service(service_id)
        return ServiceResponse(
            id=s.id,
            campus_id=s.campus_id,
            location_id=s.location_id,
            name=s.name,
            code=s.code,
            service_type=s.service_type,
            description=s.description,
            status=s.status,
            created_at=s.created_at,
            updated_at=s.updated_at,
        )
    except EntityNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


# ==============================================================================
# 5. DEPENDENCY ENDPOINTS
# ==============================================================================

@router.get(
    "/api/campuses/{campus_id}/dependencies",
    response_model=List[DependencyResponse],
    summary="List all dependency edges for a campus",
)
async def list_dependencies(
    campus_id: str,
    _: AuthenticatedUser = Depends(get_current_user),
) -> List[DependencyResponse]:
    try:
        deps = graph_service.list_dependencies(campus_id)
        return [
            DependencyResponse(
                id=d.id,
                campus_id=d.campus_id,
                source_type=d.source_type,
                source_id=d.source_id,
                target_type=d.target_type,
                target_id=d.target_id,
                dependency_type=d.dependency_type,
                strength=d.strength,
                description=d.description,
                created_at=d.created_at,
                updated_at=d.updated_at,
            )
            for d in deps
        ]
    except CampusNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.post(
    "/api/campuses/{campus_id}/dependencies",
    response_model=DependencyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a dependency edge (Admin/Staff only)",
)
async def create_dependency(
    campus_id: str,
    payload: DependencyCreateRequest,
    _: AuthenticatedUser = Depends(require_admin_or_staff),
) -> DependencyResponse:
    try:
        dep = graph_service.create_dependency(
            campus_id=campus_id,
            source_type=payload.source_type,
            source_id=payload.source_id,
            target_type=payload.target_type,
            target_id=payload.target_id,
            dependency_type=payload.dependency_type,
            strength=payload.strength,
            description=payload.description,
        )
        return DependencyResponse(
            id=dep.id,
            campus_id=dep.campus_id,
            source_type=dep.source_type,
            source_id=dep.source_id,
            target_type=dep.target_type,
            target_id=dep.target_id,
            dependency_type=dep.dependency_type,
            strength=dep.strength,
            description=dep.description,
            created_at=dep.created_at,
            updated_at=dep.updated_at,
        )
    except CampusNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except EntityNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except SelfDependencyError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except DuplicateDependencyError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    except InvalidDependencyError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get(
    "/api/dependencies/{dependency_id}",
    response_model=DependencyResponse,
    summary="Get single dependency edge",
)
async def get_dependency(
    dependency_id: str,
    _: AuthenticatedUser = Depends(get_current_user),
) -> DependencyResponse:
    try:
        dep = graph_service.get_dependency(dependency_id)
        return DependencyResponse(
            id=dep.id,
            campus_id=dep.campus_id,
            source_type=dep.source_type,
            source_id=dep.source_id,
            target_type=dep.target_type,
            target_id=dep.target_id,
            dependency_type=dep.dependency_type,
            strength=dep.strength,
            description=dep.description,
            created_at=dep.created_at,
            updated_at=dep.updated_at,
        )
    except EntityNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.delete(
    "/api/dependencies/{dependency_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a dependency edge (Admin/Staff only)",
)
async def delete_dependency(
    dependency_id: str,
    _: AuthenticatedUser = Depends(require_admin_or_staff),
):
    try:
        graph_service.delete_dependency(dependency_id)
    except EntityNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


# ==============================================================================
# 6. GRAPH & TRAVERSAL ENDPOINTS
# ==============================================================================

@router.get(
    "/api/campuses/{campus_id}/graph",
    response_model=CampusGraphResponseSchema,
    summary="Retrieve full reconstructed dependency graph for a campus",
)
async def get_campus_graph(
    campus_id: str,
    _: AuthenticatedUser = Depends(get_current_user),
) -> CampusGraphResponseSchema:
    try:
        graph = graph_service.get_campus_graph(campus_id)
        nodes_list = list(graph.nodes.values())
        loc_count = sum(1 for n in nodes_list if n.entity_type == CampusEntityType.LOCATION)
        res_count = sum(1 for n in nodes_list if n.entity_type == CampusEntityType.RESOURCE)
        svc_count = sum(1 for n in nodes_list if n.entity_type == CampusEntityType.SERVICE)

        return CampusGraphResponseSchema(
            campus_id=graph.campus_id,
            nodes=[
                {
                    "id": n.id,
                    "entity_type": n.entity_type,
                    "name": n.name,
                    "code": n.code,
                    "type_category": n.type_category,
                    "status": n.status,
                    "location_id": n.location_id,
                }
                for n in nodes_list
            ],
            edges=[
                {
                    "id": e.id,
                    "source_type": e.source_type,
                    "source_id": e.source_id,
                    "target_type": e.target_type,
                    "target_id": e.target_id,
                    "dependency_type": e.dependency_type,
                    "strength": e.strength,
                    "description": e.description,
                }
                for e in graph.edges
            ],
            summary={
                "total_locations": loc_count,
                "total_resources": res_count,
                "total_services": svc_count,
                "total_dependencies": len(graph.edges),
            },
        )
    except CampusNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.get(
    "/api/campuses/{campus_id}/dependencies/{entity_type}/{entity_id}/dependencies",
    response_model=DependencyTraversalResponseSchema,
    summary="Find upstream dependencies (What feeds this entity)",
)
async def get_entity_dependencies(
    campus_id: str,
    entity_type: CampusEntityType,
    entity_id: str,
    max_depth: Optional[int] = Query(default=None, ge=1, le=20),
    _: AuthenticatedUser = Depends(get_current_user),
) -> DependencyTraversalResponseSchema:
    try:
        result = graph_service.get_upstream_dependencies(
            campus_id=campus_id,
            entity_type=entity_type,
            entity_id=entity_id,
            max_depth=max_depth,
        )
        return DependencyTraversalResponseSchema(**result)
    except CampusNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except EntityNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except InvalidDependencyError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get(
    "/api/campuses/{campus_id}/dependencies/{entity_type}/{entity_id}/dependents",
    response_model=DependencyTraversalResponseSchema,
    summary="Find downstream dependents (What depends on this entity)",
)
async def get_entity_dependents(
    campus_id: str,
    entity_type: CampusEntityType,
    entity_id: str,
    max_depth: Optional[int] = Query(default=None, ge=1, le=20),
    _: AuthenticatedUser = Depends(get_current_user),
) -> DependencyTraversalResponseSchema:
    try:
        result = graph_service.get_downstream_dependents(
            campus_id=campus_id,
            entity_type=entity_type,
            entity_id=entity_id,
            max_depth=max_depth,
        )
        return DependencyTraversalResponseSchema(**result)
    except CampusNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except EntityNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except InvalidDependencyError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


# Additional Top-level convenience route aliases matching prompt section 18
@router.get(
    "/api/dependencies/{entity_type}/{entity_id}/dependencies",
    response_model=DependencyTraversalResponseSchema,
    summary="Upstream dependencies convenience alias",
)
async def get_entity_dependencies_alias(
    entity_type: CampusEntityType,
    entity_id: str,
    campus_id: str = Query(default="a0000000-0000-0000-0000-000000000001"),
    max_depth: Optional[int] = Query(default=None, ge=1, le=20),
    user: AuthenticatedUser = Depends(get_current_user),
) -> DependencyTraversalResponseSchema:
    return await get_entity_dependencies(
        campus_id=campus_id,
        entity_type=entity_type,
        entity_id=entity_id,
        max_depth=max_depth,
        _=user,
    )


@router.get(
    "/api/dependencies/{entity_type}/{entity_id}/dependents",
    response_model=DependencyTraversalResponseSchema,
    summary="Downstream dependents convenience alias",
)
async def get_entity_dependents_alias(
    entity_type: CampusEntityType,
    entity_id: str,
    campus_id: str = Query(default="a0000000-0000-0000-0000-000000000001"),
    max_depth: Optional[int] = Query(default=None, ge=1, le=20),
    user: AuthenticatedUser = Depends(get_current_user),
) -> DependencyTraversalResponseSchema:
    return await get_entity_dependents(
        campus_id=campus_id,
        entity_type=entity_type,
        entity_id=entity_id,
        max_depth=max_depth,
        _=user,
    )
