"""Application Service for Dependency Graph Operations and Traversal."""

from typing import Dict, List, Optional
from app.domain.campus.models import (
    CampusEntityType,
    CampusGraph,
    Dependency,
    DependencyStrength,
    DependencyType,
)
from app.domain.graph.traversal import (
    traverse_downstream_dependents,
    traverse_upstream_dependencies,
)
from app.infrastructure.repositories.campus_repository import CampusRepository, campus_repository


class DependencyGraphService:
    def __init__(self, repo: CampusRepository = campus_repository):
        self.repo = repo

    def list_dependencies(self, campus_id: str) -> List[Dependency]:
        return self.repo.list_dependencies(campus_id)

    def get_dependency(self, dependency_id: str) -> Dependency:
        return self.repo.get_dependency(dependency_id)

    def create_dependency(
        self,
        campus_id: str,
        source_type: CampusEntityType,
        source_id: str,
        target_type: CampusEntityType,
        target_id: str,
        dependency_type: DependencyType,
        strength: DependencyStrength = DependencyStrength.CRITICAL,
        description: Optional[str] = None,
    ) -> Dependency:
        return self.repo.create_dependency(
            campus_id=campus_id,
            source_type=source_type,
            source_id=source_id,
            target_type=target_type,
            target_id=target_id,
            dependency_type=dependency_type,
            strength=strength,
            description=description,
        )

    def delete_dependency(self, dependency_id: str) -> bool:
        return self.repo.delete_dependency(dependency_id)

    def get_campus_graph(self, campus_id: str) -> CampusGraph:
        return self.repo.get_campus_graph(campus_id)

    def get_upstream_dependencies(
        self,
        campus_id: str,
        entity_type: CampusEntityType,
        entity_id: str,
        max_depth: Optional[int] = None,
    ) -> Dict:
        """Find all sources this entity depends on."""
        self.repo.validate_entity_exists(campus_id, entity_type, entity_id)
        graph = self.repo.get_campus_graph(campus_id)
        nodes = traverse_upstream_dependencies(graph, entity_id, max_depth=max_depth)
        root_name = self.repo.get_entity_name(entity_type, entity_id)

        return {
            "root_entity": {
                "id": entity_id,
                "entity_type": entity_type.value,
                "name": root_name,
            },
            "direction": "dependencies",
            "max_depth": max_depth,
            "total_found": len(nodes),
            "nodes": nodes,
        }

    def get_downstream_dependents(
        self,
        campus_id: str,
        entity_type: CampusEntityType,
        entity_id: str,
        max_depth: Optional[int] = None,
    ) -> Dict:
        """Find all targets that depend on this entity (downstream impact path)."""
        self.repo.validate_entity_exists(campus_id, entity_type, entity_id)
        graph = self.repo.get_campus_graph(campus_id)
        nodes = traverse_downstream_dependents(graph, entity_id, max_depth=max_depth)
        root_name = self.repo.get_entity_name(entity_type, entity_id)

        return {
            "root_entity": {
                "id": entity_id,
                "entity_type": entity_type.value,
                "name": root_name,
            },
            "direction": "dependents",
            "max_depth": max_depth,
            "total_found": len(nodes),
            "nodes": nodes,
        }
