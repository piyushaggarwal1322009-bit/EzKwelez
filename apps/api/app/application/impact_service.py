"""Impact Analysis and Graph Traversal Application Services.

Implements deterministic dependency traversal with depth bounds, cycle detection,
and structured multi-factor blast radius synthesis.
"""

from collections import deque
from datetime import datetime, timezone
import uuid
from typing import Dict, List, Optional, Set
from app.domain.campus.models import DataMode
from app.domain.graph.models import DependencyEdge, DependencyGraph, DependencyNode
from app.domain.graph.ports import CampusContextProvider, DependencyGraphRepository
from app.domain.impact.models import (
    AnalysisProvenance,
    Criticality,
    FailureEvent,
    ImpactedNode,
    ImpactReport,
    ImpactSeverity,
    ImpactType,
    TraversalPolicy,
    TraversalResult,
    calculate_impact_severity,
)
from app.domain.impact.ports import DependencyTraversalService, ImpactAnalysisEngine


class BreadthFirstTraversalService(DependencyTraversalService):
    """Deterministic BFS graph traversal implementation with cycle mitigation and depth bounds."""

    def traverse(
        self,
        root_node: DependencyNode,
        graph: DependencyGraph,
        policy: TraversalPolicy,
    ) -> TraversalResult:
        visited_nodes: List[str] = [root_node.id]
        visited_edges: List[DependencyEdge] = []
        depth_by_node: Dict[str, int] = {root_node.id: 0}
        cycles_detected: List[List[str]] = []
        warnings: List[str] = []

        # Queue contains tuple: (current_node_id, current_depth, path_list)
        queue = deque([(root_node.id, 0, [root_node.id])])
        seen_edges: Set[str] = set()

        while queue:
            current_id, depth, path = queue.popleft()

            if depth >= policy.max_depth:
                if "DEPTH_LIMIT_REACHED" not in warnings:
                    warnings.append(f"Traversal stopped at maximum depth bound of {policy.max_depth}")
                continue

            outgoing = graph.get_outgoing_edges(current_id)

            for edge in outgoing:
                # Apply policy filters
                if policy.allowed_relationships and edge.relationship not in policy.allowed_relationships:
                    continue

                target_id = edge.target_node_id
                target_node = graph.nodes.get(target_id)

                if not target_node:
                    warnings.append(f"Edge {edge.id} references missing target node {target_id}")
                    continue

                if policy.minimum_criticality:
                    # Optional filter by criticality rank
                    criticality_order = {Criticality.LOW: 1, Criticality.MEDIUM: 2, Criticality.HIGH: 3, Criticality.CRITICAL: 4}
                    if criticality_order.get(target_node.criticality, 0) < criticality_order.get(policy.minimum_criticality, 0):
                        continue

                # Cycle detection
                if target_id in path:
                    cycle_path = path + [target_id]
                    cycles_detected.append(cycle_path)
                    warnings.append(f"Cycle detected along path: {' -> '.join(cycle_path)}")
                    continue

                if edge.id not in seen_edges:
                    visited_edges.append(edge)
                    seen_edges.add(edge.id)

                if target_id not in depth_by_node:
                    depth_by_node[target_id] = depth + 1
                    visited_nodes.append(target_id)
                    queue.append((target_id, depth + 1, path + [target_id]))

        return TraversalResult(
            visited_nodes=visited_nodes,
            visited_edges=visited_edges,
            depth_by_node=depth_by_node,
            cycles_detected=cycles_detected,
            warnings=warnings,
        )


class DefaultImpactAnalysisService(ImpactAnalysisEngine):
    """Orchestrates graph repository, traversal engine, and campus context to produce structured impact reports."""

    def __init__(
        self,
        graph_repo: DependencyGraphRepository,
        traversal_service: DependencyTraversalService,
        campus_context: CampusContextProvider,
    ):
        self._graph_repo = graph_repo
        self._traversal_service = traversal_service
        self._campus_context = campus_context

    async def analyze_failure(
        self,
        failure: FailureEvent,
        policy: Optional[TraversalPolicy] = None,
    ) -> ImpactReport:
        active_policy = policy or TraversalPolicy()
        graph = await self._graph_repo.get_graph()

        root_node = graph.nodes.get(failure.node_id)
        if not root_node:
            raise ValueError(f"Root node '{failure.node_id}' does not exist in dependency topology.")

        traversal = self._traversal_service.traverse(root_node, graph, active_policy)

        impacted_nodes: List[ImpactedNode] = []
        impacted_locations: List[str] = []
        warnings = list(traversal.warnings)

        # Check for stale campus telemetry
        if await self._campus_context.is_campus_data_stale():
            warnings.append("CAMPUS_DATA_STALE: Underlying location conditions exceed 15-minute freshness threshold.")

        for node_id in traversal.visited_nodes:
            if node_id == root_node.id:
                continue  # Root node is the failure source

            node = graph.nodes[node_id]
            depth = traversal.depth_by_node.get(node_id, 1)

            impact_type = ImpactType.DIRECT if depth == 1 else ImpactType.INDIRECT
            if node.criticality == Criticality.CRITICAL:
                node_severity = ImpactSeverity.CRITICAL
            elif node.criticality == Criticality.HIGH:
                node_severity = ImpactSeverity.HIGH
            elif node.criticality == Criticality.MEDIUM:
                node_severity = ImpactSeverity.MODERATE
            else:
                node_severity = ImpactSeverity.LOW

            reason = f"Directly impacted by {root_node.name}" if depth == 1 else f"Cascading impact ({depth} hops from {root_node.name})"

            if node.location_id and node.location_id not in impacted_locations:
                impacted_locations.append(node.location_id)

            impacted_nodes.append(
                ImpactedNode(
                    node_id=node.id,
                    node_name=node.name,
                    impact_type=impact_type,
                    impact_severity=node_severity,
                    distance_from_root=depth,
                    criticality=node.criticality,
                    reason=reason,
                    location_id=node.location_id,
                )
            )

        overall_severity = calculate_impact_severity(impacted_nodes)
        max_propagation_depth = max(traversal.depth_by_node.values()) if traversal.depth_by_node else 0

        provenance = AnalysisProvenance(
            graph_data_mode=DataMode.SIMULATED,
            campus_data_mode=DataMode.SIMULATED,
            generated_at=datetime.now(timezone.utc).isoformat(),
            source_summary="EzyKwelez Deterministic Impact Engine (Phase 4)",
        )

        return ImpactReport(
            analysis_id=f"ana_{uuid.uuid4().hex[:12]}",
            root_node=root_node,
            impacted_nodes=impacted_nodes,
            impacted_locations=impacted_locations,
            severity=overall_severity,
            propagation_depth=max_propagation_depth,
            generated_at=datetime.now(timezone.utc).isoformat(),
            data_mode=DataMode.SIMULATED,
            provenance=provenance,
            warnings=warnings,
        )
