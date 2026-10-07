"""Deterministic campus entity state derived from explicit active incident links."""

from typing import Dict, List

from app.domain.campus.ports import CampusRepository
from app.domain.graph.models import DependencyNode, NodeStatus
from app.domain.graph.ports import DependencyGraphRepository
from app.domain.incidents.models import EntityOperationalState, Incident, IncidentStatus, IncidentType
from app.domain.incidents.ports import IncidentRepository


class CampusNotFoundError(Exception):
    """Raised when a campus has no known facilities."""


class CampusEntityNotFoundError(Exception):
    """Raised when an entity is not part of the requested campus state."""


class CampusStateService:
    """Reads current entity state without traversing dependency edges."""

    _ACTIVE_STATUSES = {IncidentStatus.ACTIVE, IncidentStatus.MITIGATED}
    _OFFLINE_TYPES = {
        IncidentType.POWER_OUTAGE,
        IncidentType.WATER_OUTAGE,
        IncidentType.FIRE,
        IncidentType.EQUIPMENT_FAILURE,
    }
    _PRIORITY = {
        NodeStatus.OPERATIONAL: 0,
        NodeStatus.UNKNOWN: 1,
        NodeStatus.DEGRADED: 2,
        NodeStatus.MAINTENANCE: 3,
        NodeStatus.DISRUPTED: 4,
        NodeStatus.OFFLINE: 5,
        NodeStatus.FAILED: 6,
    }

    def __init__(
        self,
        campus_repository: CampusRepository,
        graph_repository: DependencyGraphRepository,
        incident_repository: IncidentRepository,
    ):
        self._campus_repository = campus_repository
        self._graph_repository = graph_repository
        self._incident_repository = incident_repository

    async def get_campus_state(self, campus_id: str) -> List[EntityOperationalState]:
        locations = await self._campus_repository.get_all_locations(campus_id)
        if not locations:
            raise CampusNotFoundError(f"Campus '{campus_id}' was not found.")

        nodes = [
            node
            for node in await self._graph_repository.list_nodes()
            if node.campus_id == campus_id
        ]
        incidents = await self._incident_repository.list_by_campus(campus_id)
        affected_by_node: Dict[str, List[tuple[Incident, str]]] = {}
        for incident in incidents:
            if incident.status not in self._ACTIVE_STATUSES:
                continue
            for relationship in await self._incident_repository.list_affected_entities(incident.id):
                if relationship.campus_id == campus_id:
                    affected_by_node.setdefault(relationship.node_id, []).append((incident, relationship.reason))

        return [self._resolve_node_state(node, affected_by_node.get(node.id, [])) for node in nodes]

    async def get_entity_state(self, campus_id: str, node_id: str) -> EntityOperationalState:
        states = await self.get_campus_state(campus_id)
        for state in states:
            if state.node_id == node_id:
                return state
        raise CampusEntityNotFoundError(
            f"Campus entity '{node_id}' was not found in campus '{campus_id}'."
        )

    @classmethod
    def _resolve_node_state(
        cls,
        node: DependencyNode,
        affected: List[tuple[Incident, str]],
    ) -> EntityOperationalState:
        base_status = node.status
        effective_incidents: List[tuple[Incident, str, NodeStatus]] = []
        for incident, reason in affected:
            if incident.status == IncidentStatus.MITIGATED:
                effective_status = NodeStatus.DEGRADED
            elif incident.type == IncidentType.MAINTENANCE:
                effective_status = NodeStatus.MAINTENANCE
            elif incident.type in cls._OFFLINE_TYPES:
                effective_status = NodeStatus.OFFLINE
            else:
                effective_status = NodeStatus.DISRUPTED
            effective_incidents.append((incident, reason, effective_status))

        if effective_incidents:
            status = max(
                (entry[2] for entry in effective_incidents),
                key=lambda value: cls._PRIORITY[value],
            )
            reasons = sorted({reason for _, reason, _ in effective_incidents if reason})
            return EntityOperationalState(
                campus_id=node.campus_id or "",
                node_id=node.id,
                node_type=node.type,
                node_name=node.name,
                status=status,
                reason="; ".join(reasons),
                related_incident_ids=sorted(item[0].id for item in effective_incidents),
                location_id=node.location_id,
                updated_at=max(item[0].updated_at for item in effective_incidents),
            )

        return EntityOperationalState(
            campus_id=node.campus_id or "",
            node_id=node.id,
            node_type=node.type,
            node_name=node.name,
            status=base_status,
            reason="No active incident is explicitly linked to this entity.",
            location_id=node.location_id,
            updated_at=node.created_at,
        )