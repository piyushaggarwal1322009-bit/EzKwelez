/**
 * Data Status Badge Component
 * Feature Owner: Tanisha
 * Module: @/features/tanisha/live-campus
 *
 * NOTE: Explicitly marks simulated vs live data to prevent operational confusion.
 */

import * as React from "react";
import { FlaskConical, Radio, Cpu, HelpCircle } from "lucide-react";
import { DataMode } from "../types/campus";
import { cn } from "@/lib/utils";

export interface DataStatusBadgeProps {
  mode?: DataMode;
  className?: string;
  size?: "sm" | "md";
}

export function DataStatusBadge({
  mode = "simulated",
  className,
  size = "md",
}: DataStatusBadgeProps) {
  const configs = {
    simulated: {
      label: "SIMULATED DATA",
      description: "Synthetic operational scenario for demonstration and what-if analysis",
      icon: FlaskConical,
      className:
        "bg-amber-950/70 text-amber-300 border-amber-700/60 shadow-amber-950/30",
      dotClass: "bg-amber-400 animate-pulse",
    },
    live: {
      label: "LIVE TELEMETRY",
      description: "Direct real-time campus sensor feed",
      icon: Radio,
      className:
        "bg-emerald-950/70 text-emerald-300 border-emerald-700/60 shadow-emerald-950/30",
      dotClass: "bg-emerald-400 animate-pulse",
    },
    estimated: {
      label: "ESTIMATED",
      description: "Calculated from historical schedule and prior conditions",
      icon: Cpu,
      className:
        "bg-sky-950/70 text-sky-300 border-sky-700/60 shadow-sky-950/30",
      dotClass: "bg-sky-400",
    },
    unknown: {
      label: "DATA UNKNOWN",
      description: "Telemetry source unverified",
      icon: HelpCircle,
      className:
        "bg-slate-900 text-slate-400 border-slate-700",
      dotClass: "bg-slate-500",
    },
  };

  const current = configs[mode] || configs.simulated;
  const Icon = current.icon;

  return (
    <div
      role="status"
      aria-label={`Data mode: ${current.label}. ${current.description}`}
      title={current.description}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-mono uppercase tracking-wider font-semibold shadow-sm transition-colors",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        current.className,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", current.dotClass)} aria-hidden="true" />
      <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} aria-hidden="true" />
      <span>{current.label}</span>
    </div>
  );
}
