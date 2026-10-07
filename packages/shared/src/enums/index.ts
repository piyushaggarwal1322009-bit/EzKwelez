/**
 * Core Enums for EzyKwelez
 * Shared across frontend and backend boundaries
 */

export enum IncidentSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum IncidentStatus {
  REPORTED = "REPORTED",
  INVESTIGATING = "INVESTIGATING",
  ACTIVE = "ACTIVE",
  MITIGATED = "MITIGATED",
  RESOLVED = "RESOLVED",
  CANCELLED = "CANCELLED",
}

export enum EntityType {
  CAMPUS = "CAMPUS",
  BUILDING = "BUILDING",
  ZONE = "ZONE",
  ROOM = "ROOM",
  RESOURCE = "RESOURCE",
  CLASS_SESSION = "CLASS_SESSION",
  FACILITY = "FACILITY",
}

export enum RecoveryPlanStatus {
  DRAFT = "DRAFT",
  EVALUATED = "EVALUATED",
  RECOMMENDED = "RECOMMENDED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

/**
 * Data provenance and mode indicator
 * Ensures simulated or estimated data cannot masquerade as live telemetry
 */
export enum DataMode {
  LIVE = "live",
  SIMULATED = "simulated",
  ESTIMATED = "estimated",
  UNKNOWN = "unknown",
}

/**
 * Authoritative Occupancy Classification
 * 0–49%: Low
 * 50–74%: Moderate
 * 75–89%: Busy
 * 90–100%: Very Busy
 * >100%: Over Capacity
 */
export enum OccupancyStatus {
  LOW = "Low",
  MODERATE = "Moderate",
  BUSY = "Busy",
  VERY_BUSY = "Very Busy",
  OVER_CAPACITY = "Over Capacity",
}

/**
 * Authoritative Connectivity Classification
 * 80–100: Excellent
 * 60–79: Good
 * 40–59: Fair
 * 20–39: Weak
 * 0–19: Very Weak
 */
export enum ConnectivityQuality {
  EXCELLENT = "Excellent",
  GOOD = "Good",
  FAIR = "Fair",
  WEAK = "Weak",
  VERY_WEAK = "Very Weak",
}

/**
 * Dependency Graph Edge Types
 */
export enum DependencyType {
  POWERED_BY = "POWERED_BY",
  NETWORKED_BY = "NETWORKED_BY",
  LOCATED_IN = "LOCATED_IN",
  OCCUPIES = "OCCUPIES",
  REQUIRES_RESOURCE = "REQUIRES_RESOURCE",
  ATTENDED_BY = "ATTENDED_BY",
  SERVES = "SERVES",
  ALTERNATIVE_TO = "ALTERNATIVE_TO",
}

/**
 * Dependency Criticality Levels
 */
export enum DependencyCriticality {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}
