"""Pydantic schemas for Campus Facilities, Telemetry Snapshots, and Live Conditions."""

from typing import Any, Dict, Generic, List, Optional, TypeVar
from pydantic import BaseModel, ConfigDict, Field
from app.domain.campus.models import (
    ConnectivityQuality,
    DataMode,
    EntityType,
    OccupancyStatus,
)


T = TypeVar("T")


# ------------------------------------------------------------------------------
# Standard API Response and Error Envelopes
# ------------------------------------------------------------------------------

class ApiResponseMeta(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    request_id: str = Field(..., alias="requestId")
    timestamp: str
    data_mode: Optional[DataMode] = Field(default=None, alias="dataMode")
    cached: bool = False


class ApiResponseEnvelope(BaseModel, Generic[T]):
    data: T
    meta: ApiResponseMeta


class ApiErrorDetail(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    code: str
    message: str
    request_id: str = Field(..., alias="requestId")
    details: Optional[Dict[str, Any]] = None


class ApiErrorEnvelope(BaseModel):
    error: ApiErrorDetail


# ------------------------------------------------------------------------------
# Campus & Telemetry DTOs
# ------------------------------------------------------------------------------

class CampusLocationDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    type: EntityType
    campus_id: str = Field(..., alias="campusId")
    building_id: Optional[str] = Field(default=None, alias="buildingId")
    capacity: int
    metadata: Dict[str, Any] = Field(default_factory=dict)


class OccupancySnapshotDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    location_id: str = Field(..., alias="locationId")
    current_students: int = Field(..., alias="currentStudents")
    capacity: int
    occupancy_percentage: float = Field(..., alias="occupancyPercentage")
    status: OccupancyStatus
    updated_at: str = Field(..., alias="updatedAt")
    data_mode: DataMode = Field(..., alias="dataMode")


class ConnectivitySnapshotDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    location_id: str = Field(..., alias="locationId")
    signal_score: int = Field(..., alias="signalScore")
    quality: ConnectivityQuality
    network_name: str = Field(..., alias="networkName")
    dbm: int
    updated_at: str = Field(..., alias="updatedAt")
    data_mode: DataMode = Field(..., alias="dataMode")


class LocationConditionDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    location: CampusLocationDTO
    occupancy: OccupancySnapshotDTO
    connectivity: ConnectivitySnapshotDTO
    overall_health: str = Field(default="NORMAL", alias="overallHealth")


class CampusSummaryDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    total_locations: int = Field(..., alias="totalLocations")
    total_occupancy: int = Field(..., alias="totalOccupancy")
    total_capacity: int = Field(..., alias="totalCapacity")
    average_occupancy_rate: float = Field(..., alias="averageOccupancyRate")
    overall_signal_score: int = Field(..., alias="overallSignalScore")


class LiveCampusConditionsDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    locations: List[LocationConditionDTO]
    summary: CampusSummaryDTO
    data_mode: DataMode = Field(..., alias="dataMode")
    generated_at: str = Field(..., alias="generatedAt")
