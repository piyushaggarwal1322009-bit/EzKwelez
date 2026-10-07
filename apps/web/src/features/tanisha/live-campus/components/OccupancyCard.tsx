/**
 * Occupancy Card Component
 * Feature Owner: Tanisha
 * Module: @/features/tanisha/live-campus
 */

import * as React from "react";
import { Users, AlertTriangle } from "lucide-react";
import { OccupancySnapshot, OccupancyStatus } from "../types/campus";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FreshnessIndicator } from "./FreshnessIndicator";
import { cn } from "@/lib/utils";

export interface OccupancyCardProps {
  snapshot: OccupancySnapshot;
  className?: string;
}

export function OccupancyCard({ snapshot, className }: OccupancyCardProps) {
  const {
    name,
    currentCount,
    capacity,
    percentage,
    status,
    measuredAt,
    zone,
    dataMode,
  } = snapshot;

  const statusMap: Record<
    OccupancyStatus,
    {
      label: string;
      badgeVariant: "default" | "success" | "warning" | "critical" | "outline";
      barColor: string;
      textColor: string;
      bgHighlight: string;
    }
  > = {
    low: {
      label: "Low (0–49%)",
      badgeVariant: "success",
      barColor: "bg-emerald-500",
      textColor: "text-emerald-400",
      bgHighlight: "border-slate-800/80 hover:border-emerald-700/50",
    },
    moderate: {
      label: "Moderate (50–74%)",
      badgeVariant: "default",
      barColor: "bg-blue-500",
      textColor: "text-blue-400",
      bgHighlight: "border-slate-800/80 hover:border-blue-700/50",
    },
    busy: {
      label: "Busy (75–89%)",
      badgeVariant: "warning",
      barColor: "bg-amber-500",
      textColor: "text-amber-400",
      bgHighlight: "border-amber-900/40 hover:border-amber-700/60 bg-amber-950/10",
    },
    very_busy: {
      label: "Very Busy (90–100%)",
      badgeVariant: "warning",
      barColor: "bg-orange-500",
      textColor: "text-orange-400",
      bgHighlight: "border-orange-900/50 hover:border-orange-700/70 bg-orange-950/20",
    },
    over_capacity: {
      label: "Over Capacity (>100%)",
      badgeVariant: "critical",
      barColor: "bg-rose-500 animate-pulse",
      textColor: "text-rose-400 font-bold",
      bgHighlight: "border-rose-900/60 hover:border-rose-700/80 bg-rose-950/30",
    },
  };

  const currentStatus = statusMap[status] || statusMap.low;
  const isOver = status === "over_capacity";
  const progressWidth = Math.min(100, Math.max(0, percentage));

  return (
    <Card
      className={cn(
        "p-5 bg-slate-900/70 shadow-md transition-all duration-150 flex flex-col justify-between",
        currentStatus.bgHighlight,
        className
      )}
    >
      <div>
        {/* Top bar: Name & Status Badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <h4 className="font-semibold text-white text-base tracking-tight leading-snug">
              {name}
            </h4>
            {zone && <p className="text-xs text-slate-400">{zone}</p>}
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={currentStatus.badgeVariant} className="text-[11px] font-mono whitespace-nowrap">
              {currentStatus.label}
            </Badge>
            {isOver && (
              <span className="flex items-center gap-1 text-[10px] text-rose-400 font-medium font-mono">
                <AlertTriangle className="h-3 w-3" /> Exceeds Safe Limit
              </span>
            )}
          </div>
        </div>

        {/* Metric stats row */}
        <div className="mt-4 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-extrabold text-white tracking-tight">
              {currentCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {capacity.toLocaleString()} cap
            </span>
          </div>
          <span className={cn("font-mono text-xl font-bold tracking-tight", currentStatus.textColor)}>
            {percentage}%
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-2.5">
          <div
            role="progressbar"
            aria-label={`${name} occupancy: ${percentage}%`}
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-2 w-full bg-slate-800 rounded-full overflow-hidden"
          >
            <div
              className={cn("h-full rounded-full transition-all duration-300", currentStatus.barColor)}
              style={{ width: `${progressWidth}%` }}
            />
          </div>
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
