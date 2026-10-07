"""Deterministic mock implementation of ConnectivityProvider."""

from typing import Dict, List, Optional
from app.domain.campus.models import CampusLocation, ConnectivitySnapshot, DataMode
from app.domain.campus.ports import ConnectivityProvider


class MockConnectivityProvider(ConnectivityProvider):
    """Provides deterministic synthetic connectivity data for testing and drills.
    
    Hardcoded with high-realism metrics matching the primary demo scenario:
    - Computing Labs (C101, C102): 90-92 score (Excellent)
    - Seminar Hall C204: 95 score (Excellent, RSSI -48 dBm)
    - Central Library: 88 score (Excellent, RSSI -56 dBm)
    - Central Canteen: 64 score (Good, RSSI -70 dBm)
    - Physics Lab B201: 72 score (Good, RSSI -65 dBm)
    """

    DEFAULT_PROFILES = {
        "r0000000-0000-0000-0000-000000000001": (74, "APEX-FACULTY-WIFI", -64),
        "r0000000-0000-0000-0000-000000000002": (68, "APEX-STUDENT-WIFI", -68),
        "r0000000-0000-0000-0000-000000000003": (72, "APEX-LAB-SECURE", -65),
        "r0000000-0000-0000-0000-000000000004": (65, "APEX-LAB-SECURE", -69),
        "r0000000-0000-0000-0000-000000000005": (78, "APEX-LAB-SECURE", -62),
        "r0000000-0000-0000-0000-000000000006": (92, "APEX-CS-HIGHSP", -52),
        "r0000000-0000-0000-0000-000000000007": (90, "APEX-CS-HIGHSP", -54),
        "r0000000-0000-0000-0000-000000000008": (88, "APEX-AUDITORIUM", -55),
        "r0000000-0000-0000-0000-000000000009": (95, "APEX-SEMINAR-5G", -48),
        "r0000000-0000-0000-0000-000000000010": (88, "APEX-LIB-FREEWIFI", -56),
        "r0000000-0000-0000-0000-000000000011": (64, "APEX-CANTEEN-OPEN", -70),
    }

    def __init__(self, override_profiles: Optional[Dict[str, tuple]] = None):
        self._profiles = dict(self.DEFAULT_PROFILES)
        if override_profiles:
            self._profiles.update(override_profiles)

    async def get_connectivity(self, location: CampusLocation) -> ConnectivitySnapshot:
        score, network, dbm = self._profiles.get(
            location.id, (75, "APEX-GENERAL-WIFI", -65)
        )
        return ConnectivitySnapshot.create(
            location_id=location.id,
            signal_score=score,
            network_name=network,
            dbm=dbm,
            data_mode=DataMode.SIMULATED,
        )

    async def get_all_connectivity(self, locations: List[CampusLocation]) -> Dict[str, ConnectivitySnapshot]:
        results = {}
        for loc in locations:
            results[loc.id] = await self.get_connectivity(loc)
        return results
