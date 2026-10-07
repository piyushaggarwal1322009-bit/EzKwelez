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
 * Dependency Graph Node Types
 */
export enum NodeType {
  INFRASTRUCTURE = "infrastructure",
  UTILITY = "utility",
  NETWORK = "network",
  BUILDING = "building",
  ROOM = "room",
  SERVICE = "service",
  SYSTEM = "system",
  RESOURCE = "resource",
  OPERATION = "operation",
}

/**
 * Canonical Dependency Graph Relationship Types
 */
export enum RelationshipType {
  DEPENDS_ON = "depends_on",
  SUPPORTS = "supports",
  FEEDS = "feeds",
  CONNECTS = "connects",
  HOSTS = "hosts",
  SERVES = "serves",
  REQUIRES = "requires",
  ALTERNATIVE_TO = "alternative_to",
}

/**
 * Historical/Compatibility Dependency Type Enum
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

/**
 * Standard Criticality Levels
 */
export enum Criticality {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Operational Node State (Decoupled from Incident State)
 */
export enum NodeStatus {
  OPERATIONAL = "operational",
  DEGRADED = "degraded",
  DISRUPTED = "disrupted",
  FAILED = "failed",
  UNKNOWN = "unknown",
}

/**
 * Failure / Disruption Event Types
 */
export enum FailureType {
  OUTAGE = "outage",
  DEGRADATION = "degradation",
  FAILURE = "failure",
  MAINTENANCE = "maintenance",
  CAPACITY_EXCEEDED = "capacity_exceeded",
  CONNECTIVITY_LOSS = "connectivity_loss",
}

/**
 * Impact Classification Types
 */
export enum ImpactType {
  DIRECT = "direct",
  INDIRECT = "indirect",
  DEPENDENT = "dependent",
  DEGRADED = "degraded",
  UNAVAILABLE = "unavailable",
  AT_RISK = "at_risk",
}

/**
 * Authoritative Impact Severity
 */
export enum ImpactSeverity {
  NONE = "none",
  LOW = "low",
  MODERATE = "moderate",
  HIGH = "high",
  CRITICAL = "critical",
}
