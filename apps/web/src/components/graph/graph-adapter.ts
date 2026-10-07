import {
  DependencyEdge,
  DependencyNode,
  ImpactReport,
  RelationshipType,
} from "@ezykwelez/shared";
import {
  GraphDirectionFilter,
  GraphLayout,
  VisualEdge,
  VisualNode,
} from "./graph-types";

const NODE_WIDTH = 260;
const NODE_HEIGHT = 88;
const LAYER_GAP_X = 140;
const NODE_GAP_Y = 36;
const PADDING = 60;

export function adaptGraphToVisualLayout(
  rawNodes: DependencyNode[] | Record<string, DependencyNode>,
  rawEdges: DependencyEdge[],
  options: {
    selectedNodeId?: string | null;
    impactReport?: ImpactReport | null;
    directionFilter?: GraphDirectionFilter;
  } = {}
): GraphLayout {
  const {
    selectedNodeId = null,
    impactReport = null,
    directionFilter = "all",
  } = options;

  // 1. Normalize nodes array
  const nodeList: DependencyNode[] = Array.isArray(rawNodes)
    ? rawNodes
    : Object.values(rawNodes || {});

  if (nodeList.length === 0) {
    return {
      nodes: [],
      edges: [],
      bounds: { minX: 0, minY: 0, maxX: 800, maxY: 600, width: 800, height: 600 },
      totalLayers: 0,
    };
  }

  // Node Map
  const nodeMap = new Map<string, DependencyNode>();
  nodeList.forEach((n) => nodeMap.set(n.id, n));

  // Filter edges to only include those whose source & target exist in nodeMap
  const validEdges = rawEdges.filter(
    (e) => nodeMap.has(e.sourceNodeId) && nodeMap.has(e.targetNodeId)
  );

  // In-degree & Out-degree maps
  const inEdgesMap = new Map<string, DependencyEdge[]>();
  const outEdgesMap = new Map<string, DependencyEdge[]>();

  nodeList.forEach((n) => {
    inEdgesMap.set(n.id, []);
    outEdgesMap.set(n.id, []);
  });

  validEdges.forEach((e) => {
    outEdgesMap.get(e.sourceNodeId)?.push(e);
    inEdgesMap.get(e.targetNodeId)?.push(e);
  });

  // Impact mapping
  const impactMap = new Map<string, {
    distance: number;
    severity?: any;
    impactType?: any;
    reason?: string;
  }>();

  let rootNodeId: string | null = null;
  if (impactReport) {
    rootNodeId = impactReport.rootNode.id;
    impactMap.set(rootNodeId, {
      distance: 0,
      severity: impactReport.severity,
      reason: "Root Failure Origin",
    });

    impactReport.impactedNodes.forEach((item) => {
      impactMap.set(item.nodeId, {
        distance: item.distanceFromRoot,
        severity: item.impactSeverity,
        impactType: item.impactType,
        reason: item.reason,
      });
    });
  }

  // 2. Layer Assignment
  const layerMap = new Map<string, number>();

  if (impactReport && rootNodeId) {
    // Blast radius hierarchy ordering:
    // Root = 0, +1 Hop = 1, +2 Hops = 2, +3 Hops = 3, etc.
    // Nodes outside blast radius are placed in maxLayer + 1 or adjacent
    let maxImpactDistance = 0;
    impactMap.forEach((info) => {
      if (info.distance > maxImpactDistance) maxImpactDistance = info.distance;
    });

    nodeList.forEach((n) => {
      const imp = impactMap.get(n.id);
      if (imp !== undefined) {
        layerMap.set(n.id, imp.distance);
      } else {
        // Find if this node is an upstream feeder to root
        const feedsRoot = validEdges.some(
          (e) => e.sourceNodeId === n.id && e.targetNodeId === rootNodeId
        );
        if (feedsRoot) {
          layerMap.set(n.id, 0); // Put side-by-side or layer 0
        } else {
          layerMap.set(n.id, maxImpactDistance + 1);
        }
      }
    });
  } else {
    // Topological / BFS Layer assignment
    // Start with nodes that have in-degree = 0 as Layer 0
    const queue: { id: string; layer: number }[] = [];
    const visited = new Set<string>();

    nodeList.forEach((n) => {
      const inCount = inEdgesMap.get(n.id)?.length || 0;
      if (inCount === 0) {
        queue.push({ id: n.id, layer: 0 });
        layerMap.set(n.id, 0);
        visited.add(n.id);
      }
    });

    // If all nodes have incoming edges (cycle), pick the first node
    if (queue.length === 0 && nodeList.length > 0) {
      queue.push({ id: nodeList[0].id, layer: 0 });
      layerMap.set(nodeList[0].id, 0);
      visited.add(nodeList[0].id);
    }

    // Traverse downstream
    while (queue.length > 0) {
      const current = queue.shift()!;
      const outgoing = outEdgesMap.get(current.id) || [];

      for (const edge of outgoing) {
        const nextId = edge.targetNodeId;
        const currentNextLayer = layerMap.get(nextId) || 0;
        const proposedLayer = current.layer + 1;

        if (proposedLayer > currentNextLayer) {
          layerMap.set(nextId, proposedLayer);
        }

        if (!visited.has(nextId)) {
          visited.add(nextId);
          queue.push({ id: nextId, layer: proposedLayer });
        }
      }
    }

    // Assign any unvisited disconnected components
    nodeList.forEach((n) => {
      if (!layerMap.has(n.id)) {
        layerMap.set(n.id, 0);
      }
    });
  }

  // Group nodes by assigned layer
  const layers: Map<number, string[]> = new Map();
  let maxLayer = 0;

  nodeList.forEach((n) => {
    const l = layerMap.get(n.id) || 0;
    if (l > maxLayer) maxLayer = l;
    if (!layers.has(l)) layers.set(l, []);
    layers.get(l)!.push(n.id);
  });

  // Calculate height required for each layer to vertically center them
  let maxLayerNodeCount = 0;
  layers.forEach((ids) => {
    if (ids.length > maxLayerNodeCount) maxLayerNodeCount = ids.length;
  });

  const totalContentHeight = Math.max(
    520,
    maxLayerNodeCount * NODE_HEIGHT + (maxLayerNodeCount - 1) * NODE_GAP_Y + PADDING * 2
  );

  // 3. Compute Coordinates
  const visualNodes: VisualNode[] = [];
  const coordsMap = new Map<string, { x: number; y: number }>();

  // Determine connected nodes if a node is selected
  const connectedNodeIds = new Set<string>();
  if (selectedNodeId) {
    connectedNodeIds.add(selectedNodeId);
    validEdges.forEach((e) => {
      if (e.sourceNodeId === selectedNodeId) connectedNodeIds.add(e.targetNodeId);
      if (e.targetNodeId === selectedNodeId) connectedNodeIds.add(e.sourceNodeId);
    });
  }

  layers.forEach((ids, layerIdx) => {
    const layerHeight =
      ids.length * NODE_HEIGHT + (ids.length - 1) * NODE_GAP_Y;
    const startY = Math.max(PADDING, (totalContentHeight - layerHeight) / 2);

    ids.forEach((id, rowIdx) => {
      const node = nodeMap.get(id)!;
      const x = PADDING + layerIdx * (NODE_WIDTH + LAYER_GAP_X);
      const y = startY + rowIdx * (NODE_HEIGHT + NODE_GAP_Y);

      coordsMap.set(id, { x, y });

      const impactInfo = impactMap.get(id);
      const isRoot = rootNodeId === id;
      const isImpacted = impactInfo !== undefined;
      const isSelected = selectedNodeId === id;
      const isConnected = connectedNodeIds.has(id);

      visualNodes.push({
        id: node.id,
        name: node.name,
        type: node.type,
        status: node.status,
        criticality: node.criticality,
        locationId: node.locationId,
        x,
        y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        layer: layerIdx,
        isRoot,
        isImpacted,
        impactDepth: impactInfo?.distance,
        impactSeverity: impactInfo?.severity,
        impactType: impactInfo?.impactType,
        impactReason: impactInfo?.reason,
        isSelected,
        isConnected,
        inDegree: inEdgesMap.get(id)?.length || 0,
        outDegree: outEdgesMap.get(id)?.length || 0,
      });
    });
  });

  // 4. Compute Visual Edges with Beziers
  const visualEdges: VisualEdge[] = [];

  validEdges.forEach((edge) => {
    const sourceCoords = coordsMap.get(edge.sourceNodeId);
    const targetCoords = coordsMap.get(edge.targetNodeId);

    if (!sourceCoords || !targetCoords) return;

    // Filter by direction if selected
    if (selectedNodeId && directionFilter !== "all") {
      if (directionFilter === "incoming" && edge.targetNodeId !== selectedNodeId) {
        return;
      }
      if (directionFilter === "outgoing" && edge.sourceNodeId !== selectedNodeId) {
        return;
      }
    }

    const isConnectedToSelected =
      selectedNodeId !== null &&
      (edge.sourceNodeId === selectedNodeId || edge.targetNodeId === selectedNodeId);

    const isImpactPath =
      impactMap.has(edge.sourceNodeId) && impactMap.has(edge.targetNodeId);

    let highlightLevel: "none" | "normal" | "impact" | "selected" = "normal";
    if (isImpactPath) {
      highlightLevel = "impact";
    } else if (isConnectedToSelected) {
      highlightLevel = "selected";
    } else if (selectedNodeId && !isConnectedToSelected) {
      highlightLevel = "none";
    }

    // Anchor points: Source right edge -> Target left edge
    const sourceX = sourceCoords.x + NODE_WIDTH;
    const sourceY = sourceCoords.y + NODE_HEIGHT / 2;
    const targetX = targetCoords.x;
    const targetY = targetCoords.y + NODE_HEIGHT / 2;

    // Smooth horizontal cubic bezier
    const deltaX = Math.max(30, Math.abs(targetX - sourceX) * 0.5);
    const path = `M ${sourceX} ${sourceY} C ${sourceX + deltaX} ${sourceY}, ${
      targetX - deltaX
    } ${targetY}, ${targetX} ${targetY}`;

    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;

    visualEdges.push({
      id: edge.id,
      sourceId: edge.sourceNodeId,
      targetId: edge.targetNodeId,
      relationship: edge.relationship || RelationshipType.DEPENDS_ON,
      criticality: edge.criticality,
      sourceX,
      sourceY,
      targetX,
      targetY,
      path,
      midX,
      midY,
      isImpactPath,
      isConnectedToSelected,
      highlightLevel,
    });
  });

  // 5. Compute Bounding Box
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  visualNodes.forEach((n) => {
    if (n.x < minX) minX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.x + n.width > maxX) maxX = n.x + n.width;
    if (n.y + n.height > maxY) maxY = n.y + n.height;
  });

  if (minX === Infinity) {
    minX = 0;
    minY = 0;
    maxX = 800;
    maxY = 600;
  }

  const paddedMinX = Math.max(0, minX - PADDING);
  const paddedMinY = Math.max(0, minY - PADDING);
  const paddedMaxX = maxX + PADDING;
  const paddedMaxY = maxY + PADDING;

  return {
    nodes: visualNodes,
    edges: visualEdges,
    bounds: {
      minX: paddedMinX,
      minY: paddedMinY,
      maxX: paddedMaxX,
      maxY: paddedMaxY,
      width: Math.max(800, paddedMaxX - paddedMinX),
      height: Math.max(500, paddedMaxY - paddedMinY),
    },
    totalLayers: maxLayer + 1,
  };
}
