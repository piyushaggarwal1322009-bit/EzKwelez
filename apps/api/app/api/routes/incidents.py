"""Incident and Disruption Management API Routes."""

from datetime import datetime, timezone
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from app.api.dependencies import get_development_principal, get_incident_service, get_assessment_service
from app.application.incident_service import (
    AffectedEntityNotFoundError,
    CrossCampusEntityError,
    DuplicateAffectedEntityError,
    IncidentApplicationService,
    IncidentNotFoundError,
    IncidentRootNodeNotFoundError,
    IncidentCampusNotFoundError,
    IncidentLocationNotFoundError,
    InvalidAffectedEntityTypeError,
)
from app.application.assessment_service import AssessmentService
from app.domain.campus.models import DataMode
from app.domain.incidents.models import (
    Incident,
    IncidentAffectedEntity,
    IncidentSeverity,
    IncidentSource,
    IncidentStatus,
    IncidentType,
    IncidentUpdate,
)
from app.infrastructure.auth import DevelopmentPrincipal
from app.domain.incidents.rules import InvalidStatusTransitionError
from app.schemas.campus import ApiErrorEnvelope, ApiResponseEnvelope, ApiResponseMeta
from app.schemas.incident import (
    AddAffectedEntityRequestDTO,
    CreateIncidentRequestDTO,
    IncidentAffectedEntityDTO,
    IncidentDTO,
    IncidentToImpactHandoffDTO,
    IncidentUpdateDTO,
    TransitionIncidentRequestDTO,
)
from app.schemas.assessment import IncidentAssessmentDTO

router = APIRouter(prefix="/incidents", tags=["Incidents & Disruption Management"])


def generate_meta(data_mode: str = "simulated", cached: bool = False) -> ApiResponseMeta:
    return ApiResponseMeta(
        requestId=f"req_{uuid.uuid4().hex[:12]}",
        timestamp=datetime.now(timezone.utc).isoformat(),
        dataMode=data_mode,
        cached=cached,
    )


def map_incident_to_dto(inc: Incident) -> IncidentDTO:
    return IncidentDTO(
        id=inc.id,
        campusId=inc.campus_id,
        title=inc.title,
        description=inc.description,
        type=inc.type,
        severity=inc.severity,
        status=inc.status,
        source=inc.source,
        locationId=inc.location_id,
        rootNodeId=inc.root_node_id,
        startedAt=inc.started_at,
        detectedAt=inc.detected_at,
        acknowledgedAt=inc.acknowledged_at,
        resolvedAt=inc.resolved_at,
        closedAt=inc.closed_at,
        cancelledAt=inc.cancelled_at,
        createdAt=inc.created_at,
        updatedAt=inc.updated_at,
        dataMode=inc.data_mode,
        metadata=inc.metadata,
        estimatedDurationMinutes=inc.estimated_duration_minutes,
    )


def map_affected_entity_to_dto(entity: IncidentAffectedEntity) -> IncidentAffectedEntityDTO:
    return IncidentAffectedEntityDTO(
        incidentId=entity.incident_id,
        campusId=entity.campus_id,
        nodeId=entity.node_id,
        reason=entity.reason,
        createdBy=entity.created_by,
        createdAt=entity.created_at,
    )


def map_update_to_dto(upd: IncidentUpdate) -> IncidentUpdateDTO:
    return IncidentUpdateDTO(
        id=upd.id,
        incidentId=upd.incident_id,
        type=upd.type,
        message=upd.message,
        statusBefore=upd.status_before,
        statusAfter=upd.status_after,
        severityBefore=upd.severity_before,
        severityAfter=upd.severity_after,
        createdBy=upd.created_by,
        createdAt=upd.created_at,
        metadata=upd.metadata,
    )


from app.domain.assessment.models import IncidentAssessment, AffectedEntity, BlastRadiusResult, ImpactAssessment
from app.schemas.assessment import AffectedEntityDTO, BlastRadiusResultDTO, ImpactAssessmentDTO, IncidentAssessmentDTO

def map_affected_entity_domain_to_dto(entity: AffectedEntity) -> AffectedEntityDTO:
    return AffectedEntityDTO(
        entityId=entity.entity_id,
        entityType=entity.entity_type,
        entityName=entity.entity_name,
        entityCode=entity.entity_code,
        depth=entity.depth,
        isDirect=entity.is_direct,
        parentEntityId=entity.parent_entity_id,
        dependencyType=entity.dependency_type,
        dependencyStrength=entity.dependency_strength,
        reason=entity.reason,
        criticality=entity.criticality.value,
        locationId=entity.location_id,
        path=entity.path
    )

