/**
 * Core Shared Types for EzyKwelez
 * Canonical API and Domain Data Contracts
 */

import {
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
  IncidentSource,
  IncidentUpdateType,
  EntityType,
  RecoveryPlanStatus,
  DataMode,
  OccupancyStatus,
  ConnectivityQuality,
  DependencyType,
  DependencyCriticality,
  NodeType,
  RelationshipType,
  NodeStatus,
  Criticality,
  FailureType,
  ImpactType,
  ImpactSeverity,
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
// Campus & Live Conditions Contracts (Phase 3)
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
// Dependency Graph Contracts (Phase 4)
// ---------------------------------------------------------------------------

export interface DependencyNode {
  id: string;
  type: NodeType;
  name: string;
  status: NodeStatus;
  criticality: Criticality;
  locationId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export interface DependencyEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationship: RelationshipType;
  direction?: "directed" | "bidirectional";
  criticality: Criticality;
  weight: number;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export interface DependencyGraphSnapshot {
  campusId: string;
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  generatedAt: string;
}

export interface TraversalPolicy {
  maxDepth?: number;
  allowedRelationships?: RelationshipType[];
  minimumCriticality?: Criticality;
  includeDegraded?: boolean;
  stopAtFailed?: boolean;
}

export interface TraversalResult {
  visitedNodes: string[];
  visitedEdges: string[];
  depthByNode: Record<string, number>;
  cyclesDetected: string[][];
  warnings: string[];
}

// ---------------------------------------------------------------------------
// Failure Event & Impact Analysis Contracts (Phase 4)
// ---------------------------------------------------------------------------

export interface FailureEvent {
  id: string;
  nodeId: string;
  type: FailureType;
  severity: Criticality;
  occurredAt: string;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface ImpactedNode {
  nodeId: string;
  nodeName: string;
  impactType: ImpactType;
  impactSeverity: ImpactSeverity;
  distanceFromRoot: number;
  criticality: Criticality;
  reason: string;
  locationId?: string;
}

export interface AnalysisProvenance {
  graphDataMode: DataMode;
  campusDataMode: DataMode;
  generatedAt: string;
  sourceSummary: string;
}

export interface ImpactReport {
  analysisId: string;
  rootNode: DependencyNode;
  impactedNodes: ImpactedNode[];
  impactedLocations: string[];
  severity: ImpactSeverity;
  propagationDepth: number;
  generatedAt: string;
  dataMode: DataMode;
  provenance: AnalysisProvenance;
  warnings: string[];
}

export interface ImpactAnalysisRequest {
  rootNodeId: string;
  failureType: FailureType;
  severity: Criticality;
  options?: TraversalPolicy;
}

// ---------------------------------------------------------------------------
// Incident & Disruption Management Contracts (Phase 5)
// ---------------------------------------------------------------------------

export interface Incident {
  id: string;
  title: string;
  description: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  source: IncidentSource;
  locationId?: string;
  rootNodeId?: string;
  startedAt: string;
  detectedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  dataMode: DataMode;
  metadata?: Record<string, unknown>;
}

export interface IncidentUpdate {
  id: string;
  incidentId: string;
  type: IncidentUpdateType;
  message: string;
  statusBefore?: IncidentStatus;
  statusAfter?: IncidentStatus;
  severityBefore?: IncidentSeverity;
  severityAfter?: IncidentSeverity;
  createdBy: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface CreateIncidentRequest {
  title: string;
  description?: string;
  type: IncidentType;
  severity: IncidentSeverity;
  source?: IncidentSource;
  locationId?: string;
  rootNodeId?: string;
  startedAt?: string;
  detectedAt?: string;
  dataMode?: DataMode;
  metadata?: Record<string, unknown>;
}

export interface TransitionIncidentRequest {
  targetStatus: IncidentStatus;
  reason: string;
  actorId?: string;
  newSeverity?: IncidentSeverity;
  metadata?: Record<string, unknown>;
}

export interface IncidentToImpactHandoff {
  incidentId: string;
  rootNodeId: string;
  failureType: FailureType;
  severity: Criticality;
  occurredAt: string;
  dataMode: DataMode;
}

// ---------------------------------------------------------------------------
// Legacy / Phase 1 Compatibility Summaries
// ---------------------------------------------------------------------------

export interface IncidentSummary {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedEntityId?: string;
  affectedEntityType?: EntityType;
  startedAt: string;
  resolvedAt?: string;
  reportedAt?: string;
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
