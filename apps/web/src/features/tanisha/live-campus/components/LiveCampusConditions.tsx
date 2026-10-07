/**
 * Live Campus Conditions Master Component
 * Feature Owner: Tanisha
 * Module: @/features/tanisha/live-campus
 *
 * Self-contained, reusable operational conditions module.
 * Designed to be embedded into the operator command center or recovery analysis views.
 */

import * as React from "react";
import {
  Activity,
  RefreshCw,
  Search,
  Filter,
  AlertOctagon,
  Layers,
  Users,
  Wifi,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { useLiveCampusConditions } from "../hooks/useLiveCampusConditions";
import { DataStatusBadge } from "./DataStatusBadge";
import { FreshnessIndicator } from "./FreshnessIndicator";
import { CampusOverview } from "./CampusOverview";
import { OccupancyCard } from "./OccupancyCard";
import { ConnectivityCard } from "./ConnectivityCard";
import { LocationRanking } from "./LocationRanking";
import { SimulationScenario } from "../lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface LiveCampusConditionsProps {
  className?: string;
  initialScenario?: SimulationScenario;
  showScenarioSelector?: boolean;
  enablePolling?: boolean;
}

export function LiveCampusConditions({
  className,
  initialScenario = "normal",
  showScenarioSelector = true,
  enablePolling = false,
}: LiveCampusConditionsProps) {
  const {
    data,
    overview,
    mostCrowded,
    weakestConnectivity,
    isLoading,
    isRefreshing,
    isError,
    errorMessage,
    isStale,
    isSimulated,
    scenario,
    setScenario,
    refetch,
    freshness,
  } = useLiveCampusConditions({
    initialScenario,
    enablePolling,
  });

  // Local filter states
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedZone, setSelectedZone] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"all" | "occupancy" | "connectivity" | "rankings">("all");

  // Extract unique zones for filtering
  const availableZones = React.useMemo(() => {
    if (!data) return [];
    const zones = new Set<string>();
    data.occupancy.forEach((o) => o.zone && zones.add(o.zone));
    data.connectivity.forEach((c) => c.zone && zones.add(c.zone));
    return Array.from(zones);
  }, [data]);

  // Filtered lists
  const filteredOccupancy = React.useMemo(() => {
    if (!data?.occupancy) return [];
    return data.occupancy.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.zone && item.zone.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesZone = selectedZone === "all" || item.zone === selectedZone;
      return matchesSearch && matchesZone;
    });
  }, [data?.occupancy, searchQuery, selectedZone]);

  const filteredConnectivity = React.useMemo(() => {
    if (!data?.connectivity) return [];
    return data.connectivity.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.networkName && item.networkName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.zone && item.zone.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesZone = selectedZone === "all" || item.zone === selectedZone;
      return matchesSearch && matchesZone;
    });
  }, [data?.connectivity, searchQuery, selectedZone]);

  const hasActiveFilters = searchQuery !== "" || selectedZone !== "all";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedZone("all");
  };

  return (
    <div
      role="region"
      aria-label="Live Campus Conditions Module"
      className={cn("space-y-6 max-w-7xl mx-auto", className)}
    >
      {/* Module Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-950/80 border border-blue-800/60 text-blue-400">
              <Activity className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Live Campus Conditions
            </h2>
            <DataStatusBadge mode={data?.dataMode || "simulated"} />
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time telemetry of student density, room occupancy, and network signal distribution.
          </p>
        </div>

        {/* Controls: Freshness, Scenario Switcher, Refresh Button */}
        <div className="flex flex-wrap items-center gap-3">
          <FreshnessIndicator measuredAt={data?.generatedAt} status={freshness} />

          {showScenarioSelector && (
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-lg p-1 text-xs">
              <span className="text-[10px] font-mono uppercase text-slate-400 px-2 font-medium">
                Scenario:
              </span>
              <select
                aria-label="Select simulation scenario"
                value={scenario}
                onChange={(e) => setScenario(e.target.value as SimulationScenario)}
                className="bg-slate-900 text-slate-200 border border-slate-700/80 rounded px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="normal">Normal Operations</option>
                <option value="peak_rush">Peak Class Rush</option>
                <option value="outage_scenario">Building B Outage (Simulation)</option>
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={refetch}
            disabled={isRefreshing || isLoading}
            aria-label="Refresh telemetry snapshot"
            title="Refresh telemetry snapshot"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin text-blue-400")}
              aria-hidden="true"
            />
            <span>{isRefreshing ? "Updating..." : "Refresh"}</span>
          </button>
        </div>
      </header>

      {/* Stale Warning Banner */}
      {isStale && (
        <div
          role="alert"
          className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
          <div className="flex-1">
            <strong>Stale Telemetry Notice:</strong> Sensor snapshots are older than 1 minute. Conditions may not reflect immediate campus movements.
          </div>
          <button
            type="button"
            onClick={refetch}
            className="px-2.5 py-1 rounded bg-amber-900/60 hover:bg-amber-800/80 text-amber-200 font-semibold border border-amber-700/50 text-[11px] transition-colors shrink-0"
          >
            Refetch Telemetry
          </button>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Card className="bg-rose-950/30 border-rose-800/70 p-6 text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-rose-950/80 border border-rose-700 text-rose-400">
              <AlertOctagon className="h-8 w-8" aria-hidden="true" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-white">Telemetry Service Offline</h3>
          <p className="text-xs text-rose-300 max-w-md mx-auto">
            {errorMessage || "Unable to retrieve live campus telemetry. Check backend connection or switch to simulated mode."}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={refetch}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-900 hover:bg-rose-800 text-white text-xs font-semibold transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Retry Connection
            </button>
          </div>
        </Card>
      )}

      {/* Overview Metrics Cards */}
      <CampusOverview metrics={overview} isLoading={isLoading} />

      {/* Navigation Tabs & Search / Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setViewMode("all")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap",
              viewMode === "all" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            <span>All Views</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("occupancy")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap",
              viewMode === "occupancy" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Occupancy ({filteredOccupancy.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("connectivity")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap",
              viewMode === "connectivity" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Connectivity ({filteredConnectivity.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("rankings")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap",
              viewMode === "rankings" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Rankings</span>
          </button>
        </div>

        {/* Search and Zone Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
            <input
              type="search"
              aria-label="Search locations by name or zone"
              placeholder="Search location or zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {availableZones.length > 0 && (
            <div className="relative">
              <select
                aria-label="Filter by campus zone"
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="bg-slate-900 text-slate-300 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">All Zones</option>
                {availableZones.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Empty State when filters return no results */}
      {hasActiveFilters && filteredOccupancy.length === 0 && filteredConnectivity.length === 0 && (
        <Card className="bg-slate-900/60 border-slate-800 p-8 text-center space-y-3">
          <Search className="h-8 w-8 text-slate-500 mx-auto" aria-hidden="true" />
          <h4 className="text-base font-semibold text-white">No Matching Locations</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No campus locations matched your query &quot;{searchQuery}&quot; in zone &quot;{selectedZone}&quot;.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Clear Search & Filters
          </button>
        </Card>
      )}

      {/* Main Content Area based on View Mode */}

      {/* Rankings View or Embedded in All */}
      {(viewMode === "all" || viewMode === "rankings") && (
        <section aria-label="Campus Rankings Section" className="pt-2">
          <LocationRanking
            mostCrowded={mostCrowded}
            weakestConnectivity={weakestConnectivity}
          />
        </section>
      )}

      {/* Occupancy Grid */}
      {(viewMode === "all" || viewMode === "occupancy") && filteredOccupancy.length > 0 && (
        <section aria-label="Occupancy Telemetry Section" className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" aria-hidden="true" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Student Occupancy by Location
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {filteredOccupancy.length} locations monitored
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOccupancy.map((occ) => (
              <OccupancyCard key={occ.id} snapshot={occ} />
            ))}
          </div>
        </section>
      )}

      {/* Connectivity Grid */}
      {(viewMode === "all" || viewMode === "connectivity") && filteredConnectivity.length > 0 && (
        <section aria-label="Connectivity Telemetry Section" className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-emerald-400" aria-hidden="true" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Campus Signal Strength & Network Quality
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {filteredConnectivity.length} access zones
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConnectivity.map((conn) => (
              <ConnectivityCard key={conn.id} snapshot={conn} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