def map_blast_radius_to_dto(blast: BlastRadiusResult) -> BlastRadiusResultDTO:
    return BlastRadiusResultDTO(
        directEntities=[map_affected_entity_domain_to_dto(e) for e in blast.direct_entities],
        transitiveEntities=[map_affected_entity_domain_to_dto(e) for e in blast.transitive_entities],
        totalAffectedCount=blast.total_affected_count,
        maximumDepth=blast.maximum_depth,
        generatedAt=blast.generated_at
    )

def map_impact_to_dto(impact: ImpactAssessment) -> ImpactAssessmentDTO:
    return ImpactAssessmentDTO(
        totalImpactScore=impact.total_impact_score,
        impactCategory=impact.impact_category,
        affectedLocations=impact.affected_locations,
        affectedResourcesCount=impact.affected_resources_count,
        affectedServicesCount=impact.affected_services_count,
        criticalDependencyCount=impact.critical_dependency_count,
        explanationMetadata=impact.explanation_metadata,
        generatedAt=impact.generated_at
    )

def map_assessment_to_dto(assessment: IncidentAssessment) -> IncidentAssessmentDTO:
    return IncidentAssessmentDTO(
        assessmentId=assessment.assessment_id,
        incident=map_incident_to_dto(assessment.incident),
        blastRadius=map_blast_radius_to_dto(assessment.blast_radius),
        impact=map_impact_to_dto(assessment.impact),
        dataMode=assessment.data_mode.value,
        generatedAt=assessment.generated_at
    )



@router.post(
    "",
    response_model=ApiResponseEnvelope[IncidentDTO],
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ApiErrorEnvelope, "description": "Validation error or invalid invariant"},
        409: {"model": ApiErrorEnvelope, "description": "Duplicate incident conflict"},
    },
    summary="Report or create a new campus incident/disruption",
)
async def create_incident(
    request: CreateIncidentRequestDTO,
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
    principal: DevelopmentPrincipal = Depends(get_development_principal),
    service: IncidentApplicationService = Depends(get_incident_service),
):
    """Creates a new authoritative incident record with audit history."""
    try:
        incident = await service.create_incident(
            title=request.title,
            description=request.description,
            incident_type=request.type,
            severity=request.severity,
            campus_id=principal.campus_id,
            estimated_duration_minutes=request.estimated_duration_minutes,
            source=request.source,
            status=request.status,
            location_id=request.location_id,
            root_node_id=request.root_node_id,
            started_at=request.started_at,
            detected_at=request.detected_at,
            data_mode=request.data_mode,
            actor_id=principal.actor_id,
            idempotency_key=idempotency_key,
            metadata=request.metadata,
        )
    except ValueError as e:
        req_id = f"req_{uuid.uuid4().hex[:12]}"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": {
                    "code": "INVALID_INCIDENT_DATA",
                    "message": str(e),
                    "requestId": req_id,
                }
            },
        )
    except IncidentCampusNotFoundError as e:
        raise HTTPException(status_code=404, detail={"error": {"code": "CAMPUS_NOT_FOUND", "message": str(e)}})
    except (IncidentLocationNotFoundError, IncidentRootNodeNotFoundError) as e:
        raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_CAMPUS_REFERENCE", "message": str(e)}})

    return ApiResponseEnvelope(
        data=map_incident_to_dto(incident),
        meta=generate_meta(data_mode=incident.data_mode.value),
    )


@router.get(
    "",
    response_model=ApiResponseEnvelope[List[IncidentDTO]],
    summary="Query and filter campus incidents",
)
async def list_incidents(
    status_filter: Optional[IncidentStatus] = Query(None, alias="status"),
    severity_filter: Optional[IncidentSeverity] = Query(None, alias="severity"),
    type_filter: Optional[IncidentType] = Query(None, alias="type"),
    location_id: Optional[str] = Query(None, alias="locationId"),
    data_mode: Optional[DataMode] = Query(None, alias="dataMode"),
    principal: DevelopmentPrincipal = Depends(get_development_principal),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    service: IncidentApplicationService = Depends(get_incident_service),
):
    """Lists incidents ordered by creation time with multi-factor filtering."""
    incidents = await service.list_incidents(
        status=status_filter,
        severity=severity_filter,
        incident_type=type_filter,
        location_id=location_id,
        data_mode=data_mode,
        limit=limit,
        offset=offset,
        campus_id=principal.campus_id,
    )
    return ApiResponseEnvelope(
        data=[map_incident_to_dto(inc) for inc in incidents],
        meta=generate_meta(),
    )


