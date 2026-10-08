"""Blast Radius and Impact Assessment Application Service.

This service orchestrates:
1. Loading incident + its explicitly affected entities
2. Building the campus dependency graph
3. Running deterministic BFS blast-radius traversal
4. Calculating a transparent deterministic impact assessment

CRITICAL PRINCIPLE: No LLM. All results are deterministic and recalculable.
"""

from collections import deque
from datetime import datetime, timezone
import uuid
from typing import Dict, List, Set

from app.domain.assessment.models import (
    AffectedEntity,
    BlastRadiusResult,
    ImpactAssessment,
    ImpactCategory,
    IncidentAssessment,
)
from app.domain.graph.models import Criticality, DependencyGraph, DependencyNode, DependencyEdge
from app.domain.graph.ports import DependencyGraphRepository
from app.application.incident_service import IncidentApplicationService, IncidentNotFoundError


# ---------------------------------------------------------------------------
# Scoring policy constants (documented heuristic — not scientifically derived)
# ---------------------------------------------------------------------------

# Strength-based criticality score (additive per entity)
STRENGTH_SCORES: Dict[str, int] = {
    "critical": 12,
    "required": 8,
    "important": 4,
    "optional": 1,
}

# Per-depth decay for transitively discovered entities
DEPTH_SCORES: Dict[int, int] = {
    0: 15,   # direct entity
    1: 8,    # depth-1 dependent
    2: 4,    # depth-2 dependent
}
DEPTH_DEFAULT_SCORE = 1  # all deeper levels

# Node type multipliers (service disruption is more impactful)
TYPE_SCORES = {
    "service": 6,
    "resource": 3,
    "location": 2,
    "building": 2,
    "room": 1,
    "operation": 1,
    "infrastructure": 4,
    "utility": 4,
    "network": 5,
    "system": 4,
}

# Impact category thresholds (transparent, documented, deterministic)
# Score is raw (not normalized) — capped at 100
CATEGORY_THRESHOLDS = [
    (81, ImpactCategory.CRITICAL),
    (61, ImpactCategory.HIGH),
    (41, ImpactCategory.MODERATE),
    (21, ImpactCategory.LOW),
    (0,  ImpactCategory.MINIMAL),
]


def _criticality_to_score(criticality: Criticality) -> int:
    """Map Criticality enum to a deterministic score contribution."""
    return {
        Criticality.CRITICAL: 12,
        Criticality.HIGH: 8,
        Criticality.MEDIUM: 4,
        Criticality.LOW: 1,
    }.get(criticality, 4)


def _strength_to_criticality(strength_value: str | None) -> Criticality:
    """Deterministically map dependency strength to Criticality."""
    mapping = {
        "critical": Criticality.CRITICAL,
        "required": Criticality.HIGH,
        "important": Criticality.MEDIUM,
        "optional": Criticality.LOW,
    }
    return mapping.get(strength_value or "", Criticality.MEDIUM)


def _score_to_category(score: int) -> ImpactCategory:
    """Deterministic threshold-based scoring — documented in scoring policy constants."""
    for threshold, category in CATEGORY_THRESHOLDS:
        if score >= threshold:
            return category
    return ImpactCategory.MINIMAL


