import * as React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { Alert } from "@/components/ui/alert";
import { DataProvenanceBadge } from "@/components/ui/data-provenance-badge";
import {
  simulationService,
  SimulationScenario,
  SimulationResult,
  simulateRecoveryOption,
  RecoveryOptionSimulationResult,
} from "@/services/simulation-service";
import { recoveryService } from "@/services/recovery-service";
import { incidentService } from "@/services/incident-service";
import { DecisionLoopBanner } from "@/components/decision";
import { DataMode, Incident, RecoveryOption, RecoveryPlan } from "@ezykwelez/shared";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  Play,
  Radio,
  RotateCw,
  Scale,
  ShieldAlert,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

export default function SimulationPage() {
  const router = useRouter();
  const { incidentId, optionId, planId } = router.query;

  // Option Drill State
  const [drillIncident, setDrillIncident] = React.useState<Incident | null>(null);
  const [drillPlan, setDrillPlan] = React.useState<RecoveryPlan | null>(null);
  const [drillOption, setDrillOption] = React.useState<RecoveryOption | null>(null);
  const [drillResult, setDrillResult] = React.useState<RecoveryOptionSimulationResult | null>(null);
  const [isDrillLoading, setIsDrillLoading] = React.useState(false);

  // Tabletop Drill State
  const [scenarios, setScenarios] = React.useState<SimulationScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = React.useState<SimulationScenario | null>(null);
  const [durationHours, setDurationHours] = React.useState<number>(3.5);
  const [loadFactor, setLoadFactor] = React.useState<number>(1.2);
  const [availableBackupPower, setAvailableBackupPower] = React.useState<boolean>(true);

  const [tabletopResult, setTabletopResult] = React.useState<SimulationResult | null>(null);
  const [isTabletopRunning, setIsTabletopRunning] = React.useState(false);

  // Load scenarios for tabletop mode
  React.useEffect(() => {
    simulationService.getPresetScenarios().then((res) => {
      setScenarios(res);
      if (res.length > 0) {
        setSelectedScenario(res[0]);
        setDurationHours(res[0].durationHours);
        setLoadFactor(res[0].expectedLoadFactor);
        setAvailableBackupPower(res[0].availableBackupPower);
      }
    });
  }, []);

  // Load option drill when query parameters are supplied
  React.useEffect(() => {
    if (!router.isReady) return;

    const incId = typeof incidentId === "string" ? incidentId : undefined;
    const optId = typeof optionId === "string" ? optionId : undefined;

    if (incId || optId) {
      setIsDrillLoading(true);
      Promise.all([
        incId ? incidentService.getIncident(incId) : Promise.resolve(null),
        incId ? recoveryService.getPlansForIncident(incId) : Promise.resolve([]),
      ])
        .then(([incident, plans]) => {
          if (incident) setDrillIncident(incident);
          if (plans && plans.length > 0) {
            setDrillPlan(plans[0]);
            const targetOption =
              plans[0].options.find((o) => o.id === optId) || plans[0].options[0];
            if (targetOption) {
              setDrillOption(targetOption);
              simulateRecoveryOption(targetOption, {
                incidentId: incId,
                baselineDisplacedStudents: 120,
              }).then((computed) => {
                setDrillResult(computed);
              });
            }
          }
        })
        .finally(() => {
          setIsDrillLoading(false);
        });
    }
  }, [router.isReady, incidentId, optionId, planId]);

  const handleRunTabletop = async () => {
    if (!selectedScenario) return;
    setIsTabletopRunning(true);
    try {
      const simResult = await simulationService.runSimulation({
        ...selectedScenario,
        durationHours,
        expectedLoadFactor: loadFactor,
        availableBackupPower,
      });
      setTabletopResult(simResult);
    } finally {
      setIsTabletopRunning(false);
    }
  };

  const isOptionDrillMode = Boolean(drillOption && drillResult);

  return (
    <AppLayout
      title="Counterfactual Scenario Simulation & Option Drills"
      description="Simulate disruption conditions, validate candidate recovery plans, and drill before operational execution."
      dataMode={DataMode.SIMULATED}
    >
      <PageHeader
        title={isOptionDrillMode ? "Recovery Option Simulation Drill" : "Counterfactual Scenario Simulation"}
        description={
          isOptionDrillMode
            ? `Predictive before-and-after impact evaluation for strategy: ${drillOption?.title}`
            : "Run isolated tabletop drills against hypothetical campus failures with zero production table mutation."
        }
        breadcrumbs={[
          { label: "Simulation", href: "/simulation" },
          ...(drillOption ? [{ label: drillOption.title }] : []),
        ]}
        badge={<DataProvenanceBadge mode={DataMode.SIMULATED} />}
        actions={
          <div className="flex items-center gap-2">
            {isOptionDrillMode && drillIncident && (
              <Link href={`/recovery?incidentId=${drillIncident.id}`}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs text-slate-300">
                  <ArrowLeft className="w-3.5 h-3.5" /> Return to Recovery Options
                </Button>
              </Link>
            )}
            {!isOptionDrillMode && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleRunTabletop}
                isLoading={isTabletopRunning}
                className="gap-1.5 text-xs shadow-sm bg-blue-600"
              >
                <Play className="w-3.5 h-3.5" /> Execute Simulation Run
              </Button>
            )}
          </div>
        }
      />

      {/* Decision Golden Path Stepper Banner */}
      <DecisionLoopBanner
        currentStep="simulation"
        incidentId={typeof incidentId === "string" ? incidentId : drillIncident?.id}
        optionId={typeof optionId === "string" ? optionId : drillOption?.id}
        className="mb-6"
      />

      {isOptionDrillMode && drillOption && drillResult ? (
        /* OPTION DRILL MODE: BEFORE vs AFTER COMPARISON */
        <div className="space-y-6">
          {/* Active Context Banner */}
          <div className="p-4 rounded-xl border border-blue-900/60 bg-blue-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-blue-500/60 text-blue-400 font-mono text-[10px]">
                  EVALUATING STRATEGY • RANK #{drillOption.rank || 1}
                </Badge>
                <Badge variant="success" size="sm" className="font-mono text-[10px]">
                  {drillOption.feasibility}
                </Badge>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">{drillOption.title}</h2>
              <p className="text-xs text-slate-300 max-w-3xl">{drillOption.description}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/recovery?incidentId=${drillIncident?.id}`}>
                <Button variant="primary" size="sm" className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Proceed to Authorization
                </Button>
              </Link>
            </div>
          </div>

          {/* Before vs After Impact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Disrupted Systems */}
            <Card className="border-slate-800 bg-slate-900/80">
              <CardContent className="p-4 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Disrupted Systems</span>
                <div className="flex items-baseline justify-between">
                  <div className="space-x-2">
                    <span className="text-lg font-mono text-red-400 line-through">
                      {drillResult.before.disruptedNodes}
                    </span>
                    <span className="text-2xl font-bold font-mono text-emerald-400">
                      {drillResult.after.disruptedNodes}
                    </span>
                  </div>
                  <Badge variant="success" size="sm" className="font-mono text-[10px]">
                    -{drillResult.before.disruptedNodes - drillResult.after.disruptedNodes} restored
                  </Badge>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{
                      width: `${
                        (1 - drillResult.after.disruptedNodes / drillResult.before.disruptedNodes) * 100
                      }%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Metric 2: Displaced Students */}
            <Card className="border-slate-800 bg-slate-900/80">
              <CardContent className="p-4 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Displaced Students</span>
                <div className="flex items-baseline justify-between">
                  <div className="space-x-2">
                    <span className="text-lg font-mono text-red-400 line-through">
                      {drillResult.before.displacedStudents}
                    </span>
                    <span className="text-2xl font-bold font-mono text-emerald-400">
                      {drillResult.after.displacedStudents}
                    </span>
                  </div>
                  <Badge variant="success" size="sm" className="font-mono text-[10px]">
                    -{drillResult.delta.restoredStudents} rescued
                  </Badge>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{
                      width: `${
                        drillResult.before.displacedStudents > 0
                          ? ((drillResult.delta.restoredStudents) / drillResult.before.displacedStudents) * 100
                          : 100
                      }%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Metric 3: Severity Disruption Score */}
            <Card className="border-slate-800 bg-slate-900/80">
              <CardContent className="p-4 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Composite Impact Score</span>
                <div className="flex items-baseline justify-between">
                  <div className="space-x-2">
                    <span className="text-lg font-mono text-red-400 line-through">
                      {drillResult.before.severityScore.toFixed(1)}
                    </span>
                    <span className="text-2xl font-bold font-mono text-emerald-400">
                      {drillResult.after.severityScore.toFixed(1)}
                    </span>
                  </div>
                  <Badge variant="success" size="sm" className="font-mono text-[10px]">
                    -{drillResult.delta.impactPercentReduction}%
                  </Badge>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${drillResult.delta.impactPercentReduction}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Metric 4: Restoration Time Estimate */}
            <Card className="border-slate-800 bg-slate-900/80">
              <CardContent className="p-4 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Restoration Duration</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold font-mono text-white">
                    {drillResult.delta.estimatedTimeToRestore}
                  </span>
                  <Badge variant="outline" size="sm" className="font-mono text-[10px] text-cyan-400">
                    Confidence: {drillOption.confidence}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400">Time until service restoration</p>
              </CardContent>
            </Card>
          </div>

          {/* Drill Explainability & Trade-offs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (7 cols): Option Rationale & Steps */}
            <div className="lg:col-span-7 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" /> Grounded Recovery Rationale
                  </CardTitle>
                  <CardDescription>
                    Empirical basis for calculated delta reductions under this option
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  {drillOption.rationale ? (
                    <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed italic">
                      &ldquo;{drillOption.rationale}&rdquo;
                    </div>
                  ) : null}

                  {/* Prerequisites */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-300 block mb-2 uppercase tracking-wider">
                      Prerequisites & Pre-flight Checks ({drillOption.prerequisites.length})
                    </span>
                    <div className="space-y-2">
                      {drillOption.prerequisites.map((p, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="text-white font-medium block">{p.description}</span>
                            <span className="text-[10px] text-slate-500 font-mono">Source: {p.source}</span>
                          </div>
                          <Badge variant={p.satisfied ? "success" : "warning"} size="sm">
                            {p.satisfied ? "SATISFIED" : "PENDING"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column (5 cols): Trade-offs & Risks */}
            <div className="lg:col-span-5 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-400" /> Operational Trade-offs
                  </CardTitle>
                  <CardDescription>Costs and side effects of executing this drill</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {drillOption.tradeoffs.length === 0 ? (
                    <p className="text-slate-500 py-2">No adverse trade-offs recorded.</p>
                  ) : (
                    drillOption.tradeoffs.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                      >
                        <div>
                          <span className="text-white font-medium block">{t.dimension}</span>
                          <span className="text-[11px] text-slate-400">{t.explanation}</span>
                        </div>
                        <Badge
                          variant={t.direction === "better" ? "success" : t.direction === "worse" ? "destructive" : "neutral"}
                          size="sm"
                        >
                          {String(t.value)}
                        </Badge>
                      </div>
                    ))
                  )}

                  {/* Risks */}
                  {drillOption.risks.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] font-semibold text-slate-300 block mb-2 uppercase tracking-wider">
                        Residual Operational Risks
                      </span>
                      {drillOption.risks.map((r, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-red-950/20 border border-red-900/40 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-red-300">{r.description}</span>
                            <Badge variant="destructive" size="sm">
                              {r.severity}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-400">Mitigation: {r.mitigation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Navigation Back / Next Steps */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-2">
                <span className="text-xs font-semibold text-white block">Drill Validation Complete</span>
                <p className="text-[11px] text-slate-400">
                  You have verified that executing this option recovers {drillResult.delta.impactPercentReduction}% of
                  disrupted capacity. Return to the decision portal to approve execution.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Link href={`/recovery?incidentId=${drillIncident?.id}`} className="flex-1">
                    <Button variant="primary" size="sm" className="w-full text-xs gap-1.5 bg-blue-600">
                      Return to Recovery <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                  <Link href={`/dashboard?incidentId=${drillIncident?.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      Command Center
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD TABLETOP DRILL MODE */
        <>
          {/* Safety Notice */}
          <Alert variant="info" title="Counterfactual Simulation Sandbox" className="mb-6">
            This simulation engine runs purely in-memory counterfactual drills. All variables, estimated displacement
            counts, and recommendations are strictly simulated without modifying live telemetry.
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (5 cols): Scenario Selector & Variable Controls */}
            <div className="lg:col-span-5 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Pre-Configured Scenarios</CardTitle>
                  <CardDescription>Select baseline campus drill template</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {scenarios.map((scen) => {
                    const isSelected = selectedScenario?.id === scen.id;
                    return (
                      <button
                        key={scen.id}
                        type="button"
                        onClick={() => {
                          setSelectedScenario(scen);
                          setDurationHours(scen.durationHours);
                          setLoadFactor(scen.expectedLoadFactor);
                          setAvailableBackupPower(scen.availableBackupPower);
                        }}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all space-y-1 ${
                          isSelected
                            ? "bg-slate-900 border-blue-600 text-white shadow-sm"
                            : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold">{scen.name}</span>
                          <Badge variant="outline" size="sm" className="capitalize text-[10px]">
                            {scen.disruptionType.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{scen.description}</p>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Variable Tweaker */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Simulation Variables</CardTitle>
                  <CardDescription>Adjust drill parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  {/* Duration Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-300 font-medium">Disruption Duration (Hours)</span>
                      <span className="font-mono text-blue-400 font-bold">{durationHours}h</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="12.0"
                      step="0.5"
                      value={durationHours}
                      onChange={(e) => setDurationHours(parseFloat(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>

                  {/* Load Factor Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-300 font-medium">Campus Load Multiplier</span>
                      <span className="font-mono text-cyan-400 font-bold">{loadFactor}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={loadFactor}
                      onChange={(e) => setLoadFactor(parseFloat(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>

                  {/* Auxiliary Generator toggle */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-300 font-medium">Auxiliary Power Reserve Available</span>
                    <input
                      type="checkbox"
                      checked={availableBackupPower}
                      onChange={(e) => setAvailableBackupPower(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column (7 cols): Simulation Output & Recommendations */}
            <div className="lg:col-span-7 space-y-6">
              {tabletopResult ? (
                <>
                  {/* Output Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <MetricCard
                      title="Calculated Disruption Score"
                      value={tabletopResult.disruptionScore.toFixed(1)}
                      subvalue="Multi-factor impact magnitude"
                      icon={ShieldAlert}
                      variant={tabletopResult.disruptionScore > 100 ? "critical" : "warning"}
                    />
                    <MetricCard
                      title="Estimated Displaced Students"
                      value={tabletopResult.estimatedDisplacedStudents}
                      subvalue="Affected cohort count"
                      icon={Users}
                      variant="default"
                    />
                  </div>

                  {/* Recommended Strategy Output */}
                  <Card className="border-blue-900/60 bg-blue-950/20">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs uppercase tracking-wider text-blue-300 flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Optimal Recovery Recommendation
                        </CardTitle>
                        <Badge variant="success">EVALUATED</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs">
                      <div className="p-3.5 rounded-lg bg-slate-900 border border-blue-800/60">
                        <span className="text-sm font-semibold text-white block">
                          {tabletopResult.recommendedRecoveryOption}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Calculated as the lowest-risk path under {durationHours}h outage with {loadFactor}x campus
                          load.
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                          Identified Bottleneck Facilities
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {tabletopResult.bottleneckFacilities.map((fac, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300"
                            >
                              {fac}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Simulation Run Provenance Notes */}
                  <Card className="border-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs uppercase tracking-wider text-slate-400">
                        Simulation Audit Log
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-xs text-slate-400 font-mono text-[11px]">
                      {tabletopResult.notes.map((note, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-cyan-400">●</span> {note}
                        </div>
                      ))}
                      <div className="pt-2 text-slate-500">
                        Run Completed At: {new Date(tabletopResult.simulatedAt).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-800 bg-slate-900/40">
                  <Radio className="w-8 h-8 text-slate-500 mb-3" />
                  <h3 className="text-sm font-semibold text-white">Ready for Simulation Execution</h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                    Click &ldquo;Execute Simulation Run&rdquo; to calculate counterfactual disruption scores and recovery
                    options.
                  </p>
                  <Button variant="primary" size="sm" onClick={handleRunTabletop} className="gap-1.5 text-xs">
                    <Play className="w-3.5 h-3.5" /> Start Simulation
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
