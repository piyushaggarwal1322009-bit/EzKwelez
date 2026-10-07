/**
 * Live Campus Conditions Feature Module Entrypoint
 * Feature Owner: Tanisha
 * Module: @/features/tanisha/live-campus
 */

// Presentation Components
export { LiveCampusConditions } from "./components/LiveCampusConditions";
export type { LiveCampusConditionsProps } from "./components/LiveCampusConditions";
export { CampusOverview } from "./components/CampusOverview";
export type { CampusOverviewProps } from "./components/CampusOverview";
export { OccupancyCard } from "./components/OccupancyCard";
export type { OccupancyCardProps } from "./components/OccupancyCard";
export { ConnectivityCard } from "./components/ConnectivityCard";
export type { ConnectivityCardProps } from "./components/ConnectivityCard";
export { LocationRanking } from "./components/LocationRanking";
export type { LocationRankingProps } from "./components/LocationRanking";
export { DataStatusBadge } from "./components/DataStatusBadge";
export type { DataStatusBadgeProps } from "./components/DataStatusBadge";
export { FreshnessIndicator } from "./components/FreshnessIndicator";
export type { FreshnessIndicatorProps } from "./components/FreshnessIndicator";

// Hooks
export { useLiveCampusConditions } from "./hooks/useLiveCampusConditions";
export type {
  UseLiveCampusConditionsOptions,
  UseLiveCampusConditionsReturn,
} from "./hooks/useLiveCampusConditions";

// Domain Calculations
export {
  calculateOccupancyPercentage,
  deriveOccupancyStatus,
  deriveConnectivityQuality,
  deriveFreshness,
  formatRelativeFreshness,
  calculateCampusOverview,
  rankMostCrowded,
  rankWeakestConnectivity,
  buildLocationConditions,
  OCCUPANCY_THRESHOLDS,
  CONNECTIVITY_THRESHOLDS,
  FRESHNESS_THRESHOLDS_MS,
} from "./lib/calculations";

// Mock Telemetry Generator
export {
  generateMockLiveCampusConditions,
  fetchMockLiveConditions,
} from "./lib/mock-data";
export type { SimulationScenario } from "./lib/mock-data";

// Type Contracts
export type {
  DataMode,
  OccupancyStatus,
  ConnectivityQuality,
  Freshness,
  CampusLocation,
  OccupancySnapshot,
  ConnectivitySnapshot,
  LocationCondition,
  CampusOverviewMetrics,
  RankedOccupancy,
  RankedConnectivity,
  LiveCampusConditionsResponse,
  LiveConditionsFilterState,
} from "./types/campus";
