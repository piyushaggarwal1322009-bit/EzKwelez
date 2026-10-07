"""Impact Analysis Domain Models, Policies, and Severity Evaluation Rules."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from app.domain.campus.models import DataMode
from app.domain.graph.models import Criticality, DependencyEdge, DependencyNode, RelationshipType


class FailureType(str, Enum):
    OUTAGE = "outage"
    DEGRADATION = "degradation"
    FAILURE = "failure"
    MAINTENANCE = "maintenance"
    CAPACITY_EXCEEDED = "capacity_exceeded"
    CONNECTIVITY_LOSS = "connectivity_loss"


class ImpactType(str, Enum):
    DIRECT = "direct"
    INDIRECT = "indirect"
    DEPENDENT = "dependent"
    DEGRADED = "degraded"
    UNAVAILABLE = "unavailable"
    AT_RISK = "at_risk"


class ImpactSeverity(str, Enum):
    NONE = "none"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass(frozen=True)
class FailureEvent:
    """Input event representing an operational disruption or failure trigger."""
    id: str
    node_id: str
    failure_type: FailureType
    severity: Criticality = Criticality.HIGH
    occurred_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    source: str = "operator"
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class TraversalPolicy:
    """Policy configuring depth, filters, and boundaries for graph traversal."""
    max_depth: int = 5
    allowed_relationships: Optional[List[RelationshipType]] = None
    minimum_criticality: Optional[Criticality] = None
    include_degraded: bool = True
    stop_at_failed: bool = False


@dataclass(frozen=True)
class TraversalResult:
    """Raw result of graph traversal before business impact evaluation."""
    visited_nodes: List[str]
    visited_edges: List[DependencyEdge]
    depth_by_node: Dict[str, int]
    cycles_detected: List[List[str]] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)


@dataclass(frozen=True)
class ImpactedNode:
    """Detailed evaluation of a single downstream node affected by failure propagation."""
    node_id: str
    node_name: str
    impact_type: ImpactType
    impact_severity: ImpactSeverity
    distance_from_root: int
    criticality: Criticality
    reason: str
    location_id: Optional[str] = None


@dataclass(frozen=True)
class AnalysisProvenance:
    """Captures provenance mode of underlying graph and telemetry inputs."""
    graph_data_mode: DataMode
    campus_data_mode: DataMode
    generated_at: str
    source_summary: str = "EzyKwelez Deterministic Impact Engine"


@dataclass(frozen=True)
class ImpactReport:
    """Structured impact analysis result returned to callers, recovery, and AI layers."""
    analysis_id: str
    root_node: DependencyNode
    impacted_nodes: List[ImpactedNode]
    impacted_locations: List[str]
    severity: ImpactSeverity
    propagation_depth: int
    generated_at: str
    data_mode: DataMode
    provenance: AnalysisProvenance
    warnings: List[str] = field(default_factory=list)


def calculate_impact_severity(impacted_nodes: List[ImpactedNode]) -> ImpactSeverity:
    """Authoritative rule to determine overall impact severity based on node criticalities and count."""
    if not impacted_nodes:
        return ImpactSeverity.NONE

    has_critical = any(n.criticality == Criticality.CRITICAL for n in impacted_nodes)
    has_high = any(n.criticality == Criticality.HIGH for n in impacted_nodes)
    total_count = len(impacted_nodes)

    if has_critical or total_count >= 10:
        return ImpactSeverity.CRITICAL
    elif has_high or total_count >= 5:
        return ImpactSeverity.HIGH
    elif total_count >= 2:
        return ImpactSeverity.MODERATE
    return ImpactSeverity.LOW
