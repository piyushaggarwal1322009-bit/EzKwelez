/**
 * Core Shared Types for EzyKwelez
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
  EntityType,
  RecoveryPlanStatus,
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

// -----------------------------------------------------------------------------
// Future Phase Contracts (Incident & Recovery)
// -----------------------------------------------------------------------------

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
