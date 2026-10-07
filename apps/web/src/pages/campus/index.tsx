import * as React from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StaleDataBanner } from "@/components/ui/stale-data-banner";
import { Alert } from "@/components/ui/alert";
import { DataProvenanceBadge } from "@/components/ui/data-provenance-badge";
import { campusService, CampusConditionsResponse } from "@/services/campus-service";
import {
  CampusOverview,
  LocationRanking,
  FreshnessIndicator,
  rankMostCrowded,
  rankWeakestConnectivity,
  SimulationScenario,
  OccupancySnapshot,
  ConnectivitySnapshot,
  OccupancyStatus,
  ConnectivityQuality,
} from "@/features/tanisha/live-campus";
import { DataMode, LocationCondition } from "@ezykwelez/shared";
import {
  BarChart3,
  Building2,
  Filter,
  Layers,
  LayoutGrid,
  Radio,
  RotateCcw,
  Search,
  Users,
  Wifi,
} from "lucide-react";

export default function CampusPage() {
  const [data, setData] = React.useState<CampusConditionsResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = React.useState<Date>(new Date());

  // Interactive Scenario Simulator state
  const [scenario, setScenario] = React.useState<SimulationScenario>("normal");

  // Search and Filter states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selectedZone, setSelectedZone] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "schematic" | "rankings">("grid");

  const fetchData = React.useCallback(
    async (selectedScenario?: SimulationScenario) => {
      try {
        setError(null);
        const res = await campusService.getConditions(selectedScenario || scenario);
        setData(res);
        setLastRefreshed(new Date());
      } catch (err: any) {
        setError(err.message || "Failed to load campus facilities and telemetry.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [scenario]
  );

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const handleScenarioChange = (newScenario: SimulationScenario) => {
    setScenario(newScenario);
    setIsRefreshing(true);
    fetchData(newScenario);
  };

  // Convert locations to Tanisha snapshots for pure ranking derivations
  const occupancySnapshots: OccupancySnapshot[] = React.useMemo(() => {
    if (!data?.locations) return [];
    return data.locations.map((loc) => {
      const currentCount = loc.occupancy.headcount ?? loc.occupancy.currentStudents ?? 0;
      const statusNormalized = (loc.occupancy.status || "low")
        .toLowerCase()
        .replace(" ", "_") as OccupancyStatus;
      const zone =
        (loc.location.metadata?.zone as string) ||
        (loc.location.name.includes("Block B")
          ? "Zone C - Science & Tech"
          : loc.location.name.includes("Block C")
          ? "Zone A - Academic Quad"
          : loc.location.name.includes("Library")
          ? "Zone A - Academic Quad"
          : "Zone B - Student Commons");

      return {
        id: loc.location.id,
        name: loc.location.name,
        currentCount,
        capacity: loc.occupancy.capacity,
        percentage: loc.occupancy.occupancyPercentage,
        status: statusNormalized,
        measuredAt: loc.occupancy.updatedAt,
        dataMode: (data.dataMode as any) || "simulated",
        zone,
      };
    });
  }, [data]);

  const connectivitySnapshots: ConnectivitySnapshot[] = React.useMemo(() => {
    if (!data?.locations) return [];
    return data.locations.map((loc) => {
      const qualityNormalized = (loc.connectivity.quality || "good")
        .toLowerCase()
        .replace(" ", "_") as ConnectivityQuality;
      const zone =
        (loc.location.metadata?.zone as string) ||
        (loc.location.name.includes("Block B")
          ? "Zone C - Science & Tech"
          : loc.location.name.includes("Block C")
          ? "Zone A - Academic Quad"
          : loc.location.name.includes("Library")
          ? "Zone A - Academic Quad"
          : "Zone B - Student Commons");

      return {
        id: loc.location.id,
        name: loc.location.name,
        signalScore: loc.connectivity.signalScore,
        signalDbm: loc.connectivity.dbm,
        networkName: loc.connectivity.networkName,
        measuredAt: loc.connectivity.updatedAt,
        dataMode: (data.dataMode as any) || "simulated",
        quality: qualityNormalized,
        zone,
      };
    });
  }, [data]);

  // Derived Top 5 Rankings using centralized domain calculations
  const mostCrowded = React.useMemo(() => {
    return rankMostCrowded(occupancySnapshots, 5);
  }, [occupancySnapshots]);

  const weakestConnectivity = React.useMemo(() => {
    return rankWeakestConnectivity(connectivitySnapshots, 5);
  }, [connectivitySnapshots]);

  // Overview metrics derived for CampusOverview component
  const overviewMetrics = React.useMemo(() => {
    if (!data?.summary || !data?.locations) return null;
    const busyCount = data.locations.filter((l) => {
      const s = (l.occupancy.status || "").toLowerCase();
      return s.includes("busy") || s === "over_capacity";
    }).length;

    const lowConnCount = data.locations.filter((l) => {
      const q = (l.connectivity.quality || "").toLowerCase();
      return q.includes("weak") || l.connectivity.signalScore < 40;
    }).length;

    return {
      totalStudentsTracked: data.summary.totalOccupancy,
      busyLocationsCount: busyCount,
      lowConnectivityCount: lowConnCount,
      locationsMonitored: data.summary.totalLocations,
      totalCapacityTracked: data.summary.totalCapacity,
      averageOccupancyPercentage: Math.round(data.summary.averageOccupancyRate * 10) / 10,
      averageSignalScore: Math.round(data.summary.overallSignalScore),
    };
  }, [data]);

  // Detected Zones list
  const availableZones = React.useMemo(() => {
    const zones = new Set<string>();
    occupancySnapshots.forEach((o) => o.zone && zones.add(o.zone));
    return Array.from(zones);
  }, [occupancySnapshots]);

  // Filtered locations list for grid/schematic display
  const filteredLocations = React.useMemo(() => {
    if (!data?.locations) return [];
    return data.locations.filter((loc) => {
      const zone =
        (loc.location.metadata?.zone as string) ||
        (loc.location.name.includes("Block B")
          ? "Zone C - Science & Tech"
          : loc.location.name.includes("Block C")
          ? "Zone A - Academic Quad"
          : loc.location.name.includes("Library")
          ? "Zone A - Academic Quad"
          : "Zone B - Student Commons");

      const matchesQuery =
        searchQuery === "" ||
        loc.location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.location.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        zone.toLowerCase().includes(searchQuery.toLowerCase());

      const locStatus = (loc.occupancy.status || "").toLowerCase();
      const matchesStatus =
        statusFilter === "all" ||
        locStatus === statusFilter.toLowerCase() ||
        (statusFilter === "busy" && (locStatus === "busy" || locStatus === "very busy"));

      const matchesZone = selectedZone === "all" || zone === selectedZone;

      return matchesQuery && matchesStatus && matchesZone;
    });
  }, [data, searchQuery, statusFilter, selectedZone]);

  // Group locations by Building for schematic cluster view
  const groupedByBuilding = React.useMemo(() => {
    const groups: Record<string, LocationCondition[]> = {};
    for (const loc of filteredLocations) {
      const bldg = loc.location.name.includes("Block B")
        ? "Ramanujan Science Block B"
        : loc.location.name.includes("Block C")
        ? "Ramanujan Block C"
        : loc.location.name.includes("Library")
        ? "Central Knowledge Complex"
        : loc.location.name.includes("Canteen")
        ? "Student Amenities Zone"
        : "Main Campus Grounds";
      groups[bldg] = groups[bldg] || [];
      groups[bldg].push(loc);
    }
    return groups;
  }, [filteredLocations]);

  // Honest Data Mode indicator
  const isSimulated =
    Boolean(data?.isFallback) ||
    scenario !== "normal" ||
    data?.dataMode === DataMode.SIMULATED ||
    data?.dataMode === "simulated";

  const activeDataMode = isSimulated ? DataMode.SIMULATED : DataMode.LIVE;

  return (
    <AppLayout
      title="Campus Intelligence & Telemetry"
      description="Continuous operational telemetry tracking room-level occupancy percentages, capacity thresholds, and network connectivity quality."
      dataMode={activeDataMode}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      lastRefreshed={lastRefreshed}
    >
      <PageHeader
        title="Campus Intelligence & Telemetry"
        description="Unified operational view tracking facility headcounts, live Wi-Fi signal scores, and load congestion rankings."
        breadcrumbs={[{ label: "Campus Intelligence" }]}
        badge={<DataProvenanceBadge mode={activeDataMode} />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Scenario Selector Controls */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1">
                <Radio className="w-3 h-3 text-blue-400" /> Scenario:
              </span>
              {(["normal", "peak_rush", "outage_scenario"] as SimulationScenario[]).map((scen) => (
                <button
                  key={scen}
                  type="button"
                  onClick={() => handleScenarioChange(scen)}
                  className={`px-2 py-1 rounded text-[11px] font-medium capitalize transition-colors ${
                    scenario === scen
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {scen === "normal" ? "Normal" : scen === "peak_rush" ? "Peak Rush" : "Outage"}
                </button>
              ))}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="gap-1.5 text-xs h-7 px-2.5"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Grid
              </Button>
              <Button
                variant={viewMode === "schematic" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("schematic")}
                className="gap-1.5 text-xs h-7 px-2.5"
              >
                <Layers className="w-3.5 h-3.5" />
                Schematic
              </Button>
              <Button
                variant={viewMode === "rankings" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("rankings")}
                className="gap-1.5 text-xs h-7 px-2.5"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Rankings
              </Button>
            </div>
          </div>
        }
      />

      {/* Honest Demo / Offline Mode Banner */}
      {data?.isFallback && (
        <Alert variant="info" title="Offline Demo Mode Active" className="mb-6">
          Live FastAPI backend connection offline — showing deterministic simulated campus telemetry.
          All calculations, rankings, and drill-down views remain fully interactive.
        </Alert>
      )}

      {scenario !== "normal" && (
        <Alert variant="warning" title={`Simulated Scenario: ${scenario.replace("_", " ").toUpperCase()}`} className="mb-6">
          Displaying simulated telemetry under the &quot;{scenario}&quot; condition. Real telemetry is suspended during scenario drills.
        </Alert>
      )}

      {/* Telemetry Staleness Banner */}
      <StaleDataBanner lastUpdated={lastRefreshed} thresholdMinutes={15} className="mb-6" />

      {/* Campus Overview KPI Cards */}
      <div className="mb-6">
        <CampusOverview metrics={overviewMetrics} isLoading={isLoading} />
      </div>

      {/* Search and Multi-Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search facility name or room code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Zone Filter */}
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

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Load:
            </span>
            {["all", "low", "moderate", "busy", "very busy"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium capitalize whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Relative Freshness Timestamp */}
        <div className="shrink-0 text-xs">
          <FreshnessIndicator measuredAt={lastRefreshed} />
        </div>
      </div>

      {/* Main Content Areas */}
      {error && !data ? (
        <Card className="p-8 text-center bg-rose-950/20 border-rose-900/60 space-y-3">
          <p className="text-sm text-rose-300 font-semibold">{error}</p>
          <Button variant="secondary" size="sm" onClick={handleRefresh} className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Retry Connection
          </Button>
        </Card>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : viewMode === "rankings" ? (
        /* Standalone Rankings Section */
        <div className="space-y-6">
          <LocationRanking mostCrowded={mostCrowded} weakestConnectivity={weakestConnectivity} />
        </div>
      ) : filteredLocations.length === 0 ? (
        <EmptyState
          title="No Matching Facilities Found"
          description="No campus locations match your current search query or filter criteria."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery("");
            setStatusFilter("all");
            setSelectedZone("all");
          }}
        />
      ) : viewMode === "grid" ? (
        /* Grid Layout with Full Telemetry and Direct Drill-down */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLocations.map((loc) => {
              const headcount = loc.occupancy.headcount ?? loc.occupancy.currentStudents ?? 0;
              const occupancyRate =
                loc.occupancy.capacity > 0 ? (headcount / loc.occupancy.capacity) * 100 : 0;
              const zone =
                (loc.location.metadata?.zone as string) ||
                (loc.location.name.includes("Block B")
                  ? "Zone C - Science & Tech"
                  : loc.location.name.includes("Block C")
                  ? "Zone A - Academic Quad"
                  : "Zone B - Student Commons");

              return (
                <Link
                  key={loc.location.id}
                  href={`/campus/${loc.location.id}`}
                  className="group block focus:outline-none"
                >
                  <Card className="h-full hover:border-blue-600/60 transition-all hover:bg-slate-900/90 flex flex-col justify-between p-5 border-slate-800 shadow-md">
                    <div>
                      {/* Top Bar: Name, Zone & Occupancy Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <CardTitle className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {loc.location.name}
                          </CardTitle>
                          <CardDescription className="font-mono text-[11px] text-slate-400">
                            {loc.location.code || "LOC"} • {zone}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            loc.occupancy.status === "Low"
                              ? "low"
                              : loc.occupancy.status === "Moderate"
                              ? "moderate"
                              : loc.occupancy.status === "Busy"
                              ? "warning"
                              : "critical"
                          }
                          size="sm"
                        >
                          {loc.occupancy.status}
                        </Badge>
                      </div>

                      {/* Headcount Gauge */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-300">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Users className="w-3.5 h-3.5 text-blue-400" /> Occupancy Headcount
                          </span>
                          <span className="font-mono font-semibold">
                            {headcount} / {loc.occupancy.capacity}{" "}
                            <span className="text-slate-400 font-normal">
                              ({occupancyRate.toFixed(0)}%)
                            </span>
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              occupancyRate > 90
                                ? "bg-red-500"
                                : occupancyRate > 75
                                ? "bg-amber-500"
                                : "bg-blue-500"
                            }`}
                            style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Connectivity & Telemetry Specs */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-3 mt-3 border-t border-slate-800/80">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Wi-Fi Quality</span>
                          <span className="font-medium text-slate-200 flex items-center gap-1 mt-0.5">
                            <Wifi className="w-3 h-3 text-cyan-400" />
                            {loc.connectivity.quality}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Signal Score</span>
                          <span className="font-mono font-medium text-slate-200 block mt-0.5">
                            {loc.connectivity.signalScore}/100{" "}
                            {loc.connectivity.dbm ? (
                              <span className="text-[10px] text-slate-500 font-normal">
                                ({loc.connectivity.dbm} dBm)
                              </span>
                            ) : null}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Freshness and Details CTA */}
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <FreshnessIndicator measuredAt={loc.occupancy.updatedAt} />
                      <span className="text-[11px] text-blue-400 group-hover:underline font-medium">
                        Facility Details →
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Embedded Rankings Summary at Bottom of Grid */}
          <div className="pt-6 border-t border-slate-800/80">
            <LocationRanking mostCrowded={mostCrowded} weakestConnectivity={weakestConnectivity} />
          </div>
        </div>
      ) : (
        /* Schematic Building Cluster View */
        <div className="space-y-6">
          {Object.entries(groupedByBuilding).map(([buildingName, locations]) => (
            <Card key={buildingName} className="border-slate-800 shadow-lg overflow-hidden">
              <CardHeader className="bg-slate-900/60 border-b border-slate-800/80 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <CardTitle className="text-sm font-semibold">{buildingName}</CardTitle>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {locations.length} rooms / facility zones
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {locations.map((loc) => {
                    const headcount = loc.occupancy.headcount ?? loc.occupancy.currentStudents ?? 0;
                    return (
                      <Link
                        key={loc.location.id}
                        href={`/campus/${loc.location.id}`}
                        className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-blue-600/50 hover:bg-slate-900 transition-colors flex items-center justify-between gap-3 group"
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-medium text-white group-hover:text-blue-400 transition-colors block">
                            {loc.location.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {headcount} / {loc.occupancy.capacity} students • {loc.connectivity.quality} Wi-Fi
                          </span>
                        </div>
                        <Badge
                          variant={
                            loc.occupancy.status === "Low"
                              ? "low"
                              : loc.occupancy.status === "Moderate"
                              ? "moderate"
                              : "warning"
                          }
                          size="sm"
                        >
                          {loc.occupancy.status}
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
