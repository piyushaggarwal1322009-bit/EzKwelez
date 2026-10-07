"""Pydantic Request and Response Schemas for Campus Facilities, Graph, and Live Conditions."""

from datetime import datetime
from typing import Any, Dict, Generic, List, Optional, TypeVar
from pydantic import BaseModel, ConfigDict, Field
from app.domain.campus.models import (
    CampusEntityType,
    ConnectivityQuality,
    DataMode,
    DependencyStrength,
    DependencyType,
    EntityType,
    LocationType,
    OccupancyStatus,
    ResourceType,
    ServiceType,
    StructuralStatus,
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
# Phase 3 Campus CRUD Schemas
# ------------------------------------------------------------------------------

class CampusCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100, description="Campus name")
    code: str = Field(min_length=2, max_length=30, description="Unique alphanumeric campus code")
    description: Optional[str] = Field(default=None, description="Optional campus summary")


class CampusResponse(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class LocationCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100, description="Location name")
    code: str = Field(min_length=2, max_length=30, description="Location identifier code")
    location_type: LocationType
    description: Optional[str] = None
    capacity: int = Field(default=0, ge=0)
    status: StructuralStatus = StructuralStatus.ACTIVE


class LocationResponse(BaseModel):
    id: str
    campus_id: str
    name: str
    code: str
    location_type: LocationType
    description: Optional[str] = None
    capacity: int
    status: StructuralStatus
    created_at: datetime
    updated_at: datetime


class ResourceCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    code: str = Field(min_length=2, max_length=30)
    resource_type: ResourceType
    location_id: Optional[str] = None
    description: Optional[str] = None
    status: StructuralStatus = StructuralStatus.ACTIVE


class ResourceResponse(BaseModel):
    id: str
    campus_id: str
    location_id: Optional[str] = None
    name: str
    code: str
    resource_type: ResourceType
    description: Optional[str] = None
    status: StructuralStatus
    created_at: datetime
    updated_at: datetime


class ServiceCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    code: str = Field(min_length=2, max_length=30)
    service_type: ServiceType
    location_id: Optional[str] = None
    description: Optional[str] = None
    status: StructuralStatus = StructuralStatus.ACTIVE


class ServiceResponse(BaseModel):
    id: str
    campus_id: str
    location_id: Optional[str] = None
    name: str
    code: str
    service_type: ServiceType
    description: Optional[str] = None
    status: StructuralStatus
    created_at: datetime
    updated_at: datetime


class DependencyCreateRequest(BaseModel):
    source_type: CampusEntityType
    source_id: str
    target_type: CampusEntityType
    target_id: str
    dependency_type: DependencyType
    strength: DependencyStrength = DependencyStrength.CRITICAL
    description: Optional[str] = None


class DependencyResponse(BaseModel):
    id: str
    campus_id: str
    source_type: CampusEntityType
    source_id: str
    target_type: CampusEntityType
    target_id: str
    dependency_type: DependencyType
    strength: DependencyStrength
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class GraphNodeSchema(BaseModel):
    id: str
    entity_type: CampusEntityType
    name: str
    code: str
    type_category: str
    status: StructuralStatus
    location_id: Optional[str] = None


class GraphEdgeSchema(BaseModel):
    id: str
    source_type: CampusEntityType
    source_id: str
    target_type: CampusEntityType
    target_id: str
    dependency_type: DependencyType
    strength: DependencyStrength
    description: Optional[str] = None


class CampusGraphSummarySchema(BaseModel):
    total_locations: int
    total_resources: int
    total_services: int
    total_dependencies: int


class CampusGraphResponseSchema(BaseModel):
    campus_id: str
    nodes: List[GraphNodeSchema]
    edges: List[GraphEdgeSchema]
    summary: CampusGraphSummarySchema


class TraversalNodeSchema(BaseModel):
    id: str
    entity_type: str
    name: str
    code: str
    depth: int
    edge_type: Optional[str] = None
    edge_strength: Optional[str] = None


class RootEntityInfo(BaseModel):
    id: str
    entity_type: str
    name: str


class DependencyTraversalResponseSchema(BaseModel):
    root_entity: RootEntityInfo
    direction: str
    max_depth: Optional[int] = None
    total_found: int
    nodes: List[TraversalNodeSchema]


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
