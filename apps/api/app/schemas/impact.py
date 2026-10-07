"""Pydantic DTOs for Failure Events, Traversal Options, and Structured Impact Reports."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.domain.campus.models import DataMode
from app.domain.graph.models import Criticality, RelationshipType
from app.domain.impact.models import FailureType, ImpactSeverity, ImpactType
from app.schemas.graph import DependencyNodeDTO


class TraversalPolicyDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    max_depth: int = Field(default=5, alias="maxDepth")
    allowed_relationships: Optional[List[RelationshipType]] = Field(default=None, alias="allowedRelationships")
    minimum_criticality: Optional[Criticality] = Field(default=None, alias="minimumCriticality")
    include_degraded: bool = Field(default=True, alias="includeDegraded")
    stop_at_failed: bool = Field(default=False, alias="stopAtFailed")


class ImpactAnalysisRequestDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    root_node_id: str = Field(..., alias="rootNodeId")
    failure_type: FailureType = Field(default=FailureType.OUTAGE, alias="failureType")
    severity: Criticality = Field(default=Criticality.HIGH)
    options: Optional[TraversalPolicyDTO] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ImpactedNodeDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    node_id: str = Field(..., alias="nodeId")
    node_name: str = Field(..., alias="nodeName")
    impact_type: ImpactType = Field(..., alias="impactType")
    impact_severity: ImpactSeverity = Field(..., alias="impactSeverity")
    distance_from_root: int = Field(..., alias="distanceFromRoot")
    criticality: Criticality
    reason: str
    location_id: Optional[str] = Field(default=None, alias="locationId")


class AnalysisProvenanceDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    graph_data_mode: DataMode = Field(..., alias="graphDataMode")
    campus_data_mode: DataMode = Field(..., alias="campusDataMode")
    generated_at: str = Field(..., alias="generatedAt")
    source_summary: str = Field(..., alias="sourceSummary")


class ImpactReportDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    analysis_id: str = Field(..., alias="analysisId")
    root_node: DependencyNodeDTO = Field(..., alias="rootNode")
    impacted_nodes: List[ImpactedNodeDTO] = Field(..., alias="impactedNodes")
    impacted_locations: List[str] = Field(..., alias="impactedLocations")
    severity: ImpactSeverity
    propagation_depth: int = Field(..., alias="propagationDepth")
    generated_at: str = Field(..., alias="generatedAt")
    data_mode: DataMode = Field(..., alias="dataMode")
    provenance: AnalysisProvenanceDTO
    warnings: List[str] = Field(default_factory=list)
