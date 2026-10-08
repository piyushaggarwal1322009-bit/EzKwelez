"""Recovery Plan API DTOs."""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class RecoveryActionDTO(BaseModel):
    actionId: str
    actionType: str
    targetEntity: str
    description: str
    sourceEntity: Optional[str] = None
    estimatedDurationMinutes: Optional[float] = None
    durationStatus: str = "unknown"


class ConstraintViolationDTO(BaseModel):
    type: str
    message: str
    actionId: Optional[str] = None
    constraintId: Optional[str] = None


class RecoveryOptionDTO(BaseModel):
    id: str
    title: str
    description: str
    type: str
    feasibility: str
    actions: List[RecoveryActionDTO] = Field(default_factory=list)
    violations: List[ConstraintViolationDTO] = Field(default_factory=list)
    affectedLocations: List[str] = Field(default_factory=list)
    affectedNodes: List[str] = Field(default_factory=list)
    rationale: str = ""
    actionCount: int = 0
    violationCount: int = 0


class RecoveryPlanDTO(BaseModel):
    id: str
    incidentId: str
    impactAnalysisId: Optional[str] = None
    status: str
    options: List[RecoveryOptionDTO] = Field(default_factory=list)
    dataMode: str
    generatedAt: str
    feasibleCount: int = 0
    infeasibleCount: int = 0
    insufficientDataCount: int = 0
    warnings: List[str] = Field(default_factory=list)
