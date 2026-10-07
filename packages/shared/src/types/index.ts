/**
 * Core Shared Types for EzyKwelez
 */

import { IncidentSeverity, IncidentStatus, EntityType, RecoveryPlanStatus } from "../enums";

export interface HealthCheckResponse {
  status: string;
  service: string;
  version?: string;
  timestamp?: string;
}

export interface IncidentSummary {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedEntityId: string;
  affectedEntityType: EntityType;
  reportedAt: string;
}

export interface BlastRadiusSummary {
  incidentId: string;
  directImpactCount: number;
  cascadingImpactCount: number;
  totalAffectedPeople: number;
  criticalityScore: number;
}

export interface RecoveryOptionSummary {
  id: string;
  incidentId: string;
  title: string;
  disruptionScore: number;
  status: RecoveryPlanStatus;
}
