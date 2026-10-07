"""Pydantic DTOs for Incident and Disruption Management API."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.domain.campus.models import DataMode
from app.domain.graph.models import Criticality
from app.domain.impact.models import FailureType
from app.domain.incidents.models import (
    IncidentSeverity,
    IncidentSource,
    IncidentStatus,
    IncidentType,
    IncidentUpdateType,
)


class IncidentDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    title: str
    description: str
    type: IncidentType
    severity: IncidentSeverity
    status: IncidentStatus
    source: IncidentSource
    location_id: Optional[str] = Field(default=None, alias="locationId")
    root_node_id: Optional[str] = Field(default=None, alias="rootNodeId")
    started_at: str = Field(..., alias="startedAt")
    detected_at: str = Field(..., alias="detectedAt")
    acknowledged_at: Optional[str] = Field(default=None, alias="acknowledgedAt")
    resolved_at: Optional[str] = Field(default=None, alias="resolvedAt")
    closed_at: Optional[str] = Field(default=None, alias="closedAt")
    created_at: str = Field(..., alias="createdAt")
    updated_at: str = Field(..., alias="updatedAt")
    data_mode: DataMode = Field(..., alias="dataMode")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class CreateIncidentRequestDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=5, max_length=2000)
    type: IncidentType
    severity: IncidentSeverity
    source: IncidentSource = Field(default=IncidentSource.MANUAL)
    status: IncidentStatus = Field(default=IncidentStatus.REPORTED)
    location_id: Optional[str] = Field(default=None, alias="locationId")
    root_node_id: Optional[str] = Field(default=None, alias="rootNodeId")
    started_at: Optional[str] = Field(default=None, alias="startedAt")
    detected_at: Optional[str] = Field(default=None, alias="detectedAt")
    data_mode: DataMode = Field(default=DataMode.SIMULATED, alias="dataMode")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class TransitionIncidentRequestDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    target_status: IncidentStatus = Field(..., alias="targetStatus")
    actor_id: str = Field(default="system", alias="actorId")
    message: Optional[str] = None


class IncidentUpdateDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    incident_id: str = Field(..., alias="incidentId")
    type: IncidentUpdateType
    message: str
    status_before: Optional[IncidentStatus] = Field(default=None, alias="statusBefore")
    status_after: Optional[IncidentStatus] = Field(default=None, alias="statusAfter")
    severity_before: Optional[IncidentSeverity] = Field(default=None, alias="severityBefore")
    severity_after: Optional[IncidentSeverity] = Field(default=None, alias="severityAfter")
    created_by: str = Field(..., alias="createdBy")
    created_at: str = Field(..., alias="createdAt")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class IncidentToImpactHandoffDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    incident_id: str = Field(..., alias="incidentId")
    root_node_id: str = Field(..., alias="rootNodeId")
    failure_type: FailureType = Field(..., alias="failureType")
    severity: Criticality
    occurred_at: str = Field(..., alias="occurredAt")
    data_mode: DataMode = Field(..., alias="dataMode")