class BlastRadiusEngine:
    """Deterministic BFS blast-radius traversal engine.

    Given a DependencyGraph and a set of root entity IDs (directly affected),
    discovers all downstream dependents through outgoing edges.

    Key invariants:
    - visited set prevents duplicates and infinite loops in cyclic graphs
    - traversal terminates even with malformed/cyclic graph
    - multiple paths to the same entity: first-reached wins (deterministic BFS order)
    - depth is tracked per entity
    - dependency strength and type are preserved in results
    """

    DEFAULT_MAX_DEPTH = 6

    def traverse(
        self,
        graph: DependencyGraph,
        root_ids: List[str],
        max_depth: int = DEFAULT_MAX_DEPTH,
    ) -> BlastRadiusResult:
        """BFS traversal from all root_ids simultaneously.

        Returns BlastRadiusResult with direct and transitive entities separated.
        """
        direct_entities: List[AffectedEntity] = []
        transitive_entities: List[AffectedEntity] = []
        visited: Set[str] = set()
        max_encountered_depth = 0

        # Seed queue with direct entities (depth=0)
        # Queue items: (node_id, depth, parent_id, edge)
        queue: deque = deque()

        for root_id in root_ids:
            node = graph.nodes.get(root_id)
            if node is None or root_id in visited:
                continue
            visited.add(root_id)
            entity = AffectedEntity(
                entity_id=node.id,
                entity_type=getattr(node, "type", type(node).__name__).value
                    if hasattr(getattr(node, "type", None), "value")
                    else str(getattr(node, "type", "unknown")),
                entity_name=node.name,
                entity_code=getattr(node, "code", node.id),
                depth=0,
                is_direct=True,
                parent_entity_id=None,
                dependency_type=None,
                dependency_strength=None,
                reason=f"Directly attached to incident as an affected entity.",
                criticality=getattr(node, "criticality", Criticality.MEDIUM),
                location_id=node.location_id,
                path=[node.id],
            )
            direct_entities.append(entity)
            queue.append((root_id, 0, None, None, [root_id]))

        while queue:
            curr_id, depth, parent_id, incoming_edge, path = queue.popleft()

            if depth >= max_depth:
                continue

            # Traverse all outgoing edges (Source -> Target means Target depends on Source)
            outgoing: List[DependencyEdge] = graph.get_outgoing_edges(curr_id)

            for edge in outgoing:
                target_id = edge.target_node_id
                if target_id in visited:
                    continue
                visited.add(target_id)

                target_node = graph.nodes.get(target_id)
                if target_node is None:
                    continue

                new_depth = depth + 1
                if new_depth > max_encountered_depth:
                    max_encountered_depth = new_depth

                strength = getattr(edge, "criticality", Criticality.MEDIUM)
                strength_str = strength.value if hasattr(strength, "value") else str(strength)
                dep_criticality = _strength_to_criticality(strength_str)

                relationship = edge.relationship
                dep_type = relationship.value if hasattr(relationship, "value") else str(relationship)

                # Find parent name for reason
                parent_node = graph.nodes.get(curr_id)
                parent_name = parent_node.name if parent_node else curr_id

                node_type = getattr(target_node, "type", None)
                entity_type_str = node_type.value if hasattr(node_type, "value") else str(node_type)

                reason = (
                    f"{target_node.name} depends on {parent_name} "
                    f"via {dep_type} dependency (strength: {strength_str})."
                )

                new_path = path + [target_id]
                entity = AffectedEntity(
                    entity_id=target_id,
                    entity_type=entity_type_str,
                    entity_name=target_node.name,
                    entity_code=getattr(target_node, "code", target_id),
                    depth=new_depth,
                    is_direct=False,
                    parent_entity_id=curr_id,
                    dependency_type=dep_type,
                    dependency_strength=strength_str,
                    reason=reason,
                    criticality=dep_criticality,
                    location_id=target_node.location_id,
                    path=new_path,
                )
                transitive_entities.append(entity)
                queue.append((target_id, new_depth, curr_id, edge, new_path))

        # Sort deterministically by depth then entity_id
        direct_entities.sort(key=lambda e: (e.depth, e.entity_id))
        transitive_entities.sort(key=lambda e: (e.depth, e.entity_id))

        return BlastRadiusResult(
            direct_entities=direct_entities,
            transitive_entities=transitive_entities,
            total_affected_count=len(direct_entities) + len(transitive_entities),
            maximum_depth=max_encountered_depth,
        )


