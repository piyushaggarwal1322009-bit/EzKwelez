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
import { DataProvenanceBadge } from "@/components/ui/data-provenance-badge";
import { campusService, CampusConditionsResponse } from "@/services/campus-service";
import { incidentService } from "@/services/incident-service";
import { recoveryService } from "@/services/recovery-service";
import { DecisionLoopBanner, IncidentLifecycleStepper } from "@/components/decision";
import {
  Incident,
  IncidentSeverity,
  IncidentStatus,
  DataMode,
  RecoveryPlan,
} from "@ezykwelez/shared";
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  GitFork,
  Layers,
  Radio,
  RotateCw,
  Scale,
  ShieldAlert,
  Sparkles,
  Users,
  Wifi,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const [conditionsData, setConditionsData] = React.useState<CampusConditionsResponse | null>(null);
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [recoveryPlan, setRecoveryPlan] = React.useState<RecoveryPlan | null>(null);
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

      const activeInc = incidentsRes.find(
        (i) => i.status === IncidentStatus.ACTIVE || i.status === IncidentStatus.INVESTIGATING
      );
      if (activeInc) {
        const plans = await recoveryService.getPlansForIncident(activeInc.id);
        if (plans && plans.length > 0) {
          setRecoveryPlan(plans[0]);
        }
      }

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

  const primaryIncident = activeIncidents.length > 0 ? activeIncidents[0] : incidents[0] || null;
  const primaryIncidentIsActive = activeIncidents.some((incident) => incident.id === primaryIncident?.id);

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

  const topRecoveryOption = recoveryPlan?.options && recoveryPlan.options.length > 0
    ? recoveryPlan.options[0]
    : null;

  return (
    <AppLayout
      title="Command Center"
      description="Campus status, active disruptions, and recovery priorities."
      campusStatus={isLoading || error ? undefined : campusStatus}
      dataMode={activeDataMode}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      lastRefreshed={lastRefreshed}
    >
      <PageHeader
        title="Command Center"
        description="Campus status, active disruptions, and recovery priorities."
        badge={<DataProvenanceBadge mode={activeDataMode} />}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/incidents">
              <Button variant="primary" size="sm" className="gap-1.5 shadow-sm text-xs">
                <ShieldAlert className="w-3.5 h-3.5" />
                Report Disruption
              </Button>
            </Link>
          </div>
        }
      />

      {/* Decision Workflow Banner (Golden Path Progress Indicator) */}
      <DecisionLoopBanner
        currentStep="incident"
        incidentId={primaryIncident?.id}
        rootNodeId={primaryIncident?.rootNodeId}
        planId={recoveryPlan?.id}
        className="mb-6"
      />

      {/* Stale Telemetry Warning Banner */}
      <StaleDataBanner lastUpdated={lastRefreshed} thresholdMinutes={15} className="mb-6" />

      {/* Honest Demo / Offline Fallback Banner */}
      {conditionsData?.isFallback && (
        <Alert variant="info" title="Offline Demo Mode Active" className="mb-6">
          Live FastAPI backend connection offline — showing deterministic simulated campus telemetry and disruption decision context.
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
          <div data-scroll-reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="space-y-6">
          {/* 1. SYSTEM STATE METRICS */}
          <div data-scroll-reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="System Operating State"
              value={campusStatus.toUpperCase()}
              subvalue={
                campusStatus === "disrupted"
                  ? "Critical outage affecting campus operations"
                  : campusStatus === "attention"
                  ? "Degraded subsystems under investigation"
                  : "All monitored campus services normal"
              }
              icon={ShieldAlert}
              variant={
                campusStatus === "disrupted"
                  ? "critical"
                  : campusStatus === "attention"
                  ? "warning"
                  : "success"
              }
            />
            <MetricCard
              title="Active Disruptions"
              value={activeIncidents.length}
              subvalue={
                activeIncidents.length > 0
                  ? "Active incident decision workflows"
                  : "Zero unmitigated incidents"
              }
              icon={AlertOctagon}
              variant={activeIncidents.length > 0 ? "critical" : "default"}
            />
            <MetricCard
              title="Campus Population Load"
              value={conditionsData?.summary.totalOccupancy || 0}
              subvalue={`${conditionsData?.summary.averageOccupancyRate.toFixed(1)}% average capacity utilization`}
              icon={Users}
              variant="default"
            />
            <MetricCard
              title="Infrastructure Connectivity"
              value={`${conditionsData?.summary.overallSignalScore || 0}/100`}
              subvalue="Network telemetry health score"
              icon={Radio}
              variant="info"
            />
          </div>

          {/* 2. WHAT IS HAPPENING? — ACTIVE INCIDENT COMMAND HERO */}
          {primaryIncident && (
            <Card data-scroll-reveal className={primaryIncidentIsActive ? "border-red-900/60 bg-red-950/20" : "border-slate-800 bg-slate-900/70"}>
              <CardHeader className={`pb-3 border-b ${primaryIncidentIsActive ? "border-red-900/40" : "border-slate-800"}`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                      <span className={`p-2 rounded-md border ${primaryIncidentIsActive ? "bg-red-950 text-red-300 border-red-800" : "bg-slate-800 text-slate-300 border-slate-700"}`}>
                      <ShieldAlert className="w-5 h-5" />
                    </span>
                    <div>
                      <CardTitle className={`text-base flex items-center gap-2 ${primaryIncidentIsActive ? "text-red-100" : "text-slate-100"}`}>
                        <span>{primaryIncidentIsActive ? "Active disruption" : "Latest incident"}: {primaryIncident.title}</span>
                      </CardTitle>
                      <CardDescription className={`font-mono text-xs ${primaryIncidentIsActive ? "text-red-300/80" : "text-slate-400"}`}>
                        ID: {primaryIncident.id} • Detected:{" "}
                        {new Date(primaryIncident.detectedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        primaryIncident.severity === IncidentSeverity.CRITICAL
                          ? "critical"
                          : primaryIncident.severity === IncidentSeverity.HIGH
                          ? "high"
                          : primaryIncident.severity === IncidentSeverity.MODERATE
                          ? "moderate"
                          : "low"
                      }
                    >
                      {primaryIncident.severity.toUpperCase()} PRIORITY
                    </Badge>
                    <StatusIndicator status={primaryIncident.status} showPulse={primaryIncidentIsActive} />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                {/* Description & Impact Summary */}
                <p className="text-xs text-slate-200 leading-relaxed">
                  {primaryIncident.description}
                </p>

                {/* Lifecycle Progress Stepper */}
                <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-medium text-slate-400 block">
                    Incident lifecycle
                  </span>
                  <IncidentLifecycleStepper currentStatus={primaryIncident.status} />
                </div>

                {/* Primary Decision Attributes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400 block">Root system</span>
                    <span className="font-semibold text-slate-100 font-mono truncate block">
                      {primaryIncident.rootNodeId || "Not provided"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Location</span>
                    <span className="font-semibold text-slate-100">
                      {conditionsData?.locations.find((item) => item.location.id === primaryIncident.locationId)?.location.name || "Not specified"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Reported by</span>
                    <span className="font-semibold text-slate-100 uppercase">
                      {primaryIncident.source.replaceAll("_", " ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Current status</span>
                    <span className="font-semibold text-slate-100 capitalize">
                      {primaryIncident.status.replaceAll("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Primary Decision Action Buttons */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-red-950 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Link href={`/incidents/${primaryIncident.id}`}>
                      <Button variant="destructive" size="sm" className="gap-1.5 text-xs shadow-sm">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        {primaryIncidentIsActive ? "Investigate incident" : "Review incident"} <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link
                      href={`/impact?incidentId=${primaryIncident.id}&rootNodeId=${primaryIncident.rootNodeId || ""}`}
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-1.5 text-xs text-cyan-300 border-cyan-800/80 bg-cyan-950/40 hover:bg-cyan-900/50"
                      >
                        <AlertOctagon className="w-3.5 h-3.5" />
                        View Blast Radius &rarr;
                      </Button>
                    </Link>
                  </div>

                  <Link href={`/recovery?incidentId=${primaryIncident.id}`}>
                    <Button variant="secondary" size="sm" className="gap-1.5 text-xs text-amber-300 border-amber-800/80 bg-amber-950/40 hover:bg-amber-900/50">
                      <Sparkles className="w-3.5 h-3.5" />
                      Compare Recovery Plans &rarr;
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 3 & 4. WHAT IS AFFECTED & WHAT SHOULD I DO NEXT? */}
          <div data-scroll-reveal className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Impact & Blast Radius Snapshot (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <Card className="h-full border-slate-800 bg-slate-900/70 shadow-lg flex flex-col justify-between">
                <div>
                  <CardHeader className="pb-3 border-b border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GitFork className="w-4 h-4 text-cyan-400" />
                        <CardTitle className="text-base">Incident impact</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {primaryIncident?.severity.toUpperCase() || "NO INCIDENT"}
                      </Badge>
                    </div>
                    <CardDescription>
                      {primaryIncident?.title || "No incident selected"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3">
                        <span className="block text-xs text-slate-400">Root system</span>
                        <span className="mt-1 block break-words font-mono text-slate-100">
                          {primaryIncident?.rootNodeId || "Not provided"}
                        </span>
                      </div>
                      <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3">
                        <span className="block text-xs text-slate-400">Incident status</span>
                        <span className="mt-1 block capitalize text-slate-100">
                          {primaryIncident?.status.replaceAll("_", " ") || "Not available"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="pt-3 border-t border-slate-800">
                  <Link
                    href={primaryIncident ? `/impact?incidentId=${primaryIncident.id}&rootNodeId=${primaryIncident.rootNodeId || ""}` : "/impact"}
                    className="w-full"
                  >
                    <Button variant="secondary" size="sm" className="w-full gap-1.5 text-xs text-cyan-300">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      Open impact analysis <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>

            {/* Recovery Decision Engine Status (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <Card className="h-full border-slate-800 bg-slate-900/70 shadow-lg flex flex-col justify-between">
                <div>
                  <CardHeader className="pb-3 border-b border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <CardTitle className="text-sm">Recovery Decision Engine</CardTitle>
                      </div>
                      <Badge variant={recoveryPlan ? "warning" : "neutral"} className="text-xs">
                        {recoveryPlan?.status.replaceAll("_", " ").toUpperCase() || "NO PLAN"}
                      </Badge>
                    </div>
                    <CardDescription>
                      Automated candidate evaluation and counterfactual decision options
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-3">
                    {topRecoveryOption ? (
                      <div className="p-3.5 rounded-lg bg-slate-950 border border-amber-900/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                            ★ Top Recommended Strategy (Rank #{topRecoveryOption.rank})
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {topRecoveryOption.estimatedImpactReduction.estimatedPercent}% Reduction
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-white">
                          {topRecoveryOption.title}
                        </div>

                        <div className="text-[11px] text-slate-400 leading-snug">
                          {topRecoveryOption.rationale}
                        </div>

                        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                          <span>
                            Est. Time: <strong className="text-slate-200">{topRecoveryOption.estimatedRecoveryTime.value} {topRecoveryOption.estimatedRecoveryTime.unit}</strong>
                          </span>
                          <span>
                            Feasibility: <strong className="text-emerald-300 uppercase">{topRecoveryOption.feasibility}</strong>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 py-4 text-center">
                        No candidate options formulated yet for current disruption.
                      </div>
                    )}
                  </CardContent>
                </div>

                <CardFooter className="pt-3 border-t border-slate-800 flex items-center gap-2">
                  <Link href={primaryIncident ? `/recovery?incidentId=${primaryIncident.id}` : "/recovery"} className="w-1/2">
                    <Button variant="primary" size="sm" className="w-full gap-1.5 text-xs">
                      <Scale className="w-3.5 h-3.5" />
                      Compare Options
                    </Button>
                  </Link>
                  {topRecoveryOption && (
                    <Link
                      href={`/simulation?incidentId=${primaryIncident?.id}&optionId=${topRecoveryOption.id}&planId=${recoveryPlan?.id}`}
                      className="w-1/2"
                    >
                      <Button variant="secondary" size="sm" className="w-full gap-1.5 text-xs text-cyan-300">
                        <Activity className="w-3.5 h-3.5" />
                        Simulate Drill &rarr;
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* 5. WHAT NEEDS ATTENTION? — CAMPUS SNAPSHOT */}
          <Card data-scroll-reveal className="border-slate-800 bg-slate-900/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <CardTitle className="text-sm">Facilities Needing Operational Attention</CardTitle>
                <CardDescription>
                  Campus locations with elevated occupancy loads or degraded wireless connectivity
                </CardDescription>
              </div>
              <Link href="/campus">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs text-cyan-400 border-slate-700">
                  Full Campus Intelligence <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {conditionsData?.locations.slice(0, 6).map((loc) => {
                  const headcount = loc.occupancy.headcount ?? loc.occupancy.currentStudents ?? 0;
                  const occupancyRate =
                    loc.occupancy.capacity > 0 ? (headcount / loc.occupancy.capacity) * 100 : 0;
                  const isCritical = loc.overallHealth === "CRITICAL" || occupancyRate > 90;

                  return (
                    <Link
                      key={loc.location.id}
                      href={`/campus/${loc.location.id}`}
                      className={`p-3.5 rounded-lg border transition-all ${
                        isCritical
                          ? "bg-red-950/20 border-red-900/60 hover:bg-red-950/40"
                          : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-xs text-white truncate">
                          {loc.location.name}
                        </div>
                        <Badge
                          variant={
                            loc.occupancy.status === "Over Capacity" || loc.occupancy.status === "Very Busy"
                              ? "critical"
                              : loc.occupancy.status === "Busy"
                              ? "warning"
                              : "default"
                          }
                          size="sm"
                        >
                          {loc.occupancy.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2.5 pt-2 border-t border-slate-800/80">
                        <span>
                          {headcount} / {loc.occupancy.capacity} students ({occupancyRate.toFixed(0)}%)
                        </span>
                        <span className="text-slate-300">
                          Signal: {loc.connectivity.signalScore}/100
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

        </div>
      )}
    </AppLayout>
  );
}
