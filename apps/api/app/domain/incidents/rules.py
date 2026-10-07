"""Incident Domain Rules and State Machine."""

from dataclasses import replace
from datetime import datetime, timezone
from typing import Dict, List, Optional, Set, Tuple
from app.domain.incidents.models import (
    Incident,
    IncidentSeverity,
    IncidentStatus,
    IncidentUpdate,
    IncidentUpdateType,
    IncidentStatusChangedEvent,
    IncidentActivatedEvent,
)


class IncidentDomainError(Exception):
    """Base exception for incident domain violations."""
    pass


class InvalidStatusTransitionError(IncidentDomainError):
    """Raised when an illegal lifecycle state transition is attempted."""
    def __init__(self, from_status: IncidentStatus, to_status: IncidentStatus, reason: Optional[str] = None):
        msg = f"Invalid incident status transition: '{from_status.value}' -> '{to_status.value}'."
        if reason:
            msg += f" Reason: {reason}"
        super().__init__(msg)
        self.from_status = from_status
        self.to_status = to_status


class IncidentStateMachine:
    """
    Authoritative state machine governing Incident lifecycles.
    
    Allowed Transition Graph:
      REPORTED      -> TRIAGED, CLOSED
      TRIAGED       -> INVESTIGATING, ACTIVE, CLOSED
      INVESTIGATING -> ACTIVE, MITIGATED, RESOLVED, CLOSED
      ACTIVE        -> MITIGATED, RESOLVED
      MITIGATED     -> ACTIVE, RESOLVED
      RESOLVED      -> CLOSED, INVESTIGATING (reopened)
      CLOSED        -> INVESTIGATING (reopened)
    """

    ALLOWED_TRANSITIONS: Dict[IncidentStatus, Set[IncidentStatus]] = {
        IncidentStatus.REPORTED: {
            IncidentStatus.TRIAGED,
            IncidentStatus.CLOSED,
            IncidentStatus.CANCELLED,
        },
        IncidentStatus.TRIAGED: {
            IncidentStatus.INVESTIGATING,
            IncidentStatus.ACTIVE,
            IncidentStatus.CLOSED,
            IncidentStatus.CANCELLED,
        },
        IncidentStatus.INVESTIGATING: {
            IncidentStatus.ACTIVE,
            IncidentStatus.MITIGATED,
            IncidentStatus.RESOLVED,
            IncidentStatus.CLOSED,
            IncidentStatus.CANCELLED,
        },
        IncidentStatus.ACTIVE: {
            IncidentStatus.MITIGATED,
            IncidentStatus.RESOLVED,
            IncidentStatus.CANCELLED,
        },
        IncidentStatus.MITIGATED: {
            IncidentStatus.ACTIVE,
            IncidentStatus.RESOLVED,
            IncidentStatus.CANCELLED,
        },
        IncidentStatus.RESOLVED: {
            IncidentStatus.CLOSED,
            IncidentStatus.INVESTIGATING,
        },
        IncidentStatus.CLOSED: {
            IncidentStatus.INVESTIGATING,
        },
    }

    @classmethod
    def is_transition_allowed(cls, current_status: IncidentStatus, target_status: IncidentStatus) -> bool:
        """Check if a transition from current_status to target_status is valid."""
        if current_status == target_status:
            return True
        allowed_targets = cls.ALLOWED_TRANSITIONS.get(current_status, set())
        return target_status in allowed_targets

    @classmethod
    def get_allowed_transitions(cls, current_status: IncidentStatus) -> List[IncidentStatus]:
        """Return list of valid next statuses from current status."""
        return sorted(list(cls.ALLOWED_TRANSITIONS.get(current_status, set())), key=lambda s: s.value)

    @classmethod
    def transition(
        cls,
        incident: Incident,
        target_status: IncidentStatus,
        actor_id: str = "system",
        message: Optional[str] = None,
        occurred_at: Optional[str] = None,
    ) -> Tuple[Incident, IncidentUpdate, List[IncidentStatusChangedEvent]]:
        """
        Execute a state transition on an Incident.
        
        Returns:
            - Updated Incident entity
            - IncidentUpdate audit record
            - List of emitted domain events
        """
        current_status = incident.status
        now = occurred_at or datetime.now(timezone.utc).isoformat()

        if current_status != target_status:
            if not cls.is_transition_allowed(current_status, target_status):
                raise InvalidStatusTransitionError(current_status, target_status)

        # Compute updated timestamp fields based on new state
        fields_to_update = {
            "status": target_status,
            "updated_at": now,
        }

        # Lifecycle milestone timestamps
        if target_status == IncidentStatus.INVESTIGATING and not incident.acknowledged_at:
            fields_to_update["acknowledged_at"] = now
        elif target_status in (IncidentStatus.RESOLVED, IncidentStatus.MITIGATED) and not incident.resolved_at:
            fields_to_update["resolved_at"] = now
        elif target_status == IncidentStatus.CLOSED:
            if not incident.resolved_at:
                fields_to_update["resolved_at"] = now
            fields_to_update["closed_at"] = now
        elif target_status == IncidentStatus.CANCELLED:
            fields_to_update["cancelled_at"] = now

        updated_incident = replace(incident, **fields_to_update)

        # Audit update record
        update_type = IncidentUpdateType.STATUS_CHANGED
        if target_status == IncidentStatus.RESOLVED:
            update_type = IncidentUpdateType.RESOLVED
        elif target_status == IncidentStatus.CLOSED:
            update_type = IncidentUpdateType.CLOSED
        elif target_status == IncidentStatus.MITIGATED:
            update_type = IncidentUpdateType.MITIGATED
        elif target_status == IncidentStatus.CANCELLED:
            update_type = IncidentUpdateType.CANCELLED

        audit_update = IncidentUpdate(
            id=f"upd_{incident.id}_{int(datetime.now(timezone.utc).timestamp()*1000)}",
            incident_id=incident.id,
            type=update_type,
            message=message or f"Status transitioned from {current_status.value} to {target_status.value}",
            status_before=current_status,
            status_after=target_status,
            severity_before=incident.severity,
            severity_after=incident.severity,
            created_by=actor_id,
            created_at=now,
        )

        events: List[IncidentStatusChangedEvent] = [
            IncidentStatusChangedEvent(
                event_id=f"evt_{incident.id}_{int(datetime.now(timezone.utc).timestamp()*1000)}",
                event_type="incident.status_changed",
                occurred_at=now,
                incident_id=incident.id,
                status_before=current_status,
                status_after=target_status,
                actor_id=actor_id,
            )
        ]

        if target_status == IncidentStatus.ACTIVE:
            events.append(
                IncidentActivatedEvent(
                    event_id=f"evt_act_{incident.id}_{int(datetime.now(timezone.utc).timestamp()*1000)}",
                    event_type="incident.activated",
                    occurred_at=now,
                    incident_id=incident.id,
                    root_node_id=incident.root_node_id,
                    severity=incident.severity,
                    data_mode=incident.data_mode,
                )
            )

        return updated_incident, audit_update, events
