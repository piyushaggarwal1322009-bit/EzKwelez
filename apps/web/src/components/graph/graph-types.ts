import {
  Criticality,
  ImpactSeverity,
  ImpactType,
  NodeStatus,
  NodeType,
  RelationshipType,
} from "@ezykwelez/shared";

export type GraphDirectionFilter = "all" | "incoming" | "outgoing";

export interface VisualNode {
  id: string;
  name: string;
  type: NodeType;
  status: NodeStatus;
  criticality: Criticality;
  locationId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  layer: number;
  isRoot: boolean;
  isImpacted: boolean;
  impactDepth?: number;
  impactSeverity?: ImpactSeverity;
  impactType?: ImpactType;
  impactReason?: string;
  isSelected: boolean;
  isConnected: boolean;
  inDegree: number;
  outDegree: number;
}

export interface VisualEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: RelationshipType;
  criticality: Criticality;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  path: string;
  midX: number;
  midY: number;
  isImpactPath: boolean;
  isConnectedToSelected: boolean;
  highlightLevel: "none" | "normal" | "impact" | "selected";
}

export interface GraphLayout {
  nodes: VisualNode[];
  edges: VisualEdge[];
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
  totalLayers: number;
}
