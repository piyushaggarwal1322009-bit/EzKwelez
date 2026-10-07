/**
 * Hook for Live Campus Conditions
 * Feature Owner: Tanisha
 * Module: @/features/tanisha/live-campus
 *
 * Architecture:
 * - Decouples data retrieval from presentation components.
 * - Ready to consume GET /api/campus/live-conditions once backend endpoint is deployed.
 * - Defaults safely to deterministic simulation mock when API is unavailable.
 */

import * as React from "react";
import {
  LiveCampusConditionsResponse,
  CampusOverviewMetrics,
  RankedOccupancy,
  RankedConnectivity,
  LocationCondition,
  Freshness,
} from "../types/campus";
import {
  deriveFreshness,
  rankMostCrowded,
  rankWeakestConnectivity,
} from "../lib/calculations";
import {
  SimulationScenario,
  fetchMockLiveConditions,
} from "../lib/mock-data";

export interface UseLiveCampusConditionsOptions {
  initialScenario?: SimulationScenario;
  pollingIntervalMs?: number;
  enablePolling?: boolean;
  useBackendApi?: boolean;
}

export interface UseLiveCampusConditionsReturn {
  data: LiveCampusConditionsResponse | null;
  overview: CampusOverviewMetrics | null;
  mostCrowded: RankedOccupancy[];
  weakestConnectivity: RankedConnectivity[];
  locations: LocationCondition[];
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  errorMessage: string | null;
  isStale: boolean;
  isSimulated: boolean;
  scenario: SimulationScenario;
  setScenario: (scenario: SimulationScenario) => void;
  refetch: () => Promise<void>;
  lastFetchedAt: Date | null;
  freshness: Freshness;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useLiveCampusConditions(
  options: UseLiveCampusConditionsOptions = {}
): UseLiveCampusConditionsReturn {
  const {
    initialScenario = "normal",
    pollingIntervalMs = 30000,
    enablePolling = false,
    useBackendApi = false,
  } = options;

  const [scenario, setScenario] = React.useState<SimulationScenario>(initialScenario);
  const [data, setData] = React.useState<LiveCampusConditionsResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = React.useState<Date | null>(null);

  const loadData = React.useCallback(
    async (isManualRefresh: boolean = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else if (!data) {
        setIsLoading(true);
      }

      setIsError(false);
      setErrorMessage(null);

      try {
        let responseData: LiveCampusConditionsResponse;

        if (useBackendApi) {
          // Future backend integration pathway:
          try {
            const res = await fetch(`${API_BASE_URL}/campus/live-conditions`, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            });
            if (!res.ok) {
              throw new Error(`API returned status ${res.status}`);
            }
            responseData = await res.json();
          } catch (apiErr) {
            // Graceful fallback to simulated provider if backend is offline
            responseData = await fetchMockLiveConditions(scenario, 200);
          }
        } else {
          // Standard simulation provider
          responseData = await fetchMockLiveConditions(scenario, isManualRefresh ? 300 : 150);
        }

        setData(responseData);
        setLastFetchedAt(new Date());
      } catch (err: unknown) {
        setIsError(true);
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load campus condition telemetry.";
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [scenario, useBackendApi, data]
  );

  // Initial load or scenario change
  React.useEffect(() => {
    let isMounted = true;

    loadData().catch(() => {
      if (isMounted) {
        setIsError(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [loadData]); // Reload on scenario or loadData change

  // Optional periodic polling
  React.useEffect(() => {
    if (!enablePolling || pollingIntervalMs <= 0) return;

    const timer = setInterval(() => {
      loadData(false);
    }, pollingIntervalMs);

    return () => clearInterval(timer);
  }, [enablePolling, pollingIntervalMs, loadData]);

  // Derived calculations
  const overview = data?.overview ?? null;

  const mostCrowded = React.useMemo(() => {
    return data?.occupancy ? rankMostCrowded(data.occupancy, 5) : [];
  }, [data?.occupancy]);

  const weakestConnectivity = React.useMemo(() => {
    return data?.connectivity ? rankWeakestConnectivity(data.connectivity, 5) : [];
  }, [data?.connectivity]);

  const locations = data?.locations ?? [];

  const freshness = React.useMemo(() => {
    if (!data?.generatedAt) return "unavailable";
    return deriveFreshness(data.generatedAt);
  }, [data?.generatedAt]);

  const isStale = freshness === "stale";
  const isSimulated = data?.isSimulated ?? true;

  const handleRefetch = React.useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  return {
    data,
    overview,
    mostCrowded,
    weakestConnectivity,
    locations,
    isLoading,
    isRefreshing,
    isError,
    errorMessage,
    isStale,
    isSimulated,
    scenario,
    setScenario,
    refetch: handleRefetch,
    lastFetchedAt,
    freshness,
  };
}
