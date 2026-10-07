import * as React from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { StaleDataBanner } from "@/components/ui/stale-data-banner";
import { campusService, CampusConditionsResponse } from "@/services/campus-service";
import { DataMode, LocationCondition, OccupancyStatus } from "@ezykwelez/shared";
import {
  Building2,
  Filter,
  Grid,
  Layers,
  LayoutGrid,
  Search,
  Users,
  Wifi,
  Zap,
} from "lucide-react";

export default function CampusPage() {
  const [data, setData] = React.useState<CampusConditionsResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = React.useState<Date>(new Date());

  // Filter states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "schematic">("grid");

  const fetchData = async () => {
    try {
      setError(null);
      const res = await campusService.getConditions();
      setData(res);
      setLastRefreshed(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to load campus facilities and conditions.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const filteredLocations = React.useMemo(() => {
    if (!data?.locations) return [];
    return data.locations.filter((loc) => {
      const matchesQuery =
        loc.location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.location.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.location.type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || loc.occupancy.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesQuery && matchesStatus;
    });
  }, [data, searchQuery, statusFilter]);

  // Group locations by Building for schematic view
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

  return (
    <AppLayout
      title="Campus Facilities & Live Conditions"
      description="Monitor live occupancy headcount, Wi-Fi connectivity scores, and room states across campus buildings."
      dataMode={data?.dataMode as DataMode || DataMode.SIMULATED}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      lastRefreshed={lastRefreshed}
    >
      <PageHeader
        title="Campus Facilities & Conditions"
        description="Continuous operational telemetry tracking room-level occupancy percentages, capacity thresholds, and network connectivity quality."
        breadcrumbs={[{ label: "Campus Facilities" }]}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="gap-1.5 text-xs h-7 px-2.5"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Grid View
              </Button>
              <Button
                variant={viewMode === "schematic" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("schematic")}
                className="gap-1.5 text-xs h-7 px-2.5"
              >
                <Layers className="w-3.5 h-3.5" />
                Building Schematic
              </Button>
            </div>
          </div>
        }
      />

      <StaleDataBanner lastUpdated={lastRefreshed} thresholdMinutes={15} className="mb-6" />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search facility name or room code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Load:
          </span>
          {["all", "low", "moderate", "busy", "very busy"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize whitespace-nowrap transition-colors ${
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

      {error ? (
        <ErrorState title="Telemetry Stream Failed" message={error} onRetry={handleRefresh} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : filteredLocations.length === 0 ? (
        <EmptyState
          title="No Matching Facilities Found"
          description="No campus locations match your current search query or load status filter."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery("");
            setStatusFilter("all");
          }}
        />
      ) : viewMode === "grid" ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLocations.map((loc) => {
            const headcount = loc.occupancy.headcount ?? loc.occupancy.currentStudents ?? 0;
            const occupancyRate = loc.occupancy.capacity > 0 ? (headcount / loc.occupancy.capacity) * 100 : 0;
            return (
              <Link
                key={loc.location.id}
                href={`/campus/${loc.location.id}`}
                className="group"
              >
                <Card className="h-full hover:border-slate-700 transition-all hover:bg-slate-900/90 flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-sm group-hover:text-blue-400 transition-colors">
                          {loc.location.name}
                        </CardTitle>
                        <CardDescription className="font-mono text-[11px] mt-0.5">
                          {loc.location.code || "LOC-GENERAL"} • {loc.location.type}
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
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Headcount Gauge */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Users className="w-3.5 h-3.5" /> Occupancy
                        </span>
                        <span className="font-mono font-semibold">
                          {headcount} / {loc.occupancy.capacity}{" "}
                          <span className="text-slate-400 font-normal">({occupancyRate.toFixed(0)}%)</span>
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

                    {/* Connectivity & Metadata row */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
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
                          {loc.connectivity.signalScore}/100
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Schematic Building Cluster View */
        <div className="space-y-6">
          {Object.entries(groupedByBuilding).map(([buildingName, locations]) => (
            <Card key={buildingName} className="border-slate-800">
              <CardHeader className="bg-slate-900/40 border-b border-slate-800/80 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <CardTitle className="text-sm font-semibold">{buildingName}</CardTitle>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{locations.length} rooms / zones</span>
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
                        className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-medium text-white block">{loc.location.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {headcount} / {loc.occupancy.capacity} students
                          </span>
                        </div>
                        <Badge variant={loc.occupancy.status === "Low" ? "low" : loc.occupancy.status === "Moderate" ? "moderate" : "warning"} size="sm">
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
