/**
 * Location Ranking Component
 * Feature Owner: Tanisha
 * Module: @/features/tanisha/live-campus
 *
 * NOTE: Rankings are strictly computed by domain calculation functions and never hardcoded.
 */

import * as React from "react";
import { Flame, WifiOff, Award, ChevronRight } from "lucide-react";
import { RankedOccupancy, RankedConnectivity } from "../types/campus";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface LocationRankingProps {
  mostCrowded: RankedOccupancy[];
  weakestConnectivity: RankedConnectivity[];
  className?: string;
}

export function LocationRanking({
  mostCrowded,
  weakestConnectivity,
  className,
}: LocationRankingProps) {
  const [activeTab, setActiveTab] = React.useState<"both" | "crowded" | "connectivity">("both");

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" aria-hidden="true" />
            <span>Campus Operational Rankings</span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time computed priority lists for operational intervention
          </p>
        </div>

        {/* View switcher on smaller screens */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("both")}
            className={cn(
              "px-2.5 py-1 rounded transition-colors hidden sm:block",
              activeTab === "both" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            )}
          >
            Side by Side
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("crowded")}
            className={cn(
              "px-2.5 py-1 rounded transition-colors",
              activeTab === "crowded" ? "bg-slate-800 text-amber-300 shadow-sm" : "text-slate-400 hover:text-slate-200"
            )}
          >
            Most Crowded
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("connectivity")}
            className={cn(
              "px-2.5 py-1 rounded transition-colors",
              activeTab === "connectivity" ? "bg-slate-800 text-rose-300 shadow-sm" : "text-slate-400 hover:text-slate-200"
            )}
          >
            Weakest Signal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Crowded Section */}
        {(activeTab === "both" || activeTab === "crowded") && (
          <Card className="bg-slate-900/70 border-slate-800 shadow-lg">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-amber-950/60 border border-amber-800/50 text-amber-400">
                    <Flame className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-white">Most Crowded Locations</CardTitle>
                    <CardDescription className="text-xs">Ranked by capacity utilization %</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono text-amber-400 border-amber-800/50">
                  Capacity Pressure
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-3 divide-y divide-slate-800/60">
              {mostCrowded.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No occupancy records available</p>
              ) : (
                mostCrowded.map(({ rank, snapshot }) => {
                  const isTopRank = rank === 1;
                  const isHigh = snapshot.percentage >= 85;

                  return (
                    <div
                      key={snapshot.id}
                      className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={cn(
                            "flex items-center justify-center h-6 w-6 rounded-full font-mono text-xs font-bold shrink-0",
                            isTopRank
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : "bg-slate-800 text-slate-400 border border-slate-700/50"
                          )}
                        >
                          #{rank}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
                            {snapshot.name}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {snapshot.currentCount} / {snapshot.capacity} students
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span
                            className={cn(
                              "font-mono text-xs font-bold",
                              isHigh ? "text-amber-400" : "text-slate-300"
                            )}
                          >
                            {snapshot.percentage}%
                          </span>
                        </div>
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              snapshot.percentage > 90
                                ? "bg-rose-500"
                                : snapshot.percentage >= 75
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            )}
                            style={{ width: `${Math.min(100, snapshot.percentage)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        )}

        {/* Weakest Connectivity Section */}
        {(activeTab === "both" || activeTab === "connectivity") && (
          <Card className="bg-slate-900/70 border-slate-800 shadow-lg">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-rose-950/60 border border-rose-800/50 text-rose-400">
                    <WifiOff className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-white">Weakest Connectivity</CardTitle>
                    <CardDescription className="text-xs">Ranked by lowest signal score</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono text-rose-400 border-rose-800/50">
                  Signal Degradation
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-3 divide-y divide-slate-800/60">
              {weakestConnectivity.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No connectivity records available</p>
              ) : (
                weakestConnectivity.map(({ rank, snapshot }) => {
                  const isTopRank = rank === 1;
                  const isWeak = snapshot.signalScore < 40;

                  return (
                    <div
                      key={snapshot.id}
                      className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={cn(
                            "flex items-center justify-center h-6 w-6 rounded-full font-mono text-xs font-bold shrink-0",
                            isTopRank
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                              : "bg-slate-800 text-slate-400 border border-slate-700/50"
                          )}
                        >
                          #{rank}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
                            {snapshot.name}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono truncate">
                            {snapshot.networkName || "CAMPUS-NETWORK"} {snapshot.signalDbm ? `(${snapshot.signalDbm} dBm)` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span
                            className={cn(
                              "font-mono text-xs font-bold",
                              isWeak ? "text-rose-400" : "text-slate-300"
                            )}
                          >
                            {snapshot.signalScore}/100
                          </span>
                        </div>
                        <Badge
                          variant={
                            snapshot.quality === "excellent" || snapshot.quality === "good"
                              ? "success"
                              : snapshot.quality === "fair"
                              ? "warning"
                              : "critical"
                          }
                          className="text-[10px] py-0 px-1.5 font-mono capitalize"
                        >
                          {snapshot.quality.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
