/**
 * Live Campus Conditions - Data Types & Contracts
 * Feature Owner: Tanisha
 * Module: @/features/tanisha/live-campus
 */

export type DataMode = "live" | "simulated" | "estimated" | "unknown";

export type OccupancyStatus =
  | "low"
  | "moderate"
  | "busy"
  | "very_busy"
  | "over_capacity";

export type ConnectivityQuality =
  | "excellent"
  | "good"
  | "fair"
  | "weak"
  | "very_weak";

export type Freshness = "fresh" | "stale" | "unavailable";

export interface CampusLocation {
  id: string;
  name: string;
  code: string;
  zone: string;
  description?: string;
}

export interface OccupancySnapshot {
  id: string;
  name: string;
  currentCount: number;
  capacity: number;
  percentage: number;
  status: OccupancyStatus;
  measuredAt: string;
  dataMode: DataMode;
  zone?: string;
}

export interface ConnectivitySnapshot {
  id: string;
  name: string;
  signalScore: number;
  signalDbm?: number;
  networkName?: string;
  measuredAt: string;
  dataMode: DataMode;
  quality: ConnectivityQuality;
  zone?: string;
}

export interface LocationCondition {
  id: string;
  name: string;
  zone: string;
  occupancy?: OccupancySnapshot;
  connectivity?: ConnectivitySnapshot;
  dataMode: DataMode;
  overallStatus: "normal" | "warning" | "critical";
  lastUpdated: string;
}

export interface CampusOverviewMetrics {
  totalStudentsTracked: number;
  busyLocationsCount: number;
  lowConnectivityCount: number;
  locationsMonitored: number;
  totalCapacityTracked: number;
  averageOccupancyPercentage: number;
  averageSignalScore: number;
}

export interface RankedOccupancy {
  rank: number;
  snapshot: OccupancySnapshot;
}

export interface RankedConnectivity {
  rank: number;
  snapshot: ConnectivitySnapshot;
}

export interface LiveCampusConditionsResponse {
  locations: LocationCondition[];
  occupancy: OccupancySnapshot[];
  connectivity: ConnectivitySnapshot[];
  overview: CampusOverviewMetrics;
  generatedAt: string;
  dataMode: DataMode;
  isSimulated: boolean;
}

export interface LiveConditionsFilterState {
  searchQuery: string;
  zoneFilter: string;
  statusFilter: "all" | OccupancyStatus | ConnectivityQuality;
  viewMode: "all" | "occupancy" | "connectivity" | "rankings";
}
