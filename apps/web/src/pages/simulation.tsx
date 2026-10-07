import * as React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { Alert } from "@/components/ui/alert";
import { DataProvenanceBadge } from "@/components/ui/data-provenance-badge";
import { simulationService, SimulationScenario, SimulationResult } from "@/services/simulation-service";
import { DataMode } from "@ezykwelez/shared";
import {
  Activity,
  AlertTriangle,
  Clock,
  Flame,
  Play,
  Radio,
  RotateCw,
  ShieldAlert,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

export default function SimulationPage() {
  const [scenarios, setScenarios] = React.useState<SimulationScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = React.useState<SimulationScenario | null>(null);
  const [durationHours, setDurationHours] = React.useState<number>(3.5);
  const [loadFactor, setLoadFactor] = React.useState<number>(1.2);
  const [availableBackupPower, setAvailableBackupPower] = React.useState<boolean>(true);

  const [result, setResult] = React.useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = React.useState(false);

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

  const handleRunSimulation = async () => {
    if (!selectedScenario) return;
    setIsRunning(true);
    try {
      const simResult = await simulationService.runSimulation({
        ...selectedScenario,
        durationHours,
        expectedLoadFactor: loadFactor,
        availableBackupPower,
      });
      setResult(simResult);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <AppLayout
      title="Counterfactual Scenario Simulation"
      description="Simulate disruption conditions, adjust load multipliers, and observe calculated recovery recommendations."
      dataMode={DataMode.SIMULATED}
    >
      <PageHeader
        title="Counterfactual Scenario Simulation"
        description="Run isolated tabletop drills against hypothetical campus failures with zero production table mutation."
        breadcrumbs={[{ label: "Simulation" }]}
        badge={<DataProvenanceBadge mode={DataMode.SIMULATED} />}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleRunSimulation}
            isLoading={isRunning}
            className="gap-1.5 text-xs shadow-sm bg-blue-600"
          >
            <Play className="w-3.5 h-3.5" /> Execute Simulation Run
          </Button>
        }
      />

      {/* Safety Notice */}
      <Alert variant="info" title="Counterfactual Simulation Sandbox" className="mb-6">
        This simulation engine runs purely in-memory counterfactual drills. All variables, estimated displacement counts, and recommendations are strictly simulated.
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
          {result ? (
            <>
              {/* Output Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricCard
                  title="Calculated Disruption Score"
                  value={result.disruptionScore.toFixed(1)}
                  subvalue="Multi-factor impact magnitude"
                  icon={ShieldAlert}
                  variant={result.disruptionScore > 100 ? "critical" : "warning"}
                />
                <MetricCard
                  title="Estimated Displaced Students"
                  value={result.estimatedDisplacedStudents}
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
                      {result.recommendedRecoveryOption}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Calculated as the lowest-risk path under {durationHours}h outage with {loadFactor}x campus load.
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Identified Bottleneck Facilities
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {result.bottleneckFacilities.map((fac, idx) => (
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
                  {result.notes.map((note, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-cyan-400">●</span> {note}
                    </div>
                  ))}
                  <div className="pt-2 text-slate-500">
                    Run Completed At: {new Date(result.simulatedAt).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-800 bg-slate-900/40">
              <Radio className="w-8 h-8 text-slate-500 mb-3" />
              <h3 className="text-sm font-semibold text-white">Ready for Simulation Execution</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                Click &ldquo;Execute Simulation Run&rdquo; to calculate counterfactual disruption scores and recovery options.
              </p>
              <Button variant="primary" size="sm" onClick={handleRunSimulation} className="gap-1.5 text-xs">
                <Play className="w-3.5 h-3.5" /> Start Simulation
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
