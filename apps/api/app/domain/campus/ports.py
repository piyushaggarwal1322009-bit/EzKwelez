"""Abstract repository and provider interfaces (Ports) for Campus domain."""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional
from app.domain.campus.models import CampusLocation, ConnectivitySnapshot, OccupancySnapshot


class CampusRepository(ABC):
    """Abstract port for persisting and querying campus entities."""

    @abstractmethod
    async def get_location_by_id(self, location_id: str) -> Optional[CampusLocation]:
        """Fetch a specific location by ID."""
        pass

    @abstractmethod
    async def get_all_locations(self, campus_id: Optional[str] = None) -> List[CampusLocation]:
        """Fetch all locations for a campus."""
        pass


CampusContextProvider = CampusRepository


class OccupancyProvider(ABC):
    """Abstract port for acquiring live/simulated occupancy telemetry."""

    @abstractmethod
    async def get_occupancy(self, location: CampusLocation) -> OccupancySnapshot:
        """Fetch occupancy snapshot for a single campus location."""
        pass

    @abstractmethod
    async def get_all_occupancies(self, locations: List[CampusLocation]) -> Dict[str, OccupancySnapshot]:
        """Fetch occupancy snapshots for multiple campus locations."""
        pass


class ConnectivityProvider(ABC):
    """Abstract port for acquiring Wi-Fi and network connectivity telemetry."""

    @abstractmethod
    async def get_connectivity(self, location: CampusLocation) -> ConnectivitySnapshot:
        """Fetch connectivity snapshot for a single campus location."""
        pass

    @abstractmethod
    async def get_all_connectivity(self, locations: List[CampusLocation]) -> Dict[str, ConnectivitySnapshot]:
        """Fetch connectivity snapshots for multiple campus locations."""
        pass
