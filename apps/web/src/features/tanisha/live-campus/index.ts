/**
 * Live Campus Conditions Feature Module Entrypoint
 * Owner: Tanisha
 */

// Components
export { LiveCampusConditions } from './components/LiveCampusConditions';
export type { LiveCampusConditionsProps } from './components/LiveCampusConditions';

export { CampusOverview } from './components/CampusOverview';
export type { CampusOverviewProps } from './components/CampusOverview';

export { OccupancyCard } from './components/OccupancyCard';
export type { OccupancyCardProps } from './components/OccupancyCard';

export { ConnectivityCard } from './components/ConnectivityCard';
export type { ConnectivityCardProps } from './components/ConnectivityCard';

export { LocationRanking } from './components/LocationRanking';
export type { LocationRankingProps } from './components/LocationRanking';

export { DataStatusBadge } from './components/DataStatusBadge';
export type { DataStatusBadgeProps } from './components/DataStatusBadge';

export { FreshnessIndicator } from './components/FreshnessIndicator';
export type { FreshnessIndicatorProps } from './components/FreshnessIndicator';

// Hooks
export { useLiveCampusConditions } from './hooks/useLiveCampusConditions';
export type {
  UseLiveCampusConditionsOptions,
  UseLiveCampusConditionsResult,
  SimulationMode,
} from './hooks/useLiveCampusConditions';

// Calculations & API
export * from './lib/calculations';
export * from './lib/mock-data';
export * from './lib/api-client';

// Types
export * from './types/campus';
