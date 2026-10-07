/**
 * Operational Calculations Library for Live Campus Conditions
 * Centralizes all mathematical rules, thresholds, rankings, and freshness logic.
 * Follows Single Responsibility and avoids magic numbers across components.
 */

import {
  OccupancyStatus,
  ConnectivityQuality,
  Freshness,
  OccupancySnapshot,
  ConnectivitySnapshot,
  CampusLocation,
  CampusOverviewMetrics,
  LocationRankingItem,
} from '../types/campus';

// ==========================================
// THRESHOLD CONSTANTS
// ==========================================

export const OCCUPANCY_THRESHOLDS = {
  LOW_MAX: 49,
  MODERATE_MAX: 74,
  BUSY_MAX: 89,
  VERY_BUSY_MAX: 100,
} as const;

export const CONNECTIVITY_THRESHOLDS = {
  EXCELLENT_MIN: 80,
  GOOD_MIN: 60,
  FAIR_MIN: 40,
  WEAK_MIN: 20,
} as const;

export const FRESHNESS_THRESHOLDS = {
  FRESH_MAX_MS: 60 * 1000, // 60 seconds
  STALE_MAX_MS: 5 * 60 * 1000, // 5 minutes
} as const;

// ==========================================
// OCCUPANCY CALCULATIONS
// ==========================================

/**
 * Calculates derived occupancy percentage from current count and capacity.
 * Handles edge cases such as zero capacity and negative numbers gracefully.
 */
export function calculateOccupancyPercentage(
  currentCount: number,
  capacity: number
): number {
  if (!Number.isFinite(capacity) || capacity <= 0) {
    return 0;
  }
  const safeCount = Math.max(0, Number.isFinite(currentCount) ? currentCount : 0);
  const rawPercentage = (safeCount / capacity) * 100;
  return Math.round(rawPercentage);
}

/**
 * Derives occupancy operational status from percentage using centralized thresholds:
 * 0–49%: Low
 * 50–74%: Moderate
 * 75–89%: Busy
 * 90–100%: Very Busy
 * >100%: Over Capacity
 */
export function calculateOccupancyStatus(percentage: number): OccupancyStatus {
  if (percentage > OCCUPANCY_THRESHOLDS.VERY_BUSY_MAX) {
    return 'over_capacity';
  }
  if (percentage >= OCCUPANCY_THRESHOLDS.BUSY_MAX + 1) {
    return 'very_busy';
  }
  if (percentage >= OCCUPANCY_THRESHOLDS.MODERATE_MAX + 1) {
    return 'busy';
  }
  if (percentage >= OCCUPANCY_THRESHOLDS.LOW_MAX + 1) {
    return 'moderate';
  }
  return 'low';
}

export function formatOccupancyStatus(status: OccupancyStatus): string {
  switch (status) {
    case 'low':
      return 'Low';
    case 'moderate':
      return 'Moderate';
    case 'busy':
      return 'Busy';
    case 'very_busy':
      return 'Very Busy';
    case 'over_capacity':
      return 'Over Capacity';
    default:
      return 'Unknown';
  }
}

export function getOccupancyStatusVariant(
  status: OccupancyStatus
): 'success' | 'warning' | 'critical' | 'default' {
  switch (status) {
    case 'low':
      return 'success';
    case 'moderate':
      return 'default';
    case 'busy':
      return 'warning';
    case 'very_busy':
    case 'over_capacity':
      return 'critical';
    default:
      return 'default';
  }
}

// ==========================================
// CONNECTIVITY CALCULATIONS
// ==========================================

/**
 * Derives connectivity quality from signal score (0–100):
 * 80–100: Excellent
 * 60–79: Good
 * 40–59: Fair
 * 20–39: Weak
 * 0–19: Very Weak
 */
export function calculateConnectivityQuality(
  signalScore: number
): ConnectivityQuality {
  const score = Math.max(0, Math.min(100, Number.isFinite(signalScore) ? signalScore : 0));
  if (score >= CONNECTIVITY_THRESHOLDS.EXCELLENT_MIN) {
    return 'excellent';
  }
  if (score >= CONNECTIVITY_THRESHOLDS.GOOD_MIN) {
    return 'good';
  }
  if (score >= CONNECTIVITY_THRESHOLDS.FAIR_MIN) {
    return 'fair';
  }
  if (score >= CONNECTIVITY_THRESHOLDS.WEAK_MIN) {
    return 'weak';
  }
  return 'very_weak';
}

export function formatConnectivityQuality(quality: ConnectivityQuality): string {
  switch (quality) {
    case 'excellent':
      return 'Excellent';
    case 'good':
      return 'Good';
    case 'fair':
      return 'Fair';
    case 'weak':
      return 'Weak';
    case 'very_weak':
      return 'Very Weak';
    default:
      return 'Unknown';
  }
}

export function getConnectivityQualityVariant(
  quality: ConnectivityQuality
): 'success' | 'warning' | 'critical' | 'default' {
  switch (quality) {
    case 'excellent':
    case 'good':
      return 'success';
    case 'fair':
      return 'warning';
    case 'weak':
    case 'very_weak':
      return 'critical';
    default:
      return 'default';
  }
}

// ==========================================
// FRESHNESS CALCULATIONS
// ==========================================

/**
 * Determines whether a timestamp is fresh, stale, or unavailable.
 */
