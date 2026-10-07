"""Deterministic Dependency Graph Traversal Algorithms."""

from collections import deque
from typing import Dict, List, Optional, Set
from app.domain.campus.models import (
    CampusEntityType,
    CampusGraph,
    Dependency,
    GraphEdge,
    GraphNode,
    Location,
    Resource,
    CampusService,
)


def build_campus_graph(
    campus_id: str,
    locations: List[Location],
    resources: List[Resource],
    services: List[CampusService],
    dependencies: List[Dependency],
) -> CampusGraph:
    """Construct an in-memory searchable dependency graph from relational entities."""
    nodes: Dict[str, GraphNode] = {}
    edges: List[GraphEdge] = []
    downstream_adj: Dict[str, List[GraphEdge]] = {}
    upstream_adj: Dict[str, List[GraphEdge]] = {}

    # Register Location Nodes
    for loc in locations:
        nodes[loc.id] = GraphNode(
            id=loc.id,
            entity_type=CampusEntityType.LOCATION,
            name=loc.name,
            code=loc.code,
            type_category=loc.location_type.value,
            status=loc.status,
            location_id=None,
        )
        downstream_adj[loc.id] = []
        upstream_adj[loc.id] = []

    # Register Resource Nodes
    for res in resources:
        nodes[res.id] = GraphNode(
            id=res.id,
            entity_type=CampusEntityType.RESOURCE,
            name=res.name,
            code=res.code,
            type_category=res.resource_type.value,
            status=res.status,
            location_id=res.location_id,
        )
        downstream_adj[res.id] = []
        upstream_adj[res.id] = []

    # Register Service Nodes
    for svc in services:
        nodes[svc.id] = GraphNode(
            id=svc.id,
            entity_type=CampusEntityType.SERVICE,
            name=svc.name,
            code=svc.code,
            type_category=svc.service_type.value,
            status=svc.status,
            location_id=svc.location_id,
        )
        downstream_adj[svc.id] = []
        upstream_adj[svc.id] = []

    # Register Edges (Source -> Target: Target depends on Source)
    for dep in dependencies:
        edge = GraphEdge(
            id=dep.id,
            source_type=dep.source_type,
            source_id=dep.source_id,
            target_type=dep.target_type,
            target_id=dep.target_id,
            dependency_type=dep.dependency_type,
            strength=dep.strength,
            description=dep.description,
        )
        edges.append(edge)

        # Ensure maps are initialized for nodes
        if dep.source_id not in downstream_adj:
            downstream_adj[dep.source_id] = []
        if dep.target_id not in upstream_adj:
            upstream_adj[dep.target_id] = []

        downstream_adj[dep.source_id].append(edge)
        upstream_adj[dep.target_id].append(edge)

    return CampusGraph(
        campus_id=campus_id,
        nodes=nodes,
        edges=edges,
        downstream_adj=downstream_adj,
        upstream_adj=upstream_adj,
    )


def traverse_downstream_dependents(
    graph: CampusGraph,
    root_entity_id: str,
    max_depth: Optional[int] = None,
) -> List[Dict]:
    """BFS traversal finding all downstream dependents (what depends on this entity).
    
    If Source fails, these Targets are impacted.
    """
    if root_entity_id not in graph.nodes:
        return []

    visited: Set[str] = {root_entity_id}
    # Queue stores (current_node_id, current_depth, edge_type, edge_strength)
    queue = deque([(root_entity_id, 0, None, None)])
    results: List[Dict] = []

    while queue:
        curr_id, depth, edge_type, edge_strength = queue.popleft()

        if curr_id != root_entity_id:
            node = graph.nodes.get(curr_id)
            if node:
                results.append({
                    "id": node.id,
                    "entity_type": node.entity_type.value,
                    "name": node.name,
                    "code": node.code,
                    "depth": depth,
                    "edge_type": edge_type,
                    "edge_strength": edge_strength,
                })

        if max_depth is not None and depth >= max_depth:
            continue

        for edge in graph.downstream_adj.get(curr_id, []):
            target_id = edge.target_id
            if target_id not in visited:
                visited.add(target_id)
                queue.append((
                    target_id,
                    depth + 1,
                    edge.dependency_type.value,
                    edge.strength.value,
                ))

    return results


def traverse_upstream_dependencies(
    graph: CampusGraph,
    root_entity_id: str,
    max_depth: Optional[int] = None,
) -> List[Dict]:
    """BFS traversal finding all upstream dependencies (what this entity depends on).
    
    Returns all Sources that feed into this Target.
    """
    if root_entity_id not in graph.nodes:
        return []

    visited: Set[str] = {root_entity_id}
    queue = deque([(root_entity_id, 0, None, None)])
    results: List[Dict] = []

    while queue:
        curr_id, depth, edge_type, edge_strength = queue.popleft()

        if curr_id != root_entity_id:
            node = graph.nodes.get(curr_id)
            if node:
                results.append({
                    "id": node.id,
                    "entity_type": node.entity_type.value,
                    "name": node.name,
                    "code": node.code,
                    "depth": depth,
                    "edge_type": edge_type,
                    "edge_strength": edge_strength,
                })

        if max_depth is not None and depth >= max_depth:
            continue

        for edge in graph.upstream_adj.get(curr_id, []):
            source_id = edge.source_id
            if source_id not in visited:
                visited.add(source_id)
                queue.append((
                    source_id,
                    depth + 1,
                    edge.dependency_type.value,
                    edge.strength.value,
                ))

    return results
