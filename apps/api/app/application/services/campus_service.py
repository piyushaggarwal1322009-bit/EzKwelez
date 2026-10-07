"""Application Service for Campus Aggregate."""

from typing import List, Optional
from app.domain.campus.models import Campus
from app.infrastructure.repositories.campus_repository import CampusRepository, campus_repository


class CampusService:
    def __init__(self, repo: CampusRepository = campus_repository):
        self.repo = repo

    def list_campuses(self) -> List[Campus]:
        return self.repo.list_campuses()

    def get_campus(self, campus_id: str) -> Campus:
        return self.repo.get_campus(campus_id)

    def create_campus(self, name: str, code: str, description: Optional[str] = None) -> Campus:
        return self.repo.create_campus(name=name, code=code, description=description)
