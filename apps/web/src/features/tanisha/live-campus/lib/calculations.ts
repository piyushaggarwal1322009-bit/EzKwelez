/**
 * Centralized Domain Calculations for Live Campus Conditions
 * Feature Owner: Tanisha
 * Module: @/features/tanisha/live-campus
 *
 * Rules:
 * - All thresholds, status derivations, and summary metrics MUST live here.
 * - No magic numbers scattered across UI components.
 * - Pure, deterministic, and fully testable without browser or network dependencies.
 */

import {
  OccupancyStatus,
  ConnectivityQuality,
  Freshness,
  OccupancySnapshot,
  ConnectivitySnapshot,
  LocationCondition,
  CampusOverviewMetrics,
  RankedOccupancy,
  RankedConnectivity,
} from "../types/campus";

// ============================================================================
// Central Threshold Constants
// ============================================================================

export const OCCUPANCY_THRESHOLDS = {
  LOW_MAX: 49,
  MODERATE_MAX: 74,
  BUSY_MAX: 89,
  VERY_BUSY_MAX: 100,
} as const;

export const CONNECTIVITY_THRESHOLDS = {
  VERY_WEAK_MAX: 19,
  WEAK_MAX: 39,
  FAIR_MAX: 59,
  GOOD_MAX: 79,
  EXCELLENT_MIN: 80,
} as const;

export const FRESHNESS_THRESHOLDS_MS = {
  FRESH_MAX_MS: 60 * 1000, // 60 seconds
  STALE_MAX_MS: 5 * 60 * 1000, // 5 minutes
} as const;

// ============================================================================
// Occupancy Calculations
// ============================================================================

/**
 * Calculates the occupancy percentage from current count and capacity.
 * Handles invalid or zero capacity safely without throwing.
 */
export function calculateOccupancyPercentage(
  currentCount: number,
  capacity: number
): number {
  if (typeof currentCount !== "number" || isNaN(currentCount) || currentCount < 0) {
    return 0;
  }
  if (typeof capacity !== "number" || isNaN(capacity) || capacity <= 0) {
    return 0;
  }

  const rawPercent = (currentCount / capacity) * 100;
  return Math.round(rawPercent * 10) / 10;
}

/**
 * Derives the OccupancyStatus enum from an occupancy percentage.
 *
 * Threshold rules:
 * 0–49%       -> low
 * 50–74%      -> moderate
 * 75–89%      -> busy
 * 90–100%     -> very_busy
 * >100%       -> over_capacity
 */
export function deriveOccupancyStatus(percentage: number): OccupancyStatus {
  if (typeof percentage !== "number" || isNaN(percentage) || percentage < 0) {
    return "low";
  }

  if (percentage <= OCCUPANCY_THRESHOLDS.LOW_MAX) {
    return "low";
  }
  if (percentage <= OCCUPANCY_THRESHOLDS.MODERATE_MAX) {
    return "moderate";
  }
  if (percentage <= OCCUPANCY_THRESHOLDS.BUSY_MAX) {
    return "busy";
  }
  if (percentage <= OCCUPANCY_THRESHOLDS.VERY_BUSY_MAX) {
    return "very_busy";
  }
  return "over_capacity";
}

// ============================================================================
// Connectivity Calculations
// ============================================================================

/**
 * Derives ConnectivityQuality from a signal score (0–100).
 *
 * Threshold rules:
 * 80–100 -> excellent
 * 60–79  -> good
 * 40–59  -> fair
 * 20–39  -> weak
 * 0–19   -> very_weak
 */
export function deriveConnectivityQuality(
  signalScore: number
): ConnectivityQuality {
  if (typeof signalScore !== "number" || isNaN(signalScore)) {
    return "very_weak";
  }

  const clampedScore = Math.max(0, Math.min(100, Math.round(signalScore)));

  if (clampedScore >= CONNECTIVITY_THRESHOLDS.EXCELLENT_MIN) {
    return "excellent";
  }
  if (clampedScore >= 60) {
    return "good";
  }
  if (clampedScore >= 40) {
    return "fair";
  }
  if (clampedScore >= 20) {
    return "weak";
  }
  return "very_weak";
}

