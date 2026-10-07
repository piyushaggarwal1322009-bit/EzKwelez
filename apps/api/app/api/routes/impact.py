"""Impact Analysis and Blast Radius API routes."""

from datetime import datetime, timezone
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.dependencies import get_impact_analysis_service
from app.domain.impact.models import FailureEvent, TraversalPolicy
from app.domain.impact.ports import ImpactAnalysisEngine
from app.schemas.campus import ApiErrorEnvelope, ApiResponseEnvelope, ApiResponseMeta
from app.schemas.graph import DependencyNodeDTO
from app.schemas.impact import (
    AnalysisProvenanceDTO,
    ImpactAnalysisRequestDTO,
    ImpactReportDTO,
    ImpactedNodeDTO,
)

router = APIRouter(prefix="/impact-analysis", tags=["Impact Analysis & Blast Radius"])


def generate_meta(data_mode: str = "simulated", cached: bool = False) -> ApiResponseMeta:
    return ApiResponseMeta(
        requestId=f"req_{uuid.uuid4().hex[:12]}",
        timestamp=datetime.now(timezone.utc).isoformat(),
        dataMode=data_mode,
        cached=cached,
    )


@router.post(
    "",
    response_model=ApiResponseEnvelope[ImpactReportDTO],
    responses={
        400: {"model": ApiErrorEnvelope, "description": "Invalid failure parameters"},
        404: {"model": ApiErrorEnvelope, "description": "Root node not found"},
    },
    summary="Evaluate downstream blast radius and impact report for a failure event",
)
async def analyze_impact(
    request: ImpactAnalysisRequestDTO,
    engine: ImpactAnalysisEngine = Depends(get_impact_analysis_service),
):
    """Calculates multi-hop dependency blast radius starting from a failure root node."""
    failure = FailureEvent(
        id=f"fail_{uuid.uuid4().hex[:12]}",
        node_id=request.root_node_id,
        failure_type=request.failure_type,
        severity=request.severity,
        metadata=request.metadata,
    )

    policy = None
    if request.options:
        policy = TraversalPolicy(
            max_depth=request.options.max_depth,
            allowed_relationships=request.options.allowed_relationships,
            minimum_criticality=request.options.minimum_criticality,
            include_degraded=request.options.include_degraded,
            stop_at_failed=request.options.stop_at_failed,
        )

    try:
        report = await engine.analyze_failure(failure, policy)
    except ValueError as e:
        req_id = f"req_{uuid.uuid4().hex[:12]}"
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "ROOT_NODE_NOT_FOUND",
                    "message": str(e),
                    "requestId": req_id,
                    "details": {"rootNodeId": request.root_node_id},
                }
            },
        )

    impacted_node_dtos = [
        ImpactedNodeDTO(
            nodeId=n.node_id,
            nodeName=n.node_name,
            impactType=n.impact_type,
            impactSeverity=n.impact_severity,
            distanceFromRoot=n.distance_from_root,
            criticality=n.criticality,
            reason=n.reason,
            locationId=n.location_id,
        )
        for n in report.impacted_nodes
    ]

    root_dto = DependencyNodeDTO(
        id=report.root_node.id,
        type=report.root_node.type,
        name=report.root_node.name,
        status=report.root_node.status,
        criticality=report.root_node.criticality,
        locationId=report.root_node.location_id,
        metadata=report.root_node.metadata,
        createdAt=report.root_node.created_at,
    )

    prov_dto = AnalysisProvenanceDTO(
        graphDataMode=report.provenance.graph_data_mode,
        campusDataMode=report.provenance.campus_data_mode,
        generatedAt=report.provenance.generated_at,
        sourceSummary=report.provenance.source_summary,
    )

    report_dto = ImpactReportDTO(
        analysisId=report.analysis_id,
        rootNode=root_dto,
        impactedNodes=impacted_node_dtos,
        impactedLocations=report.impacted_locations,
        severity=report.severity,
        propagationDepth=report.propagation_depth,
        generatedAt=report.generated_at,
        dataMode=report.data_mode,
        provenance=prov_dto,
        warnings=report.warnings,
    )

    return ApiResponseEnvelope(
        data=report_dto,
        meta=generate_meta(data_mode=report.data_mode.value),
    )
