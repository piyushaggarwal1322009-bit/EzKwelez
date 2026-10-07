import * as React from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { checkApiHealth } from "@/lib/api/client";
import { APP_NAME, DataMode } from "@ezykwelez/shared";
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  Building2,
  CheckCircle2,
  Compass,
  Cpu,
  GitFork,
  Radio,
  Server,
  Shield,
  ShieldAlert,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";

interface OperationalModule {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  badge: string;
  badgeVariant?: "default" | "success" | "warning" | "info";
  actionLabel: string;
}

const OPERATIONAL_MODULES: OperationalModule[] = [
  {
    title: "Command Center",
    description: "Real-time situational awareness, campus readiness overview, and unified event feed.",
    href: "/dashboard",
    icon: Compass,
    badge: "Operations",
    badgeVariant: "info",
    actionLabel: "Open Command Center",
  },
  {
    title: "Campus Live Conditions",
    description: "Facility telemetry, real-time occupancy status, and wireless infrastructure quality across zones.",
    href: "/campus",
    icon: Building2,
    badge: "Telemetry",
    badgeVariant: "default",
    actionLabel: "View Campus Telemetry",
  },
  {
    title: "Incident Response",
    description: "Structured disruption logging, audit histories, and state-machine-backed triage workflows.",
    href: "/incidents",
    icon: ShieldAlert,
    badge: "Disruptions",
    badgeVariant: "warning",
    actionLabel: "Inspect Incidents",
  },
  {
    title: "Blast Radius & Impact",
    description: "Multi-tier dependency propagation analysis to calculate the full blast radius of any campus disruption.",
    href: "/impact",
    icon: AlertOctagon,
    badge: "Impact Analysis",
    badgeVariant: "warning",
    actionLabel: "Analyze Blast Radius",
  },
  {
    title: "Campus Dependency Graph",
    description: "Topological network model connecting buildings, lecture halls, electrical hubs, and network paths.",
    href: "/dependencies",
    icon: GitFork,
    badge: "Topology",
    badgeVariant: "default",
    actionLabel: "Explore Graph",
  },
  {
    title: "Recovery Planning",
    description: "Constraint-validated recovery options, candidate comparisons, and trade-off evaluations.",
    href: "/recovery",
    icon: Sparkles,
    badge: "Decision Support",
    badgeVariant: "success",
    actionLabel: "Review Recovery Options",
  },
  {
    title: "What-If Simulation",
    description: "Model hypothetical disruptions and evaluate candidate recovery interventions before real commitment.",
    href: "/simulation",
    icon: Radio,
    badge: "Simulation",
    badgeVariant: "info",
    actionLabel: "Run Simulation",
  },
  {
    title: "Engine Diagnostics & Settings",
    description: "Configure telemetry refresh intervals, inspect backend connectivity, and verify system adapters.",
    href: "/settings",
    icon: Server,
    badge: "System",
    badgeVariant: "default",
    actionLabel: "Inspect Diagnostics",
  },
];

const DECISION_LOOP_STAGES = [
  {
    step: "01",
    title: "Incident Trigger",
    description: "Disruption or telemetry anomaly detected across campus assets or infrastructure.",
    icon: AlertOctagon,
  },
  {
    step: "02",
    title: "Blast Radius Tracing",
    description: "Graph traversal calculates direct, indirect, and multi-tier cascading dependencies.",
    icon: GitFork,
  },
  {
    step: "03",
    title: "Constraint Evaluation",
    description: "Evaluates resource limits, room capacities, and operational rules for candidate plans.",
    icon: Shield,
  },
  {
    step: "04",
    title: "What-If Simulation",
    description: "Deterministic modeling predicts recovery trajectory and operational feasibility.",
    icon: Cpu,
  },
  {
    step: "05",
    title: "Intervention Recommendation",
    description: "Delivers explainable, constraint-validated action items to operations leadership.",
    icon: CheckCircle2,
  },
];