// ============================================================================
// Freshness Calculations
// ============================================================================

/**
 * Evaluates whether a measurement timestamp is fresh, stale, or unavailable.
 */
export function deriveFreshness(
  measuredAt: string | Date | number | null | undefined,
  nowTime: number = Date.now(),
  thresholds: { freshMaxMs?: number; staleMaxMs?: number } = {}
): Freshness {
  if (!measuredAt) {
    return "unavailable";
  }

  const timestamp =
    typeof measuredAt === "number"
      ? measuredAt
      : new Date(measuredAt).getTime();

  if (isNaN(timestamp) || timestamp <= 0) {
    return "unavailable";
  }

  const freshMax = thresholds.freshMaxMs ?? FRESHNESS_THRESHOLDS_MS.FRESH_MAX_MS;
  const staleMax = thresholds.staleMaxMs ?? FRESHNESS_THRESHOLDS_MS.STALE_MAX_MS;

  const ageMs = Math.max(0, nowTime - timestamp);

  if (ageMs <= freshMax) {
    return "fresh";
  }
  if (ageMs <= staleMax) {
    return "stale";
  }
  return "unavailable";
}

/**
 * Formats a timestamp into human-readable relative freshness.
 * e.g., "Just now", "Updated 12s ago", "Updated 2m ago", "Updated 1h ago".
 */