@router.get(
    "/{incident_id}",
    response_model=ApiResponseEnvelope[IncidentDTO],
    responses={
        404: {"model": ApiErrorEnvelope, "description": "Incident not found"},
    },
    summary="Retrieve single incident by ID",
)
async def get_incident(
    incident_id: str,
    principal: DevelopmentPrincipal = Depends(get_development_principal),
    service: IncidentApplicationService = Depends(get_incident_service),
):
    """Fetches details for a specific incident."""
    try:
        incident = await service.get_incident_in_campus(incident_id, principal.campus_id)
    except IncidentNotFoundError as e:
        req_id = f"req_{uuid.uuid4().hex[:12]}"
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "INCIDENT_NOT_FOUND",
                    "message": str(e),
                    "requestId": req_id,
                    "details": {"incidentId": incident_id},
                }
            },
        )

    return ApiResponseEnvelope(
        data=map_incident_to_dto(incident),
        meta=generate_meta(data_mode=incident.data_mode.value),
    )


@router.post(
    "/{incident_id}/transitions",
    response_model=ApiResponseEnvelope[IncidentDTO],
    responses={
        400: {"model": ApiErrorEnvelope, "description": "Invalid state transition requested"},
        404: {"model": ApiErrorEnvelope, "description": "Incident not found"},
    },
    summary="Execute a validated lifecycle state transition",
)
async def transition_incident(
    incident_id: str,
    request: TransitionIncidentRequestDTO,
    principal: DevelopmentPrincipal = Depends(get_development_principal),
    service: IncidentApplicationService = Depends(get_incident_service),
):
    """Advances or updates the state machine status of an incident with audit trail."""
    try:
        updated = await service.transition_incident_status(
            incident_id=incident_id,
            target_status=request.target_status,
            actor_id=principal.actor_id,
            message=request.message,
            campus_id=principal.campus_id,
        )
    except IncidentNotFoundError as e:
        req_id = f"req_{uuid.uuid4().hex[:12]}"
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "INCIDENT_NOT_FOUND",
                    "message": str(e),
                    "requestId": req_id,
                    "details": {"incidentId": incident_id},
                }
            },
        )
    except InvalidStatusTransitionError as e:
        req_id = f"req_{uuid.uuid4().hex[:12]}"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": {
                    "code": "INVALID_STATUS_TRANSITION",
                    "message": str(e),
                    "requestId": req_id,
                    "details": {
                        "incidentId": incident_id,
                        "fromStatus": e.from_status.value,
                        "toStatus": e.to_status.value,
                    },
                }
            },
        )

    return ApiResponseEnvelope(
        data=map_incident_to_dto(updated),
        meta=generate_meta(data_mode=updated.data_mode.value),
    )


@router.get(
    "/{incident_id}/updates",
    response_model=ApiResponseEnvelope[List[IncidentUpdateDTO]],
    responses={
        404: {"model": ApiErrorEnvelope, "description": "Incident not found"},
    },
    summary="Get immutable chronological audit updates for an incident",
)
async def get_incident_updates(
    incident_id: str,
    principal: DevelopmentPrincipal = Depends(get_development_principal),
    service: IncidentApplicationService = Depends(get_incident_service),
):
    """Retrieves full audit log history for an incident."""
    try:
        await service.get_incident_in_campus(incident_id, principal.campus_id)
        updates = await service.list_incident_updates(incident_id)
    except IncidentNotFoundError as e:
        req_id = f"req_{uuid.uuid4().hex[:12]}"
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "INCIDENT_NOT_FOUND",
                    "message": str(e),
                    "requestId": req_id,
                    "details": {"incidentId": incident_id},
                }
            },
        )

    return ApiResponseEnvelope(
        data=[map_update_to_dto(u) for u in updates],
        meta=generate_meta(),
    )


