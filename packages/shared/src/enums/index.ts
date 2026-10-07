/**
 * Core Enums for EzyKwelez
 * Shared across frontend and backend boundaries
 */

export enum UserRole {
  STUDENT = "student",
  STAFF = "staff",
  ADMIN = "admin",
}

export enum LocationType {
  ACADEMIC = "academic",
  LIBRARY = "library",
  CANTEEN = "canteen",
  HOSTEL = "hostel",
  ADMINISTRATION = "administration",
  LABORATORY = "laboratory",
  SPORTS = "sports",
  ENTRANCE = "entrance",
  COMMON_AREA = "common_area",
  OTHER = "other",
}

export enum ResourceType {
  POWER = "power",
  NETWORK = "network",
  WATER = "water",
  HVAC = "hvac",
  SECURITY = "security",
  COMMUNICATION = "communication",
  TRANSPORT = "transport",
  EQUIPMENT = "equipment",
  OTHER = "other",
}

export enum ServiceType {
  NETWORK = "network",
  ACADEMIC = "academic",
  FOOD = "food",
  SECURITY = "security",
  ACCESS = "access",
  WATER = "water",
  POWER = "power",
  COMMUNICATION = "communication",
  ADMINISTRATION = "administration",
  OTHER = "other",
}

export enum DependencyType {
  POWER = "power",
  NETWORK = "network",
  WATER = "water",
  HVAC = "hvac",
  SECURITY = "security",
  COMMUNICATION = "communication",
  ACCESS = "access",
  OPERATIONAL = "operational",
  OTHER = "other",
}

export enum DependencyStrength {
  REQUIRED = "required",
  CRITICAL = "critical",
  IMPORTANT = "important",
  OPTIONAL = "optional",
}

export enum StructuralStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  MAINTENANCE = "maintenance",
  UNKNOWN = "unknown",
}

export enum CampusEntityType {
  RESOURCE = "resource",
  LOCATION = "location",
  SERVICE = "service",
}

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
