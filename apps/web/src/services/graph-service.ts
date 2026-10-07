import { apiClient } from "./api-client";
import {
  Criticality,
  DependencyEdge,
  DependencyGraph,
  DependencyNode,
  NodeStatus,
  NodeType,
  RelationshipType,
} from "@ezykwelez/shared";

const MOCK_TOPOLOGY_NODES: Record<string, DependencyNode> = {
  "n0000000-0000-0000-0000-000000000001": {
    id: "n0000000-0000-0000-0000-000000000001",
    type: NodeType.UTILITY,
    name: "Main Power Substation Grid B",
    status: NodeStatus.FAILED,
    criticality: Criticality.CRITICAL,
    locationId: "b0000000-0000-0000-0000-000000000002",
    createdAt: "2026-10-07T00:00:00Z",
  },
  "n0000000-0000-0000-0000-000000000002": {
    id: "n0000000-0000-0000-0000-000000000002",
    type: NodeType.BUILDING,
    name: "Ramanujan Block B Physical Structure",
    status: NodeStatus.DEGRADED,
    criticality: Criticality.HIGH,
    locationId: "b0000000-0000-0000-0000-000000000002",
    createdAt: "2026-10-07T00:00:00Z",
  },
  "n0000000-0000-0000-0000-000000000003": {
    id: "n0000000-0000-0000-0000-000000000003",
    type: NodeType.INFRASTRUCTURE,
    name: "Block B HVAC Primary Chiller Unit",
    status: NodeStatus.FAILED,
    criticality: Criticality.HIGH,
    locationId: "b0000000-0000-0000-0000-000000000002",
    createdAt: "2026-10-07T00:00:00Z",
  },
  "n0000000-0000-0000-0000-000000000005": {
    id: "n0000000-0000-0000-0000-000000000005",
    type: NodeType.RESOURCE,
    name: "Optics Laser Spectrometer Rig B201",
    status: NodeStatus.FAILED,
    criticality: Criticality.CRITICAL,
    locationId: "r0000000-0000-0000-0000-000000000003",
    createdAt: "2026-10-07T00:00:00Z",
  },
  "n0000000-0000-0000-0000-000000000006": {
    id: "n0000000-0000-0000-0000-000000000006",
    type: NodeType.OPERATION,
    name: "PHYS-101 Freshman Physics Practicum",
    status: NodeStatus.DEGRADED,
    criticality: Criticality.MEDIUM,
    locationId: "r0000000-0000-0000-0000-000000000003",
    createdAt: "2026-10-07T00:00:00Z",
  },
  "n0000000-0000-0000-0000-000000000004": {
    id: "n0000000-0000-0000-0000-000000000004",
    type: NodeType.NETWORK,
    name: "Core Optical Backbone Switch SW-B1",
    status: NodeStatus.OPERATIONAL,
    criticality: Criticality.CRITICAL,
    locationId: "b0000000-0000-0000-0000-000000000002",
    createdAt: "2026-10-07T00:00:00Z",
  },
  "n0000000-0000-0000-0000-000000000007": {
    id: "n0000000-0000-0000-0000-000000000007",
    type: NodeType.ROOM,
    name: "Multi-Purpose Seminar Hall C204",
    status: NodeStatus.OPERATIONAL,
    criticality: Criticality.LOW,
    locationId: "r0000000-0000-0000-0000-000000000009",
    createdAt: "2026-10-07T00:00:00Z",
  },
  "n0000000-0000-0000-0000-000000000008": {
    id: "n0000000-0000-0000-0000-000000000008",
    type: NodeType.UTILITY,
    name: "Emergency Diesel Backup Generator Gen-2",
    status: NodeStatus.OPERATIONAL,
    criticality: Criticality.HIGH,
    locationId: "b0000000-0000-0000-0000-000000000002",
    createdAt: "2026-10-07T00:00:00Z",
  },
};

