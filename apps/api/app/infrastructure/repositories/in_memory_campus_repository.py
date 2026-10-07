"""In-memory implementation of CampusRepository for testing, drills, and local MVP execution."""

from typing import Dict, List, Optional
from app.domain.campus.models import CampusLocation, EntityType
from app.domain.campus.ports import CampusRepository


class InMemoryCampusRepository(CampusRepository):
    """In-memory repository pre-seeded with synthetic connected campus locations."""

    def __init__(self, locations: Optional[List[CampusLocation]] = None):
        if locations is not None:
            self._locations: Dict[str, CampusLocation] = {loc.id: loc for loc in locations}
        else:
            self._locations = self._init_default_locations()

    def _init_default_locations(self) -> Dict[str, CampusLocation]:
        default_list = [
            CampusLocation(
                id="r0000000-0000-0000-0000-000000000001",
                name="Physics Main Lecture Hall B101",
                type=EntityType.ROOM,
                campus_id="c0000000-0000-0000-0000-000000000001",
                building_id="b0000000-0000-0000-0000-000000000002",
                capacity=120,
                metadata={"av_equipped": True, "building_code": "BLD-B"},
            ),
            CampusLocation(
                id="r0000000-0000-0000-0000-000000000002",
                name="Chemistry Lecture Hall B102",
                type=EntityType.ROOM,
                campus_id="c0000000-0000-0000-0000-000000000001",
                building_id="b0000000-0000-0000-0000-000000000002",
                capacity=100,
                metadata={"av_equipped": True, "building_code": "BLD-B"},
            ),
            CampusLocation(
                id="r0000000-0000-0000-0000-000000000003",
                name="Optics & Laser Physics Lab B201",
                type=EntityType.RESOURCE,
                campus_id="c0000000-0000-0000-0000-000000000001",
                building_id="b0000000-0000-0000-0000-000000000002",
                capacity=40,
                metadata={"equipment": ["Spectrometer Rig", "Laser Optical Bench"], "building_code": "BLD-B"},
            ),
            CampusLocation(
                id="r0000000-0000-0000-0000-000000000004",
                name="Analytical Chemistry Lab B202",
                type=EntityType.RESOURCE,
                campus_id="c0000000-0000-0000-0000-000000000001",
                building_id="b0000000-0000-0000-0000-000000000002",
                capacity=35,
                metadata={"equipment": ["Fume Hoods", "Centrifuge"], "building_code": "BLD-B"},
            ),
            CampusLocation(
                id="r0000000-0000-0000-0000-000000000005",
                name="Robotics Workshop B203",
                type=EntityType.RESOURCE,
                campus_id="c0000000-0000-0000-0000-000000000001",
                building_id="b0000000-0000-0000-0000-000000000002",
                capacity=30,
                metadata={"equipment": ["Oscilloscopes"], "building_code": "BLD-B"},
            ),
            CampusLocation(
                id="r0000000-0000-0000-0000-000000000006",
                name="Computer Lab Alpha C101",
                type=EntityType.RESOURCE,
                campus_id="c0000000-0000-0000-0000-000000000001",
                building_id="b0000000-0000-0000-0000-000000000003",
                capacity=60,
                metadata={"workstations": 60, "os": "Linux", "building_code": "BLD-C"},
            ),
            CampusLocation(
                id="r0000000-0000-0000-0000-000000000007",
                name="Computer Lab Beta C102",
                type=EntityType.RESOURCE,
                campus_id="c0000000-0000-0000-0000-000000000001",
                building_id="b0000000-0000-0000-0000-000000000003",
                capacity=60,
                metadata={"workstations": 60, "os": "Windows", "building_code": "BLD-C"},
            ),
            CampusLocation(
                id="r0000000-0000-0000-0000-000000000008",
                name="Main Campus Auditorium C201",
                type=EntityType.FACILITY,
                campus_id="c0000000-0000-0000-0000-000000000001",
                building_id="b0000000-0000-0000-0000-000000000003",
                capacity=250,
                metadata={"av_surround": True, "building_code": "BLD-C"},
            ),
            CampusLocation(
                id="r0000000-0000-0000-0000-000000000009",
                name="Multi-Purpose Seminar Hall C204",
                type=EntityType.ROOM,
                campus_id="c0000000-0000-0000-0000-000000000001",
                building_id="b0000000-0000-0000-0000-000000000003",
                capacity=130,
                metadata={"av_equipped": True, "flexible_seating": True, "building_code": "BLD-C"},
            ),
            CampusLocation(
                id="r0000000-0000-0000-0000-000000000010",
                name="Central Library Commons LIB-101",
                type=EntityType.FACILITY,
                campus_id="c0000000-0000-0000-0000-000000000001",
                building_id="b0000000-0000-0000-0000-000000000004",
                capacity=200,
                metadata={"building_code": "BLD-LIB", "quiet_zone": False},
            ),
            CampusLocation(
                id="r0000000-0000-0000-0000-000000000011",
                name="Central Campus Canteen CAN-001",
                type=EntityType.FACILITY,
                campus_id="c0000000-0000-0000-0000-000000000001",
                building_id="b0000000-0000-0000-0000-000000000004",
                capacity=300,
                metadata={"building_code": "BLD-LIB", "food_stalls": 6},
            ),
        ]
        return {loc.id: loc for loc in default_list}

    async def get_location_by_id(self, location_id: str) -> Optional[CampusLocation]:
        return self._locations.get(location_id)

    async def get_all_locations(self, campus_id: Optional[str] = None) -> List[CampusLocation]:
        if campus_id is None:
            return list(self._locations.values())
        return [loc for loc in self._locations.values() if loc.campus_id == campus_id]
