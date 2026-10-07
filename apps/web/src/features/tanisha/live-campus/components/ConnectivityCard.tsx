/**
 * Connectivity Card Component
 * Feature Owner: Tanisha
 * Module: @/features/tanisha/live-campus
 */

import * as React from "react";
import { Wifi, WifiOff, Radio, Signal } from "lucide-react";
import { ConnectivitySnapshot, ConnectivityQuality } from "../types/campus";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FreshnessIndicator } from "./FreshnessIndicator";
import { cn } from "@/lib/utils";

export interface ConnectivityCardProps {
  snapshot: ConnectivitySnapshot;
  className?: string;
}

export function ConnectivityCard({ snapshot, className }: ConnectivityCardProps) {
  const {
    name,
    signalScore,
    signalDbm,
    networkName,
    quality,
    measuredAt,
    zone,
    dataMode,
  } = snapshot;

  const qualityConfig: Record<
    ConnectivityQuality,
    {
      label: string;
      badgeVariant: "default" | "success" | "warning" | "critical" | "outline";
      color: string;
      barColor: string;
      barsActive: number;
      bgHighlight: string;
    }
  > = {
    excellent: {
      label: "Excellent (80–100)",
      badgeVariant: "success",
      color: "text-emerald-400",
      barColor: "bg-emerald-500",
      barsActive: 4,
      bgHighlight: "border-slate-800/80 hover:border-emerald-700/50",
    },
    good: {
      label: "Good (60–79)",
      badgeVariant: "default",
      color: "text-blue-400",
      barColor: "bg-blue-500",
      barsActive: 3,
      bgHighlight: "border-slate-800/80 hover:border-blue-700/50",
    },
    fair: {
      label: "Fair (40–59)",
      badgeVariant: "warning",
      color: "text-amber-400",
      barColor: "bg-amber-500",
      barsActive: 2,
      bgHighlight: "border-amber-900/40 hover:border-amber-700/60 bg-amber-950/10",
    },
    weak: {
      label: "Weak (20–39)",
      badgeVariant: "critical",
      color: "text-rose-400",
      barColor: "bg-rose-500",
      barsActive: 1,
      bgHighlight: "border-rose-900/50 hover:border-rose-700/70 bg-rose-950/20",
    },
    very_weak: {
      label: "Very Weak (0–19)",
      badgeVariant: "critical",
      color: "text-rose-500 font-bold",
      barColor: "bg-rose-600 animate-pulse",
      barsActive: 1,
      bgHighlight: "border-rose-900/70 hover:border-rose-700/90 bg-rose-950/30",
    },
  };

  const current = qualityConfig[quality] || qualityConfig.fair;

  return (
    <Card
      className={cn(
        "p-5 bg-slate-900/70 shadow-md transition-all duration-150 flex flex-col justify-between",
        current.bgHighlight,
        className
      )}
    >
      <div>
        {/* Top bar */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <h4 className="font-semibold text-white text-base tracking-tight leading-snug">
              {name}
            </h4>
            {zone && <p className="text-xs text-slate-400">{zone}</p>}
          </div>
          <Badge variant={current.badgeVariant} className="text-[11px] font-mono whitespace-nowrap">
            {current.label}
          </Badge>
        </div>

        {/* Signal Score & Multi-bar Visualizer */}
        <div className="mt-4 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-white tracking-tight">
              {signalScore}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 100 score</span>
          </div>

          {/* 4-Bar Signal Visualizer */}
          <div
            role="meter"
            aria-label={`${name} signal strength: ${signalScore} out of 100 (${quality})`}
            aria-valuenow={signalScore}
            aria-valuemin={0}
            aria-valuemax={100}
            className="flex items-end gap-1 h-6 px-2 py-1 bg-slate-800/80 rounded border border-slate-700/50"
          >
            {[1, 2, 3, 4].map((barIndex) => {
              const heightClass =
                barIndex === 1
                  ? "h-2"
                  : barIndex === 2
                  ? "h-3"
                  : barIndex === 3
                  ? "h-4"
                  : "h-5";
              const isActive = barIndex <= current.barsActive;

              return (
                <div
                  key={barIndex}
                  className={cn(
                    "w-1 rounded-sm transition-all",
                    heightClass,
                    isActive ? current.barColor : "bg-slate-700/40"
                  )}
                  aria-hidden="true"
                />
              );
            })}
          </div>
        </div>

        {/* Technical telemetry metadata */}
        <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded border border-slate-800/60">
          <div className="flex items-center gap-1.5 truncate">
            <Radio className="h-3 w-3 text-slate-500 shrink-0" aria-hidden="true" />
            <span className="truncate text-slate-300">{networkName || "CAMPUS-NETWORK"}</span>
          </div>
          {typeof signalDbm === "number" && (
            <span className="text-slate-400 shrink-0">{signalDbm} dBm</span>
          )}
        </div>
      </div>

      {/* Footer: Freshness & Data Mode */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <FreshnessIndicator measuredAt={measuredAt} />
        <span className="text-[10px] font-mono uppercase text-slate-500">
          Mode: <strong className="text-slate-400">{dataMode}</strong>
        </span>
      </div>
    </Card>
  );
}
