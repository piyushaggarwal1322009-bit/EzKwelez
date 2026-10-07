"""Deterministic mock implementation of OccupancyProvider."""

from typing import Dict, List, Optional
from app.domain.campus.models import CampusLocation, DataMode, OccupancySnapshot
from app.domain.campus.ports import OccupancyProvider


class MockOccupancyProvider(OccupancyProvider):
    """Provides deterministic synthetic occupancy data for testing and drills.
    
    Hardcoded with high-realism profiles matching the primary demo scenario:
    - Central Library: ~71% load (Moderate)
    - Central Canteen: ~94% load (Very Busy)
    - Physics Lab B201: ~85% load (Busy)
    - Seminar Hall C204: ~11% load (Low - ideal relocation target)
    """

    DEFAULT_SNAPSHOTS = {
        "r0000000-0000-0000-0000-000000000001": 114,  # B101 Physics Lecture (114/120 -> 95%)
        "r0000000-0000-0000-0000-000000000002": 82,   # B102 Chemistry Lecture (82/100 -> 82%)
        "r0000000-0000-0000-0000-000000000003": 34,   # B201 Optics Lab (34/40 -> 85%)
        "r0000000-0000-0000-0000-000000000004": 28,   # B202 Chemistry Lab (28/35 -> 80%)
        "r0000000-0000-0000-0000-000000000005": 26,   # B203 Robotics Workshop (26/30 -> 86.6%)
        "r0000000-0000-0000-0000-000000000006": 42,   # C101 Computer Lab Alpha (42/60 -> 70%)
        "r0000000-0000-0000-0000-000000000007": 38,   # C102 Computer Lab Beta (38/60 -> 63.3%)
        "r0000000-0000-0000-0000-000000000008": 0,    # C201 Auditorium (0/250 -> 0%)
        "r0000000-0000-0000-0000-000000000009": 14,   # C204 Seminar Hall (14/130 -> 10.8% - Free)
        "r0000000-0000-0000-0000-000000000010": 142,  # LIB-101 Central Library (142/200 -> 71%)
        "r0000000-0000-0000-0000-000000000011": 282,  # CAN-001 Central Canteen (282/300 -> 94%)
    }

    def __init__(self, override_counts: Optional[Dict[str, int]] = None):
        self._counts = dict(self.DEFAULT_SNAPSHOTS)
        if override_counts:
            self._counts.update(override_counts)

    async def get_occupancy(self, location: CampusLocation) -> OccupancySnapshot:
        count = self._counts.get(location.id, max(1, int(location.capacity * 0.45)))
        # Guard against count > capacity in non-overflow locations
        return OccupancySnapshot.create(
            location_id=location.id,
            current_students=min(count, location.capacity),
            capacity=location.capacity,
            data_mode=DataMode.SIMULATED,
        )

    async def get_all_occupancies(self, locations: List[CampusLocation]) -> Dict[str, OccupancySnapshot]:
        results = {}
        for loc in locations:
            results[loc.id] = await self.get_occupancy(loc)
        return results
