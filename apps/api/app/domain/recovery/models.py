"""Recovery Planning Domain Models, Enums, Value Objects, and Domain Events."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from app.domain.campus.models import DataMode
from app.domain.graph.models import Criticality


class PlanStatus(str, Enum):
    DRAFT = "draft"
    GENERATED = "generated"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    SUPERSEDED = "superseded"


class RecoveryOptionType(str, Enum):
    REROUTE = "reroute"
    FAILOVER = "failover"
    RELOCATE = "relocate"
    ISOLATE = "isolate"
    RESTORE = "restore"
    SUBSTITUTE = "substitute"
    REDUCE_LOAD = "reduce_load"
    PRIORITIZE_SERVICE = "prioritize_service"
    TEMPORARY_SHUTDOWN = "temporary_shutdown"
    MANUAL_INTERVENTION = "manual_intervention"
    OTHER = "other"


class Feasibility(str, Enum):
    FEASIBLE = "feasible"
    CONDITIONALLY_FEASIBLE = "conditionally_feasible"
    INFEASIBLE = "infeasible"
    UNKNOWN = "unknown"


class ConfidenceLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    UNKNOWN = "unknown"


class ConstraintType(str, Enum):
    RESOURCE = "resource"
    CAPACITY = "capacity"
    TIME = "time"
    DEPENDENCY = "dependency"
    SAFETY = "safety"
    AVAILABILITY = "availability"
    LOCATION = "location"
    POLICY = "policy"
    STAFFING = "staffing"


class ConstraintSeverity(str, Enum):
    HARD = "hard"
    SOFT = "soft"


class ResourceType(str, Enum):
    TECHNICIAN = "technician"
    BACKUP_POWER = "backup_power"
    BACKUP_NETWORK = "backup_network"
    AVAILABLE_ROOM = "available_room"
    EQUIPMENT = "equipment"
    STAFF = "staff"
    TIME_WINDOW = "time_window"
    OTHER = "other"


class PlanningObjectiveType(str, Enum):
    MINIMIZE_RECOVERY_TIME = "minimize_recovery_time"
    MINIMIZE_STUDENT_DISRUPTION = "minimize_student_disruption"
    MINIMIZE_RESOURCE_USE = "minimize_resource_use"
    MAXIMIZE_SERVICE_CONTINUITY = "maximize_service_continuity"
    MINIMIZE_OPERATIONAL_RISK = "minimize_operational_risk"


class PlanningObjectivePriority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class TradeoffDirection(str, Enum):
    BETTER = "better"
    WORSE = "worse"
    NEUTRAL = "neutral"


class AssumptionStatus(str, Enum):
    VALID = "valid"
    TENTATIVE = "tentative"
    REFUTED = "refuted"


# ------------------------------------------------------------------------------
# Value Objects
# ------------------------------------------------------------------------------

@dataclass(frozen=True)
class EstimatedRecoveryTime:
    """Estimated duration for recovery execution with uncertainty bounds."""
    value: float
    unit: str = "minutes"
    confidence: ConfidenceLevel = ConfidenceLevel.MEDIUM
    assumptions: List[str] = field(default_factory=list)

    def __post_init__(self):
        if self.value < 0:
            raise ValueError("Estimated recovery time cannot be negative.")


@dataclass(frozen=True)
class ImpactReduction:
    """Expected disruption mitigation metrics."""
    affected_node_reduction: int
    affected_location_reduction: int
    severity_reduction: str
    estimated_percent: float

    def __post_init__(self):
        if not (0.0 <= self.estimated_percent <= 100.0):
            raise ValueError(f"Estimated reduction percent must be between 0 and 100 (got {self.estimated_percent}).")


@dataclass(frozen=True)
class ResourceRequirement:
    """Resource required to implement an option."""
    resource_type: ResourceType
    quantity: float
    availability: str = "unknown"
    location: Optional[str] = None
    source: str = "planning_engine"


@dataclass(frozen=True)
class RecoveryPrerequisite:
    """Condition that must be satisfied before recovery option can proceed."""
    type: str
    description: str
    satisfied: bool
    source: str = "system"


@dataclass(frozen=True)
class RecoveryRisk:
    """Operational or physical risk associated with executing an option."""
    description: str
    severity: Criticality = Criticality.MEDIUM
    likelihood: Optional[str] = None
    affected_systems: List[str] = field(default_factory=list)
    mitigation: Optional[str] = None


@dataclass(frozen=True)
class RecoveryTradeoff:
    """Multi-dimensional trade-off relative to baseline disruption."""
    dimension: str
    value: Any
    direction: TradeoffDirection
    explanation: str


@dataclass(frozen=True)
class RecoveryConstraint:
    """Hard or soft operational constraint bounding planning."""
    id: str
    type: ConstraintType
    description: str
    severity: ConstraintSeverity = ConstraintSeverity.HARD
    value: Any = None
    source: str = "campus_policy"


@dataclass(frozen=True)
class PlanningAssumption:
    """Explicit assumption made by the planning engine."""
    description: str
    source: str
    confidence: ConfidenceLevel = ConfidenceLevel.MEDIUM
    status: AssumptionStatus = AssumptionStatus.TENTATIVE


@dataclass(frozen=True)
class PlanningObjective:
    """Configurable goal driving candidate scoring and future optimization."""
    type: PlanningObjectiveType
    weight: Optional[float] = None
    priority: PlanningObjectivePriority = PlanningObjectivePriority.HIGH


# ------------------------------------------------------------------------------
# Core Recovery Entities
# ------------------------------------------------------------------------------

@dataclass(frozen=True)
class RecoveryOption:
    """Structured, machine-readable recovery candidate."""
    id: str
    title: str
    description: str
    type: RecoveryOptionType
    feasibility: Feasibility
    estimated_recovery_time: EstimatedRecoveryTime
    estimated_impact_reduction: ImpactReduction
    resource_requirements: List[ResourceRequirement] = field(default_factory=list)
    prerequisites: List[RecoveryPrerequisite] = field(default_factory=list)
    affected_locations: List[str] = field(default_factory=list)
    affected_nodes: List[str] = field(default_factory=list)
    risks: List[RecoveryRisk] = field(default_factory=list)
    tradeoffs: List[RecoveryTradeoff] = field(default_factory=list)
    confidence: ConfidenceLevel = ConfidenceLevel.MEDIUM
    rank: Optional[int] = None
    rationale: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        if not self.id or not self.id.strip():
            raise ValueError("RecoveryOption id cannot be empty.")
        if not self.title or not self.title.strip():
            raise ValueError("RecoveryOption title cannot be empty.")


@dataclass(frozen=True)
class RecoveryPlan:
    """Authoritative collection of candidate recovery options for an incident/impact."""
    id: str
    incident_id: str
    version: int = 1
    impact_analysis_id: Optional[str] = None
    supersedes_plan_id: Optional[str] = None
    status: PlanStatus = PlanStatus.GENERATED
    options: List[RecoveryOption] = field(default_factory=list)
    constraints: List[RecoveryConstraint] = field(default_factory=list)
    assumptions: List[PlanningAssumption] = field(default_factory=list)
    objectives: List[PlanningObjective] = field(default_factory=list)
    data_mode: DataMode = DataMode.SIMULATED
    warnings: List[str] = field(default_factory=list)
    generated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    review_notes: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        if not self.id or not self.id.strip():
            raise ValueError("RecoveryPlan id cannot be empty.")
        if not self.incident_id or not self.incident_id.strip():
            raise ValueError("RecoveryPlan incident_id cannot be empty.")
        if self.version < 1:
            raise ValueError(f"RecoveryPlan version must be >= 1 (got {self.version}).")


# ------------------------------------------------------------------------------
# Domain Events
# ------------------------------------------------------------------------------

@dataclass(frozen=True)
class RecoveryPlanGeneratedEvent:
    """Emitted when a new recovery plan candidate set is formulated."""
    event_id: str
    plan_id: str
    incident_id: str
    version: int
    option_count: int
    data_mode: DataMode
    occurred_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@dataclass(frozen=True)
class RecoveryPlanReviewedEvent:
    """Emitted when a recovery plan is reviewed (approved or rejected) by human operator."""
    event_id: str
    plan_id: str
    incident_id: str
    status: PlanStatus
    reviewed_by: str
    review_notes: Optional[str] = None
    occurred_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