const MOCK_TOPOLOGY_EDGES: DependencyEdge[] = [
  {
    id: "e-01",
    sourceNodeId: "n0000000-0000-0000-0000-000000000001",
    targetNodeId: "n0000000-0000-0000-0000-000000000002",
    relationship: RelationshipType.FEEDS,
    criticality: Criticality.CRITICAL,
    weight: 1.0,
  },
  {
    id: "e-02",
    sourceNodeId: "n0000000-0000-0000-0000-000000000002",
    targetNodeId: "n0000000-0000-0000-0000-000000000003",
    relationship: RelationshipType.HOSTS,
    criticality: Criticality.HIGH,
    weight: 1.0,
  },
  {
    id: "e-03",
    sourceNodeId: "n0000000-0000-0000-0000-000000000002",
    targetNodeId: "n0000000-0000-0000-0000-000000000005",
    relationship: RelationshipType.FEEDS,
    criticality: Criticality.CRITICAL,
    weight: 1.0,
  },
  {
    id: "e-04",
    sourceNodeId: "n0000000-0000-0000-0000-000000000005",
    targetNodeId: "n0000000-0000-0000-0000-000000000006",
    relationship: RelationshipType.FEEDS,
    criticality: Criticality.HIGH,
    weight: 1.0,
  },
  {
    id: "e-05",
    sourceNodeId: "n0000000-0000-0000-0000-000000000001",
    targetNodeId: "n0000000-0000-0000-0000-000000000004",
    relationship: RelationshipType.FEEDS,
    criticality: Criticality.HIGH,
    weight: 1.0,
  },
  {
    id: "e-06",
    sourceNodeId: "n0000000-0000-0000-0000-000000000002",
    targetNodeId: "n0000000-0000-0000-0000-000000000007",
    relationship: RelationshipType.HOSTS,
    criticality: Criticality.LOW,
    weight: 1.0,
  },
  {
    id: "e-07",
    sourceNodeId: "n0000000-0000-0000-0000-000000000008",
    targetNodeId: "n0000000-0000-0000-0000-000000000001",
    relationship: RelationshipType.ALTERNATIVE_TO,
    criticality: Criticality.HIGH,
    weight: 1.0,
  },
];

export const graphService = {
  async getTopology(): Promise<DependencyGraph> {
    try {
      const res = await apiClient.get<any>("/dependencies/graph");
      if (res && res.nodes && Array.isArray(res.nodes)) {
        const nodeMap: Record<string, DependencyNode> = {};
        res.nodes.forEach((n: DependencyNode) => {
          nodeMap[n.id] = n;
        });
        return {
          nodes: nodeMap,
          edges: res.edges || [],
        };
      }
      if (res && res.nodes && typeof res.nodes === "object") {
        return res;
      }
      return await apiClient.get<DependencyGraph>("/graph/topology");
    } catch {
      return {
        nodes: MOCK_TOPOLOGY_NODES,
        edges: MOCK_TOPOLOGY_EDGES,
      };
    }
  },

  async listNodes(): Promise<DependencyNode[]> {
    try {
      return await apiClient.get<DependencyNode[]>("/dependencies/nodes");
    } catch {
      try {
        return await apiClient.get<DependencyNode[]>("/graph/nodes");
      } catch {
        return Object.values(MOCK_TOPOLOGY_NODES);
      }
    }
  },

  async getNode(id: string): Promise<DependencyNode> {
    try {
      return await apiClient.get<DependencyNode>(`/dependencies/nodes/${id}`);
    } catch {
      try {
        return await apiClient.get<DependencyNode>(`/graph/nodes/${id}`);
      } catch {
        return MOCK_TOPOLOGY_NODES[id] || Object.values(MOCK_TOPOLOGY_NODES)[0];
      }
    }
  },

  async listEdges(nodeId?: string, direction?: "incoming" | "outgoing"): Promise<DependencyEdge[]> {
    const query = new URLSearchParams();
    if (nodeId) query.set("nodeId", nodeId);
    if (direction) query.set("direction", direction);

    const qs = query.toString();
    try {
      return await apiClient.get<DependencyEdge[]>(`/dependencies/edges${qs ? `?${qs}` : ""}`);
    } catch {
      let filtered = [...MOCK_TOPOLOGY_EDGES];
      if (nodeId) {
        if (direction === "incoming") {
          filtered = filtered.filter((e) => e.targetNodeId === nodeId);
        } else if (direction === "outgoing") {
          filtered = filtered.filter((e) => e.sourceNodeId === nodeId);
        } else {
          filtered = filtered.filter((e) => e.sourceNodeId === nodeId || e.targetNodeId === nodeId);
        }
      }
      return filtered;
    }
  },
};