class ImpactScoringPolicy:
    """Transparent, documented, deterministic scoring policy.

    Scoring heuristic (not scientifically validated — product scoring tool):
    - Each entity contributes a base score from its node type
    - Depth-decay: direct entities contribute more than deep transitives
    - Criticality: critical/high dependency edges increase score
    - Raw score is capped at 100

    Category thresholds (transparent):
      CRITICAL  >= 81
      HIGH      >= 61
      MODERATE  >= 41
      LOW       >= 21
      MINIMAL   < 21
    """

    def calculate(self, blast_radius: BlastRadiusResult) -> ImpactAssessment:
        all_entities = blast_radius.direct_entities + blast_radius.transitive_entities

        locations: Set[str] = set()
        resources_count = 0
        services_count = 0
        critical_dep_count = 0
        raw_score = 0

        for entity in all_entities:
            if entity.location_id:
                locations.add(entity.location_id)

            entity_type_lower = (entity.entity_type or "").lower()

            # Classify for counters
            if entity_type_lower == "resource":
                resources_count += 1
            elif entity_type_lower == "service":
                services_count += 1

            if entity.criticality in (Criticality.CRITICAL, Criticality.HIGH):
                critical_dep_count += 1

            # Depth-decay score contribution
            depth_contribution = DEPTH_SCORES.get(entity.depth, DEPTH_DEFAULT_SCORE)
            # Type contribution
            type_contribution = TYPE_SCORES.get(entity_type_lower, 2)
            # Criticality contribution
            criticality_contribution = _criticality_to_score(entity.criticality)

            raw_score += depth_contribution + type_contribution + criticality_contribution

        # Normalize: cap at 100
        normalized = min(100, raw_score)
        category = _score_to_category(normalized)

        return ImpactAssessment(
            total_impact_score=normalized,
            impact_category=category,
            affected_locations=sorted(locations),
            affected_resources_count=resources_count,
            affected_services_count=services_count,
            critical_dependency_count=critical_dep_count,
            explanation_metadata={
                "raw_score": raw_score,
                "normalized_score": normalized,
                "scoring_policy": "EzKwelez Phase 5 deterministic scoring heuristic v1.0",
                "category_thresholds": {
                    "critical": ">=81", "high": ">=61",
                    "moderate": ">=41", "low": ">=21", "minimal": "<21",
                },
                "depth_decay_table": DEPTH_SCORES,
                "max_depth_reached": blast_radius.maximum_depth,
                "total_entities": blast_radius.total_affected_count,
            },
        )


class AssessmentService:
    """Orchestrator: incident → blast radius → impact → assessment.

    Read-only — does NOT mutate incident or campus state.
    Deterministic — same input → same output always.
    Auth-independent — no auth logic inside calculation.
    """

    def __init__(
        self,
        incident_service: IncidentApplicationService,
        graph_repository: DependencyGraphRepository,
    ):
        self._incident_service = incident_service
        self._graph_repository = graph_repository
        self._blast_engine = BlastRadiusEngine()
        self._scoring_policy = ImpactScoringPolicy()

    async def generate_assessment(
        self,
        incident_id: str,
        campus_id: str,
    ) -> IncidentAssessment:
        """Full pipeline: incident → affected entities → graph traversal → blast radius → impact."""
        # 1. Load incident (validates existence and campus ownership)
        incident = await self._incident_service.get_incident_in_campus(incident_id, campus_id)

        # 2. Load explicitly affected entities (directly attached to this incident)
        affected_entities = await self._incident_service.list_affected_entities(incident_id, campus_id)

        # 3. Load campus dependency graph (read-only)
        graph: DependencyGraph = await self._graph_repository.get_graph()

        # 4. Extract root entity IDs from explicitly affected entities
        root_ids = [ae.node_id for ae in affected_entities]

        # 5. Run deterministic blast-radius traversal
        blast_radius = self._blast_engine.traverse(graph=graph, root_ids=root_ids)

        # 6. Calculate deterministic impact
        impact = self._scoring_policy.calculate(blast_radius)

        return IncidentAssessment(
            assessment_id=f"assmt_{uuid.uuid4().hex[:12]}",
            incident=incident,
            blast_radius=blast_radius,
            impact=impact,
            data_mode=incident.data_mode,
        )
