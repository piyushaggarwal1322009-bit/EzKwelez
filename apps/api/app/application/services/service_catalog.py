"""Application Service for Campus Services / Amenities."""

from typing import List, Optional
from app.domain.campus.models import CampusService, ServiceType, StructuralStatus
from app.infrastructure.repositories.campus_repository import CampusRepository, campus_repository


class ServiceCatalogService:
    def __init__(self, repo: CampusRepository = campus_repository):
        self.repo = repo

    def list_services(self, campus_id: str) -> List[CampusService]:
        return self.repo.list_services(campus_id)

    def get_service(self, service_id: str) -> CampusService:
        return self.repo.get_service(service_id)

    def create_service(
        self,
        campus_id: str,
        name: str,
        code: str,
        service_type: ServiceType,
        location_id: Optional[str] = None,
        description: Optional[str] = None,
        status: StructuralStatus = StructuralStatus.ACTIVE,
    ) -> CampusService:
        return self.repo.create_service(
            campus_id=campus_id,
            name=name,
            code=code,
            service_type=service_type,
            location_id=location_id,
            description=description,
            status=status,
        )
