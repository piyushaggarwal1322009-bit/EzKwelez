/**
 * Custom Hook for Live Campus Conditions
 * Abstracts data retrieval, handles loading/error/stale states,
 * and passes response data through calculations.ts to produce derived metrics.
 * Owner: Tanisha
 */

import * as React from 'react';
import {
  LiveCampusConditionsResponse,
  CampusOverviewMetrics,
  LocationCondition,
  LocationRankingItem,
  Freshness,
} from '../types/campus';
import {
  calculateCampusOverview,
  getMostCrowdedLocations,
  getWeakestConnectivityLocations,
  calculateFreshness,
  formatRelativeTime,
} from '../lib/calculations';
import { fetchLiveCampusConditions, FetchConditionsOptions } from '../lib/api-client';

export type SimulationMode = 'normal' | 'error' | 'empty' | 'stale';

export interface UseLiveCampusConditionsOptions {
  autoRefreshIntervalMs?: number;
  initialMode?: SimulationMode;
}

export interface UseLiveCampusConditionsResult {
  data: LiveCampusConditionsResponse | null;
  isLoading: boolean;
  error: string | null;
  metrics: CampusOverviewMetrics | null;
  combinedConditions: LocationCondition[];
  mostCrowded: LocationRankingItem[];
  weakestConnectivity: LocationRankingItem[];
  freshness: Freshness;
  formattedLastUpdated: string;
  simulationMode: SimulationMode;
  setSimulationMode: (mode: SimulationMode) => void;
  refresh: () => Promise<void>;
}

export function useLiveCampusConditions(
  options: UseLiveCampusConditionsOptions = {}
): UseLiveCampusConditionsResult {
  const { autoRefreshIntervalMs, initialMode = 'normal' } = options;

  const [data, setData] = React.useState<LiveCampusConditionsResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [simulationMode, setSimulationMode] = React.useState<SimulationMode>(initialMode);
  const [now, setNow] = React.useState<Date>(() => new Date());

  // Periodically update reference clock for accurate relative time display
  React.useEffect(() => {
    const clockInterval = setInterval(() => {
      setNow(new Date());
    }, 5000);
    return () => clearInterval(clockInterval);
  }, []);

  const loadData = React.useCallback(async (mode: SimulationMode) => {
    setIsLoading(true);
    setError(null);

    const fetchOpts: FetchConditionsOptions = {
      simulateError: mode === 'error',
      simulateEmpty: mode === 'empty',
      simulateStale: mode === 'stale',
    };

    try {
      const response = await fetchLiveCampusConditions(fetchOpts);
      setData(response);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : 'Unknown telemetry retrieval error');
    } finally {
      setIsLoading(false);
      setNow(new Date());
    }
  }, []);

  // Initial fetch and reload on simulationMode change
  React.useEffect(() => {
    let isCancelled = false;

    loadData(simulationMode).catch(() => {
      if (!isCancelled) {
        // Error state handled in loadData
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [loadData, simulationMode]);

  // Optional background polling
  React.useEffect(() => {
    if (!autoRefreshIntervalMs || autoRefreshIntervalMs <= 0) return;

    const timer = setInterval(() => {
      loadData(simulationMode);
    }, autoRefreshIntervalMs);

    return () => clearInterval(timer);
  }, [autoRefreshIntervalMs, loadData, simulationMode]);

  const refresh = React.useCallback(async () => {
    await loadData(simulationMode);
  }, [loadData, simulationMode]);

  // Derived metrics and rankings computed via calculations.ts
  const metrics = React.useMemo<CampusOverviewMetrics | null>(() => {
    if (!data) return null;
    return calculateCampusOverview(data.locations, data.occupancy, data.connectivity);
  }, [data]);

  const mostCrowded = React.useMemo<LocationRankingItem[]>(() => {
    if (!data || !data.occupancy) return [];
    return getMostCrowdedLocations(data.occupancy, 5);
  }, [data]);

  const weakestConnectivity = React.useMemo<LocationRankingItem[]>(() => {
    if (!data || !data.connectivity) return [];
    return getWeakestConnectivityLocations(data.connectivity, 5);
  }, [data]);

  const combinedConditions = React.useMemo<LocationCondition[]>(() => {
    if (!data || !data.locations) return [];

    const occMap = new Map(data.occupancy.map((o) => [o.locationId, o]));
    const connMap = new Map(data.connectivity.map((c) => [c.locationId, c]));

    return data.locations.map((loc) => ({
      location: loc,
      occupancy: occMap.get(loc.id),
      connectivity: connMap.get(loc.id),
    }));
  }, [data]);

  const freshness = React.useMemo<Freshness>(() => {
    if (!data) return 'unavailable';
    return calculateFreshness(data.timestamp, now);
  }, [data, now]);

  const formattedLastUpdated = React.useMemo<string>(() => {
    if (!data) return 'Unavailable';
    return formatRelativeTime(data.timestamp, now);
  }, [data, now]);

  return {
    data,
    isLoading,
    error,
    metrics,
    combinedConditions,
    mostCrowded,
    weakestConnectivity,
    freshness,
    formattedLastUpdated,
    simulationMode,
    setSimulationMode,
    refresh,
  };
}
