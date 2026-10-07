import * as React from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { StaleDataBanner } from "@/components/ui/stale-data-banner";
import { Alert } from "@/components/ui/alert";
import { campusService, CampusConditionsResponse } from "@/services/campus-service";
import { incidentService } from "@/services/incident-service";
import {
  Incident,
  IncidentSeverity,
  IncidentStatus,
  DataMode,
  LocationCondition,
} from "@ezykwelez/shared";
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  Building2,
  GitFork,
  Radio,
  ShieldAlert,
  Sparkles,
  Users,
  Wifi,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const [conditionsData, setConditionsData] = React.useState<CampusConditionsResponse | null>(null);
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = React.useState<Date>(new Date());

  const fetchData = async () => {
    try {
      setError(null);
      const [conditionsRes, incidentsRes] = await Promise.all([
        campusService.getConditions(),
        incidentService.listIncidents({ limit: 10 }),
      ]);
      setConditionsData(conditionsRes);
      setIncidents(incidentsRes);
      setLastRefreshed(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to communicate with campus backend.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const activeIncidents = incidents.filter(
    (inc) => inc.status === IncidentStatus.ACTIVE || inc.status === IncidentStatus.INVESTIGATING
  );

  const campusStatus = activeIncidents.some((i) => i.severity === IncidentSeverity.CRITICAL)
    ? "disrupted"
    : activeIncidents.length > 0
    ? "attention"
    : "operational";

  const isSimulated =
    Boolean(conditionsData?.isFallback) ||
    conditionsData?.dataMode === DataMode.SIMULATED ||
    conditionsData?.dataMode === "simulated";

  const activeDataMode = isSimulated ? DataMode.SIMULATED : DataMode.LIVE;

  return (
    <AppLayout
      title="Operational Command Center"
      description="Real-time campus occupancy, connectivity health, active incident blast radius, and decision support."
      campusStatus={campusStatus}
      dataMode={activeDataMode}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      lastRefreshed={lastRefreshed}
    >
      <PageHeader
        title="Operational Command Center"
        description="Unified real-time visibility across campus facilities, active disruptions, dependency graphs, and recovery decision support."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/incidents">
              <Button variant="destructive" size="sm" className="gap-1.5 shadow-sm">
                <ShieldAlert className="w-4 h-4" />
                Report Disruption
              </Button>
            </Link>
            <Link href="/recovery">
              <Button variant="secondary" size="sm" className="gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Recovery Options
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stale Telemetry Warning Banner */}
      <StaleDataBanner lastUpdated={lastRefreshed} thresholdMinutes={15} className="mb-6" />

      {/* Honest Demo / Offline Fallback Banner */}
      {conditionsData?.isFallback && (
        <Alert variant="info" title="Offline Demo Mode Active" className="mb-6">
          Live FastAPI backend connection offline — showing simulated campus conditions and active disruption data.
          All decision support workflows and navigation remain fully operational.
        </Alert>
      )}

      {error && !conditionsData ? (
        <ErrorState
          title="Backend Connection Offline"
          message={error}
          onRetry={handleRefresh}
          className="my-8"
        />
      ) : isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 lg:col-span-2 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Operational Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Monitored Facilities"
              value={conditionsData?.summary.totalLocations || 0}
              subvalue="Active telemetry feeds"
              icon={Building2}
              variant="info"
            />
            <MetricCard
              title="Campus Population"
              value={conditionsData?.summary.totalOccupancy || 0}
              subvalue={`Across ${conditionsData?.summary.totalLocations || 0} facilities`}
              icon={Users}
              variant="default"
            />
            <MetricCard
              title="Average Occupancy Rate"
              value={`${(conditionsData?.summary.averageOccupancyRate || 0).toFixed(1)}%`}
              subvalue="Capacity utilization"
              icon={Activity}
              trend={{
                value: (conditionsData?.summary.averageOccupancyRate || 0) > 75 ? "High Load" : "Normal Load",
                isPositive: (conditionsData?.summary.averageOccupancyRate || 0) <= 75,
              }}
              variant={(conditionsData?.summary.averageOccupancyRate || 0) > 85 ? "warning" : "default"}
            />
            <MetricCard
              title="Active Disruptions"
              value={activeIncidents.length}
              subvalue={activeIncidents.length > 0 ? "Requires decision support" : "Normal continuity"}
              icon={ShieldAlert}
              variant={activeIncidents.length > 0 ? "critical" : "success"}
            />
          </div>

          {/* Core Decision Loop: Incidents & Live Facilities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Active Incidents & Downstream Impact Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Incident Alert Card */}
              {activeIncidents.length > 0 && (
                <Card className="border-red-900/60 bg-red-950/20 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded bg-red-950 text-red-400 border border-red-800">
                          <ShieldAlert className="w-4 h-4" />
                        </span>
                        <CardTitle className="text-red-100">Active Campus Disruption</CardTitle>
                      </div>
                      <Badge variant="critical">CRITICAL SEVERITY</Badge>
                    </div>
                    <CardDescription className="text-red-300/80">
                      Disruption detected and impacting downstream academic & facility operations.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {activeIncidents.map((incident) => (
                      <div
                        key={incident.id}
                        className="p-4 rounded-lg bg-slate-900/90 border border-slate-800 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <h4 className="text-sm font-semibold text-white">{incident.title}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">{incident.description}</p>
                          </div>
                          <StatusIndicator status={incident.status} showPulse />
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 border-t border-slate-800/80 flex-wrap">
                          <span>
                            Type: <strong className="text-slate-200 capitalize">{incident.type.replace("_", " ")}</strong>
                          </span>
                          <span>
                            Source: <strong className="text-slate-200 capitalize">{incident.source}</strong>
                          </span>
                          <span>
                            Started:{" "}
                            <strong className="text-slate-200">
                              {new Date(incident.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </strong>
                          </span>
                        </div>

                        {/* Quick Pipeline Actions */}
                        <div className="flex items-center gap-2 pt-2">
                          <Link href={`/incidents/${incident.id}`}>
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                              Incident Details
                            </Button>
                          </Link>
                          <Link href={`/impact?incidentId=${incident.id}&rootNodeId=${incident.rootNodeId || ""}`}>
                            <Button variant="secondary" size="sm" className="gap-1.5 text-xs text-cyan-300">
                              <AlertOctagon className="w-3.5 h-3.5" />
                              Inspect Blast Radius
                            </Button>
                          </Link>
                          <Link href={`/recovery?incidentId=${incident.id}`}>
                            <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                              <Sparkles className="w-3.5 h-3.5" />
                              View Recovery Options
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Campus Facilities Overview Grid with Attention Focus */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle>Campus Intelligence Snapshot</CardTitle>
                    <CardDescription>
                      Facilities needing operational attention, high capacity loads, and network signals
                    </CardDescription>
                  </div>
                  <Link href="/campus">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs text-blue-400 hover:text-blue-300 border-blue-900/60 bg-blue-950/20">
                      View Campus Intelligence <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {conditionsData?.locations.slice(0, 6).map((loc) => {
                      const headcount = loc.occupancy.headcount ?? loc.occupancy.currentStudents ?? 0;
                      const occupancyRate = loc.occupancy.capacity > 0 ? (headcount / loc.occupancy.capacity) * 100 : 0;
                      return (
                        <Link
                          key={loc.location.id}
                          href={`/campus/${loc.location.id}`}
                          className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all hover:bg-slate-900 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
                              {loc.location.name}
                            </span>
                            <Badge
                              variant={
                                loc.occupancy.status === "Low"
                                  ? "low"
                                  : loc.occupancy.status === "Moderate"
                                  ? "moderate"
                                  : loc.occupancy.status === "Busy"
                                  ? "warning"
                                  : "critical"
                              }
                              size="sm"
                            >
                              {loc.occupancy.status}
                            </Badge>
                          </div>

                          {/* Occupancy Progress Bar */}
                          <div className="mt-3 space-y-1">
                            <div className="flex justify-between text-[11px] text-slate-400">
                              <span>Occupancy</span>
                              <span className="font-mono text-slate-300">
                                {headcount} / {loc.occupancy.capacity} ({occupancyRate.toFixed(0)}%)
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
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

                          {/* Connectivity quality */}
                          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                            <span className="flex items-center gap-1.5">
                              <Wifi className="w-3.5 h-3.5 text-slate-400" />
                              Wi-Fi Signal
                            </span>
                            <span className="font-medium text-slate-200">
                              {loc.connectivity.quality} ({loc.connectivity.signalScore}/100)
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Quick Continuity Pipeline & Actions */}
            <div className="space-y-6">
              {/* Decision Loop Fast-Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Continuity Decision Pipeline</CardTitle>
                  <CardDescription>Navigate the 8-stage operational recovery loop</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs">
                  <Link
                    href="/campus"
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-blue-600/60 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-blue-950/60 text-blue-400 border border-blue-800">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          1. Campus State
                        </span>
                        <div className="text-[11px] text-slate-400">Inspect live occupancy & feeds</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                  </Link>

                  <Link
                    href="/dependencies"
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-purple-600/60 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-purple-950/60 text-purple-400 border border-purple-800">
                        <GitFork className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                          2. Dependency Graph
                        </span>
                        <div className="text-[11px] text-slate-400">View topology & parent systems</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
                  </Link>

                  <Link
                    href="/impact"
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-cyan-600/60 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800">
                        <AlertOctagon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                          3. Impact Analysis
                        </span>
                        <div className="text-[11px] text-slate-400">Calculate multi-hop blast radius</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  </Link>

                  <Link
                    href="/recovery"
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-amber-600/60 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-amber-950/60 text-amber-400 border border-amber-800">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                          4. Recovery Planning
                        </span>
                        <div className="text-[11px] text-slate-400">Evaluate feasible options & review</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                  </Link>

                  <Link
                    href="/simulation"
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-emerald-600/60 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                        <Radio className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                          5. Counterfactual Simulation
                        </span>
                        <div className="text-[11px] text-slate-400">Test scenario variable deltas</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                  </Link>
                </CardContent>
              </Card>

              {/* Data Trust & Provenance Card */}
              <Card className="border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase tracking-wider text-slate-400">
                    Data Provenance Mode
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-slate-400">
                  <p>
                    All telemetry, dependency traversals, and recovery options preserve explicit data provenance modes:
                  </p>
                  <div className="space-y-1.5 font-mono text-[11px] pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">●</span> Live Telemetry (Hardware IoT feed)
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-bold">◐</span> Simulated Data (Deterministic drill)
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-bold">≈</span> Estimated Model (Statistical average)
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
