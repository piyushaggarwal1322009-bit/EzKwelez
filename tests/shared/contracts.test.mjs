import assert from "node:assert/strict";
import {
  DataMode,
  OccupancyStatus,
  ConnectivityQuality,
  DependencyType,
  DependencyCriticality,
  IncidentType,
  IncidentSeverity,
  IncidentStatus,
  IncidentSource,
  IncidentUpdateType,
  classifyOccupancy,
  classifyConnectivity,
  OCCUPANCY_THRESHOLDS,
  CONNECTIVITY_THRESHOLDS,
  NodeType,
  RelationshipType,
  FailureType,
  ImpactType,
  ImpactSeverity,
  PlanStatus,
  RecoveryOptionType,
  Feasibility,
  PlanningObjectiveType,
  ResourceType,
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

// 4. Test Phase 7 Incident Enums
assert.equal(IncidentType.POWER_OUTAGE, "power_outage");
assert.equal(IncidentType.NETWORK_OUTAGE, "network_outage");
assert.equal(IncidentSeverity.CRITICAL, "critical");
assert.equal(IncidentSeverity.HIGH, "high");
assert.equal(IncidentStatus.REPORTED, "reported");
assert.equal(IncidentStatus.ACTIVE, "active");
assert.equal(IncidentStatus.RESOLVED, "resolved");
assert.equal(IncidentSource.MANUAL, "manual");
assert.equal(IncidentSource.SENSOR, "sensor");
assert.equal(IncidentUpdateType.STATUS_CHANGED, "status_changed");
console.log("✓ Phase 7 Incident enums and lifecycle types validated successfully.");

// 5. Test Phase 8 Graph and Impact Enums
assert.equal(NodeType.INFRASTRUCTURE, "infrastructure");
assert.equal(NodeType.UTILITY, "utility");
assert.equal(NodeType.NETWORK, "network");
assert.equal(RelationshipType.DEPENDS_ON, "depends_on");
assert.equal(RelationshipType.FEEDS, "feeds");
assert.equal(FailureType.OUTAGE, "outage");
assert.equal(ImpactType.DIRECT, "direct");
assert.equal(ImpactType.INDIRECT, "indirect");
assert.equal(ImpactSeverity.CRITICAL, "critical");
console.log("✓ Phase 8 Dependency Graph and Impact Analysis enums validated successfully.");

// 6. Test Phase 9 Recovery Enums
assert.equal(PlanStatus.APPROVED, "approved");
assert.equal(PlanStatus.DRAFT, "draft");
assert.equal(RecoveryOptionType.FAILOVER, "failover");
assert.equal(RecoveryOptionType.RELOCATE, "relocate");
assert.equal(Feasibility.FEASIBLE, "feasible");
assert.equal(Feasibility.CONDITIONALLY_FEASIBLE, "conditionally_feasible");
assert.equal(PlanningObjectiveType.MINIMIZE_STUDENT_DISRUPTION, "minimize_student_disruption");
assert.equal(ResourceType.BACKUP_POWER, "backup_power");
console.log("✓ Phase 9 Recovery Planning & Decision Support enums validated successfully.");

console.log("\nAll @ezykwelez/shared tests passed successfully!");
