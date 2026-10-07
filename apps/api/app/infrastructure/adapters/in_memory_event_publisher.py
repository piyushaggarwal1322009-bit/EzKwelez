"""In-memory domain event publisher collecting events for audit and testing."""

from typing import List
from app.domain.incidents.models import DomainEvent
from app.domain.incidents.ports import IncidentEventPublisher


class InMemoryIncidentEventPublisher(IncidentEventPublisher):
    """Stores published domain events in an in-memory ledger."""

    def __init__(self):
        self._published_events: List[DomainEvent] = []

    async def publish(self, event: DomainEvent) -> None:
        self._published_events.append(event)

    async def publish_batch(self, events: List[DomainEvent]) -> None:
        self._published_events.extend(events)

    @property
    def published_events(self) -> List[DomainEvent]:
        return list(self._published_events)

    def clear(self) -> None:
        self._published_events.clear()
