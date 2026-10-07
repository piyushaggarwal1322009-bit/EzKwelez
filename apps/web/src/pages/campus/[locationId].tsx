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
import { StaleDataBanner } from "@/components/ui/stale-data-banner";
import { campusService } from "@/services/campus-service";
import { incidentService } from "@/services/incident-service";
import { graphService } from "@/services/graph-service";
import {
  DataMode,
  DependencyNode,
  Incident,
  LocationCondition,
} from "@ezykwelez/shared";
import {
  Activity,
  AlertOctagon,
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  GitFork,
  Radio,
  ShieldAlert,
  Sparkles,
  Users,
  Wifi,
} from "lucide-react";

export default function LocationDetailPage() {
  const router = useRouter();
  const { locationId } = router.query;

  const [condition, setCondition] = React.useState<LocationCondition | null>(null);
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [nodes, setNodes] = React.useState<DependencyNode[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = React.useState<Date>(new Date());

  const fetchData = React.useCallback(async () => {
    if (!locationId || typeof locationId !== "string") return;
    try {
      setError(null);
      const [conditionRes, allIncidents, allNodes] = await Promise.all([
        campusService.getLocationCondition(locationId),
        incidentService.listIncidents(),
        graphService.listNodes(),
      ]);

      setCondition(conditionRes);
      setIncidents(allIncidents.filter((inc) => inc.locationId === locationId));
      setNodes(allNodes.filter((n) => n.locationId === locationId));
      setLastRefreshed(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to load facility condition metrics.");
    } finally {
      setIsLoading(false);
    }
  }, [locationId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <AppLayout title="Loading Facility...">
        <div className="space-y-6">
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (error || !condition) {
    return (
      <AppLayout title="Facility Not Found">
        <PageHeader
          title="Facility Location"
          breadcrumbs={[{ label: "Campus Facilities", href: "/campus" }, { label: "Details" }]}
        />
        <ErrorState
          title="Location Telemetry Offline"
          message={error || "Requested campus location does not exist in topology."}
          onRetry={fetchData}
        />
      </AppLayout>
    );
  }

  const headcount = condition.occupancy.headcount ?? condition.occupancy.currentStudents ?? 0;
  const occupancyRate = condition.occupancy.capacity > 0 ? (headcount / condition.occupancy.capacity) * 100 : 0;

  return (
    <AppLayout
      title={`${condition.location.name} Details`}
      description={`Real-time telemetry and operational metrics for ${condition.location.name}.`}
      dataMode={DataMode.SIMULATED}
      onRefresh={fetchData}
      lastRefreshed={lastRefreshed}
    >
      <PageHeader
        title={condition.location.name}
        description={`Facility Code: ${condition.location.code || "LOC-GEN"} • Type: ${condition.location.type} • Monitored continuously`}
        breadcrumbs={[
          { label: "Campus Facilities", href: "/campus" },
          { label: condition.location.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/campus">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Facilities
              </Button>
            </Link>
            {incidents.length > 0 && (
              <Link href={`/recovery?incidentId=${incidents[0].id}`}>
                <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5" /> View Recovery Options
                </Button>
              </Link>
            )}
          </div>
        }
      />

      <StaleDataBanner lastUpdated={lastRefreshed} thresholdMinutes={15} className="mb-6" />

      {/* Top 3 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Current Headcount"
          value={headcount}
          subvalue={`Max capacity: ${condition.occupancy.capacity}`}
          icon={Users}
          variant={occupancyRate > 90 ? "critical" : occupancyRate > 75 ? "warning" : "default"}
        />
        <MetricCard
          title="Occupancy Load"
          value={`${occupancyRate.toFixed(1)}%`}
          subvalue={`Status: ${condition.occupancy.status}`}
          icon={Activity}
          variant={occupancyRate > 90 ? "critical" : "info"}
        />
        <MetricCard
          title="Wi-Fi Signal Score"
          value={`${condition.connectivity.signalScore}/100`}
          subvalue={`Quality: ${condition.connectivity.quality}`}
          icon={Wifi}
          variant={condition.connectivity.signalScore > 60 ? "success" : "warning"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Occupancy Gauge & Telemetry Feed Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Capacity Utilization</CardTitle>
              <CardDescription>Live space load and threshold boundaries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Current Occupancy</span>
                  <span className="font-mono font-semibold text-white">
                    {headcount} / {condition.occupancy.capacity} students ({occupancyRate.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      occupancyRate > 90
                        ? "bg-red-500"
                        : occupancyRate > 75
                        ? "bg-amber-500"
                        : "bg-blue-500"
                    }`}
                    style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                  />
                </div>
              </div>

              {/* Threshold explanation */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">0-49%</span>
                  <span className="font-semibold text-blue-400">Low</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">50-74%</span>
                  <span className="font-semibold text-amber-400">Moderate</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">75-89%</span>
                  <span className="font-semibold text-orange-400">Busy</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">90-100%+</span>
                  <span className="font-semibold text-red-400">Very Busy</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hosted Dependency Nodes in this location */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Hosted Infrastructure & Academic Services</CardTitle>
                <CardDescription>Topology nodes located inside this facility</CardDescription>
              </div>
              <Link href="/dependencies">
                <Button variant="ghost" size="sm" className="text-xs text-blue-400">
                  Topology Graph
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {nodes.length === 0 ? (
                <div className="text-xs text-slate-500 py-4 text-center">
                  No explicit topology nodes mapped directly to this room.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80">
                  {nodes.map((node) => (
                    <div key={node.id} className="py-3 flex items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-white block">{node.name}</span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {node.type.toUpperCase()} • Status: <strong className="capitalize text-slate-200">{node.status}</strong>
                        </span>
                      </div>
                      <Badge variant={node.criticality === "critical" ? "critical" : node.criticality === "high" ? "high" : "low"}>
                        {node.criticality.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Active Disruptions at this Facility */}
        <div className="space-y-6">
          <Card className={incidents.length > 0 ? "border-red-900/60 bg-red-950/10" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Facility Disruptions</CardTitle>
                <Badge variant={incidents.length > 0 ? "critical" : "success"}>
                  {incidents.length} Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {incidents.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  <span className="text-emerald-400 font-semibold block mb-1">No Active Incidents</span>
                  Facility is operating normally with zero reported outages.
                </div>
              ) : (
                incidents.map((inc) => (
                  <div key={inc.id} className="p-3 rounded-lg bg-slate-900 border border-red-900/50 space-y-2">
                    <span className="text-xs font-semibold text-white block">{inc.title}</span>
                    <p className="text-[11px] text-slate-400">{inc.description}</p>
                    <div className="pt-2 flex items-center gap-2">
                      <Link href={`/incidents/${inc.id}`}>
                        <Button variant="outline" size="sm" className="text-xs w-full">
                          Inspect Incident
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Telemetry Provenance Box */}
          <Card className="border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-slate-400">
                Telemetry Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Data Mode</span>
                <span className="font-mono text-cyan-400">Simulated (Drill)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Sensor Poll Interval</span>
                <span className="font-mono text-slate-300">10 seconds</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Wi-Fi Provider</span>
                <span className="font-mono text-slate-300">Aruba-Mock-Adapter</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
