/**
 * Core Shared Types for EzyKwelez
 * Canonical API and Domain Data Contracts
 */

import {
  UserRole,
  LocationType,
  ResourceType,
  ServiceType,
  DependencyType,
  DependencyStrength,
  StructuralStatus,
  CampusEntityType,
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
  DependencyCriticality,
  NodeType,
  RelationshipType,
  NodeStatus,
  Criticality,
  FailureType,
  ImpactType,
  ImpactSeverity,
  PlanStatus,
  RecoveryOptionType,
  Feasibility,
  ConfidenceLevel,
  ConstraintType,
  ConstraintSeverity,
  PlanningObjectiveType,
  PlanningObjectivePriority,
  TradeoffDirection,
  AssumptionStatus,
} from "../enums";

export interface HealthCheckResponse {
  status: string;
  service: string;
  version?: string;
  environment?: string;
  timestamp?: string;
}

export interface UserProfile {
  id: string;
  fullName: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDTO {
  fullName?: string;
}

// -----------------------------------------------------------------------------
// Phase 3: Campus Model & Dependency Graph Types
// -----------------------------------------------------------------------------

export interface CampusDTO {
  id: string;
  name: string;
  code: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampusDTO {
  name: string;
  code: string;
  description?: string | null;
}

export interface LocationDTO {
  id: string;
  campusId: string;
  name: string;
  code: string;
  locationType: LocationType;
  description: string | null;
  capacity: number;
  status: StructuralStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationDTO {
  campusId: string;
  name: string;
  code: string;
  locationType: LocationType;
  description?: string | null;
  capacity?: number;
  status?: StructuralStatus;
}

export interface ResourceDTO {
  id: string;
  campusId: string;
  locationId: string | null;
  name: string;
  code: string;
  resourceType: ResourceType;
  description: string | null;
  status: StructuralStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourceDTO {
  campusId: string;
  locationId?: string | null;
  name: string;
  code: string;
  resourceType: ResourceType;
  description?: string | null;
  status?: StructuralStatus;
}

export interface ServiceDTO {
  id: string;
  campusId: string;
  locationId: string | null;
  name: string;
  code: string;
  serviceType: ServiceType;
  description: string | null;
  status: StructuralStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDTO {
  campusId: string;
  locationId?: string | null;
  name: string;
  code: string;
  serviceType: ServiceType;
  description?: string | null;
  status?: StructuralStatus;
}

export interface DependencyDTO {
  id: string;
  campusId: string;
  sourceType: CampusEntityType;
  sourceId: string;
  targetType: CampusEntityType;
  targetId: string;
  dependencyType: DependencyType;
  strength: DependencyStrength;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDependencyDTO {
  campusId: string;
  sourceType: CampusEntityType;
  sourceId: string;
  targetType: CampusEntityType;
  targetId: string;
  dependencyType: DependencyType;
  strength?: DependencyStrength;
  description?: string | null;
}

export interface CampusGraphNode {
  id: string;
  entityType: CampusEntityType;
  name: string;
  code: string;
  typeCategory: string;
  status: StructuralStatus;
  locationId: string | null;
}

export interface CampusGraphEdge {
  id: string;
  sourceType: CampusEntityType;
  sourceId: string;
  targetType: CampusEntityType;
  targetId: string;
  dependencyType: DependencyType;
  strength: DependencyStrength;
  description: string | null;
}

export interface CampusGraphResponse {
  campusId: string;
  nodes: CampusGraphNode[];
  edges: CampusGraphEdge[];
  summary: {
    totalLocations: number;
    totalResources: number;
    totalServices: number;
    totalDependencies: number;
  };
}

export interface DependencyTraversalNode {
  id: string;
  entityType: CampusEntityType;
  name: string;
  code: string;
  depth: number;
  edgeType?: DependencyType;
  edgeStrength?: DependencyStrength;
}

export interface DependencyTraversalResult {
  rootEntity: {
    id: string;
    entityType: CampusEntityType;
    name: string;
  };
  direction: "dependencies" | "dependents";
  maxDepth: number | null;
  totalFound: number;
  nodes: DependencyTraversalNode[];
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
  code?: string;
  capacity: number;
  metadata?: Record<string, unknown>;
}

export interface OccupancySnapshot {
  locationId: string;
  currentStudents: number;
  headcount?: number;
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

export interface LiveCampusConditionsSummary {
  totalLocations: number;
  totalOccupancy: number;
  totalCapacity: number;
  averageOccupancyRate: number;
  overallSignalScore: number;
}

export interface LiveCampusConditionsResponse {
  locations: LocationCondition[];
  summary: LiveCampusConditionsSummary;
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

export interface DependencyGraph {
  nodes: Record<string, DependencyNode>;
  edges: DependencyEdge[];
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
  status?: IncidentStatus;
  locationId?: string;
  rootNodeId?: string;
  startedAt?: string;
  detectedAt?: string;
  dataMode?: DataMode;
  metadata?: Record<string, unknown>;
}

export interface TransitionIncidentRequest {
  targetStatus: IncidentStatus;
  reason?: string;
  message?: string;
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

// ---------------------------------------------------------------------------
// Phase 6: Recovery Planning & Decision Support Contracts
// ---------------------------------------------------------------------------

export interface EstimatedRecoveryTime {
  value: number;
  unit: string;
  confidence: ConfidenceLevel;
  assumptions?: string[];
}

export interface ImpactReduction {
  affectedNodeReduction: number;
  affectedLocationReduction: number;
  severityReduction: string;
  estimatedPercent: number;
}

export interface ResourceRequirement {
  resourceType: ResourceType;
  quantity: number;
  availability: string;
  location?: string;
  source: string;
}

export interface RecoveryPrerequisite {
  type: string;
  description: string;
  satisfied: boolean;
  source: string;
}

export interface RecoveryRisk {
  description: string;
  severity: Criticality;
  likelihood?: string;
  affectedSystems: string[];
  mitigation?: string;
}

export interface RecoveryTradeoff {
  dimension: string;
  value: string | number;
  direction: TradeoffDirection;
  explanation: string;
}

export interface RecoveryConstraint {
  id: string;
  type: ConstraintType;
  description: string;
  severity: ConstraintSeverity;
  value?: string | number | boolean;
  source: string;
}

export interface PlanningAssumption {
  description: string;
  source: string;
  confidence: ConfidenceLevel;
  status: AssumptionStatus;
}

export interface PlanningObjective {
  type: PlanningObjectiveType;
  weight?: number;
  priority: PlanningObjectivePriority;
}

export interface RecoveryOption {
  id: string;
  title: string;
  description: string;
  type: RecoveryOptionType;
  feasibility: Feasibility;
  estimatedRecoveryTime: EstimatedRecoveryTime;
  estimatedImpactReduction: ImpactReduction;
  resourceRequirements: ResourceRequirement[];
  prerequisites: RecoveryPrerequisite[];
  affectedLocations: string[];
  affectedNodes: string[];
  risks: RecoveryRisk[];
  tradeoffs: RecoveryTradeoff[];
  confidence: ConfidenceLevel;
  rank?: number;
  rationale: string;
  metadata?: Record<string, unknown>;
}

export interface RecoveryPlan {
  id: string;
  incidentId: string;
  impactAnalysisId?: string;
  version: number;
  supersedesPlanId?: string;
  status: PlanStatus;
  options: RecoveryOption[];
  constraints: RecoveryConstraint[];
  assumptions: PlanningAssumption[];
  objectives: PlanningObjective[];
  dataMode: DataMode;
  warnings: string[];
  generatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  metadata?: Record<string, unknown>;
}

export interface RecoveryPlanningRequest {
  incidentId: string;
  impactAnalysisId?: string;
  planningObjectives?: PlanningObjective[];
  constraints?: RecoveryConstraint[];
  availableResources?: ResourceRequirement[];
  dataMode?: DataMode;
  metadata?: Record<string, unknown>;
}

export interface RecoveryPlanReviewRequest {
  status: PlanStatus.APPROVED | PlanStatus.REJECTED | PlanStatus.UNDER_REVIEW;
  reviewedBy: string;
  reviewNotes?: string;
}
