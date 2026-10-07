/**
 * Frontend Unit Tests: Live Campus Conditions Calculations
 * Feature Owner: Tanisha
 * Module: @/features/tanisha/live-campus
 *
 * Covers:
 * 1. Occupancy percentage calculation
 * 2. Occupancy status thresholds
 * 3. Connectivity quality thresholds
 * 4. Freshness classification & time formatting
 * 5. Campus overview metrics aggregation
 * 6. Most crowded ranking logic
 * 7. Weakest connectivity ranking logic
 * 8. Location condition composite building
 */

import {
  calculateOccupancyPercentage,
  deriveOccupancyStatus,
  deriveConnectivityQuality,
  deriveFreshness,
  formatRelativeFreshness,
  calculateCampusOverview,
  rankMostCrowded,
  rankWeakestConnectivity,
  buildLocationConditions,
} from "../../apps/web/src/features/tanisha/live-campus/lib/calculations";
import {
  OccupancySnapshot,
  ConnectivitySnapshot,
} from "../../apps/web/src/features/tanisha/live-campus/types/campus";

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`FAIL: ${message}\nExpected: ${expected}\nActual:   ${actual}`);
  }
}

function assertTrue(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`FAIL: ${message}\nExpected true but got false`);
  }
}

export function runLiveCampusUnitTests(): { total: number; passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  function test(name: string, fn: () => void) {
    try {
      fn();
      passed++;
      console.log(`  ✓ ${name}`);
    } catch (err: unknown) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${name}: ${msg}`);
      console.error(`  ✗ ${name}\n    ${msg}`);
    }
  }

  console.log("\n========================================================");
  console.log("Running Live Campus Conditions Calculation Tests");
  console.log("========================================================");

  // --------------------------------------------------------------------------
  // 1. Occupancy Percentage Calculation
  // --------------------------------------------------------------------------
  test("calculateOccupancyPercentage: standard division and rounding", () => {
    assertEqual(calculateOccupancyPercentage(210, 250), 84, "210 / 250 should be 84%");
    assertEqual(calculateOccupancyPercentage(188, 200), 94, "188 / 200 should be 94%");
    assertEqual(calculateOccupancyPercentage(31, 50), 62, "31 / 50 should be 62%");
    assertEqual(calculateOccupancyPercentage(57, 150), 38, "57 / 150 should be 38%");
    assertEqual(calculateOccupancyPercentage(215, 200), 107.5, "215 / 200 should be 107.5%");
  });

  test("calculateOccupancyPercentage: edge cases (zero capacity, negative counts)", () => {
    assertEqual(calculateOccupancyPercentage(50, 0), 0, "Zero capacity should return 0");
    assertEqual(calculateOccupancyPercentage(50, -10), 0, "Negative capacity should return 0");
    assertEqual(calculateOccupancyPercentage(-5, 100), 0, "Negative count should return 0");
    assertEqual(calculateOccupancyPercentage(0, 100), 0, "0 count should return 0%");
  });

  // --------------------------------------------------------------------------
  // 2. Occupancy Status Derivation
  // --------------------------------------------------------------------------
  test("deriveOccupancyStatus: exact threshold boundaries", () => {
    // 0–49% -> low
    assertEqual(deriveOccupancyStatus(0), "low", "0% is low");
    assertEqual(deriveOccupancyStatus(25), "low", "25% is low");
    assertEqual(deriveOccupancyStatus(49), "low", "49% is low");

    // 50–74% -> moderate
    assertEqual(deriveOccupancyStatus(50), "moderate", "50% is moderate");
    assertEqual(deriveOccupancyStatus(62), "moderate", "62% is moderate");
    assertEqual(deriveOccupancyStatus(74), "moderate", "74% is moderate");

    // 75–89% -> busy
    assertEqual(deriveOccupancyStatus(75), "busy", "75% is busy");
    assertEqual(deriveOccupancyStatus(84), "busy", "84% is busy");
    assertEqual(deriveOccupancyStatus(89), "busy", "89% is busy");

    // 90–100% -> very_busy
    assertEqual(deriveOccupancyStatus(90), "very_busy", "90% is very_busy");
    assertEqual(deriveOccupancyStatus(95), "very_busy", "95% is very_busy");
    assertEqual(deriveOccupancyStatus(100), "very_busy", "100% is very_busy");

    // >100% -> over_capacity
    assertEqual(deriveOccupancyStatus(100.1), "over_capacity", "100.1% is over_capacity");
    assertEqual(deriveOccupancyStatus(115), "over_capacity", "115% is over_capacity");
  });

  // --------------------------------------------------------------------------
  // 3. Connectivity Quality Derivation
  // --------------------------------------------------------------------------
  test("deriveConnectivityQuality: exact score boundaries", () => {
    // 80–100 -> excellent
    assertEqual(deriveConnectivityQuality(100), "excellent", "100 is excellent");
    assertEqual(deriveConnectivityQuality(92), "excellent", "92 is excellent");
    assertEqual(deriveConnectivityQuality(80), "excellent", "80 is excellent");

    // 60–79 -> good
    assertEqual(deriveConnectivityQuality(79), "good", "79 is good");
    assertEqual(deriveConnectivityQuality(70), "good", "70 is good");
    assertEqual(deriveConnectivityQuality(60), "good", "60 is good");

    // 40–59 -> fair
    assertEqual(deriveConnectivityQuality(59), "fair", "59 is fair");
    assertEqual(deriveConnectivityQuality(50), "fair", "50 is fair");
    assertEqual(deriveConnectivityQuality(40), "fair", "40 is fair");

    // 20–39 -> weak
    assertEqual(deriveConnectivityQuality(39), "weak", "39 is weak");
    assertEqual(deriveConnectivityQuality(30), "weak", "30 is weak");
    assertEqual(deriveConnectivityQuality(20), "weak", "20 is weak");

    // 0–19 -> very_weak
    assertEqual(deriveConnectivityQuality(19), "very_weak", "19 is very_weak");
    assertEqual(deriveConnectivityQuality(5), "very_weak", "5 is very_weak");
    assertEqual(deriveConnectivityQuality(0), "very_weak", "0 is very_weak");
  });

  // --------------------------------------------------------------------------
  // 4. Freshness Derivation & Formatting
  // --------------------------------------------------------------------------
  test("deriveFreshness and formatRelativeFreshness: time calculations", () => {
    const now = 1700000000000;

    // 15 seconds ago -> fresh
    const t15s = new Date(now - 15 * 1000).toISOString();
    assertEqual(deriveFreshness(t15s, now), "fresh", "15s age is fresh");
    assertEqual(formatRelativeFreshness(t15s, now), "Updated 15s ago", "Relative format 15s");

    // 2 minutes ago -> stale
    const t2m = new Date(now - 2 * 60 * 1000).toISOString();
    assertEqual(deriveFreshness(t2m, now), "stale", "2m age is stale");
    assertEqual(formatRelativeFreshness(t2m, now), "Updated 2m ago", "Relative format 2m");

    // 10 minutes ago -> unavailable
    const t10m = new Date(now - 10 * 60 * 1000).toISOString();
    assertEqual(deriveFreshness(t10m, now), "unavailable", "10m age is unavailable");

    // Missing / invalid
    assertEqual(deriveFreshness(null, now), "unavailable", "null timestamp is unavailable");
    assertEqual(formatRelativeFreshness(null, now), "Unavailable", "null timestamp format");
  });

  // --------------------------------------------------------------------------
  // 5. Campus Overview Metrics Calculation
  // --------------------------------------------------------------------------
  test("calculateCampusOverview: aggregated student counts and counts", () => {
    const mockOccupancy: OccupancySnapshot[] = [
      {
        id: "loc-1",
        name: "Library",
        capacity: 100,
        currentCount: 80, // 80% -> busy
        percentage: 80,
        status: "busy",
        measuredAt: new Date().toISOString(),
        dataMode: "simulated",
      },
      {
        id: "loc-2",
        name: "Canteen",
        capacity: 100,
        currentCount: 95, // 95% -> very_busy
        percentage: 95,
        status: "very_busy",
        measuredAt: new Date().toISOString(),
        dataMode: "simulated",
      },
      {
        id: "loc-3",
        name: "Lab",
        capacity: 50,
        currentCount: 20, // 40% -> low
        percentage: 40,
        status: "low",
        measuredAt: new Date().toISOString(),
        dataMode: "simulated",
      },
    ];

    const mockConnectivity: ConnectivitySnapshot[] = [
      {
        id: "loc-1",
        name: "Library",
        signalScore: 90, // excellent
        measuredAt: new Date().toISOString(),
        dataMode: "simulated",
        quality: "excellent",
      },
      {
        id: "loc-2",
        name: "Canteen",
        signalScore: 35, // weak
        measuredAt: new Date().toISOString(),
        dataMode: "simulated",
        quality: "weak",
      },
      {
        id: "loc-4",
        name: "Gate",
        signalScore: 15, // very_weak
        measuredAt: new Date().toISOString(),
        dataMode: "simulated",
        quality: "very_weak",
      },
    ];

    const overview = calculateCampusOverview(mockOccupancy, mockConnectivity);

    // Total students = 80 + 95 + 20 = 195
    assertEqual(overview.totalStudentsTracked, 195, "Total students tracked");
    // Total capacity = 100 + 100 + 50 = 250
    assertEqual(overview.totalCapacityTracked, 250, "Total capacity tracked");
    // Busy locations = loc-1 (80%) + loc-2 (95%) = 2
    assertEqual(overview.busyLocationsCount, 2, "Busy locations count");
    // Low connectivity = loc-2 (35) + loc-4 (15) = 2
    assertEqual(overview.lowConnectivityCount, 2, "Low connectivity count");
    // Monitored locations unique IDs: loc-1, loc-2, loc-3, loc-4 = 4
    assertEqual(overview.locationsMonitored, 4, "Unique locations monitored");
  });

  // --------------------------------------------------------------------------
  // 6. Most Crowded Ranking
  // --------------------------------------------------------------------------
  test("rankMostCrowded: sort descending by percentage", () => {
    const list: OccupancySnapshot[] = [
      { id: "A", name: "A", capacity: 100, currentCount: 40, percentage: 40, status: "low", measuredAt: "", dataMode: "simulated" },
      { id: "B", name: "B", capacity: 100, currentCount: 95, percentage: 95, status: "very_busy", measuredAt: "", dataMode: "simulated" },
      { id: "C", name: "C", capacity: 100, currentCount: 78, percentage: 78, status: "busy", measuredAt: "", dataMode: "simulated" },
    ];

    const ranked = rankMostCrowded(list);
    assertEqual(ranked.length, 3, "Ranked list length");
    assertEqual(ranked[0].rank, 1, "Top rank is 1");
    assertEqual(ranked[0].snapshot.id, "B", "Top ranked is B (95%)");
    assertEqual(ranked[1].snapshot.id, "C", "Second ranked is C (78%)");
    assertEqual(ranked[2].snapshot.id, "A", "Third ranked is A (40%)");
  });

  // --------------------------------------------------------------------------
  // 7. Weakest Connectivity Ranking
  // --------------------------------------------------------------------------
  test("rankWeakestConnectivity: sort ascending by signal score", () => {
    const list: ConnectivitySnapshot[] = [
      { id: "A", name: "A", signalScore: 85, quality: "excellent", measuredAt: "", dataMode: "simulated" },
      { id: "B", name: "B", signalScore: 22, quality: "weak", measuredAt: "", dataMode: "simulated" },
      { id: "C", name: "C", signalScore: 50, quality: "fair", measuredAt: "", dataMode: "simulated" },
    ];

    const ranked = rankWeakestConnectivity(list);
    assertEqual(ranked.length, 3, "Ranked connectivity length");
    assertEqual(ranked[0].rank, 1, "Top weakest rank is 1");
    assertEqual(ranked[0].snapshot.id, "B", "Weakest is B (22)");
    assertEqual(ranked[1].snapshot.id, "C", "Second weakest is C (50)");
    assertEqual(ranked[2].snapshot.id, "A", "Strongest is A (85)");
  });

  // --------------------------------------------------------------------------
  // 8. Build Location Conditions Composite
  // --------------------------------------------------------------------------
  test("buildLocationConditions: composite mapping and status severity", () => {
    const occ: OccupancySnapshot[] = [
      { id: "loc-1", name: "Library", capacity: 100, currentCount: 110, percentage: 110, status: "over_capacity", measuredAt: "2026-10-07T10:00:00Z", dataMode: "simulated" },
    ];
    const conn: ConnectivitySnapshot[] = [
      { id: "loc-1", name: "Library", signalScore: 90, quality: "excellent", measuredAt: "2026-10-07T10:05:00Z", dataMode: "simulated" },
    ];

    const conditions = buildLocationConditions(occ, conn);
    assertEqual(conditions.length, 1, "Single composite condition");
    assertEqual(conditions[0].overallStatus, "critical", "Over capacity triggers critical status");
    assertEqual(conditions[0].lastUpdated, "2026-10-07T10:05:00Z", "Takes latest timestamp");
  });

  console.log("========================================================");
  console.log(`Results: ${passed} passed, ${failed} failed.`);
  console.log("========================================================\n");

  if (failed > 0) {
    throw new Error(`Calculation tests failed with ${failed} error(s).`);
  }

  return { total: passed + failed, passed, failed, errors };
}

// Auto-run when executed directly
if (typeof require !== "undefined" && require.main === module) {
  runLiveCampusUnitTests();
}
