import * as React from "react";
import {
  Criticality,
  DependencyEdge,
  DependencyNode,
  ImpactReport,
  NodeStatus,
  NodeType,
} from "@ezykwelez/shared";
import {
  Activity,
  AlertOctagon,
  Building2,
  Cpu,
  Focus,
  Maximize2,
  Minus,
  Network,
  Plus,
  Radio,
  RotateCcw,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { adaptGraphToVisualLayout } from "./graph-adapter";
import {
  GraphDirectionFilter,
  VisualEdge,
  VisualNode,
} from "./graph-types";

interface InteractiveDependencyGraphProps {
  nodes: DependencyNode[] | Record<string, DependencyNode>;
  edges: DependencyEdge[];
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  impactReport?: ImpactReport | null;
  directionFilter?: GraphDirectionFilter;
  onChangeDirectionFilter?: (filter: GraphDirectionFilter) => void;
  className?: string;
  height?: number;
}

export function InteractiveDependencyGraph({
  nodes,
  edges,
  selectedNodeId = null,
  onSelectNode,
  impactReport = null,
  directionFilter = "all",
  onChangeDirectionFilter,
  className = "",
  height = 540,
}: InteractiveDependencyGraphProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Pan and Zoom Viewport State
  const [pan, setPan] = React.useState({ x: 40, y: 30 });
  const [zoom, setZoom] = React.useState(0.9);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  // Hover state
  const [hoveredNode, setHoveredNode] = React.useState<VisualNode | null>(null);

  // Compute visual graph layout using adapter
  const layout = React.useMemo(() => {
    return adaptGraphToVisualLayout(nodes, edges, {
      selectedNodeId,
      impactReport,
      directionFilter,
    });
  }, [nodes, edges, selectedNodeId, impactReport, directionFilter]);

  // Fit to view calculation
  const handleFitView = React.useCallback(() => {
    if (!containerRef.current || layout.nodes.length === 0) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const { width, height: contentHeight, minX, minY } = layout.bounds;

    const scaleX = (clientWidth - 80) / width;
    const scaleY = (clientHeight - 80) / contentHeight;
    const newZoom = Math.min(1.2, Math.max(0.4, Math.min(scaleX, scaleY)));

    const centerX = (clientWidth - width * newZoom) / 2 - minX * newZoom;
    const centerY = (clientHeight - contentHeight * newZoom) / 2 - minY * newZoom;

    setZoom(newZoom);
    setPan({ x: centerX, y: centerY });
  }, [layout]);

  // Initial fit on load or when layout size changes significantly
  React.useEffect(() => {
    if (layout.nodes.length > 0) {
      handleFitView();
    }
  }, [layout.nodes.length, handleFitView]);

  // Reset view to default
  const handleResetView = () => {
    setZoom(1.0);
    setPan({ x: 40, y: 30 });
  };

  // Zoom helpers
  const handleZoomIn = () => setZoom((prev) => Math.min(2.2, prev + 0.15));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.35, prev - 0.15));

  // Mouse drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.min(2.5, Math.max(0.3, prev * zoomFactor)));
  };

  // Node type icon helper
  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case NodeType.UTILITY:
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case NodeType.BUILDING:
      case NodeType.ROOM:
        return <Building2 className="w-3.5 h-3.5 text-sky-400" />;
      case NodeType.NETWORK:
        return <Network className="w-3.5 h-3.5 text-indigo-400" />;
      case NodeType.INFRASTRUCTURE:
      case NodeType.RESOURCE:
        return <Cpu className="w-3.5 h-3.5 text-emerald-400" />;
      case NodeType.OPERATION:
      case NodeType.SERVICE:
      case NodeType.SYSTEM:
      default:
        return <Activity className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden select-none shadow-2xl ${className}`}
      style={{ height: `${height}px` }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Background blueprint grid */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
            <path
              d="M 32 0 L 0 0 0 32"
              fill="none"
              stroke="#334155"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
            <circle cx="0" cy="0" r="1" fill="#64748b" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>

      {/* Floating Toolbar Controls */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 p-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg shadow-lg">
        {/* Zoom Controls */}
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-slate-800 mx-0.5" />
        <button
          type="button"
          onClick={handleFitView}
          title="Fit to View"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
        >
          <Focus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleResetView}
          title="Reset View"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] font-mono text-slate-400 px-1.5">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Direction Filter Toggle (Part 6) */}
      {onChangeDirectionFilter && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg text-xs shadow-lg">
          <span className="text-[10px] text-slate-500 font-mono px-2 uppercase">Edges:</span>
          {(["all", "incoming", "outgoing"] as GraphDirectionFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onChangeDirectionFilter(f)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                directionFilter === f
                  ? "bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {f === "all" ? "All Links" : f === "incoming" ? "Feeders" : "Dependents"}
            </button>
          ))}
        </div>
      )}

      {/* Legend Footer */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-4 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-lg text-[10px] font-mono text-slate-400 shadow-md flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Healthy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Degraded</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Failed</span>
        </div>
        {impactReport && (
          <>
            <div className="w-px h-3 bg-slate-800" />
            <div className="flex items-center gap-1 text-rose-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
              <span>Root Fault</span>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-sm border border-amber-400" />
              <span>In Blast Radius</span>
            </div>
          </>
        )}
      </div>

      {/* Interactive SVG Canvas */}
      <svg
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
      >
        <defs>
          {/* Arrow markers for directed edges */}
          <marker
            id="arrow-normal"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#64748b" />
          </marker>
          <marker
            id="arrow-selected"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#38bdf8" />
          </marker>
          <marker
            id="arrow-impact"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#f43f5e" />
          </marker>

          {/* Root Beacon Glow Filter */}
          <filter id="beacon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Viewport Transform Group (Pan & Zoom) */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Layer Headers (Columns) */}
          {impactReport && (
            <g className="opacity-40 font-mono text-[11px] uppercase tracking-wider fill-slate-400 select-none">
              {Array.from({ length: layout.totalLayers }).map((_, idx) => (
                <text
                  key={idx}
                  x={60 + idx * 400 + 130}
                  y={30}
                  textAnchor="middle"
                >
                  {idx === 0 ? "★ Root Failure Origin" : `Cascade Level +${idx}`}
                </text>
              ))}
            </g>
          )}

          {/* Render Visual Edges */}
          <g className="edges-layer">
            {layout.edges.map((edge) => {
              const isSelected = edge.highlightLevel === "selected";
              const isImpact = edge.highlightLevel === "impact";
              const isDimmed = edge.highlightLevel === "none";

              const strokeColor = isImpact
                ? "#f43f5e"
                : isSelected
                ? "#38bdf8"
                : "#475569";
              const strokeWidth = isImpact ? 2.5 : isSelected ? 2.5 : 1.5;
              const markerEnd = isImpact
                ? "url(#arrow-impact)"
                : isSelected
                ? "url(#arrow-selected)"
                : "url(#arrow-normal)";

              return (
                <g key={edge.id} className="transition-all duration-300">
                  {/* Outer shadow / glow for impact paths */}
                  {isImpact && (
                    <path
                      d={edge.path}
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth={5}
                      strokeOpacity={0.25}
                    />
                  )}

                  {/* Primary directed edge */}
                  <path
                    d={edge.path}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={isImpact ? "6,3" : undefined}
                    strokeOpacity={isDimmed ? 0.2 : 1.0}
                    markerEnd={markerEnd}
                  />

                  {/* Relationship label badge on edge midpoint */}
                  {(isSelected || isImpact) && (
                    <g transform={`translate(${edge.midX}, ${edge.midY})`}>
                      <rect
                        x="-36"
                        y="-10"
                        width="72"
                        height="20"
                        rx="4"
                        fill="#020617"
                        stroke={strokeColor}
                        strokeWidth="1"
                        strokeOpacity="0.8"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill={isImpact ? "#f43f5e" : "#38bdf8"}
                        className="text-[9px] font-mono uppercase font-bold"
                      >
                        {edge.relationship}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* Render Visual Nodes */}
          <g className="nodes-layer">
            {layout.nodes.map((node) => {
              const isSelected = node.isSelected;
              const isRoot = node.isRoot;
              const isImpacted = node.isImpacted;
              const isConnected = node.isConnected;

              // Border and styling
              let borderColor = "#334155"; // slate-700
              let borderWidth = 1;
              let fillGradient = "#0f172a"; // slate-900

              if (isSelected) {
                borderColor = "#38bdf8"; // sky-400
                borderWidth = 2.5;
              } else if (isRoot) {
                borderColor = "#ef4444"; // red-500
                borderWidth = 2.5;
              } else if (isImpacted) {
                borderColor = "#f59e0b"; // amber-500
                borderWidth = 2;
              } else if (isConnected) {
                borderColor = "#38bdf8";
                borderWidth = 1.5;
              }

              // Status dot color
              const statusDotColor =
                node.status === NodeStatus.FAILED || node.status === NodeStatus.DISRUPTED
                  ? "#ef4444"
                  : node.status === NodeStatus.DEGRADED
                  ? "#f59e0b"
                  : "#10b981";

              // Dim non-connected nodes if a node is selected
              const opacity =
                selectedNodeId && !isSelected && !isConnected && !isImpacted
                  ? 0.4
                  : 1.0;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer transition-opacity duration-200"
                  style={{ opacity }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectNode) onSelectNode(node.id);
                  }}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Root Beacon Pulsing Aura */}
                  {isRoot && (
                    <rect
                      x="-6"
                      y="-6"
                      width={node.width + 12}
                      height={node.height + 12}
                      rx="14"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3"
                      strokeOpacity="0.4"
                      filter="url(#beacon-glow)"
                    />
                  )}

                  {/* Main Node Card Body */}
                  <rect
                    width={node.width}
                    height={node.height}
                    rx="10"
                    fill={fillGradient}
                    stroke={borderColor}
                    strokeWidth={borderWidth}
                    className="shadow-md"
                  />

                  {/* Header Row: Type & Criticality Badge */}
                  <g transform="translate(12, 20)">
                    {/* Status dot */}
                    <circle cx="0" cy="0" r="4" fill={statusDotColor} />

                    {/* Node Type Pill */}
                    <rect
                      x="10"
                      y="-8"
                      width="88"
                      height="16"
                      rx="3"
                      fill="#1e293b"
                      stroke="#334155"
                      strokeWidth="0.5"
                    />
                    <text
                      x="54"
                      y="3.5"
                      textAnchor="middle"
                      fill="#94a3b8"
                      className="text-[9px] font-mono uppercase font-bold"
                    >
                      {node.type}
                    </text>

                    {/* Criticality Badge */}
                    <rect
                      x={node.width - 92}
                      y="-8"
                      width="68"
                      height="16"
                      rx="3"
                      fill={
                        node.criticality === "critical"
                          ? "#450a0a"
                          : node.criticality === "high"
                          ? "#431407"
                          : "#1e293b"
                      }
                      stroke={
                        node.criticality === "critical"
                          ? "#991b1b"
                          : node.criticality === "high"
                          ? "#9a3412"
                          : "#475569"
                      }
                      strokeWidth="0.5"
                    />
                    <text
                      x={node.width - 58}
                      y="3.5"
                      textAnchor="middle"
                      fill={
                        node.criticality === "critical"
                          ? "#fca5a5"
                          : node.criticality === "high"
                          ? "#fdba74"
                          : "#cbd5e1"
                      }
                      className="text-[8.5px] font-mono uppercase font-bold"
                    >
                      {node.criticality}
                    </text>
                  </g>

                  {/* Node Name */}
                  <text
                    x="12"
                    y="46"
                    fill="#f8fafc"
                    className="text-[12px] font-sans font-semibold tracking-tight"
                  >
                    {node.name.length > 28
                      ? `${node.name.substring(0, 26)}…`
                      : node.name}
                  </text>

                  {/* Node Footer: ID and Impact Badge */}
                  <g transform="translate(12, 70)">
                    <text fill="#64748b" className="text-[10px] font-mono">
                      {node.id.substring(0, 16)}…
                    </text>

                    {/* If Root Node */}
                    {isRoot && (
                      <g transform={`translate(${node.width - 100}, -10)`}>
                        <rect
                          width="76"
                          height="16"
                          rx="3"
                          fill="#7f1d1d"
                          stroke="#ef4444"
                          strokeWidth="1"
                        />
                        <text
                          x="38"
                          y="11"
                          textAnchor="middle"
                          fill="#fecaca"
                          className="text-[9px] font-mono font-bold"
                        >
                          ROOT FAULT
                        </text>
                      </g>
                    )}

                    {/* If Cascading Node */}
                    {!isRoot && isImpacted && (
                      <g transform={`translate(${node.width - 86}, -10)`}>
                        <rect
                          width="62"
                          height="16"
                          rx="3"
                          fill="#7c2d12"
                          stroke="#f97316"
                          strokeWidth="1"
                        />
                        <text
                          x="31"
                          y="11"
                          textAnchor="middle"
                          fill="#ffedd5"
                          className="text-[9px] font-mono font-bold"
                        >
                          +{node.impactDepth} HOPS
                        </text>
                      </g>
                    )}
                  </g>
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Contextual Node Tooltip */}
      {hoveredNode && (
        <div
          className="absolute z-30 pointer-events-none p-3 rounded-lg bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl text-xs max-w-xs transition-opacity duration-150"
          style={{
            left: `${Math.min(
              (containerRef.current?.clientWidth || 800) - 260,
              Math.max(12, hoveredNode.x * zoom + pan.x)
            )}px`,
            top: `${Math.max(
              12,
              Math.min(
                (containerRef.current?.clientHeight || 600) - 130,
                hoveredNode.y * zoom + pan.y - 80
              )
            )}px`,
          }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-1.5">
            <span className="font-semibold text-white">{hoveredNode.name}</span>
            <span className="text-[10px] font-mono uppercase px-1 py-0.5 rounded bg-slate-800 text-slate-300">
              {hoveredNode.type}
            </span>
          </div>

          <div className="space-y-1 text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-semibold capitalize text-slate-200">
                {hoveredNode.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Feeders / Dependents:</span>
              <span className="font-mono text-slate-300">
                {hoveredNode.inDegree} in • {hoveredNode.outDegree} out
              </span>
            </div>

            {hoveredNode.isImpacted && (
              <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-amber-300">
                <span className="font-bold">Blast Radius:</span> {hoveredNode.impactReason || `Cascade distance: +${hoveredNode.impactDepth} hops`}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
