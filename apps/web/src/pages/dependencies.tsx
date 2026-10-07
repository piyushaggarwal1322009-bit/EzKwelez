import * as React from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Alert } from "@/components/ui/alert";
import { DataProvenanceBadge } from "@/components/ui/data-provenance-badge";
import { graphService } from "@/services/graph-service";
import {
  InteractiveDependencyGraph,
  GraphDirectionFilter,
} from "@/components/graph";
import {
  Criticality,
  DataMode,
  DependencyGraph,
  DependencyNode,
  NodeType,
} from "@ezykwelez/shared";
import {
  AlertOctagon,
  ArrowRight,
  ChevronRight,
  Compass,
  Filter,
  GitFork,
  Layers,
  Network,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";

export default function DependenciesPage() {
  const [graph, setGraph] = React.useState<DependencyGraph | null>(null);
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);
  const [directionFilter, setDirectionFilter] = React.useState<GraphDirectionFilter>("all");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isSimulated, setIsSimulated] = React.useState(false);

  // Filter state for directory
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [criticalityFilter, setCriticalityFilter] = React.useState<string>("all");

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await graphService.getTopology();
      setGraph(res);
      const nodeList = Object.values(res.nodes);
      if (nodeList.length > 0) {
        setSelectedNodeId((prev) => prev || nodeList[0].id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load campus dependency topology.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const nodeList = React.useMemo(() => {
    if (!graph) return [];
    return Object.values(graph.nodes);
  }, [graph]);

  const selectedNode = React.useMemo(() => {
    if (!graph || !selectedNodeId) return null;
    return graph.nodes[selectedNodeId] || null;
  }, [graph, selectedNodeId]);

  const filteredNodes = React.useMemo(() => {
    return nodeList.filter((node) => {
      const matchesSearch =
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === "all" || node.type === typeFilter;
      const matchesCriticality =
        criticalityFilter === "all" || node.criticality === criticalityFilter;

      return matchesSearch && matchesType && matchesCriticality;
    });
  }, [nodeList, searchQuery, typeFilter, criticalityFilter]);

  // Outgoing dependencies (what this node feeds/hosts/serves)
  const outgoingEdges = React.useMemo(() => {
    if (!graph || !selectedNodeId) return [];
    return graph.edges.filter((e) => e.sourceNodeId === selectedNodeId);
  }, [graph, selectedNodeId]);

  // Incoming dependencies (what feeds/supports this node)
  const incomingEdges = React.useMemo(() => {
    if (!graph || !selectedNodeId) return [];
    return graph.edges.filter((e) => e.targetNodeId === selectedNodeId);
  }, [graph, selectedNodeId]);

  return (
    <AppLayout
      title="Campus Dependency Topology"
      description="Interactive multi-layer dependency graph connecting utilities, physical buildings, facilities, and academic operations."
    >
      <PageHeader
        title="Campus Dependency Topology"
        description="Inspect upstream feeders and downstream systems to understand structural coupling, physical hosting, and potential disruption propagation."
        breadcrumbs={[{ label: "Dependencies" }]}
        badge={<DataProvenanceBadge mode={DataMode.SIMULATED} />}
        actions={
          selectedNode && (
            <Link href={`/impact?rootNodeId=${selectedNode.id}`}>
              <Button variant="secondary" size="sm" className="gap-1.5 text-xs text-cyan-300">
                <AlertOctagon className="w-3.5 h-3.5" /> Analyze Downstream Blast Radius
              </Button>
            </Link>
          )
        }
      />

      {error ? (
        <ErrorState title="Topology Graph Unavailable" message={error} onRetry={fetchData} />
      ) : isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-[480px] w-full rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Skeleton className="h-80 lg:col-span-7 w-full" />
            <Skeleton className="h-80 lg:col-span-5 w-full" />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* PRIMARY VISUAL SURFACE: Interactive Dependency Graph */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
                  Interactive Multi-Tier Dependency Canvas
                </span>
                <span className="text-slate-500">•</span>
                <span className="font-mono text-[11px]">
                  {nodeList.length} vertices • {graph?.edges.length || 0} directed relationships
                </span>
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Click nodes to inspect • Drag to pan • Scroll to zoom
              </span>
            </div>

            <InteractiveDependencyGraph
              nodes={nodeList}
              edges={graph?.edges || []}
              selectedNodeId={selectedNodeId}
              onSelectNode={(id) => setSelectedNodeId(id)}
              directionFilter={directionFilter}
              onChangeDirectionFilter={(f) => setDirectionFilter(f)}
              height={480}
            />
          </div>

          {/* LOWER SECTION: Master-Detail Node Inspector & Filterable Directory */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (7 cols): Selected Node Inspector */}
            <div className="lg:col-span-7 space-y-4">
              {selectedNode ? (
                <Card className="border-slate-800 bg-slate-900/90 shadow-xl">
                  <CardHeader className="pb-3 border-b border-slate-800">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                          Selected Topology Vertex
                        </span>
                        <CardTitle className="text-base sm:text-lg text-white mt-0.5">
                          {selectedNode.name}
                        </CardTitle>
                        <CardDescription className="font-mono text-[11px] mt-0.5">
                          ID: {selectedNode.id}
                        </CardDescription>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            selectedNode.criticality === "critical"
                              ? "critical"
                              : selectedNode.criticality === "high"
                              ? "high"
                              : "low"
                          }
                        >
                          {selectedNode.criticality.toUpperCase()} CRITICALITY
                        </Badge>
                        <StatusIndicator status={selectedNode.status} />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-5">
                    {/* Key Attributes */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Type</span>
                        <span className="font-semibold text-slate-200 uppercase">{selectedNode.type}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Status</span>
                        <span className="font-semibold text-slate-200 capitalize">{selectedNode.status}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Upstream Feeders</span>
                        <span className="font-mono font-semibold text-cyan-300">{incomingEdges.length}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Downstream Systems</span>
                        <span className="font-mono font-semibold text-amber-300">{outgoingEdges.length}</span>
                      </div>
                    </div>

                    {/* Upstream Feeders List */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs uppercase font-mono text-slate-400 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-cyan-400" />
                          Upstream Feeder Dependencies ({incomingEdges.length})
                        </span>
                        <span className="text-[11px] text-slate-500">What feeds or supports this node</span>
                      </div>

                      {incomingEdges.length === 0 ? (
                        <div className="text-xs text-slate-500 py-2.5 px-3 rounded bg-slate-950/40 border border-slate-800/50">
                          Root supplier: This node has no upstream dependencies.
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {incomingEdges.map((edge) => {
                            const source = graph?.nodes[edge.sourceNodeId];
                            return (
                              <button
                                key={edge.id}
                                type="button"
                                onClick={() => setSelectedNodeId(edge.sourceNodeId)}
                                className="w-full p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between text-xs transition text-left"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono uppercase text-slate-300">
                                    {edge.relationship}
                                  </span>
                                  <span className="font-medium text-white">{source?.name || edge.sourceNodeId}</span>
                                </div>
                                <span className="text-[10px] font-mono text-cyan-400 uppercase">Focus &rarr;</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Downstream Dependents List */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs uppercase font-mono text-slate-400 flex items-center gap-1.5">
                          <GitFork className="w-3.5 h-3.5 text-amber-400" />
                          Downstream Dependents ({outgoingEdges.length})
                        </span>
                        <span className="text-[11px] text-slate-500">Systems impacted if this node fails</span>
                      </div>

                      {outgoingEdges.length === 0 ? (
                        <div className="text-xs text-slate-500 py-2.5 px-3 rounded bg-slate-950/40 border border-slate-800/50">
                          Leaf consumer: No downstream systems depend on this node.
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {outgoingEdges.map((edge) => {
                            const target = graph?.nodes[edge.targetNodeId];
                            return (
                              <button
                                key={edge.id}
                                type="button"
                                onClick={() => setSelectedNodeId(edge.targetNodeId)}
                                className="w-full p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between text-xs transition text-left"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="px-1.5 py-0.5 rounded bg-amber-950 text-[10px] font-mono uppercase text-amber-300 border border-amber-900/60">
                                    {edge.relationship}
                                  </span>
                                  <span className="font-medium text-white">{target?.name || edge.targetNodeId}</span>
                                </div>
                                <span className="text-[10px] font-mono text-amber-400 uppercase">Focus &rarr;</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Blast Radius CTA */}
                    <div className="pt-2 border-t border-slate-800 flex justify-end">
                      <Link href={`/impact?rootNodeId=${selectedNode.id}`}>
                        <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                          <AlertOctagon className="w-3.5 h-3.5" /> Analyze Blast Radius From Here
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 border border-slate-800 rounded-lg">
                  Select a node on the canvas to inspect its operational attributes.
                </div>
              )}
            </div>

            {/* Right Column (5 cols): Filterable Node Directory */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="h-full flex flex-col border-slate-800 bg-slate-900/60">
                <CardHeader className="pb-3 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Topology Directory</CardTitle>
                    <span className="text-xs font-mono text-slate-400">
                      {filteredNodes.length} of {nodeList.length}
                    </span>
                  </div>

                  {/* Search */}
                  <div className="relative pt-2">
                    <Search className="absolute left-3 top-4.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter nodes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Criticality Filter Chips */}
                  <div className="flex items-center gap-1.5 pt-2 text-[11px] overflow-x-auto pb-1">
                    <span className="text-slate-500">Tier:</span>
                    {["all", "critical", "high", "medium", "low"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCriticalityFilter(c)}
                        className={`px-2 py-0.5 rounded capitalize whitespace-nowrap font-medium transition-colors ${
                          criticalityFilter === c
                            ? "bg-slate-800 text-white border border-slate-700"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </CardHeader>

                <CardContent className="p-2 overflow-y-auto max-h-[460px] divide-y divide-slate-800/60">
                  {filteredNodes.map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start justify-between gap-2 ${
                          isSelected
                            ? "bg-cyan-950/40 border border-cyan-700/80 text-white shadow-sm"
                            : "hover:bg-slate-800/60 text-slate-300"
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="text-xs font-semibold truncate">{node.name}</div>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                            <span className="uppercase">{node.type}</span>
                            <span>•</span>
                            <span className="capitalize">{node.status}</span>
                          </div>
                        </div>

                        <Badge
                          variant={
                            node.criticality === "critical"
                              ? "critical"
                              : node.criticality === "high"
                              ? "high"
                              : "low"
                          }
                          size="sm"
                        >
                          {node.criticality.toUpperCase()}
                        </Badge>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
