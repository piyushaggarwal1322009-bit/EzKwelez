"""Pydantic Request and Response Schemas for Campus Domain and Dependency Graph."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.domain.campus.models import (
    CampusEntityType,
    DependencyStrength,
    DependencyType,
    LocationType,
    ResourceType,
    ServiceType,
    StructuralStatus,
)


# --- Campus Schemas ---
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


# --- Location Schemas ---
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


# --- Resource Schemas ---
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


# --- Service Schemas ---
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


# --- Dependency Schemas ---
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


# --- Graph Schemas ---
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
