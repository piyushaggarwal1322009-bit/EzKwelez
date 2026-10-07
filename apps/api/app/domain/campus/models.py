"""Campus domain entities, value objects, and authoritative business rules.

Independent of HTTP, FastAPI, or persistence drivers.
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

DEFAULT_CAMPUS_ID = "c0000000-0000-0000-0000-000000000001"


class EntityType(str, Enum):
    CAMPUS = "CAMPUS"
    BUILDING = "BUILDING"
    ZONE = "ZONE"
    ROOM = "ROOM"
    RESOURCE = "RESOURCE"
    SERVICE = "SERVICE"
    CLASS_SESSION = "CLASS_SESSION"
    FACILITY = "FACILITY"


class DataMode(str, Enum):
    LIVE = "live"
    SIMULATED = "simulated"
    ESTIMATED = "estimated"
    UNKNOWN = "unknown"


class OccupancyStatus(str, Enum):
    LOW = "Low"
    MODERATE = "Moderate"
    BUSY = "Busy"
    VERY_BUSY = "Very Busy"
    OVER_CAPACITY = "Over Capacity"


class ConnectivityQuality(str, Enum):
    EXCELLENT = "Excellent"
    GOOD = "Good"
    FAIR = "Fair"
    WEAK = "Weak"
    VERY_WEAK = "Very Weak"


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


# ------------------------------------------------------------------------------
# Authoritative Business Rules & Classifications
# ------------------------------------------------------------------------------

def classify_occupancy(percentage: float) -> OccupancyStatus:
    """Classify occupancy percentage according to authoritative domain rules."""
    if percentage <= 49.0:
        return OccupancyStatus.LOW
    elif percentage <= 74.0:
        return OccupancyStatus.MODERATE
    elif percentage <= 89.0:
        return OccupancyStatus.BUSY
    elif percentage <= 100.0:
        return OccupancyStatus.VERY_BUSY
    return OccupancyStatus.OVER_CAPACITY


def classify_connectivity(score: int) -> ConnectivityQuality:
    """Classify Wi-Fi/cellular signal score (0-100) according to authoritative domain rules."""
    if score <= 19:
        return ConnectivityQuality.VERY_WEAK
    elif score <= 39:
        return ConnectivityQuality.WEAK
    elif score <= 59:
        return ConnectivityQuality.FAIR
    elif score <= 79:
        return ConnectivityQuality.GOOD
    return ConnectivityQuality.EXCELLENT


# ------------------------------------------------------------------------------
# Pydantic Domain Entities (Phase 3 Core)
# ------------------------------------------------------------------------------

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
    downstream_adj: Dict[str, List[GraphEdge]] = Field(default_factory=dict)
    upstream_adj: Dict[str, List[GraphEdge]] = Field(default_factory=dict)


# ------------------------------------------------------------------------------
# Dataclass Telemetry Snapshots & Live Conditions Result
# ------------------------------------------------------------------------------

@dataclass(frozen=True)
class CampusLocation:
    """Pure domain entity representing a physical or logical campus facility."""
    id: str
    name: str
    type: EntityType
    campus_id: str
    building_id: Optional[str]
    capacity: int
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        if self.capacity <= 0:
            raise ValueError(f"Capacity must be greater than 0, got {self.capacity}")


@dataclass(frozen=True)
class OccupancySnapshot:
    """Telemetry snapshot capturing headcount and capacity load."""
    location_id: str
    current_students: int
    capacity: int
    occupancy_percentage: float
    status: OccupancyStatus
    updated_at: str
    data_mode: DataMode

    @classmethod
    def create(
        cls,
        location_id: str,
        current_students: int,
        capacity: int,
        data_mode: DataMode = DataMode.SIMULATED,
        updated_at: Optional[str] = None,
    ) -> "OccupancySnapshot":
        if capacity <= 0:
            raise ValueError(f"Capacity must be positive, got {capacity}")
        if current_students < 0:
            raise ValueError(f"Current students cannot be negative, got {current_students}")

        percentage = round((current_students / capacity) * 100.0, 1)
        status = classify_occupancy(percentage)
        ts = updated_at or datetime.now(timezone.utc).isoformat()

        return cls(
            location_id=location_id,
            current_students=current_students,
            capacity=capacity,
            occupancy_percentage=percentage,
            status=status,
            updated_at=ts,
            data_mode=data_mode,
        )


@dataclass(frozen=True)
class ConnectivitySnapshot:
    """Telemetry snapshot capturing network strength and quality."""
    location_id: str
    signal_score: int
    quality: ConnectivityQuality
    network_name: str
    dbm: int
    updated_at: str
    data_mode: DataMode

    @classmethod
    def create(
        cls,
        location_id: str,
        signal_score: int,
        network_name: str = "APEX-CAMPUS-WIFI",
        dbm: int = -65,
        data_mode: DataMode = DataMode.SIMULATED,
        updated_at: Optional[str] = None,
    ) -> "ConnectivitySnapshot":
        if not (0 <= signal_score <= 100):
            raise ValueError(f"Signal score must be between 0 and 100, got {signal_score}")

        quality = classify_connectivity(signal_score)
        ts = updated_at or datetime.now(timezone.utc).isoformat()

        return cls(
            location_id=location_id,
            signal_score=signal_score,
            quality=quality,
            network_name=network_name,
            dbm=dbm,
            updated_at=ts,
            data_mode=data_mode,
        )


@dataclass(frozen=True)
class LocationCondition:
    """Aggregated condition combining location metadata, occupancy, and connectivity."""
    location: CampusLocation
    occupancy: OccupancySnapshot
    connectivity: ConnectivitySnapshot
    overall_health: str = "NORMAL"


@dataclass(frozen=True)
class LiveCampusConditionsResult:
    """Aggregated conditions response across all campus locations."""
    locations: List[LocationCondition]
    total_locations: int
    total_occupancy: int
    total_capacity: int
    average_occupancy_rate: float
    overall_signal_score: int
    data_mode: DataMode
    generated_at: str
