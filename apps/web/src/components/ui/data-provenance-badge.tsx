import * as React from "react";
import { cn } from "@/lib/utils";
import { DataMode } from "@ezykwelez/shared";

interface DataProvenanceBadgeProps {
  mode?: DataMode | string;
  size?: "sm" | "md";
  className?: string;
  showExplanation?: boolean;
}

export function DataProvenanceBadge({
  mode = DataMode.SIMULATED,
  size = "sm",
  className,
  showExplanation = false,
}: DataProvenanceBadgeProps) {
  const normMode = (mode || DataMode.UNKNOWN).toLowerCase();

  const getBadgeConfig = () => {
    switch (normMode) {
      case "live":
        return {
          symbol: "●",
          label: "Live Telemetry",
          bg: "bg-emerald-950/70 border-emerald-700/80 text-emerald-300",
          desc: "Real-time hardware sensor/Wi-Fi feed",
        };
      case "simulated":
        return {
          symbol: "◐",
          label: "Simulated Data",
          bg: "bg-cyan-950/70 border-cyan-700/80 text-cyan-300",
          desc: "Synthetic environment model for drills and verification",
        };
      case "estimated":
        return {
          symbol: "≈",
          label: "Estimated Model",
          bg: "bg-purple-950/70 border-purple-700/80 text-purple-300",
          desc: "Statistical inference or historical average",
        };
      default:
        return {
          symbol: "?",
          label: "Source Unknown",
          bg: "bg-slate-900 border-slate-700 text-slate-400",
          desc: "Unverified origin",
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      title={config.desc}
      className={cn(
        "inline-flex items-center gap-1.5 font-mono rounded-md border tracking-wider select-none",
        config.bg,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <span className="font-bold">{config.symbol}</span>
      <span>{config.label}</span>
      {showExplanation && (
        <span className="text-[10px] text-slate-400 font-sans ml-1">({config.desc})</span>
      )}
    </span>
  );
}
