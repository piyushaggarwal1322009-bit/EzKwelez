from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.schemas.incident import IncidentDTO
from app.domain.assessment.models import ImpactCategory


class AffectedEntityDTO(BaseModel):
    entityId: str
    entityType: str
    entityName: str
    entityCode: str
    depth: int
    isDirect: bool
    parentEntityId: Optional[str] = None
    dependencyType: Optional[str] = None
    dependencyStrength: Optional[str] = None
    reason: str
    criticality: str
    locationId: Optional[str] = None
    path: List[str] = Field(default_factory=list)


class BlastRadiusResultDTO(BaseModel):
    directEntities: List[AffectedEntityDTO]
    transitiveEntities: List[AffectedEntityDTO]
    totalAffectedCount: int
    maximumDepth: int
    generatedAt: str


class ImpactAssessmentDTO(BaseModel):
    totalImpactScore: int
    impactCategory: ImpactCategory
    affectedLocations: List[str]
    affectedResourcesCount: int
    affectedServicesCount: int
    criticalDependencyCount: int
    explanationMetadata: Dict[str, Any] = Field(default_factory=dict)
    generatedAt: str


class IncidentAssessmentDTO(BaseModel):
    assessmentId: str
    incident: IncidentDTO
    blastRadius: BlastRadiusResultDTO
    impact: ImpactAssessmentDTO
    dataMode: str
    generatedAt: str
