"""Campus facilities and live conditions API endpoints."""

from datetime import datetime, timezone
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.api.dependencies import get_condition_service
from app.application.condition_service import ConditionAggregationService
from app.schemas.campus import (
    ApiErrorDetail,
    ApiErrorEnvelope,
    ApiResponseEnvelope,
    ApiResponseMeta,
    CampusLocationDTO,
    CampusSummaryDTO,
    ConnectivitySnapshotDTO,
    LiveCampusConditionsDTO,
    LocationConditionDTO,
    OccupancySnapshotDTO,
)

router = APIRouter(prefix="/campus", tags=["Campus Facilities & Conditions"])


def generate_meta(data_mode: Optional[str] = None, cached: bool = False) -> ApiResponseMeta:
    """Helper to construct standard response metadata envelope."""
    return ApiResponseMeta(
        requestId=f"req_{uuid.uuid4().hex[:12]}",
        timestamp=datetime.now(timezone.utc).isoformat(),
        dataMode=data_mode,
        cached=cached,
    )


@router.get(
    "/locations",
    response_model=ApiResponseEnvelope[List[CampusLocationDTO]],
    summary="List all campus facilities and rooms",
)
async def list_locations(
    campus_id: Optional[str] = Query(default=None, alias="campusId"),
    service: ConditionAggregationService = Depends(get_condition_service),
):
    """Retrieve all physical campus facilities, rooms, and labs."""
    locations = await service.get_all_locations(campus_id)
    dtos = [
        CampusLocationDTO(
            id=loc.id,
            name=loc.name,
            type=loc.type,
            campusId=loc.campus_id,
            buildingId=loc.building_id,
            capacity=loc.capacity,
            metadata=loc.metadata,
        )
        for loc in locations
    ]
    return ApiResponseEnvelope(
        data=dtos,
        meta=generate_meta(),
    )


@router.get(
    "/conditions",
    response_model=ApiResponseEnvelope[LiveCampusConditionsDTO],
    summary="Get aggregated live conditions across all campus facilities",
)
async def get_campus_conditions(
    campus_id: Optional[str] = Query(default=None, alias="campusId"),
    service: ConditionAggregationService = Depends(get_condition_service),
):
    """Retrieve occupancy and connectivity conditions across all campus facilities."""
    result = await service.get_live_campus_conditions(campus_id)

    location_dtos = [
        LocationConditionDTO(
            location=CampusLocationDTO(
                id=item.location.id,
                name=item.location.name,
                type=item.location.type,
                campusId=item.location.campus_id,
                buildingId=item.location.building_id,
                capacity=item.location.capacity,
                metadata=item.location.metadata,
            ),
            occupancy=OccupancySnapshotDTO(
                locationId=item.occupancy.location_id,
                currentStudents=item.occupancy.current_students,
                capacity=item.occupancy.capacity,
                occupancyPercentage=item.occupancy.occupancy_percentage,
                status=item.occupancy.status,
                updatedAt=item.occupancy.updated_at,
                dataMode=item.occupancy.data_mode,
            ),
            connectivity=ConnectivitySnapshotDTO(
                locationId=item.connectivity.location_id,
                signalScore=item.connectivity.signal_score,
                quality=item.connectivity.quality,
                networkName=item.connectivity.network_name,
                dbm=item.connectivity.dbm,
                updatedAt=item.connectivity.updated_at,
                dataMode=item.connectivity.data_mode,
            ),
            overallHealth=item.overall_health,
        )
        for item in result.locations
    ]

    summary_dto = CampusSummaryDTO(
        totalLocations=result.total_locations,
        totalOccupancy=result.total_occupancy,
        totalCapacity=result.total_capacity,
        averageOccupancyRate=result.average_occupancy_rate,
        overallSignalScore=result.overall_signal_score,
    )

    payload = LiveCampusConditionsDTO(
        locations=location_dtos,
        summary=summary_dto,
        dataMode=result.data_mode,
        generatedAt=result.generated_at,
    )

    return ApiResponseEnvelope(
        data=payload,
        meta=generate_meta(data_mode=result.data_mode.value),
    )


@router.get(
    "/conditions/{location_id}",
    response_model=ApiResponseEnvelope[LocationConditionDTO],
    responses={
        404: {"model": ApiErrorEnvelope, "description": "Location not found"}
    },
    summary="Get condition for a specific campus facility",
)
async def get_location_condition(
    location_id: str,
    service: ConditionAggregationService = Depends(get_condition_service),
):
    """Retrieve detailed condition for a single campus room, lab, or facility."""
    condition = await service.get_location_condition(location_id)
    if not condition:
        req_id = f"req_{uuid.uuid4().hex[:12]}"
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "LOCATION_NOT_FOUND",
                    "message": f"Campus facility with ID '{location_id}' was not found.",
                    "requestId": req_id,
                    "details": {"locationId": location_id},
                }
            },
        )

    dto = LocationConditionDTO(
        location=CampusLocationDTO(
            id=condition.location.id,
            name=condition.location.name,
            type=condition.location.type,
            campusId=condition.location.campus_id,
            buildingId=condition.location.building_id,
            capacity=condition.location.capacity,
            metadata=condition.location.metadata,
        ),
        occupancy=OccupancySnapshotDTO(
            locationId=condition.occupancy.location_id,
            currentStudents=condition.occupancy.current_students,
            capacity=condition.occupancy.capacity,
            occupancyPercentage=condition.occupancy.occupancy_percentage,
            status=condition.occupancy.status,
            updatedAt=condition.occupancy.updated_at,
            dataMode=condition.occupancy.data_mode,
        ),
        connectivity=ConnectivitySnapshotDTO(
            locationId=condition.connectivity.location_id,
            signalScore=condition.connectivity.signal_score,
            quality=condition.connectivity.quality,
            networkName=condition.connectivity.network_name,
            dbm=condition.connectivity.dbm,
            updatedAt=condition.connectivity.updated_at,
            dataMode=condition.connectivity.data_mode,
        ),
        overallHealth=condition.overall_health,
    )

    return ApiResponseEnvelope(
        data=dto,
        meta=generate_meta(data_mode=condition.occupancy.data_mode.value),
    )