export function calculateFreshness(
  measuredAt: string | Date | undefined | null,
  referenceTime: Date = new Date(),
  customThresholds: { freshMaxMs?: number; staleMaxMs?: number } = {}
): Freshness {
  if (!measuredAt) {
    return 'unavailable';
  }

  const date = typeof measuredAt === 'string' ? new Date(measuredAt) : measuredAt;
  const timeMs = date.getTime();

  if (Number.isNaN(timeMs)) {
    return 'unavailable';
  }

  const diffMs = referenceTime.getTime() - timeMs;
  if (diffMs < 0) {
    // Clock slight skew or future timestamp - treat as fresh
    return 'fresh';
  }

  const freshMax = customThresholds.freshMaxMs ?? FRESHNESS_THRESHOLDS.FRESH_MAX_MS;
  const staleMax = customThresholds.staleMaxMs ?? FRESHNESS_THRESHOLDS.STALE_MAX_MS;

  if (diffMs <= freshMax) {
    return 'fresh';
  }
  if (diffMs <= staleMax) {
    return 'stale';
  }
  return 'unavailable';
}

/**
 * Formats relative time string such as "Updated 12 sec ago", "Updated 2 min ago".
 */
export function formatRelativeTime(
  measuredAt: string | Date | undefined | null,
  referenceTime: Date = new Date()
): string {
  if (!measuredAt) {
    return 'Timestamp unavailable';
  }

  const date = typeof measuredAt === 'string' ? new Date(measuredAt) : measuredAt;
  const timeMs = date.getTime();

  if (Number.isNaN(timeMs)) {
    return 'Timestamp unavailable';
  }

  const diffSeconds = Math.max(0, Math.floor((referenceTime.getTime() - timeMs) / 1000));

  if (diffSeconds < 10) {
    return 'Updated just now';
  }
  if (diffSeconds < 60) {
    return `Updated ${diffSeconds} sec ago`;
  }
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `Updated ${diffMinutes} min ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `Updated ${diffHours} hr ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `Updated ${diffDays} d ago`;
}

// ==========================================
// CAMPUS OVERVIEW METRICS
// ==========================================

/**
 * Computes consolidated campus overview metrics derived strictly from current location snapshots.
 */
export function calculateCampusOverview(
  locations: CampusLocation[],
  occupancy: OccupancySnapshot[],
  connectivity: ConnectivitySnapshot[]
): CampusOverviewMetrics {
  const totalStudentsTracked = occupancy.reduce((acc, curr) => {
    return acc + (Number.isFinite(curr.currentCount) ? Math.max(0, curr.currentCount) : 0);
  }, 0);

  const totalMonitoredCapacity = locations.reduce((acc, curr) => {
    return acc + (Number.isFinite(curr.capacity) ? Math.max(0, curr.capacity) : 0);
  }, 0);

  const overallOccupancyPercentage =
    totalMonitoredCapacity > 0
      ? Math.round((totalStudentsTracked / totalMonitoredCapacity) * 100)
      : 0;

  const busyLocationsCount = occupancy.filter((snap) => {
    return snap.status === 'busy' || snap.status === 'very_busy' || snap.status === 'over_capacity';
  }).length;

  const lowConnectivityCount = connectivity.filter((snap) => {
    return snap.quality === 'weak' || snap.quality === 'very_weak';
  }).length;

  const monitoredLocationIds = new Set<string>();
  locations.forEach((loc) => monitoredLocationIds.add(loc.id));
  occupancy.forEach((occ) => monitoredLocationIds.add(occ.locationId));
  connectivity.forEach((conn) => monitoredLocationIds.add(conn.locationId));

  const averageSignalScore =
    connectivity.length > 0
      ? Math.round(
          connectivity.reduce((acc, curr) => acc + (Number.isFinite(curr.signalScore) ? curr.signalScore : 0), 0) /
            connectivity.length
        )
      : 0;

  return {
    totalStudentsTracked,
    totalMonitoredCapacity,
    overallOccupancyPercentage,
    busyLocationsCount,
    lowConnectivityCount,
    locationsMonitored: monitoredLocationIds.size,
    averageSignalScore,
  };
}

// ==========================================
// LOCATION RANKINGS
// ==========================================

/**
 * Ranks locations by highest crowd pressure (occupancy percentage descending).
 */
export function getMostCrowdedLocations(
  occupancy: OccupancySnapshot[],
  limit = 5
): LocationRankingItem[] {
  const sorted = [...occupancy]
    .filter((o) => Number.isFinite(o.percentage))
    .sort((a, b) => {
      if (b.percentage !== a.percentage) {
        return b.percentage - a.percentage;
      }
      return b.currentCount - a.currentCount;
    });

  return sorted.slice(0, limit).map((item, idx) => ({
    rank: idx + 1,
    locationId: item.locationId,
    locationName: item.locationName,
    metricValue: item.percentage,
    formattedValue: `${item.percentage}% full`,
    statusLabel: formatOccupancyStatus(item.status),
    statusVariant: getOccupancyStatusVariant(item.status),
    secondaryInfo: `${item.currentCount} / ${item.capacity} students`,
  }));
}

/**
 * Ranks locations by weakest connectivity (signal score ascending).
 */
export function getWeakestConnectivityLocations(
  connectivity: ConnectivitySnapshot[],
  limit = 5
): LocationRankingItem[] {
  const sorted = [...connectivity]
    .filter((c) => Number.isFinite(c.signalScore))
    .sort((a, b) => a.signalScore - b.signalScore);

  return sorted.slice(0, limit).map((item, idx) => ({
    rank: idx + 1,
    locationId: item.locationId,
    locationName: item.locationName,
    metricValue: item.signalScore,
    formattedValue: `${item.signalScore} / 100`,
    statusLabel: formatConnectivityQuality(item.quality),
    statusVariant: getConnectivityQualityVariant(item.quality),
    secondaryInfo: item.signalDbm ? `${item.signalDbm} dBm` : item.networkName ?? 'WLAN',
  }));
}
