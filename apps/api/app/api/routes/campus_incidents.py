"""Campus-scoped incident and operational-state routes."""

from datetime import datetime, timezone
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import (
    get_campus_repository,
    get_campus_state_service,
    get_development_principal,
    get_incident_service,
)
from app.application.campus_state_service import (
    CampusEntityNotFoundError,
    CampusNotFoundError,
    CampusStateService,
)
from app.domain.campus.ports import CampusRepository
from app.application.incident_service import (
    IncidentApplicationService,
    IncidentLocationNotFoundError,
    IncidentRootNodeNotFoundError,
)
from app.infrastructure.auth import DevelopmentPrincipal
from app.schemas.campus import ApiResponseEnvelope, ApiResponseMeta
from app.schemas.incident import (
    CreateIncidentRequestDTO,
    EntityOperationalStateDTO,
    IncidentDTO,
)
from app.api.routes.incidents import generate_meta, map_incident_to_dto


router = APIRouter(prefix="/campuses", tags=["Campus Incidents & State"])


@router.post(
    "/{campus_id}/incidents",
    response_model=ApiResponseEnvelope[IncidentDTO],
    status_code=status.HTTP_201_CREATED,
)
async def create_campus_incident(
    campus_id: str,
    request: CreateIncidentRequestDTO,
    principal: DevelopmentPrincipal = Depends(get_development_principal),
    campus_repository: CampusRepository = Depends(get_campus_repository),
    incident_service: IncidentApplicationService = Depends(get_incident_service),
):
    if campus_id != principal.campus_id:
        raise HTTPException(status_code=404, detail={"error": {"code": "CAMPUS_NOT_FOUND", "message": f"Campus '{campus_id}' was not found."}})
    if not await campus_repository.get_all_locations(campus_id):
        raise HTTPException(status_code=404, detail={"error": {"code": "CAMPUS_NOT_FOUND", "message": f"Campus '{campus_id}' was not found."}})

    try:
        incident = await incident_service.create_incident(
            title=request.title,
            description=request.description,
            incident_type=request.type,
            severity=request.severity,
            campus_id=campus_id,
            estimated_duration_minutes=request.estimated_duration_minutes,
            source=request.source,
            status=request.status,
            location_id=request.location_id,
            root_node_id=request.root_node_id,
            started_at=request.started_at,
            detected_at=request.detected_at,
            data_mode=request.data_mode,
            actor_id=principal.actor_id,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_INCIDENT_DATA", "message": str(error)}})
    except (IncidentLocationNotFoundError, IncidentRootNodeNotFoundError) as error:
        raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_CAMPUS_REFERENCE", "message": str(error)}})

    return ApiResponseEnvelope(data=map_incident_to_dto(incident), meta=generate_meta(incident.data_mode.value))


@router.get(
    "/{campus_id}/incidents",
    response_model=ApiResponseEnvelope[List[IncidentDTO]],
)
async def list_campus_incidents(
    campus_id: str,
    principal: DevelopmentPrincipal = Depends(get_development_principal),
    campus_repository: CampusRepository = Depends(get_campus_repository),
    incident_service: IncidentApplicationService = Depends(get_incident_service),
):
    if campus_id != principal.campus_id:
        raise HTTPException(status_code=404, detail={"error": {"code": "CAMPUS_NOT_FOUND", "message": f"Campus '{campus_id}' was not found."}})
    if not await campus_repository.get_all_locations(campus_id):
        raise HTTPException(status_code=404, detail={"error": {"code": "CAMPUS_NOT_FOUND", "message": f"Campus '{campus_id}' was not found."}})
    incidents = await incident_service.list_campus_incidents(campus_id)
    return ApiResponseEnvelope(data=[map_incident_to_dto(item) for item in incidents], meta=generate_meta())


@router.get(
    "/{campus_id}/state",
    response_model=ApiResponseEnvelope[List[EntityOperationalStateDTO]],
)
async def get_campus_state(
    campus_id: str,
    principal: DevelopmentPrincipal = Depends(get_development_principal),
    service: CampusStateService = Depends(get_campus_state_service),
):
    if campus_id != principal.campus_id:
        raise HTTPException(status_code=404, detail={"error": {"code": "CAMPUS_NOT_FOUND", "message": f"Campus '{campus_id}' was not found."}})
    try:
        states = await service.get_campus_state(campus_id)
    except CampusNotFoundError as error:
        raise HTTPException(status_code=404, detail={"error": {"code": "CAMPUS_NOT_FOUND", "message": str(error)}})
    return ApiResponseEnvelope(
        data=[EntityOperationalStateDTO.model_validate(state.__dict__) for state in states],
        meta=ApiResponseMeta(
            requestId=f"req_{uuid.uuid4().hex[:12]}",
            timestamp=datetime.now(timezone.utc).isoformat(),
            dataMode="simulated",
        ),
    )


@router.get(
    "/{campus_id}/state/{node_id}",
    response_model=ApiResponseEnvelope[EntityOperationalStateDTO],
)
async def get_entity_state(
    campus_id: str,
    node_id: str,
    principal: DevelopmentPrincipal = Depends(get_development_principal),
    service: CampusStateService = Depends(get_campus_state_service),
):
    if campus_id != principal.campus_id:
        raise HTTPException(status_code=404, detail={"error": {"code": "CAMPUS_NOT_FOUND", "message": f"Campus '{campus_id}' was not found."}})
    try:
        entity_state = await service.get_entity_state(campus_id, node_id)
    except CampusNotFoundError as error:
        raise HTTPException(status_code=404, detail={"error": {"code": "CAMPUS_NOT_FOUND", "message": str(error)}})
    except CampusEntityNotFoundError as error:
        raise HTTPException(status_code=404, detail={"error": {"code": "ENTITY_NOT_FOUND", "message": str(error)}})
    return ApiResponseEnvelope(
        data=EntityOperationalStateDTO.model_validate(entity_state.__dict__),
        meta=ApiResponseMeta(
            requestId=f"req_{uuid.uuid4().hex[:12]}",
            timestamp=datetime.now(timezone.utc).isoformat(),
            dataMode="simulated",
        ),
    )