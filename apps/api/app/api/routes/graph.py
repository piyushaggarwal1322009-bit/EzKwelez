"""Dependency Graph query and topology API routes."""

from datetime import datetime, timezone
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.api.dependencies import get_graph_repository
from app.domain.graph.ports import DependencyGraphRepository
from app.schemas.campus import ApiErrorEnvelope, ApiResponseEnvelope, ApiResponseMeta
from app.schemas.graph import DependencyEdgeDTO, DependencyGraphSnapshotDTO, DependencyNodeDTO

router = APIRouter(prefix="/dependencies", tags=["Dependency Graph"])


def generate_meta(cached: bool = False) -> ApiResponseMeta:
    return ApiResponseMeta(
        requestId=f"req_{uuid.uuid4().hex[:12]}",
        timestamp=datetime.now(timezone.utc).isoformat(),
        cached=cached,
    )


@router.get(
    "/nodes",
    response_model=ApiResponseEnvelope[List[DependencyNodeDTO]],
    summary="List all dependency nodes",
)
async def list_dependency_nodes(
    graph_repo: DependencyGraphRepository = Depends(get_graph_repository),
):
    """Retrieve all operational, utility, room, and service dependency vertices."""
    nodes = await graph_repo.list_nodes()
    dtos = [
        DependencyNodeDTO(
            id=n.id,
            type=n.type,
            name=n.name,
            status=n.status,
            criticality=n.criticality,
            locationId=n.location_id,
            metadata=n.metadata,
            createdAt=n.created_at,
        )
        for n in nodes
    ]
    return ApiResponseEnvelope(data=dtos, meta=generate_meta())


@router.get(
    "/nodes/{node_id}",
    response_model=ApiResponseEnvelope[DependencyNodeDTO],
    responses={404: {"model": ApiErrorEnvelope, "description": "Node not found"}},
    summary="Get a specific dependency node",
)
async def get_dependency_node(
    node_id: str,
    graph_repo: DependencyGraphRepository = Depends(get_graph_repository),
):
    """Retrieve detailed topology vertex by node ID."""
    node = await graph_repo.get_node_by_id(node_id)
    if not node:
        req_id = f"req_{uuid.uuid4().hex[:12]}"
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "NODE_NOT_FOUND",
                    "message": f"Dependency node with ID '{node_id}' was not found.",
                    "requestId": req_id,
                    "details": {"nodeId": node_id},
                }
            },
        )

    dto = DependencyNodeDTO(
        id=node.id,
        type=node.type,
        name=node.name,
        status=node.status,
        criticality=node.criticality,
        locationId=node.location_id,
        metadata=node.metadata,
        createdAt=node.created_at,
    )
    return ApiResponseEnvelope(data=dto, meta=generate_meta())


@router.get(
    "/edges",
    response_model=ApiResponseEnvelope[List[DependencyEdgeDTO]],
    summary="List dependency edges",
)
async def list_dependency_edges(
    node_id: Optional[str] = Query(default=None, alias="nodeId"),
    direction: str = Query(default="outgoing", pattern="^(outgoing|incoming)$"),
    graph_repo: DependencyGraphRepository = Depends(get_graph_repository),
):
    """Retrieve directed dependency edges connecting vertices."""
    if node_id:
        edges = await graph_repo.get_edges(node_id, direction=direction)
    else:
        edges = await graph_repo.list_edges()

    dtos = [
        DependencyEdgeDTO(
            id=e.id,
            sourceNodeId=e.source_node_id,
            targetNodeId=e.target_node_id,
            relationship=e.relationship,
            direction=e.direction,
            criticality=e.criticality,
            weight=e.weight,
            metadata=e.metadata,
            createdAt=e.created_at,
        )
        for e in edges
    ]
    return ApiResponseEnvelope(data=dtos, meta=generate_meta())


@router.get(
    "/graph",
    response_model=ApiResponseEnvelope[DependencyGraphSnapshotDTO],
    summary="Get complete dependency graph topology snapshot",
)
async def get_graph_snapshot(
    graph_repo: DependencyGraphRepository = Depends(get_graph_repository),
):
    """Retrieve full graph snapshot with all vertices and directed edges."""
    graph = await graph_repo.get_graph()
    node_dtos = [
        DependencyNodeDTO(
            id=n.id,
            type=n.type,
            name=n.name,
            status=n.status,
            criticality=n.criticality,
            locationId=n.location_id,
            metadata=n.metadata,
            createdAt=n.created_at,
        )
        for n in graph.nodes.values()
    ]
    edge_dtos = [
        DependencyEdgeDTO(
            id=e.id,
            sourceNodeId=e.source_node_id,
            targetNodeId=e.target_node_id,
            relationship=e.relationship,
            direction=e.direction,
            criticality=e.criticality,
            weight=e.weight,
            metadata=e.metadata,
            createdAt=e.created_at,
        )
        for e in graph.edges
    ]
    snapshot = DependencyGraphSnapshotDTO(
        nodes=node_dtos,
        edges=edge_dtos,
        totalNodes=len(node_dtos),
        totalEdges=len(edge_dtos),
        generatedAt=datetime.now(timezone.utc).isoformat(),
    )
    return ApiResponseEnvelope(data=snapshot, meta=generate_meta())
