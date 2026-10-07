"""Pure Domain Models for Campus Structure and Dependency Graphs.

Independent of HTTP, FastAPI, or persistence drivers.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class LocationType(str, Enum):
    ACADEMIC = "academic"
    LIBRARY = "library"
    CANTEEN = "canteen"
    HOSTEL = "hostel"
    ADMINISTRATION = "administration"
    LABORATORY = "laboratory"
    SPORTS = "sports"
    ENTRANCE = "entrance"
    COMMON_AREA = "common_area"
    OTHER = "other"


class ResourceType(str, Enum):
    POWER = "power"
    NETWORK = "network"
    WATER = "water"
    HVAC = "hvac"
    SECURITY = "security"
    COMMUNICATION = "communication"
    TRANSPORT = "transport"
    EQUIPMENT = "equipment"
    OTHER = "other"


class ServiceType(str, Enum):
    NETWORK = "network"
    ACADEMIC = "academic"
    FOOD = "food"
    SECURITY = "security"
    ACCESS = "access"
    WATER = "water"
    POWER = "power"
    COMMUNICATION = "communication"
    ADMINISTRATION = "administration"
    OTHER = "other"


class DependencyType(str, Enum):
    POWER = "power"
    NETWORK = "network"
    WATER = "water"
    HVAC = "hvac"
    SECURITY = "security"
    COMMUNICATION = "communication"
    ACCESS = "access"
    OPERATIONAL = "operational"
    OTHER = "other"


class DependencyStrength(str, Enum):
    REQUIRED = "required"
    CRITICAL = "critical"
    IMPORTANT = "important"
    OPTIONAL = "optional"


class StructuralStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"
    UNKNOWN = "unknown"


class CampusEntityType(str, Enum):
    RESOURCE = "resource"
    LOCATION = "location"
    SERVICE = "service"


class Campus(BaseModel):
    """University campus boundary aggregate root."""

    id: str
    name: str
    code: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Location(BaseModel):
    """Physical or logical zone within a campus."""

    id: str
    campus_id: str
    name: str
    code: str
    location_type: LocationType
    description: Optional[str] = None
    capacity: int = 0
    status: StructuralStatus = StructuralStatus.ACTIVE
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Resource(BaseModel):
    """Infrastructure component or physical resource."""

    id: str
    campus_id: str
    location_id: Optional[str] = None
    name: str
    code: str
    resource_type: ResourceType
    description: Optional[str] = None
    status: StructuralStatus = StructuralStatus.ACTIVE
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CampusService(BaseModel):
    """Operational capability or amenity offered to campus stakeholders."""

    id: str
    campus_id: str
    location_id: Optional[str] = None
    name: str
    code: str
    service_type: ServiceType
    description: Optional[str] = None
    status: StructuralStatus = StructuralStatus.ACTIVE
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Dependency(BaseModel):
    """Directed dependency graph edge (Source -> Target: Target depends on Source)."""

    id: str
    campus_id: str
    source_type: CampusEntityType
    source_id: str
    target_type: CampusEntityType
    target_id: str
    dependency_type: DependencyType
    strength: DependencyStrength = DependencyStrength.CRITICAL
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class GraphNode(BaseModel):
    """Reconstructed graph node representation."""

    id: str
    entity_type: CampusEntityType
    name: str
    code: str
    type_category: str
    status: StructuralStatus
    location_id: Optional[str] = None


class GraphEdge(BaseModel):
    """Reconstructed graph edge representation."""

    id: str
    source_type: CampusEntityType
    source_id: str
    target_type: CampusEntityType
    target_id: str
    dependency_type: DependencyType
    strength: DependencyStrength
    description: Optional[str] = None


class CampusGraph(BaseModel):
    """Reconstructed in-memory dependency graph for a campus."""

    campus_id: str
    nodes: Dict[str, GraphNode] = Field(default_factory=dict)
    edges: List[GraphEdge] = Field(default_factory=list)
    # Adjacency maps for high-performance traversals
    # downstream: source_id -> list of target edges (what depends on source)
    downstream_adj: Dict[str, List[GraphEdge]] = Field(default_factory=dict)
    # upstream: target_id -> list of source edges (what target depends on)
    upstream_adj: Dict[str, List[GraphEdge]] = Field(default_factory=dict)
