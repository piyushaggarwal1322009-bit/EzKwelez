import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock } from "lucide-react";

interface StaleDataBannerProps {
  lastUpdated?: string | Date;
  thresholdMinutes?: number;
  className?: string;
}

export function StaleDataBanner({
  lastUpdated,
  thresholdMinutes = 15,
  className,
}: StaleDataBannerProps) {
  const getMinutesAgo = () => {
    if (!lastUpdated) return null;
    const updateTime = new Date(lastUpdated).getTime();
    const now = Date.now();
    return Math.floor((now - updateTime) / (1000 * 60));
  };

  const minutesAgo = getMinutesAgo();
  const isStale = minutesAgo !== null && minutesAgo >= thresholdMinutes;

  if (!isStale) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 px-3.5 py-2 rounded-lg border border-amber-800/80 bg-amber-950/40 text-amber-200 text-xs",
        className
      )}
    >
      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
      <span className="font-semibold">Telemetry Stale:</span>
      <span>
        Last telemetry update was {minutesAgo} minutes ago (exceeds {thresholdMinutes}m threshold). Values may not reflect live conditions.
      </span>
      <Clock className="w-3.5 h-3.5 text-amber-400/70 ml-auto shrink-0" />
    </div>
  );
}
