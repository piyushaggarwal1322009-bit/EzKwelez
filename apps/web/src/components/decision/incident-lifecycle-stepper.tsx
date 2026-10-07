import * as React from "react";
import { IncidentStatus } from "@ezykwelez/shared";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";

interface IncidentLifecycleStepperProps {
  currentStatus: IncidentStatus;
  className?: string;
}

const LIFECYCLE_STAGES: { status: IncidentStatus; label: string; description: string }[] = [
  { status: IncidentStatus.REPORTED, label: "Reported", description: "Disruption ingested" },
  { status: IncidentStatus.TRIAGED, label: "Triaged", description: "Severity classified" },
  { status: IncidentStatus.INVESTIGATING, label: "Investigating", description: "Root cause tracing" },
  { status: IncidentStatus.ACTIVE, label: "Active", description: "Disrupting operations" },
  { status: IncidentStatus.MITIGATED, label: "Mitigated", description: "Contingency deployed" },
  { status: IncidentStatus.RESOLVED, label: "Resolved", description: "Full restoration" },
];

const STATUS_ORDER: Record<IncidentStatus, number> = {
  [IncidentStatus.REPORTED]: 1,
  [IncidentStatus.TRIAGED]: 2,
  [IncidentStatus.INVESTIGATING]: 3,
  [IncidentStatus.ACTIVE]: 4,
  [IncidentStatus.MITIGATED]: 5,
  [IncidentStatus.RESOLVED]: 6,
  [IncidentStatus.CLOSED]: 7,
};

export function IncidentLifecycleStepper({
  currentStatus,
  className = "",
}: IncidentLifecycleStepperProps) {
  const currentOrder = STATUS_ORDER[currentStatus] || 1;

  return (
    <div
      className={`p-3 rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 text-xs">
        {LIFECYCLE_STAGES.map((stage, idx) => {
          const stageOrder = STATUS_ORDER[stage.status];
          const isPassed = stageOrder < currentOrder;
          const isCurrent = stage.status === currentStatus;

          return (
            <div key={stage.status} className="flex items-center gap-2 shrink-0">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                  isCurrent
                    ? currentStatus === IncidentStatus.ACTIVE
                      ? "bg-red-950/80 text-red-200 border border-red-800/80 font-bold"
                      : "bg-cyan-950/80 text-cyan-200 border border-cyan-800/80 font-bold"
                    : isPassed
                    ? "text-slate-300 font-medium"
                    : "text-slate-500"
                }`}
              >
                {isPassed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                ) : (
                  <Circle className="w-3 h-3 text-slate-600 shrink-0" />
                )}
                <span>{stage.label}</span>
              </div>

              {idx < LIFECYCLE_STAGES.length - 1 && (
                <div
                  className={`w-4 h-px shrink-0 ${
                    stageOrder < currentOrder ? "bg-emerald-500/60" : "bg-slate-800"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
