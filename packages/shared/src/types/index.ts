/**
 * Core Shared Types for EzyKwelez
 * Canonical API and Domain Data Contracts
 */

import {
  IncidentSeverity,
  IncidentStatus,
  EntityType,
  RecoveryPlanStatus,
  DataMode,
  OccupancyStatus,
  ConnectivityQuality,
  DependencyType,
  DependencyCriticality,
} from "../enums";

export interface HealthCheckResponse {
  status: string;
  service: string;
  version?: string;
  timestamp?: string;
}

// ---------------------------------------------------------------------------
// Standard API Envelope & Error Contracts
// ---------------------------------------------------------------------------

export interface ApiErrorDetail {
  code: string;
  message: string;
  requestId: string;
  details?: Record<string, unknown>;
}

export interface ApiErrorEnvelope {
  error: ApiErrorDetail;
}

export interface ApiResponseMeta {
  requestId: string;
  timestamp: string;
  dataMode?: DataMode;
  cached?: boolean;
}

export interface ApiResponseEnvelope<T> {
  data: T;
  meta: ApiResponseMeta;
}

// ---------------------------------------------------------------------------
// Campus & Live Conditions Contracts
// ---------------------------------------------------------------------------

export interface CampusLocation {
  id: string;
  name: string;
  type: EntityType;
  campusId: string;
  buildingId?: string;
  capacity: number;
  metadata?: Record<string, unknown>;
}

export interface OccupancySnapshot {
  locationId: string;
  currentStudents: number;
  capacity: number;
  occupancyPercentage: number;
  status: OccupancyStatus;
  updatedAt: string;
  dataMode: DataMode;
}

export interface ConnectivitySnapshot {
  locationId: string;
  signalScore: number;
  quality: ConnectivityQuality;
  networkName: string;
  dbm: number;
  updatedAt: string;
  dataMode: DataMode;
}

export interface LocationCondition {
  location: CampusLocation;
  occupancy: OccupancySnapshot;
  connectivity: ConnectivitySnapshot;
  overallHealth?: "NORMAL" | "DEGRADED" | "CRITICAL";
}

export interface LiveCampusConditionsResponse {
  locations: LocationCondition[];
  summary: {
    totalLocations: number;
    totalOccupancy: number;
    totalCapacity: number;
    averageOccupancyRate: number;
    overallSignalScore: number;
  };
  dataMode: DataMode;
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Dependency Graph Contracts
// ---------------------------------------------------------------------------

export interface DependencyNode {
  id: string;
  name: string;
  type: EntityType;
  capacity?: number;
  criticality: DependencyCriticality;
  metadata?: Record<string, unknown>;
}

export interface DependencyEdge {
  id: string;
  source: string;
  target: string;
  relationship: DependencyType;
  criticality: DependencyCriticality;
  weight: number;
  metadata?: Record<string, unknown>;
}

export interface DependencyGraphSnapshot {
  campusId: string;
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Incidents & Impact Contracts
// ---------------------------------------------------------------------------

export interface IncidentSummary {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedEntityId: string;
  affectedEntityType: EntityType;
  startedAt: string;
  resolvedAt?: string;
  reportedAt: string;
  dataMode: DataMode;
}

export interface BlastRadiusSummary {
  incidentId: string;
  directImpactCount: number;
  cascadingImpactCount: number;
  totalAffectedPeople: number;
  criticalityScore: number;
  affectedEntityIds: string[];
}

export interface RecommendationReason {
  factor: string;
  observedValue: string | number;
  effectOnResult: "positive" | "negative" | "neutral";
  humanReadableLabel: string;
}

export interface RecoveryOptionSummary {
  id: string;
  incidentId: string;
  title: string;
  disruptionScore: number;
  status: RecoveryPlanStatus;
  reasons?: RecommendationReason[];
}
