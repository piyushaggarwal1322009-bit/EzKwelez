/**
 * Unit Tests for Live Campus Conditions Calculations
 * Tests all required business metrics, thresholds, rankings, and freshness classifications.
 * Run with: node --test --experimental-strip-types apps/web/src/features/tanisha/live-campus/lib/calculations.test.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOccupancyPercentage,
  calculateOccupancyStatus,
  calculateConnectivityQuality,
  calculateCampusOverview,
  getMostCrowdedLocations,
  getWeakestConnectivityLocations,
  calculateFreshness,
  formatRelativeTime,
} from './calculations';
import {
  CampusLocation,
  OccupancySnapshot,
  ConnectivitySnapshot,
} from '../types/campus';

describe('Occupancy Calculations', () => {
  it('correctly calculates derived occupancy percentage', () => {
    assert.equal(calculateOccupancyPercentage(50, 100), 50);
    assert.equal(calculateOccupancyPercentage(294, 350), 84);
    assert.equal(calculateOccupancyPercentage(184, 200), 92);
    assert.equal(calculateOccupancyPercentage(0, 100), 0);
  });

  it('handles zero or negative capacity gracefully without crashing', () => {
    assert.equal(calculateOccupancyPercentage(50, 0), 0);
    assert.equal(calculateOccupancyPercentage(50, -10), 0);
    assert.equal(calculateOccupancyPercentage(-10, 100), 0);
  });

  it('correctly derives occupancy status against centralized thresholds', () => {
    // 0–49%: Low
    assert.equal(calculateOccupancyStatus(0), 'low');
    assert.equal(calculateOccupancyStatus(49), 'low');

    // 50–74%: Moderate
    assert.equal(calculateOccupancyStatus(50), 'moderate');
    assert.equal(calculateOccupancyStatus(74), 'moderate');

    // 75–89%: Busy
    assert.equal(calculateOccupancyStatus(75), 'busy');
    assert.equal(calculateOccupancyStatus(89), 'busy');

    // 90–100%: Very Busy
    assert.equal(calculateOccupancyStatus(90), 'very_busy');
    assert.equal(calculateOccupancyStatus(100), 'very_busy');

    // >100%: Over Capacity
    assert.equal(calculateOccupancyStatus(101), 'over_capacity');
    assert.equal(calculateOccupancyStatus(120), 'over_capacity');
  });
});

describe('Connectivity Calculations', () => {
  it('correctly derives connectivity quality against centralized thresholds', () => {
    // 80–100: Excellent
    assert.equal(calculateConnectivityQuality(100), 'excellent');
    assert.equal(calculateConnectivityQuality(80), 'excellent');

    // 60–79: Good
    assert.equal(calculateConnectivityQuality(79), 'good');
    assert.equal(calculateConnectivityQuality(60), 'good');

    // 40–59: Fair
    assert.equal(calculateConnectivityQuality(59), 'fair');
    assert.equal(calculateConnectivityQuality(40), 'fair');

    // 20–39: Weak
    assert.equal(calculateConnectivityQuality(39), 'weak');
    assert.equal(calculateConnectivityQuality(20), 'weak');

    // 0–19: Very Weak
    assert.equal(calculateConnectivityQuality(19), 'very_weak');
    assert.equal(calculateConnectivityQuality(0), 'very_weak');
  });

  it('clamps out-of-range signal scores', () => {
    assert.equal(calculateConnectivityQuality(-10), 'very_weak');
    assert.equal(calculateConnectivityQuality(150), 'excellent');
  });
});

describe('Campus Overview Calculations', () => {
  const sampleLocations: CampusLocation[] = [
    { id: 'loc-1', name: 'Lib', category: 'library', capacity: 100 },
    { id: 'loc-2', name: 'Lab', category: 'laboratory', capacity: 50 },
    { id: 'loc-3', name: 'Hostel', category: 'residential', capacity: 200 },
  ];

  const sampleOccupancy: OccupancySnapshot[] = [
    {
      locationId: 'loc-1',
      locationName: 'Lib',
      currentCount: 85,
      capacity: 100,
      percentage: 85,
      status: 'busy',
      measuredAt: new Date().toISOString(),
      dataMode: 'simulated',
    },
    {
      locationId: 'loc-2',
      locationName: 'Lab',
      currentCount: 48,
      capacity: 50,
      percentage: 96,
      status: 'very_busy',
      measuredAt: new Date().toISOString(),
      dataMode: 'simulated',
    },
    {
      locationId: 'loc-3',
      locationName: 'Hostel',
      currentCount: 60,
      capacity: 200,
      percentage: 30,
      status: 'low',
      measuredAt: new Date().toISOString(),
      dataMode: 'simulated',
    },
  ];

  const sampleConnectivity: ConnectivitySnapshot[] = [
    {
      locationId: 'loc-1',
      locationName: 'Lib',
      signalScore: 90,
      quality: 'excellent',
      measuredAt: new Date().toISOString(),
      dataMode: 'simulated',
    },
    {
      locationId: 'loc-2',
      locationName: 'Lab',
      signalScore: 35,
      quality: 'weak',
      measuredAt: new Date().toISOString(),
      dataMode: 'simulated',
    },
    {
      locationId: 'loc-3',
      locationName: 'Hostel',
      signalScore: 15,
      quality: 'very_weak',
      measuredAt: new Date().toISOString(),
      dataMode: 'simulated',
    },
  ];

  it('computes accurate totals and counts for campus overview', () => {
    const overview = calculateCampusOverview(
      sampleLocations,
      sampleOccupancy,
      sampleConnectivity
    );

    // Total tracked: 85 + 48 + 60 = 193
    assert.equal(overview.totalStudentsTracked, 193);
    // Total capacity: 100 + 50 + 200 = 350
    assert.equal(overview.totalMonitoredCapacity, 350);
    // Overall occupancy: 193 / 350 * 100 = 55%
    assert.equal(overview.overallOccupancyPercentage, 55);
    // Busy locations (busy + very_busy): 2
    assert.equal(overview.busyLocationsCount, 2);
    // Low connectivity (weak + very_weak): 2
    assert.equal(overview.lowConnectivityCount, 2);
    // Monitored count: 3
    assert.equal(overview.locationsMonitored, 3);
    // Average signal score: (90 + 35 + 15) / 3 = 47
    assert.equal(overview.averageSignalScore, 47);
  });
});

describe('Rankings Calculations', () => {
  const sampleOccupancy: OccupancySnapshot[] = [
    {
      locationId: 'loc-1',
      locationName: 'Library',
      currentCount: 80,
      capacity: 100,
      percentage: 80,
      status: 'busy',
      measuredAt: new Date().toISOString(),
      dataMode: 'simulated',
    },
    {
      locationId: 'loc-2',
      locationName: 'Canteen',
      currentCount: 95,
      capacity: 100,
      percentage: 95,
      status: 'very_busy',
      measuredAt: new Date().toISOString(),
      dataMode: 'simulated',
    },
    {
      locationId: 'loc-3',
      locationName: 'Hostel',
      currentCount: 40,
      capacity: 100,
      percentage: 40,
      status: 'low',
      measuredAt: new Date().toISOString(),
      dataMode: 'simulated',
    },
  ];

  const sampleConnectivity: ConnectivitySnapshot[] = [
    {
      locationId: 'loc-1',
      locationName: 'Library',
      signalScore: 90,
      quality: 'excellent',
      measuredAt: new Date().toISOString(),
      dataMode: 'simulated',
    },
    {
      locationId: 'loc-2',
      locationName: 'Canteen',
      signalScore: 50,
      quality: 'fair',
      measuredAt: new Date().toISOString(),
      dataMode: 'simulated',
    },
    {
      locationId: 'loc-3',
      locationName: 'Hostel',
      signalScore: 25,
      quality: 'weak',
      measuredAt: new Date().toISOString(),
      dataMode: 'simulated',
    },
  ];

  it('ranks most crowded locations in descending percentage order', () => {
    const ranked = getMostCrowdedLocations(sampleOccupancy, 3);
    assert.equal(ranked.length, 3);
    assert.equal(ranked[0].locationName, 'Canteen');
    assert.equal(ranked[0].rank, 1);
    assert.equal(ranked[0].metricValue, 95);
    assert.equal(ranked[1].locationName, 'Library');
    assert.equal(ranked[1].rank, 2);
    assert.equal(ranked[2].locationName, 'Hostel');
    assert.equal(ranked[2].rank, 3);
  });

  it('ranks weakest connectivity locations in ascending signal score order', () => {
    const ranked = getWeakestConnectivityLocations(sampleConnectivity, 3);
    assert.equal(ranked.length, 3);
    assert.equal(ranked[0].locationName, 'Hostel');
    assert.equal(ranked[0].rank, 1);
    assert.equal(ranked[0].metricValue, 25);
    assert.equal(ranked[1].locationName, 'Canteen');
    assert.equal(ranked[1].rank, 2);
    assert.equal(ranked[2].locationName, 'Library');
    assert.equal(ranked[2].rank, 3);
  });
});

describe('Freshness Classification', () => {
  it('correctly classifies fresh, stale, and unavailable timestamps', () => {
    const now = new Date('2026-10-07T12:00:00Z');

    // 30 seconds ago -> fresh
    const freshTime = new Date('2026-10-07T11:59:30Z');
    assert.equal(calculateFreshness(freshTime, now), 'fresh');

    // 2 minutes ago -> stale (threshold is 60s to 5min)
    const staleTime = new Date('2026-10-07T11:58:00Z');
    assert.equal(calculateFreshness(staleTime, now), 'stale');

    // 10 minutes ago -> unavailable
    const oldTime = new Date('2026-10-07T11:50:00Z');
    assert.equal(calculateFreshness(oldTime, now), 'unavailable');

    // Invalid date -> unavailable
    assert.equal(calculateFreshness('invalid-timestamp', now), 'unavailable');
    assert.equal(calculateFreshness(undefined, now), 'unavailable');
  });

  it('formats relative time strings accurately', () => {
    const now = new Date('2026-10-07T12:00:00Z');

    assert.equal(formatRelativeTime(new Date('2026-10-07T11:59:55Z'), now), 'Updated just now');
    assert.equal(formatRelativeTime(new Date('2026-10-07T11:59:40Z'), now), 'Updated 20 sec ago');
    assert.equal(formatRelativeTime(new Date('2026-10-07T11:57:00Z'), now), 'Updated 3 min ago');
    assert.equal(formatRelativeTime(undefined, now), 'Timestamp unavailable');
  });
});
