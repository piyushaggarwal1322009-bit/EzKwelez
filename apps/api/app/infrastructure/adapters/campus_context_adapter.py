"""Adapter bridging Campus domain context to the Dependency Graph and Impact Analysis domain."""

from typing import Optional
from app.domain.campus.ports import CampusRepository
from app.domain.graph.ports import CampusContextProvider


class CampusContextAdapter(CampusContextProvider):
    """Integrates Phase 3 CampusRepository data into Graph & Impact services."""

    def __init__(self, campus_repo: CampusRepository):
        self._campus_repo = campus_repo

    async def get_location_name(self, location_id: str) -> Optional[str]:
        loc = await self._campus_repo.get_location_by_id(location_id)
        return loc.name if loc else None

    async def get_location_occupancy(self, location_id: str) -> Optional[int]:
        loc = await self._campus_repo.get_location_by_id(location_id)
        return loc.capacity if loc else None

    async def is_campus_data_stale(self, threshold_minutes: int = 15) -> bool:
        # Default implementation: false for in-memory simulated environment
        return False
