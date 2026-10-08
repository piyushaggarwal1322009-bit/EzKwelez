"""Incident Application Service.

Orchestrates incident management, state machine transitions, audit history recording,
event publishing, and handoff to the Phase 4 Impact Analysis engine.
"""

from datetime import datetime, timezone
import uuid
from typing import Any, Dict, List, Optional
from app.domain.campus.models import DataMode, DEFAULT_CAMPUS_ID
from app.domain.campus.ports import CampusRepository
from app.domain.graph.models import Criticality
from app.domain.impact.models import FailureType
from app.domain.incidents.models import (
    Incident,
    IncidentAffectedEntity,
    IncidentSeverity,
    IncidentSource,
    IncidentStatus,
    IncidentToImpactHandoff,
    IncidentType,
    IncidentUpdate,
    IncidentUpdateType,
)
from app.domain.graph.models import DependencyNode, NodeType
from app.domain.graph.ports import DependencyGraphRepository
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


class AffectedEntityNotFoundError(Exception):
    """Raised when an affected entity is not a valid campus graph node."""


class CrossCampusEntityError(Exception):
    """Raised when an incident and entity belong to different campuses."""


class InvalidAffectedEntityTypeError(Exception):
    """Raised when a graph node cannot be attached as an affected campus entity."""


class IncidentCampusNotFoundError(Exception):
    """Raised when incident creation targets a campus without registered entities."""


class IncidentLocationNotFoundError(Exception):
    """Raised when an incident location is missing or owned by another campus."""


class IncidentRootNodeNotFoundError(Exception):
    """Raised when an incident root node is missing or owned by another campus."""


class DuplicateAffectedEntityError(Exception):
    """Raised when an entity is attached to an incident more than once."""


class IncidentApplicationService:
    """Application Service orchestrating Incident domain lifecycle and use cases."""

    def __init__(
        self,
        repository: IncidentRepository,
        event_publisher: IncidentEventPublisher,
        graph_repository: DependencyGraphRepository,
        campus_repository: CampusRepository,
    ):
        self._repository = repository
        self._publisher = event_publisher
        self._graph_repository = graph_repository
        self._campus_repository = campus_repository

    async def create_incident(
        self,
        title: str,
        description: str,
        incident_type: IncidentType,
        severity: IncidentSeverity,
        campus_id: str = DEFAULT_CAMPUS_ID,
        estimated_duration_minutes: Optional[int] = None,
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
        if not await self._campus_repository.get_all_locations(campus_id):
            raise IncidentCampusNotFoundError(f"Campus '{campus_id}' was not found.")
        if location_id:
            location = await self._campus_repository.get_location_by_id(location_id)
            graph_nodes = await self._graph_repository.list_nodes()
            matching_nodes = [node for node in graph_nodes if node.location_id == location_id]
            location_is_valid = location is not None or any(
                node.campus_id == campus_id for node in matching_nodes
            )
            location_is_same_campus = (
                location.campus_id == campus_id
                if location is not None
                else any(node.campus_id == campus_id for node in matching_nodes)
            )
            if not location_is_valid or not location_is_same_campus:
                raise IncidentLocationNotFoundError(
                    f"Location '{location_id}' was not found in campus '{campus_id}'."
                )
        if root_node_id:
            root_node = await self._graph_repository.get_node_by_id(root_node_id)
            if root_node is None or root_node.campus_id != campus_id:
                raise IncidentRootNodeNotFoundError(
                    f"Root node '{root_node_id}' was not found in campus '{campus_id}'."
                )

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
            campus_id=campus_id,
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
            estimated_duration_minutes=estimated_duration_minutes,
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
        campus_id: Optional[str] = None,
    ) -> Incident:
        """Execute a validated state machine transition on an existing incident."""
        incident = await self._repository.get_by_id(incident_id)
        if not incident:
            raise IncidentNotFoundError(incident_id)
        if campus_id is not None and incident.campus_id != campus_id:
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
        campus_id: Optional[str] = None,
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
            campus_id=campus_id,
        )

    async def list_campus_incidents(self, campus_id: str) -> List[Incident]:
        return await self._repository.list_by_campus(campus_id)

    async def add_affected_entity(
        self,
        incident_id: str,
        node_id: str,
        reason: str,
        actor_id: str = "system",
        campus_id: Optional[str] = None,
    ) -> IncidentAffectedEntity:
        incident = await self.get_incident(incident_id)
        if campus_id is not None and incident.campus_id != campus_id:
            raise IncidentNotFoundError(incident_id)
        node = await self._graph_repository.get_node_by_id(node_id)
        if node is None:
            raise AffectedEntityNotFoundError(f"Campus entity '{node_id}' was not found.")
        if node.type not in {
            NodeType.BUILDING, NodeType.ROOM, NodeType.RESOURCE, NodeType.SERVICE,
            NodeType.INFRASTRUCTURE, NodeType.UTILITY, NodeType.NETWORK,
            NodeType.SYSTEM, NodeType.OPERATION,
        }:
            raise InvalidAffectedEntityTypeError(
                f"Graph node type '{node.type.value}' cannot be attached as an affected campus entity."
            )
        if node.campus_id != incident.campus_id:
            raise CrossCampusEntityError(
                f"Incident '{incident_id}' and campus entity '{node_id}' must belong to the same campus."
            )

        relationship = IncidentAffectedEntity(
            incident_id=incident_id,
            campus_id=incident.campus_id,
            node_id=node_id,
            reason=reason,
            created_by=actor_id,
        )
        try:
            saved = await self._repository.add_affected_entity(relationship)
        except ValueError as error:
            if "already attached" in str(error):
                raise DuplicateAffectedEntityError(str(error)) from error
            raise

        await self._repository.save_update(
            IncidentUpdate(
                id=f"upd_{uuid.uuid4().hex}",
                incident_id=incident_id,
                type=IncidentUpdateType.AFFECTED_ENTITY_ADDED,
                message=reason,
                created_by=actor_id,
                metadata={"nodeId": node.id, "nodeType": node.type.value},
            )
        )
        return saved

    async def list_affected_entities(
        self,
        incident_id: str,
        campus_id: Optional[str] = None,
    ) -> List[IncidentAffectedEntity]:
        incident = await self.get_incident(incident_id)
        if campus_id is not None and incident.campus_id != campus_id:
            raise IncidentNotFoundError(incident_id)
        return await self._repository.list_affected_entities(incident_id)

    async def get_incident_in_campus(self, incident_id: str, campus_id: str) -> Incident:
        incident = await self.get_incident(incident_id)
        if incident.campus_id != campus_id:
            raise IncidentNotFoundError(incident_id)
        return incident

    async def list_incident_updates(self, incident_id: str) -> List[IncidentUpdate]:
        """Retrieve the immutable audit history for an incident."""
        incident = await self._repository.get_by_id(incident_id)
        if not incident:
            raise IncidentNotFoundError(incident_id)
        return await self._repository.list_updates(incident_id)

    async def get_impact_analysis_handoff(
        self,
        incident_id: str,
        campus_id: Optional[str] = None,
    ) -> IncidentToImpactHandoff:
        """
        Generate a minimal, decoupled contract payload for Phase 4 Impact Analysis.
        Maps incident types and severities to impact failure types and criticalities.
        """
        incident = (
            await self.get_incident_in_campus(incident_id, campus_id)
            if campus_id is not None
            else await self.get_incident(incident_id)
        )
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