export default function HomePage() {
  const [apiOnline, setApiOnline] = React.useState<boolean | null>(null);
  const [latencyMs, setLatencyMs] = React.useState<number | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    const start = performance.now();

    checkApiHealth()
      .then(() => {
        if (isMounted) {
          setLatencyMs(Math.round(performance.now() - start));
          setApiOnline(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setApiOnline(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AppLayout
      title="Campus Disruption-Response & Recovery Engine"
      description="Operational decision-support platform modeling campus interdependencies, blast radius tracing, and constraint-validated recovery interventions."
      campusStatus="operational"
      dataMode={DataMode.SIMULATED}
    >
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader
          title="Campus Disruption-Response & Recovery Engine"
          description="Operational decision-support platform modeling campus interdependencies, blast radius tracing, and constraint-validated recovery interventions."
          breadcrumbs={[{ label: "Overview" }]}
          actions={
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="primary" size="sm" className="gap-2 shadow-sm">
                  <span>Enter Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          }
        />

        {/* Engine Mission & Live System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-slate-800 bg-slate-900/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-blue-800 text-blue-400 font-mono text-[11px]">
                  Operational Intelligence
                </Badge>
                <Badge variant="default" className="text-slate-400 font-mono text-[11px]">
                  Decision Support Loop
                </Badge>
              </div>
              <CardTitle className="text-lg text-slate-100 mt-2">
                When something goes wrong on campus, what else is affected, and how do we recover?
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs sm:text-sm leading-relaxed mt-1">
                {APP_NAME} models physical, digital, and instructional dependencies as a living network.
                During disruptions—power failures, room closures, or network outages—the engine computes
                exact blast radiuses, evaluates recovery candidates, and produces explainable briefings.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Workflow className="w-4 h-4 text-blue-400" />
                  <span>Deterministic Analysis</span>
                </div>
                <span className="text-slate-700">•</span>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Constraint Validation</span>
                </div>
                <span className="text-slate-700">•</span>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Sub-second Simulation</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Engine Connectivity Status */}
          <Card className="border-slate-800 bg-slate-900/40 flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Engine Gateway</span>
                {apiOnline === null ? (
                  <Badge variant="default" size="sm">Checking...</Badge>
                ) : apiOnline ? (
                  <Badge variant="success" size="sm">API Online</Badge>
                ) : (
                  <Badge variant="warning" size="sm">Standalone</Badge>
                )}
              </div>
              <CardTitle className="text-base text-slate-100 mt-2">
                FastAPI Gateway
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Backend coordination service providing dependency graph traversal, telemetry ingestion, and simulation routes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-0 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-500">Service:</span>
                <span className="text-slate-200">ezykwelez-api</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-500">Status:</span>
                <span className={apiOnline ? "text-emerald-400" : "text-amber-400"}>
                  {apiOnline === null ? "Connecting..." : apiOnline ? `Healthy (${latencyMs}ms)` : "Offline / Mock"}
                </span>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Link href="/settings" className="w-full">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Inspect System Diagnostics
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Operational Modules Navigation Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-100">Operational Workspaces</h2>
              <p className="text-xs text-slate-400">Dedicated operational interfaces for campus operators and recovery teams.</p>
            </div>
            <span className="text-xs font-mono text-slate-500">{OPERATIONAL_MODULES.length} Workspaces</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {OPERATIONAL_MODULES.map((module) => {
              const IconComp = module.icon;
              return (
                <Card
                  key={module.href}
                  className="flex flex-col justify-between border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/70 hover:border-slate-700/80 transition-all group"
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-lg bg-slate-800/80 text-blue-400 border border-slate-700/60 group-hover:bg-blue-600/20 group-hover:text-blue-300 transition-colors">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <Badge variant={module.badgeVariant || "default"} size="sm">
                        {module.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors">
                      {module.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400 leading-relaxed mt-1">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="p-4 pt-3 border-t border-slate-800/40 mt-3">
                    <Link href={module.href} className="w-full">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full text-xs justify-between group-hover:border-slate-600 group-hover:text-white"
                      >
                        <span>{module.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>

        {/* The EzyKwelez Core Decision Loop */}
        <div className="space-y-4 pt-2">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Core Decision Loop</h2>
            <p className="text-xs text-slate-400">
              The continuous automated pipeline running from initial disruption signal to validated intervention.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {DECISION_LOOP_STAGES.map((stage) => {
              const IconComponent = stage.icon;
              return (
                <div
                  key={stage.step}
                  className="flex flex-col p-4 rounded-xl border border-slate-800/80 bg-slate-900/30 text-slate-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] text-blue-400 font-semibold">{stage.step}</span>
                    <IconComponent className="w-4 h-4 text-slate-400" />
                  </div>
                  <h3 className="text-xs font-semibold text-slate-100 mb-1">{stage.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{stage.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
