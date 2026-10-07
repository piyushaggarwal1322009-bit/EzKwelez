"""In-memory implementation of IncidentRepository pre-seeded with sample disruption."""

from datetime import datetime, timezone
from typing import Dict, List, Optional
from app.domain.campus.models import DataMode, DEFAULT_CAMPUS_ID
from app.domain.incidents.models import (
    Incident,
    IncidentAffectedEntity,
    IncidentSeverity,
    IncidentSource,
    IncidentStatus,
    IncidentType,
    IncidentUpdate,
    IncidentUpdateType,
)
from app.domain.incidents.ports import IncidentRepository


class InMemoryIncidentRepository(IncidentRepository):
    """Thread-safe in-memory repository for Incidents and Audit Updates."""

    def __init__(
        self,
        incidents: Optional[List[Incident]] = None,
        updates: Optional[List[IncidentUpdate]] = None,
        affected_entities: Optional[List[IncidentAffectedEntity]] = None,
    ):
        if incidents is not None:
            self._incidents: Dict[str, Incident] = {inc.id: inc for inc in incidents}
        else:
            self._incidents = self._init_default_incidents()

        if updates is not None:
            self._updates: Dict[str, List[IncidentUpdate]] = {}
            for u in updates:
                self._updates.setdefault(u.incident_id, []).append(u)
        else:
            self._updates = self._init_default_updates()

        self._affected_entities: Dict[str, List[IncidentAffectedEntity]] = {}
        initial_affected_entities = (
            self._init_default_affected_entities()
            if affected_entities is None
            else affected_entities
        )
        for relationship in initial_affected_entities:
            self._affected_entities.setdefault(relationship.incident_id, []).append(relationship)

    def _init_default_incidents(self) -> Dict[str, Incident]:
        default_inc = Incident(
            id="inc-00000000-0000-0000-0000-000000000001",
            campus_id=DEFAULT_CAMPUS_ID,
            title="Grid B Main Feeder Trip",
            description="Transformer trip at Main Power Substation Grid B affecting Ramanujan Science Block B.",
            type=IncidentType.POWER_OUTAGE,
            severity=IncidentSeverity.CRITICAL,
            status=IncidentStatus.ACTIVE,
            source=IncidentSource.SENSOR,
            location_id="b0000000-0000-0000-0000-000000000002",
            root_node_id="n0000000-0000-0000-0000-000000000001",
            started_at="2026-10-07T08:15:00Z",
            detected_at="2026-10-07T08:16:30Z",
            acknowledged_at="2026-10-07T08:18:00Z",
            resolved_at=None,
            closed_at=None,
            created_at="2026-10-07T08:16:30Z",
            updated_at="2026-10-07T08:20:00Z",
            data_mode=DataMode.SIMULATED,
            metadata={"feeder": "KV-33", "auto_detected": True},
        )
        maintenance_incident = Incident(
            id="inc-00000000-0000-0000-0000-000000000002",
            campus_id=DEFAULT_CAMPUS_ID,
            title="Block B201 Power Maintenance",
            description="Scheduled maintenance for the seeded Optics and Laser Physics Lab.",
            type=IncidentType.MAINTENANCE,
            severity=IncidentSeverity.MODERATE,
            status=IncidentStatus.RESOLVED,
            source=IncidentSource.MANUAL,
            location_id="r0000000-0000-0000-0000-000000000003",
            root_node_id="n0000000-0000-0000-0000-000000000004",
            started_at="2026-10-07T05:00:00Z",
            detected_at="2026-10-07T05:00:00Z",
            acknowledged_at="2026-10-07T05:05:00Z",
            resolved_at="2026-10-07T06:00:00Z",
            created_at="2026-10-07T05:00:00Z",
            updated_at="2026-10-07T06:00:00Z",
            estimated_duration_minutes=60,
            data_mode=DataMode.SIMULATED,
        )
        return {default_inc.id: default_inc, maintenance_incident.id: maintenance_incident}

    def _init_default_updates(self) -> Dict[str, List[IncidentUpdate]]:
        inc_id = "inc-00000000-0000-0000-0000-000000000001"
        return {
            inc_id: [
                IncidentUpdate(
                    id=f"upd_{inc_id}_1",
                    incident_id=inc_id,
                    type=IncidentUpdateType.CREATED,
                    message="Incident auto-created from telemetry anomaly detection.",
                    status_before=None,
                    status_after=IncidentStatus.REPORTED,
                    severity_before=None,
                    severity_after=IncidentSeverity.CRITICAL,
                    created_by="telemetry_sensor_engine",
                    created_at="2026-10-07T08:16:30Z",
                ),
                IncidentUpdate(
                    id=f"upd_{inc_id}_2",
                    incident_id=inc_id,
                    type=IncidentUpdateType.STATUS_CHANGED,
                    message="Triaged by campus operations; confirmed breaker lockout.",
                    status_before=IncidentStatus.REPORTED,
                    status_after=IncidentStatus.ACTIVE,
                    severity_before=IncidentSeverity.CRITICAL,
                    severity_after=IncidentSeverity.CRITICAL,
                    created_by="ops_dispatch_agent",
                    created_at="2026-10-07T08:20:00Z",
                ),
            ],
            "inc-00000000-0000-0000-0000-000000000002": [
                IncidentUpdate(
                    id="upd_inc_maintenance_created",
                    incident_id="inc-00000000-0000-0000-0000-000000000002",
                    type=IncidentUpdateType.CREATED,
                    message="Scheduled lab maintenance recorded.",
                    status_after=IncidentStatus.REPORTED,
                    severity_after=IncidentSeverity.MODERATE,
                    created_by="system",
                    created_at="2026-10-07T05:00:00Z",
                ),
                IncidentUpdate(
                    id="upd_inc_maintenance_resolved",
                    incident_id="inc-00000000-0000-0000-0000-000000000002",
                    type=IncidentUpdateType.RESOLVED,
                    message="Scheduled maintenance completed.",
                    status_before=IncidentStatus.ACTIVE,
                    status_after=IncidentStatus.RESOLVED,
                    severity_before=IncidentSeverity.MODERATE,
                    severity_after=IncidentSeverity.MODERATE,
                    created_by="system",
                    created_at="2026-10-07T06:00:00Z",
                ),
            ],
        }

    def _init_default_affected_entities(self) -> List[IncidentAffectedEntity]:
        incident_id = "inc-00000000-0000-0000-0000-000000000001"
        return [
            IncidentAffectedEntity(
                incident_id=incident_id,
                campus_id=DEFAULT_CAMPUS_ID,
                node_id="n0000000-0000-0000-0000-000000000002",
                reason="Building B is explicitly affected by the power feeder trip.",
                created_by="system",
                created_at="2026-10-07T08:16:30Z",
            ),
            IncidentAffectedEntity(
                incident_id="inc-00000000-0000-0000-0000-000000000002",
                campus_id=DEFAULT_CAMPUS_ID,
                node_id="n0000000-0000-0000-0000-000000000004",
                reason="The Optics and Laser Physics Lab is explicitly under maintenance.",
                created_by="system",
                created_at="2026-10-07T05:00:00Z",
            ),
        ]

    async def get_by_id(self, incident_id: str) -> Optional[Incident]:
        return self._incidents.get(incident_id)

    async def save(self, incident: Incident) -> Incident:
        self._incidents[incident.id] = incident
        return incident

    async def update(self, incident: Incident) -> Incident:
        self._incidents[incident.id] = incident
        return incident

    async def list_all(
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
        results = list(self._incidents.values())

        if status:
            results = [inc for inc in results if inc.status == status]
        if severity:
            results = [inc for inc in results if inc.severity == severity]
        if incident_type:
            results = [inc for inc in results if inc.type == incident_type]
        if location_id:
            results = [inc for inc in results if inc.location_id == location_id]
        if data_mode:
            results = [inc for inc in results if inc.data_mode == data_mode]
        if campus_id:
            results = [inc for inc in results if inc.campus_id == campus_id]

        # Sort newest first
        results.sort(key=lambda x: x.created_at, reverse=True)
        return results[offset : offset + limit]

    async def list_by_campus(self, campus_id: str) -> List[Incident]:
        return sorted(
            (incident for incident in self._incidents.values() if incident.campus_id == campus_id),
            key=lambda incident: incident.created_at,
            reverse=True,
        )

    async def save_update(self, update: IncidentUpdate) -> IncidentUpdate:
        self._updates.setdefault(update.incident_id, []).append(update)
        return update

    async def list_updates(self, incident_id: str) -> List[IncidentUpdate]:
        updates = self._updates.get(incident_id, [])
        return sorted(updates, key=lambda u: u.created_at)

    async def exists_by_idempotency_key(self, key: str) -> Optional[Incident]:
        for inc in self._incidents.values():
            if inc.metadata.get("idempotency_key") == key:
                return inc
        return None

    async def add_affected_entity(self, relationship: IncidentAffectedEntity) -> IncidentAffectedEntity:
        incident = self._incidents.get(relationship.incident_id)
        if incident is None:
            raise ValueError("Cannot attach an entity to a missing incident.")
        if incident.campus_id != relationship.campus_id:
            raise ValueError("Incident and affected entity must belong to the same campus.")

        relationships = self._affected_entities.setdefault(relationship.incident_id, [])
        if any(existing.node_id == relationship.node_id for existing in relationships):
            raise ValueError("Affected entity is already attached to this incident.")
        relationships.append(relationship)
        return relationship

    async def list_affected_entities(self, incident_id: str) -> List[IncidentAffectedEntity]:
        return list(self._affected_entities.get(incident_id, []))
