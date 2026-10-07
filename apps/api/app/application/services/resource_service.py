"""Application Service for Campus Resources/Infrastructure."""

from typing import List, Optional
from app.domain.campus.models import Resource, ResourceType, StructuralStatus
from app.infrastructure.repositories.campus_repository import CampusRepository, campus_repository


class ResourceService:
    def __init__(self, repo: CampusRepository = campus_repository):
        self.repo = repo

    def list_resources(self, campus_id: str) -> List[Resource]:
        return self.repo.list_resources(campus_id)

    def get_resource(self, resource_id: str) -> Resource:
        return self.repo.get_resource(resource_id)

    def create_resource(
        self,
        campus_id: str,
        name: str,
        code: str,
        resource_type: ResourceType,
        location_id: Optional[str] = None,
        description: Optional[str] = None,
        status: StructuralStatus = StructuralStatus.ACTIVE,
    ) -> Resource:
        return self.repo.create_resource(
            campus_id=campus_id,
            name=name,
            code=code,
            resource_type=resource_type,
            location_id=location_id,
            description=description,
            status=status,
        )
