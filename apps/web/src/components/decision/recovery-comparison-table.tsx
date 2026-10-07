import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Feasibility, RecoveryOption, RecoveryPlan } from "@ezykwelez/shared";
import { ArrowRight, CheckCircle2, Clock, Play, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";

interface RecoveryComparisonTableProps {
  plan: RecoveryPlan;
  incidentId?: string;
  selectedOptionId?: string;
  onSelectOption?: (option: RecoveryOption) => void;
  className?: string;
}

export function RecoveryComparisonTable({
  plan,
  incidentId,
  selectedOptionId,
  onSelectOption,
  className = "",
}: RecoveryComparisonTableProps) {
  const options = plan.options || [];

  const getFeasibilityBadge = (feasibility: Feasibility) => {
    switch (feasibility) {
      case Feasibility.FEASIBLE:
        return <Badge variant="success">FEASIBLE</Badge>;
      case Feasibility.CONDITIONALLY_FEASIBLE:
        return <Badge variant="warning">CONDITIONALLY FEASIBLE</Badge>;
      case Feasibility.INFEASIBLE:
        return <Badge variant="destructive">INFEASIBLE</Badge>;
      default:
        return <Badge variant="outline">UNKNOWN</Badge>;
    }
  };

  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-md ${className}`}>
      <table className="w-full text-xs text-left">
        <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-mono uppercase text-[11px]">
          <tr>
            <th className="py-3 px-4">Rank / Strategy</th>
            <th className="py-3 px-4">Feasibility</th>
            <th className="py-3 px-4">Restoration Time</th>
            <th className="py-3 px-4">Impact Reduction</th>
            <th className="py-3 px-4">Key Trade-off</th>
            <th className="py-3 px-4 text-right">Decision Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-sans">
          {options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const isRank1 = opt.rank === 1;
            const tradeoff = opt.tradeoffs && opt.tradeoffs.length > 0
              ? `${opt.tradeoffs[0].dimension}: ${opt.tradeoffs[0].value}`
              : "Standard reallocation";

            return (
              <tr
                key={opt.id}
                className={`transition-colors ${
                  isSelected
                    ? "bg-cyan-950/30 border-l-4 border-l-cyan-400"
                    : "hover:bg-slate-800/40"
                }`}
              >
                {/* Rank & Strategy */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                        isRank1
                          ? "bg-amber-500 text-slate-950 shadow-sm"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      #{opt.rank}
                    </span>
                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>{opt.title}</span>
                        {isRank1 && (
                          <span className="text-[10px] font-mono text-amber-400 font-bold px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-800">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Type: {opt.type.toUpperCase()} • ID: {opt.id}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Feasibility */}
                <td className="py-3.5 px-4">
                  {getFeasibilityBadge(opt.feasibility)}
                </td>

                {/* Restoration Time */}
                <td className="py-3.5 px-4 font-mono">
                  <span className="font-semibold text-slate-200">
                    {opt.estimatedRecoveryTime.value} {opt.estimatedRecoveryTime.unit}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Confidence: {opt.confidence}
                  </span>
                </td>

                {/* Impact Reduction */}
                <td className="py-3.5 px-4">
                  <span className="font-bold text-emerald-400 font-mono text-xs">
                    {opt.estimatedImpactReduction.estimatedPercent}% Reduction
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {opt.estimatedImpactReduction.severityReduction}
                  </span>
                </td>

                {/* Trade-off */}
                <td className="py-3.5 px-4 text-slate-300 max-w-xs">
                  <div className="text-[11px] font-medium">{tradeoff}</div>
                  <div className="text-[10px] text-slate-500 truncate" title={opt.rationale}>
                    {opt.rationale}
                  </div>
                </td>

                {/* Action Buttons */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onSelectOption && (
                      <button
                        type="button"
                        onClick={() => onSelectOption(opt)}
                        className={`text-xs px-2.5 py-1 rounded transition ${
                          isSelected
                            ? "bg-slate-800 text-cyan-300 font-semibold"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </button>
                    )}
                    <Link
                      href={`/simulation?incidentId=${incidentId || plan.incidentId}&optionId=${opt.id}&planId=${plan.id}`}
                    >
                      <Button variant="secondary" size="sm" className="gap-1 text-xs text-cyan-300 bg-cyan-950/40 border-cyan-800/60 hover:bg-cyan-900/50">
                        <Play className="w-3 h-3" /> Simulate Option
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
