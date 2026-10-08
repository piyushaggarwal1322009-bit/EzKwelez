"""Blast Radius and Impact Assessment Domain Models."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from app.domain.campus.models import DataMode
from app.domain.graph.models import Criticality, DependencyNode, RelationshipType
from app.domain.incidents.models import Incident


class ImpactCategory(str, Enum):
    MINIMAL = "minimal"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass(frozen=True)
class AffectedEntity:
    """Represents an entity affected by an incident."""
    entity_id: str
    entity_type: str
    entity_name: str
    entity_code: str
    depth: int
    is_direct: bool
    parent_entity_id: Optional[str] = None
    dependency_type: Optional[str] = None
    dependency_strength: Optional[str] = None
    reason: str = ""
    criticality: Criticality = Criticality.MEDIUM
    location_id: Optional[str] = None
    path: List[str] = field(default_factory=list)


@dataclass(frozen=True)
class BlastRadiusResult:
    """The result of graph traversal from incident root entities."""
    direct_entities: List[AffectedEntity]
    transitive_entities: List[AffectedEntity]
    total_affected_count: int
    maximum_depth: int
    generated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@dataclass(frozen=True)
class ImpactAssessment:
    """Deterministic assessment of the blast radius."""
    total_impact_score: int
    impact_category: ImpactCategory
    affected_locations: List[str]
    affected_resources_count: int
    affected_services_count: int
    critical_dependency_count: int
    explanation_metadata: Dict[str, Any] = field(default_factory=dict)
    generated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@dataclass(frozen=True)
class IncidentAssessment:
    """Combined incident, blast radius, and impact assessment."""
    assessment_id: str
    incident: Incident
    blast_radius: BlastRadiusResult
    impact: ImpactAssessment
    data_mode: DataMode = DataMode.SIMULATED
    generated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

