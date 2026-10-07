"""Condition Aggregation Application Service.

Orchestrates campus repositories, occupancy providers, and connectivity providers
to produce authoritative live condition snapshots and summary metrics.
"""

from datetime import datetime, timezone
from typing import List, Optional
from app.domain.campus.models import (
    CampusLocation,
    DataMode,
    LiveCampusConditionsResult,
    LocationCondition,
    OccupancyStatus,
)
from app.domain.campus.ports import CampusRepository, ConnectivityProvider, OccupancyProvider


class ConditionAggregationService:
    """Application service for campus telemetry and condition synthesis."""

    def __init__(
        self,
        campus_repo: CampusRepository,
        occupancy_provider: OccupancyProvider,
        connectivity_provider: ConnectivityProvider,
    ):
        self._campus_repo = campus_repo
        self._occupancy_provider = occupancy_provider
        self._connectivity_provider = connectivity_provider

    async def get_all_locations(self, campus_id: Optional[str] = None) -> List[CampusLocation]:
        """Retrieve all active campus facilities."""
        return await self._campus_repo.get_all_locations(campus_id)

    async def get_location_condition(self, location_id: str) -> Optional[LocationCondition]:
        """Retrieve the live condition for a single campus facility."""
        location = await self._campus_repo.get_location_by_id(location_id)
        if not location:
            return None

        occupancy = await self._occupancy_provider.get_occupancy(location)
        connectivity = await self._connectivity_provider.get_connectivity(location)

        health = "NORMAL"
        if occupancy.status == OccupancyStatus.OVER_CAPACITY:
            health = "CRITICAL"
        elif occupancy.status == OccupancyStatus.VERY_BUSY or connectivity.signal_score < 40:
            health = "DEGRADED"

        return LocationCondition(
            location=location,
            occupancy=occupancy,
            connectivity=connectivity,
            overall_health=health,
        )

    async def get_live_campus_conditions(
        self, campus_id: Optional[str] = None
    ) -> LiveCampusConditionsResult:
        """Aggregate conditions across all campus facilities with rolled-up summary statistics."""
        locations = await self._campus_repo.get_all_locations(campus_id)
        if not locations:
            return LiveCampusConditionsResult(
                locations=[],
                total_locations=0,
                total_occupancy=0,
                total_capacity=0,
                average_occupancy_rate=0.0,
                overall_signal_score=0,
                data_mode=DataMode.SIMULATED,
                generated_at=datetime.now(timezone.utc).isoformat(),
            )

        occupancies = await self._occupancy_provider.get_all_occupancies(locations)
        connectivities = await self._connectivity_provider.get_all_connectivity(locations)

        location_conditions: List[LocationCondition] = []
        total_occ = 0
        total_cap = 0
        total_signal = 0

        for loc in locations:
            occ = occupancies[loc.id]
            conn = connectivities[loc.id]

            health = "NORMAL"
            if occ.status == OccupancyStatus.OVER_CAPACITY:
                health = "CRITICAL"
            elif occ.status == OccupancyStatus.VERY_BUSY or conn.signal_score < 40:
                health = "DEGRADED"

            location_conditions.append(
                LocationCondition(
                    location=loc,
                    occupancy=occ,
                    connectivity=conn,
                    overall_health=health,
                )
            )

            total_occ += occ.current_students
            total_cap += occ.capacity
            total_signal += conn.signal_score

        avg_occ_rate = round((total_occ / total_cap * 100.0), 1) if total_cap > 0 else 0.0
        avg_signal = int(round(total_signal / len(locations))) if locations else 0

        # Provenance: If any provider is live, check overall mode; defaults to simulated for mock
        data_mode = DataMode.SIMULATED
        if location_conditions and location_conditions[0].occupancy.data_mode == DataMode.LIVE:
            data_mode = DataMode.LIVE

        return LiveCampusConditionsResult(
            locations=location_conditions,
            total_locations=len(locations),
            total_occupancy=total_occ,
            total_capacity=total_cap,
            average_occupancy_rate=avg_occ_rate,
            overall_signal_score=avg_signal,
            data_mode=data_mode,
            generated_at=datetime.now(timezone.utc).isoformat(),
        )
