import * as React from "react";
import Link from "next/link";
import { AlertOctagon, CheckCircle2, ChevronRight, GitFork, Sparkles, Activity } from "lucide-react";

export type DecisionStep = "incident" | "impact" | "recovery" | "simulation";

interface DecisionLoopBannerProps {
  currentStep: DecisionStep;
  incidentId?: string;
  rootNodeId?: string;
  impactId?: string;
  planId?: string;
  optionId?: string;
  className?: string;
}

export function DecisionLoopBanner({
  currentStep,
  incidentId = "inc-00000000-0000-0000-0000-000000000001",
  rootNodeId = "n0000000-0000-0000-0000-000000000001",
  impactId = "ana_grid_b_outage",
  planId = "rec-plan-grid-b-01",
  optionId = "opt-01",
  className = "",
}: DecisionLoopBannerProps) {
  const steps: {
    key: DecisionStep;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    href: string;
  }[] = [
    {
      key: "incident",
      label: "1. Incident Command",
      sublabel: "Identify root fault",
      icon: AlertOctagon,
      href: `/incidents/${incidentId}`,
    },
    {
      key: "impact",
      label: "2. Blast Radius",
      sublabel: "Assess cascade hops",
      icon: GitFork,
      href: `/impact?incidentId=${incidentId}&rootNodeId=${rootNodeId}`,
    },
    {
      key: "recovery",
      label: "3. Recovery Options",
      sublabel: "Compare trade-offs",
      icon: Sparkles,
      href: `/recovery?incidentId=${incidentId}&impactId=${impactId}`,
    },
    {
      key: "simulation",
      label: "4. Simulation Drill",
      sublabel: "Before vs After delta",
      icon: Activity,
      href: `/simulation?incidentId=${incidentId}&optionId=${optionId}&planId=${planId}`,
    },
  ];

  const stepOrder: Record<DecisionStep, number> = {
    incident: 1,
    impact: 2,
    recovery: 3,
    simulation: 4,
  };

  const currentOrder = stepOrder[currentStep];

  return (
    <div
      className={`p-3 rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-md ${className}`}
    >
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCurrent = step.key === currentStep;
          const isCompleted = stepNum < currentOrder;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.key}>
              <Link
                href={step.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all shrink-0 ${
                  isCurrent
                    ? "bg-cyan-950/80 border border-cyan-700/80 text-white shadow-sm"
                    : isCompleted
                    ? "text-slate-300 hover:bg-slate-800/60"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isCurrent ? "text-cyan-400" : "text-slate-500"
                    }`}
                  />
                )}
                <div>
                  <div
                    className={`font-semibold tracking-tight ${
                      isCurrent ? "text-cyan-300" : "text-slate-200"
                    }`}
                  >
                    {step.label}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {step.sublabel}
                  </div>
                </div>
              </Link>

              {idx < steps.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-700 shrink-0 hidden sm:block" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
