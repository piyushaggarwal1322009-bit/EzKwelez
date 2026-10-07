import assert from "node:assert/strict";
import {
  DataMode,
  OccupancyStatus,
  ConnectivityQuality,
  DependencyType,
  DependencyCriticality,
  classifyOccupancy,
  classifyConnectivity,
  OCCUPANCY_THRESHOLDS,
  CONNECTIVITY_THRESHOLDS,
} from "../../packages/shared/dist/index.js";

console.log("Running @ezykwelez/shared Contract & Business Rule Tests...");

// 1. Test Occupancy Classification Thresholds
assert.equal(classifyOccupancy(0), OccupancyStatus.LOW);
assert.equal(classifyOccupancy(49), OccupancyStatus.LOW);
assert.equal(classifyOccupancy(50), OccupancyStatus.MODERATE);
assert.equal(classifyOccupancy(74), OccupancyStatus.MODERATE);
assert.equal(classifyOccupancy(75), OccupancyStatus.BUSY);
assert.equal(classifyOccupancy(89), OccupancyStatus.BUSY);
assert.equal(classifyOccupancy(90), OccupancyStatus.VERY_BUSY);
assert.equal(classifyOccupancy(100), OccupancyStatus.VERY_BUSY);
assert.equal(classifyOccupancy(101), OccupancyStatus.OVER_CAPACITY);
assert.equal(classifyOccupancy(150), OccupancyStatus.OVER_CAPACITY);
console.log("✓ classifyOccupancy threshold tests passed.");

// 2. Test Connectivity Classification Thresholds
assert.equal(classifyConnectivity(0), ConnectivityQuality.VERY_WEAK);
assert.equal(classifyConnectivity(19), ConnectivityQuality.VERY_WEAK);
assert.equal(classifyConnectivity(20), ConnectivityQuality.WEAK);
assert.equal(classifyConnectivity(39), ConnectivityQuality.WEAK);
assert.equal(classifyConnectivity(40), ConnectivityQuality.FAIR);
assert.equal(classifyConnectivity(59), ConnectivityQuality.FAIR);
assert.equal(classifyConnectivity(60), ConnectivityQuality.GOOD);
assert.equal(classifyConnectivity(79), ConnectivityQuality.GOOD);
assert.equal(classifyConnectivity(80), ConnectivityQuality.EXCELLENT);
assert.equal(classifyConnectivity(100), ConnectivityQuality.EXCELLENT);
console.log("✓ classifyConnectivity threshold tests passed.");

// 3. Test DataMode and Enums
assert.equal(DataMode.LIVE, "live");
assert.equal(DataMode.SIMULATED, "simulated");
assert.equal(DataMode.ESTIMATED, "estimated");
assert.equal(DataMode.UNKNOWN, "unknown");

assert.equal(DependencyType.POWERED_BY, "POWERED_BY");
assert.equal(DependencyType.LOCATED_IN, "LOCATED_IN");
assert.equal(DependencyType.REQUIRES_RESOURCE, "REQUIRES_RESOURCE");
assert.equal(DependencyCriticality.CRITICAL, "CRITICAL");
console.log("✓ Enums and provenance types validated successfully.");

console.log("\nAll @ezykwelez/shared tests passed successfully!");
