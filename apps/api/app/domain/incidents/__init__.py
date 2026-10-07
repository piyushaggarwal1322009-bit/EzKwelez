"""Incident Domain Module."""

from app.domain.incidents.models import (
    DomainEvent,
    Incident,
    IncidentActivatedEvent,
    IncidentSeverity,
    IncidentSource,
    IncidentStatus,
    IncidentStatusChangedEvent,
    IncidentToImpactHandoff,
    IncidentType,
    IncidentUpdate,
    IncidentUpdateType,
)
from app.domain.incidents.ports import IncidentEventPublisher, IncidentRepository
from app.domain.incidents.rules import (
    IncidentDomainError,
    IncidentStateMachine,
    InvalidStatusTransitionError,
)

__all__ = [
    "DomainEvent",
    "Incident",
    "IncidentActivatedEvent",
    "IncidentDomainError",
    "IncidentEventPublisher",
    "IncidentRepository",
    "IncidentSeverity",
    "IncidentSource",
    "IncidentStateMachine",
    "IncidentStatus",
    "IncidentStatusChangedEvent",
    "IncidentToImpactHandoff",
    "IncidentType",
    "IncidentUpdate",
    "IncidentUpdateType",
    "InvalidStatusTransitionError",
]
