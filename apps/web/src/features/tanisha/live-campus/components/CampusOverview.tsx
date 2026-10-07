/**
 * Campus Overview Metrics Component
 * Feature Owner: Tanisha
 * Module: @/features/tanisha/live-campus
 */

import * as React from "react";
import { Users, Flame, WifiOff, MapPin, Activity, ShieldAlert } from "lucide-react";
import { CampusOverviewMetrics } from "../types/campus";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface CampusOverviewProps {
  metrics: CampusOverviewMetrics | null;
  isLoading?: boolean;
  className?: string;
}

export function CampusOverview({
  metrics,
  isLoading = false,
  className,
}: CampusOverviewProps) {
  if (isLoading) {
    return (
      <section
        aria-label="Campus overview metrics loading"
        className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}
      >
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse bg-slate-900/40 border-slate-800/80 p-5">
            <div className="h-4 w-24 bg-slate-800 rounded mb-3" />
            <div className="h-8 w-16 bg-slate-700 rounded mb-2" />
            <div className="h-3 w-32 bg-slate-800 rounded" />
          </Card>
        ))}
      </section>
    );
  }

  if (!metrics) {
    return null;
  }

  const cards = [
    {
      id: "students-tracked",
      title: "Students Tracked",
      value: metrics.totalStudentsTracked.toLocaleString(),
      subtitle: `${metrics.averageOccupancyPercentage}% avg campus load`,
      caption: `of ${metrics.totalCapacityTracked.toLocaleString()} capacity`,
      icon: Users,
      iconColor: "text-blue-400 bg-blue-950/60 border-blue-800/50",
      accent: metrics.averageOccupancyPercentage > 85 ? "text-amber-400" : "text-blue-400",
      badgeText: "Real-time Aggregate",
      badgeVariant: "default" as const,
    },
    {
      id: "busy-locations",
      title: "Busy Locations",
      value: metrics.busyLocationsCount.toString(),
      subtitle: metrics.busyLocationsCount === 0 ? "No congested areas" : `${metrics.busyLocationsCount} high-density zones`,
      caption: ">= 75% capacity load",
      icon: Flame,
      iconColor:
        metrics.busyLocationsCount > 0
          ? "text-amber-400 bg-amber-950/60 border-amber-800/50"
          : "text-emerald-400 bg-emerald-950/60 border-emerald-800/50",
      accent: metrics.busyLocationsCount > 0 ? "text-amber-400" : "text-emerald-400",
      badgeText: metrics.busyLocationsCount > 0 ? "Elevated Pressure" : "Nominal",
      badgeVariant: metrics.busyLocationsCount > 0 ? ("warning" as const) : ("success" as const),
    },
    {
      id: "low-connectivity",
      title: "Low Signal Zones",
      value: metrics.lowConnectivityCount.toString(),
      subtitle:
        metrics.lowConnectivityCount === 0
          ? "Full mesh coverage"
          : `${metrics.lowConnectivityCount} degraded Wi-Fi zones`,
      caption: "< 40 / 100 signal score",
      icon: WifiOff,
      iconColor:
        metrics.lowConnectivityCount > 0
          ? "text-rose-400 bg-rose-950/60 border-rose-800/50"
          : "text-emerald-400 bg-emerald-950/60 border-emerald-800/50",
      accent: metrics.lowConnectivityCount > 0 ? "text-rose-400" : "text-emerald-400",
      badgeText: metrics.lowConnectivityCount > 0 ? "Degraded" : "Optimal",
      badgeVariant: metrics.lowConnectivityCount > 0 ? ("critical" as const) : ("success" as const),
    },
    {
      id: "monitored-locations",
      title: "Locations Monitored",
      value: metrics.locationsMonitored.toString(),
      subtitle: `${metrics.averageSignalScore}/100 avg campus signal`,
      caption: "Telemetry active",
      icon: MapPin,
      iconColor: "text-emerald-400 bg-emerald-950/60 border-emerald-800/50",
      accent: "text-emerald-400",
      badgeText: "Active Coverage",
      badgeVariant: "outline" as const,
    },
  ];

  return (
    <section
      aria-label="Campus overview metrics"
      className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.id}
            className="relative overflow-hidden bg-slate-900/70 border-slate-800/90 p-5 hover:border-slate-700/80 transition-colors shadow-lg"
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <div
                className={cn(
                  "p-2 rounded-lg border",
                  card.iconColor
                )}
                aria-hidden="true"
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-extrabold tracking-tight text-white">
                {card.value}
              </span>
              <Badge variant={card.badgeVariant} className="text-[10px] py-0 px-1.5 font-mono">
                {card.badgeText}
              </Badge>
            </div>

            <div className="mt-2 flex flex-col gap-0.5 text-xs text-slate-400">
              <span className="font-medium text-slate-300">{card.subtitle}</span>
              <span className="text-[11px] text-slate-500">{card.caption}</span>
            </div>
          </Card>
        );
      })}
    </section>
  );
}
