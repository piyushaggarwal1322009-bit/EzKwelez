"""Pydantic DTOs for Dependency Graph Nodes, Edges, and Topology Snapshots."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.domain.graph.models import Criticality, NodeStatus, NodeType, RelationshipType


class DependencyNodeDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    type: NodeType
    name: str
    status: NodeStatus = NodeStatus.OPERATIONAL
    criticality: Criticality = Criticality.MEDIUM
    location_id: Optional[str] = Field(default=None, alias="locationId")
    campus_id: Optional[str] = Field(default=None, alias="campusId")
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[str] = Field(default=None, alias="createdAt")


class DependencyEdgeDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    source_node_id: str = Field(..., alias="sourceNodeId")
    target_node_id: str = Field(..., alias="targetNodeId")
    relationship: RelationshipType
    direction: str = "directed"
    criticality: Criticality = Criticality.MEDIUM
    weight: float = 1.0
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[str] = Field(default=None, alias="createdAt")


class DependencyGraphSnapshotDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    nodes: List[DependencyNodeDTO]
    edges: List[DependencyEdgeDTO]
    total_nodes: int = Field(..., alias="totalNodes")
    total_edges: int = Field(..., alias="totalEdges")
    generated_at: str = Field(..., alias="generatedAt")
