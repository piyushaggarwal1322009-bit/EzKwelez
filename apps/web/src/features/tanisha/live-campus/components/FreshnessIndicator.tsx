/**
 * Freshness Indicator Component
 * Feature Owner: Tanisha
 * Module: @/features/tanisha/live-campus
 */

import * as React from "react";
import { Clock, AlertCircle } from "lucide-react";
import { Freshness } from "../types/campus";
import { deriveFreshness, formatRelativeFreshness } from "../lib/calculations";
import { cn } from "@/lib/utils";

export interface FreshnessIndicatorProps {
  measuredAt?: string | Date | number | null;
  status?: Freshness;
  className?: string;
  showIcon?: boolean;
}

export function FreshnessIndicator({
  measuredAt,
  status,
  className,
  showIcon = true,
}: FreshnessIndicatorProps) {
  const [now, setNow] = React.useState<number>(Date.now());

  // Update relative time display every 10 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const derivedStatus = status || deriveFreshness(measuredAt, now);
  const formattedTime = formatRelativeFreshness(measuredAt, now);

  const statusConfig = {
    fresh: {
      dotClass: "bg-emerald-400",
      textClass: "text-slate-400",
      label: "Fresh Telemetry",
    },
    stale: {
      dotClass: "bg-amber-400 animate-pulse",
      textClass: "text-amber-400/90",
      label: "Stale Telemetry (>1m old)",
    },
    unavailable: {
      dotClass: "bg-rose-500",
      textClass: "text-rose-400",
      label: "Telemetry Stalled / Unavailable",
    },
  };

  const config = statusConfig[derivedStatus] || statusConfig.unavailable;

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-label={`${config.label}: ${formattedTime}`}
      title={`${config.label}: ${formattedTime}`}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-mono font-medium",
        config.textClass,
        className
      )}
    >
      <span
        className={cn("h-2 w-2 rounded-full ring-2 ring-slate-900", config.dotClass)}
        aria-hidden="true"
      />
      {showIcon && (
        derivedStatus === "unavailable" ? (
          <AlertCircle className="h-3 w-3 text-rose-400" aria-hidden="true" />
        ) : (
          <Clock className="h-3 w-3 text-slate-500" aria-hidden="true" />
        )
      )}
      <span>{formattedTime}</span>
    </div>
  );
}
