"""Incident Application Service.

Orchestrates incident management, state machine transitions, audit history recording,
event publishing, and handoff to the Phase 4 Impact Analysis engine.
"""

from datetime import datetime, timezone
import uuid
from typing import Any, Dict, List, Optional
from app.domain.campus.models import DataMode
from app.domain.graph.models import Criticality
from app.domain.impact.models import FailureType
from app.domain.incidents.models import (
    Incident,
    IncidentSeverity,
    IncidentSource,
    IncidentStatus,
    IncidentToImpactHandoff,
    IncidentType,
    IncidentUpdate,
    IncidentUpdateType,
)
from app.domain.incidents.ports import IncidentEventPublisher, IncidentRepository
from app.domain.incidents.rules import IncidentStateMachine


class IncidentNotFoundError(Exception):
    """Raised when an incident is requested but not found."""
    def __init__(self, incident_id: str):
        super().__init__(f"Incident with ID '{incident_id}' was not found.")
        self.incident_id = incident_id


class DuplicateIncidentError(Exception):
    """Raised when an incident with an identical idempotency key is submitted."""
    def __init__(self, idempotency_key: str, existing_incident_id: str):
        super().__init__(f"Incident creation idempotent replay detected for key '{idempotency_key}'.")
        self.idempotency_key = idempotency_key
        self.existing_incident_id = existing_incident_id


class IncidentApplicationService:
    """Application Service orchestrating Incident domain lifecycle and use cases."""

    def __init__(
        self,
        repository: IncidentRepository,
        event_publisher: IncidentEventPublisher,
    ):
        self._repository = repository
        self._publisher = event_publisher

    async def create_incident(
        self,
        title: str,
        description: str,
        incident_type: IncidentType,
        severity: IncidentSeverity,
        source: IncidentSource = IncidentSource.MANUAL,
        status: IncidentStatus = IncidentStatus.REPORTED,
        location_id: Optional[str] = None,
        root_node_id: Optional[str] = None,
        started_at: Optional[str] = None,
        detected_at: Optional[str] = None,
        data_mode: DataMode = DataMode.SIMULATED,
        actor_id: str = "system",
        idempotency_key: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Incident:
        """Create a new Incident, save initial audit entry, and publish domain events."""
        if idempotency_key:
            existing = await self._repository.exists_by_idempotency_key(idempotency_key)
            if existing:
                return existing

        now = datetime.now(timezone.utc).isoformat()
        incident_id = f"inc_{uuid.uuid4().hex[:10]}"

        meta = dict(metadata or {})
        if idempotency_key:
            meta["idempotency_key"] = idempotency_key

        incident = Incident(
            id=incident_id,
            title=title,
            description=description,
            type=incident_type,
            severity=severity,
            status=status,
            source=source,
            location_id=location_id,
            root_node_id=root_node_id,
            started_at=started_at or now,
            detected_at=detected_at or now,
            created_at=now,
            updated_at=now,
            data_mode=data_mode,
            metadata=meta,
        )

        saved_incident = await self._repository.save(incident)

        # Record creation in audit log
        create_update = IncidentUpdate(
            id=f"upd_{incident_id}_{int(datetime.now(timezone.utc).timestamp()*1000)}",
            incident_id=incident_id,
            type=IncidentUpdateType.CREATED,
            message=f"Incident created with status '{status.value}' and severity '{severity.value}'",
            status_before=None,
            status_after=status,
            severity_before=None,
            severity_after=severity,
            created_by=actor_id,
            created_at=now,
        )
        await self._repository.save_update(create_update)

        return saved_incident

    async def transition_incident_status(
        self,
        incident_id: str,
        target_status: IncidentStatus,
        actor_id: str = "system",
        message: Optional[str] = None,
    ) -> Incident:
        """Execute a validated state machine transition on an existing incident."""
        incident = await self._repository.get_by_id(incident_id)
        if not incident:
            raise IncidentNotFoundError(incident_id)

        updated_incident, audit_update, events = IncidentStateMachine.transition(
            incident=incident,
            target_status=target_status,
            actor_id=actor_id,
            message=message,
        )

        saved = await self._repository.update(updated_incident)
        await self._repository.save_update(audit_update)
        await self._publisher.publish_batch(events)

        return saved

    async def get_incident(self, incident_id: str) -> Incident:
        """Retrieve an incident by ID."""
        incident = await self._repository.get_by_id(incident_id)
        if not incident:
            raise IncidentNotFoundError(incident_id)
        return incident

    async def list_incidents(
        self,
        status: Optional[IncidentStatus] = None,
        severity: Optional[IncidentSeverity] = None,
        incident_type: Optional[IncidentType] = None,
        location_id: Optional[str] = None,
        data_mode: Optional[DataMode] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Incident]:
        """Query incidents with filtering."""
        return await self._repository.list_all(
            status=status,
            severity=severity,
            incident_type=incident_type,
            location_id=location_id,
            data_mode=data_mode,
            limit=limit,
            offset=offset,
        )

    async def list_incident_updates(self, incident_id: str) -> List[IncidentUpdate]:
        """Retrieve the immutable audit history for an incident."""
        incident = await self._repository.get_by_id(incident_id)
        if not incident:
            raise IncidentNotFoundError(incident_id)
        return await self._repository.list_updates(incident_id)

    async def get_impact_analysis_handoff(self, incident_id: str) -> IncidentToImpactHandoff:
        """
        Generate a minimal, decoupled contract payload for Phase 4 Impact Analysis.
        Maps incident types and severities to impact failure types and criticalities.
        """
        incident = await self.get_incident(incident_id)
        if not incident.root_node_id:
            raise ValueError(f"Incident '{incident_id}' has no associated root_node_id for impact analysis.")

        # Map IncidentType -> FailureType (Phase 4 domain)
        type_mapping: Dict[IncidentType, FailureType] = {
            IncidentType.POWER_OUTAGE: FailureType.OUTAGE,
            IncidentType.NETWORK_OUTAGE: FailureType.CONNECTIVITY_LOSS,
            IncidentType.EQUIPMENT_FAILURE: FailureType.FAILURE,
            IncidentType.BUILDING_ISSUE: FailureType.FAILURE,
            IncidentType.MAINTENANCE: FailureType.MAINTENANCE,
            IncidentType.CAPACITY_ISSUE: FailureType.CAPACITY_EXCEEDED,
        }
        failure_type = type_mapping.get(incident.type, FailureType.OUTAGE)

        # Map IncidentSeverity -> Criticality
        severity_mapping: Dict[IncidentSeverity, Criticality] = {
            IncidentSeverity.LOW: Criticality.LOW,
            IncidentSeverity.MODERATE: Criticality.MEDIUM,
            IncidentSeverity.HIGH: Criticality.HIGH,
            IncidentSeverity.CRITICAL: Criticality.CRITICAL,
        }
        severity = severity_mapping.get(incident.severity, Criticality.HIGH)

        return IncidentToImpactHandoff(
            incident_id=incident.id,
            root_node_id=incident.root_node_id,
            failure_type=failure_type,
            severity=severity,
            occurred_at=incident.started_at,
            data_mode=incident.data_mode,
        )
