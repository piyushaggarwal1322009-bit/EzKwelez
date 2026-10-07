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
  ANALYZED = "ANALYZED",
  RECOVERY_IN_PROGRESS = "RECOVERY_IN_PROGRESS",
  RESOLVED = "RESOLVED",
}

export enum EntityType {
  BUILDING = "BUILDING",
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
