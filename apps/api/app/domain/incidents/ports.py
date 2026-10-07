"""Incident Domain Ports (Repository and Event Publisher Interfaces)."""

from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.campus.models import DataMode
from app.domain.incidents.models import (
    DomainEvent,
    Incident,
    IncidentAffectedEntity,
    IncidentSeverity,
    IncidentStatus,
    IncidentType,
    IncidentUpdate,
)


class IncidentRepository(ABC):
    """Port for Incident and IncidentUpdate persistence."""

    @abstractmethod
    async def get_by_id(self, incident_id: str) -> Optional[Incident]:
        """Retrieve an incident by ID."""
        pass

    @abstractmethod
    async def save(self, incident: Incident) -> Incident:
        """Save a new incident."""
        pass

    @abstractmethod
    async def update(self, incident: Incident) -> Incident:
        """Update an existing incident."""
        pass

    @abstractmethod
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
        """List incidents with optional filtering."""
        pass

    @abstractmethod
    async def list_by_campus(self, campus_id: str) -> List[Incident]:
        """List incidents owned by one campus."""
        pass

    @abstractmethod
    async def save_update(self, update: IncidentUpdate) -> IncidentUpdate:
        """Append an audit update to an incident."""
        pass

    @abstractmethod
    async def list_updates(self, incident_id: str) -> List[IncidentUpdate]:
        """List all audit updates for an incident ordered by time."""
        pass

    @abstractmethod
    async def exists_by_idempotency_key(self, key: str) -> Optional[Incident]:
        """Check if an incident was already created with a given idempotency key."""
        pass

    @abstractmethod
    async def add_affected_entity(self, relationship: IncidentAffectedEntity) -> IncidentAffectedEntity:
        """Attach one explicitly affected graph entity to an incident."""
        pass

    @abstractmethod
    async def list_affected_entities(self, incident_id: str) -> List[IncidentAffectedEntity]:
        """List only entities explicitly attached to an incident."""
        pass


class IncidentEventPublisher(ABC):
    """Port for publishing incident domain events."""

    @abstractmethod
    async def publish(self, event: DomainEvent) -> None:
        """Publish a single domain event."""
        pass

    @abstractmethod
    async def publish_batch(self, events: List[DomainEvent]) -> None:
        """Publish a batch of domain events."""
        pass
