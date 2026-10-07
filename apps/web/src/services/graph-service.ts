import { apiClient } from "./api-client";
import { DependencyEdge, DependencyGraph, DependencyNode } from "@ezykwelez/shared";

export const graphService = {
  async getTopology(): Promise<DependencyGraph> {
    return apiClient.get<DependencyGraph>("/graph/topology");
  },

  async listNodes(): Promise<DependencyNode[]> {
    return apiClient.get<DependencyNode[]>("/graph/nodes");
  },

  async getNode(id: string): Promise<DependencyNode> {
    return apiClient.get<DependencyNode>(`/graph/nodes/${id}`);
  },

  async listEdges(nodeId?: string, direction?: "incoming" | "outgoing"): Promise<DependencyEdge[]> {
    const query = new URLSearchParams();
    if (nodeId) query.set("node_id", nodeId);
    if (direction) query.set("direction", direction);

    const qs = query.toString();
    return apiClient.get<DependencyEdge[]>(`/graph/edges${qs ? `?${qs}` : ""}`);
  },
};
