"""Application Service for Campus Locations."""

from typing import List, Optional
from app.domain.campus.models import Location, LocationType, StructuralStatus
from app.infrastructure.repositories.campus_repository import CampusRepository, campus_repository


class LocationService:
    def __init__(self, repo: CampusRepository = campus_repository):
        self.repo = repo

    def list_locations(self, campus_id: str) -> List[Location]:
        return self.repo.list_locations(campus_id)

    def get_location(self, location_id: str) -> Location:
        return self.repo.get_location(location_id)

    def create_location(
        self,
        campus_id: str,
        name: str,
        code: str,
        location_type: LocationType,
        description: Optional[str] = None,
        capacity: int = 0,
        status: StructuralStatus = StructuralStatus.ACTIVE,
    ) -> Location:
        return self.repo.create_location(
            campus_id=campus_id,
            name=name,
            code=code,
            location_type=location_type,
            description=description,
            capacity=capacity,
            status=status,
        )
