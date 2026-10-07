/**
 * Core Enums for EzyKwelez
 * Shared across frontend and backend boundaries
 */

export enum IncidentSeverity {
  INFO = "info",
  LOW = "low",
  MODERATE = "moderate",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum IncidentStatus {
  REPORTED = "reported",
  TRIAGED = "triaged",
  INVESTIGATING = "investigating",
  ACTIVE = "active",
  MITIGATED = "mitigated",
  RESOLVED = "resolved",
  CLOSED = "closed",
  CANCELLED = "cancelled",
}

export enum IncidentType {
  POWER_OUTAGE = "power_outage",
  NETWORK_OUTAGE = "network_outage",
  WATER_OUTAGE = "water_outage",
  FIRE = "fire",
  EQUIPMENT_FAILURE = "equipment_failure",
  BUILDING_ISSUE = "building_issue",
  SECURITY_EVENT = "security_event",
  CAPACITY_ISSUE = "capacity_issue",
  MAINTENANCE = "maintenance",
  ENVIRONMENTAL = "environmental",
  HVAC_ISSUE = "hvac_issue",
  COMMUNICATIONS_OUTAGE = "communications_outage",
  ACCESS_ISSUE = "access_issue",
  OPERATIONAL = "operational",
  OTHER = "other",
}

export enum IncidentSource {
  MANUAL = "manual",
  SENSOR = "sensor",
  PROVIDER = "provider",
  MONITORING = "monitoring",
  SYSTEM = "system",
  IMPORTED = "imported",
  UNKNOWN = "unknown",
}

export enum IncidentUpdateType {
  CREATED = "created",
  STATUS_CHANGED = "status_changed",
  SEVERITY_CHANGED = "severity_changed",
  LOCATION_UPDATED = "location_updated",
  ROOT_NODE_UPDATED = "root_node_updated",
  COMMENT_ADDED = "comment_added",
  ACKNOWLEDGED = "acknowledged",
  MITIGATED = "mitigated",
  RESOLVED = "resolved",
  CLOSED = "closed",
  CANCELLED = "cancelled",
  AFFECTED_ENTITY_ADDED = "affected_entity_added",
}

export enum EntityType {
  CAMPUS = "CAMPUS",
  BUILDING = "BUILDING",
  ZONE = "ZONE",
  ROOM = "ROOM",
  RESOURCE = "RESOURCE",
  SERVICE = "SERVICE",
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
  OFFLINE = "offline",
  MAINTENANCE = "maintenance",
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

/**
 * Phase 6 Recovery Plan Lifecycle Status
 */
export enum PlanStatus {
  DRAFT = "draft",
  GENERATED = "generated",
  UNDER_REVIEW = "under_review",
  APPROVED = "approved",
  REJECTED = "rejected",
  SUPERSEDED = "superseded",
}

/**
 * Controlled vocabulary for recovery strategies & options
 */
export enum RecoveryOptionType {
  REROUTE = "reroute",
  FAILOVER = "failover",
  RELOCATE = "relocate",
  ISOLATE = "isolate",
  RESTORE = "restore",
  SUBSTITUTE = "substitute",
  REDUCE_LOAD = "reduce_load",
  PRIORITIZE_SERVICE = "prioritize_service",
  TEMPORARY_SHUTDOWN = "temporary_shutdown",
  MANUAL_INTERVENTION = "manual_intervention",
  OTHER = "other",
}

/**
 * Feasibility evaluation classification
 */
export enum Feasibility {
  FEASIBLE = "feasible",
  CONDITIONALLY_FEASIBLE = "conditionally_feasible",
  INFEASIBLE = "infeasible",
  UNKNOWN = "unknown",
}

/**
 * Generic confidence level rating
 */
export enum ConfidenceLevel {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
  UNKNOWN = "unknown",
}

/**
 * Recovery constraint categories
 */
export enum ConstraintType {
  RESOURCE = "resource",
  CAPACITY = "capacity",
  TIME = "time",
  DEPENDENCY = "dependency",
  SAFETY = "safety",
  AVAILABILITY = "availability",
  LOCATION = "location",
  POLICY = "policy",
  STAFFING = "staffing",
}

/**
 * Constraint enforcement severity
 */
export enum ConstraintSeverity {
  HARD = "hard",
  SOFT = "soft",
}

/**
 * Operational resource types
 */
export enum ResourceType {
  TECHNICIAN = "technician",
  BACKUP_POWER = "backup_power",
  BACKUP_NETWORK = "backup_network",
  AVAILABLE_ROOM = "available_room",
  EQUIPMENT = "equipment",
  STAFF = "staff",
  TIME_WINDOW = "time_window",
  OTHER = "other",
}

/**
 * Recovery planning objective types
 */
export enum PlanningObjectiveType {
  MINIMIZE_RECOVERY_TIME = "minimize_recovery_time",
  MINIMIZE_STUDENT_DISRUPTION = "minimize_student_disruption",
  MINIMIZE_RESOURCE_USE = "minimize_resource_use",
  MAXIMIZE_SERVICE_CONTINUITY = "maximize_service_continuity",
  MINIMIZE_OPERATIONAL_RISK = "minimize_operational_risk",
}

/**
 * Objective priority rating
 */
export enum PlanningObjectivePriority {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

/**
 * Relative trade-off comparison direction
 */
export enum TradeoffDirection {
  BETTER = "better",
  WORSE = "worse",
  NEUTRAL = "neutral",
}

/**
 * Planning assumption status
 */
export enum AssumptionStatus {
  VALID = "valid",
  TENTATIVE = "tentative",
  REFUTED = "refuted",
}
