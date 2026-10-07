/**
 * Types for Live Campus Conditions Feature
 * Owner: Tanisha
 */

export type DataMode = 'live' | 'simulated' | 'estimated' | 'unknown';

export type OccupancyStatus =
  | 'low'
  | 'moderate'
  | 'busy'
  | 'very_busy'
  | 'over_capacity';

export type ConnectivityQuality =
  | 'excellent'
  | 'good'
  | 'fair'
  | 'weak'
  | 'very_weak';

export type Freshness = 'fresh' | 'stale' | 'unavailable';

export type LocationCategory =
  | 'library'
  | 'dining'
  | 'academic'
  | 'laboratory'
  | 'recreation'
  | 'residential'
  | 'transit'
  | 'general';

export interface CampusLocation {
  id: string;
  name: string;
  category: LocationCategory;
  capacity: number;
  buildingId?: string;
  zone?: string;
  floor?: string;
}

export interface OccupancySnapshot {
  locationId: string;
  locationName: string;
  currentCount: number;
  capacity: number;
  percentage: number;
  status: OccupancyStatus;
  measuredAt: string;
  dataMode: DataMode;
}

export interface ConnectivitySnapshot {
  locationId: string;
  locationName: string;
  signalScore: number;
  signalDbm?: number;
  networkName?: string;
  measuredAt: string;
  dataMode: DataMode;
  quality: ConnectivityQuality;
}

export interface LocationCondition {
  location: CampusLocation;
  occupancy?: OccupancySnapshot;
  connectivity?: ConnectivitySnapshot;
}

export interface CampusOverviewMetrics {
  totalStudentsTracked: number;
  totalMonitoredCapacity: number;
  overallOccupancyPercentage: number;
  busyLocationsCount: number;
  lowConnectivityCount: number;
  locationsMonitored: number;
  averageSignalScore: number;
}

export interface LocationRankingItem {
  rank: number;
  locationId: string;
  locationName: string;
  metricValue: number;
  formattedValue: string;
  statusLabel: string;
  statusVariant: 'success' | 'warning' | 'critical' | 'default' | 'outline';
  secondaryInfo?: string;
}

export interface LiveCampusConditionsResponse {
  timestamp: string;
  dataMode: DataMode;
  locations: CampusLocation[];
  occupancy: OccupancySnapshot[];
  connectivity: ConnectivitySnapshot[];
  metadata?: {
    source: string;
    version: string;
    refreshIntervalMs?: number;
    notes?: string;
  };
}