export function formatRelativeFreshness(
  measuredAt: string | Date | number | null | undefined,
  nowTime: number = Date.now()
): string {
  if (!measuredAt) {
    return "Unavailable";
  }

  const timestamp =
    typeof measuredAt === "number"
      ? measuredAt
      : new Date(measuredAt).getTime();

  if (isNaN(timestamp) || timestamp <= 0) {
    return "Unavailable";
  }

  const diffSeconds = Math.floor(Math.max(0, nowTime - timestamp) / 1000);

  if (diffSeconds < 5) {
    return "Just now";
  }
  if (diffSeconds < 60) {
    return `Updated ${diffSeconds}s ago`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `Updated ${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `Updated ${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `Updated ${diffDays}d ago`;
}

// ============================================================================
// Campus Overview Metrics Calculations
// ============================================================================

/**
 * Computes live campus overview metrics derived strictly from location datasets.
 */
export function calculateCampusOverview(
  occupancyList: OccupancySnapshot[] = [],
  connectivityList: ConnectivitySnapshot[] = []
): CampusOverviewMetrics {
  let totalStudents = 0;
  let totalCapacity = 0;
  let busyCount = 0;
  let lowConnectivityCount = 0;
  let sumOccupancyPercentages = 0;
  let sumSignalScores = 0;

  const uniqueLocationIds = new Set<string>();

  // Process occupancy list
  for (const item of occupancyList) {
    if (item && typeof item.currentCount === "number") {
      totalStudents += Math.max(0, item.currentCount);
      totalCapacity += Math.max(0, item.capacity || 0);
      sumOccupancyPercentages += item.percentage || 0;
      uniqueLocationIds.add(item.id);

      if (
        item.status === "busy" ||
        item.status === "very_busy" ||
        item.status === "over_capacity" ||
        item.percentage >= 75
      ) {
        busyCount++;
      }
    }
  }

  // Process connectivity list
  for (const item of connectivityList) {
    if (item && typeof item.signalScore === "number") {
      sumSignalScores += item.signalScore;
      uniqueLocationIds.add(item.id);

      if (
        item.quality === "weak" ||
        item.quality === "very_weak" ||
        item.signalScore < 40
      ) {
        lowConnectivityCount++;
      }
    }
  }

  const avgOccupancy =
    occupancyList.length > 0
      ? Math.round((sumOccupancyPercentages / occupancyList.length) * 10) / 10
      : 0;

  const avgSignal =
    connectivityList.length > 0
      ? Math.round((sumSignalScores / connectivityList.length) * 10) / 10
      : 0;

  return {
    totalStudentsTracked: totalStudents,
    totalCapacityTracked: totalCapacity,
    busyLocationsCount: busyCount,
    lowConnectivityCount: lowConnectivityCount,
    locationsMonitored: uniqueLocationIds.size,
    averageOccupancyPercentage: avgOccupancy,
    averageSignalScore: avgSignal,
  };
}

// ============================================================================
// Location Rankings Calculations
// ============================================================================

/**
 * Ranks locations by highest occupancy percentage (Most Crowded).
 */
export function rankMostCrowded(
  occupancyList: OccupancySnapshot[] = [],
  limit?: number
): RankedOccupancy[] {
  const sorted = [...occupancyList].sort((a, b) => {
    if (b.percentage !== a.percentage) {
      return b.percentage - a.percentage;
    }
    return b.currentCount - a.currentCount;
  });

  const sliced = typeof limit === "number" && limit > 0 ? sorted.slice(0, limit) : sorted;

  return sliced.map((snapshot, index) => ({
    rank: index + 1,
    snapshot,
  }));
}

/**
 * Ranks locations by lowest signal score (Weakest Connectivity).
 */
export function rankWeakestConnectivity(
  connectivityList: ConnectivitySnapshot[] = [],
  limit?: number
): RankedConnectivity[] {
  const sorted = [...connectivityList].sort((a, b) => {
    if (a.signalScore !== b.signalScore) {
      return a.signalScore - b.signalScore;
    }
    return (a.signalDbm ?? 0) - (b.signalDbm ?? 0);
  });

  const sliced = typeof limit === "number" && limit > 0 ? sorted.slice(0, limit) : sorted;

  return sliced.map((snapshot, index) => ({
    rank: index + 1,
    snapshot,
  }));
}

// ============================================================================
// Composite Location Condition Builder
// ============================================================================

/**
 * Combines occupancy and connectivity snapshots into a cohesive location condition model.
 */
export function buildLocationConditions(
  occupancyList: OccupancySnapshot[] = [],
  connectivityList: ConnectivitySnapshot[] = []
): LocationCondition[] {
  const map = new Map<string, Partial<LocationCondition>>();

  for (const occ of occupancyList) {
    map.set(occ.id, {
      id: occ.id,
      name: occ.name,
      zone: occ.zone || "Main Campus",
      occupancy: occ,
      dataMode: occ.dataMode,
      lastUpdated: occ.measuredAt,
    });
  }

  for (const conn of connectivityList) {
    const existing = map.get(conn.id) || {
      id: conn.id,
      name: conn.name,
      zone: conn.zone || "Main Campus",
      dataMode: conn.dataMode,
      lastUpdated: conn.measuredAt,
    };

    existing.connectivity = conn;
    if (!existing.lastUpdated || new Date(conn.measuredAt) > new Date(existing.lastUpdated)) {
      existing.lastUpdated = conn.measuredAt;
    }
    map.set(conn.id, existing);
  }

  return Array.from(map.values()).map((item) => {
    let overallStatus: "normal" | "warning" | "critical" = "normal";

    const isCrowded =
      item.occupancy?.status === "very_busy" ||
      item.occupancy?.status === "over_capacity";
    const isWeakSignal =
      item.connectivity?.quality === "weak" ||
      item.connectivity?.quality === "very_weak";

    if (item.occupancy?.status === "over_capacity" || item.connectivity?.quality === "very_weak") {
      overallStatus = "critical";
    } else if (isCrowded || isWeakSignal || item.occupancy?.status === "busy") {
      overallStatus = "warning";
    }

    return {
      id: item.id || "unknown",
      name: item.name || "Unknown Location",
      zone: item.zone || "General",
      occupancy: item.occupancy,
      connectivity: item.connectivity,
      dataMode: item.dataMode || "simulated",
      overallStatus,
      lastUpdated: item.lastUpdated || new Date().toISOString(),
    };
  });
}