@router.post(
    "/{incident_id}/affected-entities",
    response_model=ApiResponseEnvelope[IncidentAffectedEntityDTO],
    status_code=status.HTTP_201_CREATED,
)
async def add_affected_entity(
    incident_id: str,
    request: AddAffectedEntityRequestDTO,
    principal: DevelopmentPrincipal = Depends(get_development_principal),
    service: IncidentApplicationService = Depends(get_incident_service),
):
    try:
        relationship = await service.add_affected_entity(
            incident_id=incident_id,
            node_id=request.node_id,
            reason=request.reason,
            actor_id=principal.actor_id,
            campus_id=principal.campus_id,
        )
    except IncidentNotFoundError as error:
        raise HTTPException(status_code=404, detail={"error": {"code": "INCIDENT_NOT_FOUND", "message": str(error)}})
    except AffectedEntityNotFoundError as error:
        raise HTTPException(status_code=404, detail={"error": {"code": "ENTITY_NOT_FOUND", "message": str(error)}})
    except CrossCampusEntityError as error:
        raise HTTPException(status_code=400, detail={"error": {"code": "CROSS_CAMPUS_ENTITY", "message": str(error)}})
    except InvalidAffectedEntityTypeError as error:
        raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_ENTITY_TYPE", "message": str(error)}})
    except DuplicateAffectedEntityError as error:
        raise HTTPException(status_code=409, detail={"error": {"code": "DUPLICATE_AFFECTED_ENTITY", "message": str(error)}})

    return ApiResponseEnvelope(data=map_affected_entity_to_dto(relationship), meta=generate_meta())


@router.get(
    "/{incident_id}/affected-entities",
    response_model=ApiResponseEnvelope[List[IncidentAffectedEntityDTO]],
)
async def get_affected_entities(
    incident_id: str,
    principal: DevelopmentPrincipal = Depends(get_development_principal),
    service: IncidentApplicationService = Depends(get_incident_service),
):
    try:
        entities = await service.list_affected_entities(incident_id, principal.campus_id)
    except IncidentNotFoundError as error:
        raise HTTPException(status_code=404, detail={"error": {"code": "INCIDENT_NOT_FOUND", "message": str(error)}})
    return ApiResponseEnvelope(
        data=[map_affected_entity_to_dto(entity) for entity in entities],
        meta=generate_meta(),
    )


@router.get(
    "/{incident_id}/impact-handoff",
    response_model=ApiResponseEnvelope[IncidentToImpactHandoffDTO],
    responses={
        400: {"model": ApiErrorEnvelope, "description": "Incident not linked to root node"},
        404: {"model": ApiErrorEnvelope, "description": "Incident not found"},
    },
    summary="Generate decoupled handoff payload for Phase 4 Impact Analysis",
)
async def get_impact_handoff(
    incident_id: str,
    principal: DevelopmentPrincipal = Depends(get_development_principal),
    service: IncidentApplicationService = Depends(get_incident_service),
):
    """Produces the minimal contract required to trigger Phase 4 impact blast radius analysis."""
    try:
        handoff = await service.get_impact_analysis_handoff(incident_id, principal.campus_id)
    except IncidentNotFoundError as e:
        req_id = f"req_{uuid.uuid4().hex[:12]}"
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "INCIDENT_NOT_FOUND",
                    "message": str(e),
                    "requestId": req_id,
                    "details": {"incidentId": incident_id},
                }
            },
        )
    except ValueError as e:
        req_id = f"req_{uuid.uuid4().hex[:12]}"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": {
                    "code": "MISSING_ROOT_NODE",
                    "message": str(e),
                    "requestId": req_id,
                    "details": {"incidentId": incident_id},
                }
            },
        )

    return ApiResponseEnvelope(
        data=IncidentToImpactHandoffDTO(
            incidentId=handoff.incident_id,
            rootNodeId=handoff.root_node_id,
            failureType=handoff.failure_type,
            severity=handoff.severity,
            occurredAt=handoff.occurred_at,
            dataMode=handoff.data_mode,
        ),
        meta=generate_meta(data_mode=handoff.data_mode.value),
    )


@router.get(
    "/{incident_id}/assessment",
    response_model=ApiResponseEnvelope[IncidentAssessmentDTO],
    summary="Get incident blast radius and deterministic impact assessment",
)
async def get_assessment(
    incident_id: str,
    principal: DevelopmentPrincipal = Depends(get_development_principal),
    assessment_service: AssessmentService = Depends(get_assessment_service),
):
    try:
        assessment = await assessment_service.generate_assessment(
            incident_id=incident_id, 
            campus_id=principal.campus_id
        )
    except IncidentNotFoundError as error:
        raise HTTPException(status_code=404, detail={"error": {"code": "INCIDENT_NOT_FOUND", "message": str(error)}})
        
    return ApiResponseEnvelope(
        data=map_assessment_to_dto(assessment),
        meta=generate_meta(data_mode=assessment.data_mode.value)
    )
