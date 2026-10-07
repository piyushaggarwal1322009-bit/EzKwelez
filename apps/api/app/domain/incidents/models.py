"""Incident Domain Entities, Value Objects, and Domain Events."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from app.domain.campus.models import DataMode
from app.domain.graph.models import Criticality
from app.domain.impact.models import FailureType


class IncidentType(str, Enum):
    POWER_OUTAGE = "power_outage"
    NETWORK_OUTAGE = "network_outage"
    WATER_OUTAGE = "water_outage"
    FIRE = "fire"
    EQUIPMENT_FAILURE = "equipment_failure"
    BUILDING_ISSUE = "building_issue"
    SECURITY_EVENT = "security_event"
    CAPACITY_ISSUE = "capacity_issue"
    MAINTENANCE = "maintenance"
    ENVIRONMENTAL = "environmental"
    OTHER = "other"


class IncidentSeverity(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


class IncidentStatus(str, Enum):
    REPORTED = "reported"
    TRIAGED = "triaged"
    INVESTIGATING = "investigating"
    ACTIVE = "active"
    MITIGATED = "mitigated"
    RESOLVED = "resolved"
    CLOSED = "closed"


class IncidentSource(str, Enum):
    MANUAL = "manual"
    SENSOR = "sensor"
    PROVIDER = "provider"
    MONITORING = "monitoring"
    SYSTEM = "system"
    IMPORTED = "imported"
    UNKNOWN = "unknown"


class IncidentUpdateType(str, Enum):
    CREATED = "created"
    STATUS_CHANGED = "status_changed"
    SEVERITY_CHANGED = "severity_changed"
    LOCATION_UPDATED = "location_updated"
    ROOT_NODE_UPDATED = "root_node_updated"
    COMMENT_ADDED = "comment_added"
    ACKNOWLEDGED = "acknowledged"
    MITIGATED = "mitigated"
    RESOLVED = "resolved"
    CLOSED = "closed"


# ------------------------------------------------------------------------------
# Domain Events
# ------------------------------------------------------------------------------

@dataclass(frozen=True)
class DomainEvent:
    """Base Domain Event for decoupled asynchronous reactions."""
    event_id: str
    event_type: str
    occurred_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@dataclass(frozen=True)
class IncidentStatusChangedEvent(DomainEvent):
    incident_id: str = ""
    status_before: IncidentStatus = IncidentStatus.REPORTED
    status_after: IncidentStatus = IncidentStatus.REPORTED
    actor_id: Optional[str] = None


@dataclass(frozen=True)
class IncidentActivatedEvent(DomainEvent):
    incident_id: str = ""
    root_node_id: Optional[str] = None
    severity: IncidentSeverity = IncidentSeverity.HIGH
    data_mode: DataMode = DataMode.SIMULATED


# ------------------------------------------------------------------------------
# Core Incident Entities & Updates
# ------------------------------------------------------------------------------

@dataclass(frozen=True)
class IncidentUpdate:
    """Immutable record capturing an update or audit event on an incident."""
    id: str
    incident_id: str
    type: IncidentUpdateType
    message: str
    status_before: Optional[IncidentStatus] = None
    status_after: Optional[IncidentStatus] = None
    severity_before: Optional[IncidentSeverity] = None
    severity_after: Optional[IncidentSeverity] = None
    created_by: str = "system"
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class Incident:
    """Authoritative Incident domain entity representing a campus disruption."""
    id: str
    title: str
    description: str
    type: IncidentType
    severity: IncidentSeverity
    status: IncidentStatus
    source: IncidentSource = IncidentSource.MANUAL
    location_id: Optional[str] = None
    root_node_id: Optional[str] = None
    started_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    detected_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    acknowledged_at: Optional[str] = None
    resolved_at: Optional[str] = None
    closed_at: Optional[str] = None
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    data_mode: DataMode = DataMode.SIMULATED
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        if not self.id or not self.id.strip():
            raise ValueError("Incident id cannot be empty.")
        if not self.title or not self.title.strip():
            raise ValueError("Incident title cannot be empty.")

        # Invariant validations
        if self.resolved_at and self.started_at:
            if self.resolved_at < self.started_at:
                raise ValueError(f"resolved_at ({self.resolved_at}) cannot precede started_at ({self.started_at})")
        if self.closed_at and self.resolved_at:
            if self.closed_at < self.resolved_at:
                raise ValueError(f"closed_at ({self.closed_at}) cannot precede resolved_at ({self.resolved_at})")


@dataclass(frozen=True)
class IncidentToImpactHandoff:
    """Minimal integration contract transferring incident parameters to Phase 4 Impact Analysis."""
    incident_id: str
    root_node_id: str
    failure_type: FailureType
    severity: Criticality
    occurred_at: str
    data_mode: DataMode
