import { apiClient } from "./api-client";
import {
  Criticality,
  FailureType,
  ImpactReport,
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

export const impactService = {
  async analyzeImpact(request: ImpactAnalysisRequest): Promise<ImpactReport> {
    return apiClient.post<ImpactReport>("/impact-analysis", request);
  },
};
