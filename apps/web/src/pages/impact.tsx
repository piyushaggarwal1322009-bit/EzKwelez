import * as React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Alert } from "@/components/ui/alert";
import { DataProvenanceBadge } from "@/components/ui/data-provenance-badge";
import { impactService } from "@/services/impact-service";
import { graphService } from "@/services/graph-service";
import { incidentService } from "@/services/incident-service";
import {
  Criticality,
  DataMode,
  DependencyNode,
  FailureType,
  ImpactReport,
  ImpactSeverity,
  Incident,
} from "@ezykwelez/shared";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Filter,
  GitFork,
  Layers,
  Play,
  RotateCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

export default function ImpactAnalysisPage() {
  const router = useRouter();
  const { rootNodeId: initialRootId, incidentId } = router.query;

  const [nodes, setNodes] = React.useState<DependencyNode[]>([]);
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [selectedRootId, setSelectedRootId] = React.useState<string>("");
  const [failureType, setFailureType] = React.useState<FailureType>(FailureType.OUTAGE);
  const [severity, setSeverity] = React.useState<Criticality>(Criticality.CRITICAL);
  const [maxDepth, setMaxDepth] = React.useState<number>(5);

  const [report, setReport] = React.useState<ImpactReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Load available nodes and incidents
  React.useEffect(() => {
    Promise.all([graphService.listNodes(), incidentService.listIncidents()]).then(
      ([nodesRes, incidentsRes]) => {
        setNodes(nodesRes);
        setIncidents(incidentsRes);

        const defaultId =
          (initialRootId as string) ||
          (incidentsRes.find((i) => i.rootNodeId)?.rootNodeId) ||
          (nodesRes.length > 0 ? nodesRes[0].id : "");

        setSelectedRootId(defaultId);
      }
    );
  }, [initialRootId]);

  const handleRunAnalysis = React.useCallback(async (rootId: string) => {
    if (!rootId) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await impactService.analyzeImpact({
        rootNodeId: rootId,
        failureType,
        severity,
        options: {
          maxDepth,
          includeDegraded: true,
          stopAtFailed: false,
        },
      });
      setReport(result);
    } catch (err: any) {
      setError(err.message || "Impact calculation failed.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [failureType, severity, maxDepth]);

  React.useEffect(() => {
    if (selectedRootId) {
      handleRunAnalysis(selectedRootId);
    }
  }, [selectedRootId, handleRunAnalysis]);

  return (
    <AppLayout
      title="Downstream Impact Analysis & Blast Radius"
      description="Deterministic multi-hop BFS dependency traversal calculating cascading facility and academic disruption."
      dataMode={report?.dataMode || DataMode.SIMULATED}
    >
      <PageHeader
        title="Downstream Impact & Blast Radius"
        description="Analyzes failure propagation pathways across infrastructure, rooms, and academic sessions starting from a root system fault."
        breadcrumbs={[{ label: "Impact Analysis" }]}
        badge={<DataProvenanceBadge mode={report?.dataMode || DataMode.SIMULATED} />}
        actions={
          <div className="flex items-center gap-2">
            {report && (
              <Link href={`/recovery?impactId=${report.analysisId}${incidentId ? `&incidentId=${incidentId}` : ""}`}>
                <Button variant="primary" size="sm" className="gap-1.5 text-xs shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" /> Generate Recovery Plan
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Honest Demo / Offline Fallback Notice */}
      {report?.dataMode === DataMode.SIMULATED && (
        <Alert variant="info" title="Offline Demo Blast Radius" className="mb-6">
          Live FastAPI backend connection offline — displaying simulated blast radius calculation.
          Propagation paths, disrupted nodes, and affected academic cohorts remain fully interactive.
        </Alert>
      )}

      {/* Control Panel: Select Root Node & Policy Config */}
      <Card className="mb-6 border-slate-800 bg-slate-900/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Failure Simulation Parameters</CardTitle>
          <CardDescription>Configure root failure origin and traversal boundaries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Root Node Selector */}
            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">Root Topology Node</label>
              <select
                value={selectedRootId}
                onChange={(e) => setSelectedRootId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name} ({node.criticality.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Failure Type */}
            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">Disruption Failure Type</label>
              <select
                value={failureType}
                onChange={(e) => setFailureType(e.target.value as FailureType)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 capitalize"
              >
                {Object.values(FailureType).map((t) => (
                  <option key={t} value={t}>
                    {t.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">Initial Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Criticality)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 uppercase"
              >
                {Object.values(Criticality).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Traversal Depth & Trigger */}
            <div className="space-y-1 flex flex-col justify-end">
              <Button
                variant="secondary"
                size="sm"
                isLoading={isAnalyzing}
                onClick={() => handleRunAnalysis(selectedRootId)}
                className="w-full h-9 gap-1.5 font-semibold text-cyan-300 border-cyan-800/80 bg-cyan-950/40 hover:bg-cyan-900/50"
              >
                <Play className="w-3.5 h-3.5" /> Recompute Blast Radius
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <ErrorState
          title="Blast Radius Traversal Error"
          message={error}
          onRetry={() => handleRunAnalysis(selectedRootId)}
        />
      ) : isAnalyzing ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : !report ? (
        <div className="text-center py-12 text-slate-500">Select a root node to compute blast radius.</div>
      ) : (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Overall Disruption Severity"
              value={report.severity.toUpperCase()}
              subvalue={`Propagation depth: ${report.propagationDepth} hops`}
              icon={ShieldAlert}
              variant={
                report.severity === "critical"
                  ? "critical"
                  : report.severity === "high"
                  ? "warning"
                  : "info"
              }
            />
            <MetricCard
              title="Downstream Systems Disrupted"
              value={report.impactedNodes.length}
              subvalue="Vertices in cascading tree"
              icon={GitFork}
              variant="default"
            />
            <MetricCard
              title="Impacted Facilities"
              value={report.impactedLocations.length}
              subvalue="Campus rooms / buildings"
              icon={Building2}
              variant="default"
            />
            <MetricCard
              title="Propagation Algorithm"
              value="BFS Depth-Bounded"
              subvalue="Deterministic Cycle Safe"
              icon={Activity}
              variant="info"
            />
          </div>

          {/* Traversal Warnings if any */}
          {report.warnings && report.warnings.length > 0 && (
            <Alert variant="warning" title="Graph Traversal Notices">
              <ul className="list-disc pl-4 space-y-0.5">
                {report.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Downstream Impact Cascading Pathway Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Downstream Blast Radius Hierarchy</CardTitle>
                <CardDescription>
                  Direct and indirect dependencies ordered by distance from root fault ({report.rootNode.name})
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-[11px]">
                Analysis ID: {report.analysisId}
              </Badge>
            </CardHeader>
            <CardContent>
              {report.impactedNodes.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  No downstream dependencies are disrupted by this node failure.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-medium">
                      <tr>
                        <th className="py-2.5 px-3">Hops</th>
                        <th className="py-2.5 px-3">System / Service</th>
                        <th className="py-2.5 px-3">Impact Type</th>
                        <th className="py-2.5 px-3">Impact Severity</th>
                        <th className="py-2.5 px-3">Criticality</th>
                        <th className="py-2.5 px-3">Causal Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {report.impactedNodes.map((n) => (
                        <tr key={n.nodeId} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-slate-300">
                            <span className="p-1 rounded bg-slate-800 border border-slate-700">
                              +{n.distanceFromRoot}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-white block">{n.nodeName}</span>
                            <span className="text-[10px] font-mono text-slate-500">{n.nodeId}</span>
                          </td>
                          <td className="py-3 px-3">
                            <Badge
                              variant={n.impactType === "direct" ? "destructive" : "warning"}
                              size="sm"
                              className="uppercase"
                            >
                              {n.impactType}
                            </Badge>
                          </td>
                          <td className="py-3 px-3">
                            <Badge
                              variant={
                                n.impactSeverity === "critical"
                                  ? "critical"
                                  : n.impactSeverity === "high"
                                  ? "high"
                                  : "moderate"
                              }
                              size="sm"
                              className="uppercase"
                            >
                              {n.impactSeverity}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-300 uppercase">
                            {n.criticality}
                          </td>
                          <td className="py-3 px-3 text-slate-400">{n.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
