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
import { graphService } from "@/services/graph-service";
import {
  Criticality,
  DependencyEdge,
  DependencyGraph,
  DependencyNode,
  NodeType,
  RelationshipType,
} from "@ezykwelez/shared";
import {
  AlertOctagon,
  ArrowRight,
  ChevronRight,
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
  const [selectedNode, setSelectedNode] = React.useState<DependencyNode | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [criticalityFilter, setCriticalityFilter] = React.useState<string>("all");

  const fetchData = async () => {
    try {
      setError(null);
      const res = await graphService.getTopology();
      setGraph(res);
      const nodeList = Object.values(res.nodes);
      if (nodeList.length > 0) {
        setSelectedNode(nodeList[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load campus dependency topology.");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const nodeList = React.useMemo(() => {
    if (!graph) return [];
    return Object.values(graph.nodes);
  }, [graph]);

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
    if (!graph || !selectedNode) return [];
    return graph.edges.filter((e) => e.sourceNodeId === selectedNode.id);
  }, [graph, selectedNode]);

  // Incoming dependencies (what feeds/supports this node)
  const incomingEdges = React.useMemo(() => {
    if (!graph || !selectedNode) return [];
    return graph.edges.filter((e) => e.targetNodeId === selectedNode.id);
  }, [graph, selectedNode]);

  return (
    <AppLayout
      title="Campus Dependency Topology"
      description="Interactive multi-layer dependency graph connecting utilities, physical buildings, facilities, and academic operations."
    >
      <PageHeader
        title="Campus Dependency Topology"
        description="Inspect upstream feeders and downstream systems to understand structural coupling and potential disruption propagation."
        breadcrumbs={[{ label: "Dependencies" }]}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 lg:col-span-2 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (5 cols): Node Search & Filterable List */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Topology Vertices</CardTitle>
                  <span className="text-xs font-mono text-slate-400">
                    {filteredNodes.length} of {nodeList.length} nodes
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
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Filter chips */}
                <div className="flex items-center gap-2 pt-2 text-[11px] overflow-x-auto pb-1">
                  <span className="text-slate-500">Criticality:</span>
                  {["all", "critical", "high", "medium"].map((c) => (
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

              <CardContent className="p-2 overflow-y-auto max-h-[580px] divide-y divide-slate-800/60">
                {filteredNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => setSelectedNode(node)}
                      className={`w-full text-left p-3 rounded-lg transition-all flex items-start justify-between gap-2 ${
                        isSelected
                          ? "bg-blue-950/40 border border-blue-700/80 text-white"
                          : "hover:bg-slate-800/60 text-slate-300"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">{node.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                          <span className="uppercase">{node.type}</span>
                          <span>•</span>
                          <span className="capitalize">Status: {node.status}</span>
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

          {/* Right Column (7 cols): Selected Node Inspector & Directed Edges */}
          <div className="lg:col-span-7 space-y-6">
            {selectedNode ? (
              <>
                {/* Node Details Header Card */}
                <Card className="border-slate-800 bg-slate-900/90">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">
                          Selected Topology Node
                        </span>
                        <CardTitle className="text-base sm:text-lg text-white mt-0.5">
                          {selectedNode.name}
                        </CardTitle>
                        <CardDescription className="font-mono text-[11px] mt-1">
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

                  <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Type</span>
                      <span className="font-semibold text-slate-200 uppercase">{selectedNode.type}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Incoming Feeders</span>
                      <span className="font-mono font-semibold text-slate-200">{incomingEdges.length}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Outgoing Dependents</span>
                      <span className="font-mono font-semibold text-slate-200">{outgoingEdges.length}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Location ID</span>
                      <span className="font-mono text-[11px] text-slate-400 truncate block">
                        {selectedNode.locationId ? "Linked Facility" : "None"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Downstream Dependents (Outgoing Edges) */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                        <GitFork className="w-3.5 h-3.5 text-blue-400" /> Downstream Dependencies ({outgoingEdges.length})
                      </CardTitle>
                      <span className="text-[11px] text-slate-500">Systems that rely on this node</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {outgoingEdges.length === 0 ? (
                      <div className="text-xs text-slate-500 py-3 text-center">
                        This node is a leaf node; no systems depend downstream on it.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-800/60">
                        {outgoingEdges.map((edge) => {
                          const target = graph?.nodes[edge.targetNodeId];
                          return (
                            <div
                              key={edge.id}
                              className="py-2.5 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="p-1 rounded bg-blue-950 text-blue-400 border border-blue-800 font-mono text-[10px] uppercase">
                                  {edge.relationship}
                                </span>
                                <span className="text-slate-400">&rarr;</span>
                                <span className="font-semibold text-white">
                                  {target ? target.name : edge.targetNodeId}
                                </span>
                              </div>
                              <Badge variant={edge.criticality === "critical" ? "critical" : "outline"} size="sm">
                                Weight: {edge.weight}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Upstream Feeders (Incoming Edges) */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-amber-400" /> Upstream Feeder Systems ({incomingEdges.length})
                      </CardTitle>
                      <span className="text-[11px] text-slate-500">Parent systems that power or host this node</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {incomingEdges.length === 0 ? (
                      <div className="text-xs text-slate-500 py-3 text-center">
                        This node is a primary root feeder (e.g. Substation Grid).
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-800/60">
                        {incomingEdges.map((edge) => {
                          const source = graph?.nodes[edge.sourceNodeId];
                          return (
                            <div
                              key={edge.id}
                              className="py-2.5 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">
                                  {source ? source.name : edge.sourceNodeId}
                                </span>
                                <span className="text-slate-400">&rarr;</span>
                                <span className="p-1 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono text-[10px] uppercase">
                                  {edge.relationship}
                                </span>
                              </div>
                              <Badge variant="outline" size="sm">
                                Criticality: {edge.criticality}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-12 text-slate-500">Select a topology node to inspect dependencies.</div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
