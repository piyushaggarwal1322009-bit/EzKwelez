import { apiClient } from "./api-client";
import {
  Criticality,
  DataMode,
  FailureType,
  ImpactReport,
  ImpactSeverity,
  ImpactType,
  NodeType,
  NodeStatus,
  RelationshipType,
} from "@ezykwelez/shared";

export interface TraversalPolicyOptions {
  maxDepth?: number;
  allowedRelationships?: RelationshipType[];
  minimumCriticality?: Criticality;
  includeDegraded?: boolean;
  stopAtFailed?: boolean;
}

export interface ImpactAnalysisRequest {
  rootNodeId: string;
  failureType: FailureType;
  severity: Criticality;
  options?: TraversalPolicyOptions;
  metadata?: Record<string, unknown>;
}

function generateMockImpactReport(request: ImpactAnalysisRequest): ImpactReport {
  const rootId = request.rootNodeId || "n0000000-0000-0000-0000-000000000001";
  return {
    analysisId: `ana_demo_${Date.now()}`,
    rootNode: {
      id: rootId,
      name: "Main Power Substation Grid B",
      type: NodeType.UTILITY,
      status: NodeStatus.FAILED,
      criticality: Criticality.CRITICAL,
      locationId: "b0000000-0000-0000-0000-000000000002",
      createdAt: "2026-10-07T00:00:00Z",
    },
    impactedNodes: [
      {
        nodeId: "n0000000-0000-0000-0000-000000000002",
        nodeName: "Ramanujan Block B Physical Structure",
        impactType: ImpactType.INDIRECT,
        impactSeverity: ImpactSeverity.CRITICAL,
        distanceFromRoot: 1,
        criticality: Criticality.HIGH,
        reason: "Primary electrical feeder disconnected; complete building blackout.",
        locationId: "b0000000-0000-0000-0000-000000000002",
      },
      {
        nodeId: "n0000000-0000-0000-0000-000000000005",
        nodeName: "Optics Laser Spectrometer Rig B201",
        impactType: ImpactType.DIRECT,
        impactSeverity: ImpactSeverity.CRITICAL,
        distanceFromRoot: 2,
        criticality: Criticality.CRITICAL,
        reason: "Chiller power lost; laser apparatus entered emergency safety lockdown.",
        locationId: "r0000000-0000-0000-0000-000000000003",
      },
      {
        nodeId: "n0000000-0000-0000-0000-000000000006",
        nodeName: "PHYS-101 Freshman Physics Practicum",
        impactType: ImpactType.DEGRADED,
        impactSeverity: ImpactSeverity.HIGH,
        distanceFromRoot: 3,
        criticality: Criticality.MEDIUM,
        reason: "120 enrolled students unable to access scheduled experiment facility.",
        locationId: "r0000000-0000-0000-0000-000000000003",
      },
    ],
    impactedLocations: [
      "b0000000-0000-0000-0000-000000000002",
      "r0000000-0000-0000-0000-000000000003",
    ],
    severity: ImpactSeverity.CRITICAL,
    propagationDepth: 3,
    generatedAt: new Date().toISOString(),
    dataMode: DataMode.SIMULATED,
    provenance: {
      graphDataMode: DataMode.SIMULATED,
      campusDataMode: DataMode.SIMULATED,
      generatedAt: new Date().toISOString(),
      sourceSummary: "Deterministic In-Memory Fallback Graph Traversal",
    },
    warnings: [
      "Simulated Analysis: Displaying deterministic blast radius calculation for demo resilience.",
    ],
  };
}

export const impactService = {
  async analyzeImpact(request: ImpactAnalysisRequest): Promise<ImpactReport> {
    try {
      return await apiClient.post<ImpactReport>("/impact-analysis", request);
    } catch {
      return generateMockImpactReport(request);
    }
  },
};
