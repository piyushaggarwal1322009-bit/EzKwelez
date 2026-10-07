import { apiClient } from "./api-client";
import {
  DataMode,
  Feasibility,
  ConfidenceLevel,
  PlanStatus,
  RecoveryOptionType,
  RecoveryPlan,
  RecoveryPlanReviewRequest,
  RecoveryPlanningRequest,
  TradeoffDirection,
  Criticality,
  RecoveryResourceType,
  PlanningObjectiveType,
  PlanningObjectivePriority,
  AssumptionStatus,
} from "@ezykwelez/shared";

// Seeded deterministic fallback plans for demo and offline development
const MOCK_RECOVERY_PLANS: Record<string, RecoveryPlan> = {
  "rec-plan-grid-b-01": {
    id: "rec-plan-grid-b-01",
    incidentId: "inc-00000000-0000-0000-0000-000000000001",
    impactAnalysisId: "ana_grid_b_outage",
    version: 1,
    status: PlanStatus.GENERATED,
    dataMode: DataMode.SIMULATED,
    warnings: [
      "RESOURCE_AVAILABILITY_UNVERIFIED: Auxiliary Generator #2 fuel reserve unverified.",
      "CAMPUS_DATA_SIMULATED: Plan formulated under simulated campus load.",
    ],
    generatedAt: "2026-10-07T08:25:00Z",
    objectives: [
      {
        type: PlanningObjectiveType.MINIMIZE_STUDENT_DISRUPTION,
        priority: PlanningObjectivePriority.HIGH,
      },
      {
        type: PlanningObjectiveType.MINIMIZE_RECOVERY_TIME,
        priority: PlanningObjectivePriority.MEDIUM,
      },
    ],
    assumptions: [
      {
        description: "Auxiliary power transfer switch is functional in Ramanujan Block B.",
        source: "Substation Maintenance Log",
        confidence: ConfidenceLevel.MEDIUM,
        status: AssumptionStatus.TENTATIVE,
      },
      {
        description: "Seminar Hall C204 has vacant capacity for relocated PHYS-101 cohort.",
        source: "Live Occupancy Telemetry",
        confidence: ConfidenceLevel.HIGH,
        status: AssumptionStatus.VALID,
      },
    ],
    constraints: [
      {
        id: "c-01",
        type: "capacity" as any,
        description: "Relocated facility must hold at least 120 students.",
        severity: "hard" as any,
        value: 120,
        source: "Freshman Physics Practicum Enrollment",
      },
      {
        id: "c-02",
        type: "safety" as any,
        description: "Laser optics lab equipment must be cooled down prior to breaker reset.",
        severity: "hard" as any,
        source: "Lab Safety Protocol Standard",
      },
    ],
    options: [
      {
        id: "opt-01",
        title: "Relocate PHYS-101 Practicum to Seminar Hall C204",
        description: "Move the 120-student lecture from affected Block B to available Seminar Hall C204 in Ramanujan Block C.",
        type: RecoveryOptionType.RELOCATE,
        feasibility: Feasibility.FEASIBLE,
        rank: 1,
        estimatedRecoveryTime: {
          value: 20,
          unit: "minutes",
          confidence: ConfidenceLevel.HIGH,
          assumptions: ["Room C204 currently shows 0% occupancy."],
        },
        estimatedImpactReduction: {
          affectedNodeReduction: 2,
          affectedLocationReduction: 1,
          severityReduction: "High -> Low for student lectures",
          estimatedPercent: 75.0,
        },
        confidence: ConfidenceLevel.HIGH,
        rationale: "Ranked #1 because Seminar Hall C204 is immediately vacant, supports AV projection, and eliminates 120 student delays.",
        affectedLocations: ["r0000000-0000-0000-0000-000000000009"],
        affectedNodes: ["n0000000-0000-0000-0000-000000000006"],
        prerequisites: [
          {
            type: "room_availability",
            description: "Room C204 must remain unbooked until 11:30 AM.",
            satisfied: true,
            source: "Timetable Schedule System",
          },
        ],
        resourceRequirements: [
          {
            resourceType: RecoveryResourceType.STAFF,
            quantity: 1,
            availability: "available",
            location: "Block C Admin",
            source: "Department Dispatch",
          },
        ],
        risks: [
          {
            description: "Students require 5-minute walking transit between Block B and Block C.",
            severity: Criticality.LOW,
            likelihood: "Low",
            affectedSystems: ["Freshman Cohort"],
          },
        ],
        tradeoffs: [
          {
            dimension: "Walking Transit Time",
            value: "+5 mins",
            direction: TradeoffDirection.WORSE,
            explanation: "Minimal walking inconvenience for freshman cohort.",
          },
          {
            dimension: "Lecture Delay",
            value: "0 mins",
            direction: TradeoffDirection.BETTER,
            explanation: "Prevents full class cancellation.",
          },
        ],
      },
      {
        id: "opt-02",
        title: "Failover Grid B to Substation Feeder Ring A (Backup)",
        description: "Engage tie-breaker at Grid A to re-energize Ramanujan Block B main power bus.",
        type: RecoveryOptionType.FAILOVER,
        feasibility: Feasibility.CONDITIONALLY_FEASIBLE,
        rank: 2,
        estimatedRecoveryTime: {
          value: 45,
          unit: "minutes",
          confidence: ConfidenceLevel.MEDIUM,
          assumptions: ["High-voltage certified technician is on campus."],
        },
        estimatedImpactReduction: {
          affectedNodeReduction: 6,
          affectedLocationReduction: 2,
          severityReduction: "Critical -> Operational",
          estimatedPercent: 100.0,
        },
        confidence: ConfidenceLevel.MEDIUM,
        rationale: "Ranked #2: Full permanent restoration of entire building power, but requires certified electrical technician on-site.",
        affectedLocations: ["b0000000-0000-0000-0000-000000000002"],
        affectedNodes: ["n0000000-0000-0000-0000-000000000001", "n0000000-0000-0000-0000-000000000002"],
        prerequisites: [
          {
            type: "technician_dispatch",
            description: "Authorized electrician must verify bus isolation before tie switch engagement.",
            satisfied: false,
            source: "Facilities Work Order Dispatch",
          },
        ],
        resourceRequirements: [
          {
            resourceType: RecoveryResourceType.TECHNICIAN,
            quantity: 2,
            availability: "dispatched",
            location: "Substation Grid A",
            source: "Campus Facilities",
          },
        ],
        risks: [
          {
            description: "Grid A load spike if total science complex load exceeds 85% capacity.",
            severity: Criticality.HIGH,
            likelihood: "Low",
            affectedSystems: ["Substation Grid A Primary"],
          },
        ],
        tradeoffs: [
          {
            dimension: "Power Restoration",
            value: "100%",
            direction: TradeoffDirection.BETTER,
            explanation: "Restores both lecture halls and precision spectrometer lab.",
          },
          {
            dimension: "Operational Safety Window",
            value: "45 mins",
            direction: TradeoffDirection.NEUTRAL,
            explanation: "Requires complete verification before switching.",
          },
        ],
      },
      {
        id: "opt-03",
        title: "Isolate Optics Lab & Defer Spectrometer Experiments",
        description: "Lock out laser rig power feed, postpone practicum lab tasks, and hold theoretical lecture via remote stream.",
        type: RecoveryOptionType.ISOLATE,
        feasibility: Feasibility.FEASIBLE,
        rank: 3,
        estimatedRecoveryTime: {
          value: 10,
          unit: "minutes",
          confidence: ConfidenceLevel.HIGH,
          assumptions: ["Students have active LMS accounts."],
        },
        estimatedImpactReduction: {
          affectedNodeReduction: 1,
          affectedLocationReduction: 0,
          severityReduction: "Medium",
          estimatedPercent: 35.0,
        },
        confidence: ConfidenceLevel.HIGH,
        rationale: "Fastest implementation but causes partial educational disruption by cancelling hands-on lab work.",
        affectedLocations: ["r0000000-0000-0000-0000-000000000003"],
        affectedNodes: ["n0000000-0000-0000-0000-000000000005"],
        prerequisites: [],
        resourceRequirements: [],
        risks: [],
        tradeoffs: [
          {
            dimension: "Implementation Speed",
            value: "10 mins",
            direction: TradeoffDirection.BETTER,
            explanation: "Immediate safety containment.",
          },
          {
            dimension: "Lab Learning Value",
            value: "Postponed",
            direction: TradeoffDirection.WORSE,
            explanation: "Students miss hands-on experiment time.",
          },
        ],
      },
    ],
  },
};

export const recoveryService = {
  async getPlansForIncident(incidentId: string): Promise<RecoveryPlan[]> {
    try {
      const plans = await apiClient.get<RecoveryPlan[]>(`/incidents/${incidentId}/recovery-plans`);
      return plans;
    } catch {
      // Return typed simulated fallback for verified development & demonstration
      const matched = Object.values(MOCK_RECOVERY_PLANS).filter(
        (p) => p.incidentId === incidentId || incidentId.startsWith("inc-")
      );
      return matched.length > 0 ? matched : [MOCK_RECOVERY_PLANS["rec-plan-grid-b-01"]];
    }
  },

  async getPlanById(planId: string): Promise<RecoveryPlan> {
    try {
      return await apiClient.get<RecoveryPlan>(`/recovery-plans/${planId}`);
    } catch {
      return MOCK_RECOVERY_PLANS[planId] || MOCK_RECOVERY_PLANS["rec-plan-grid-b-01"];
    }
  },

  async generatePlan(request: RecoveryPlanningRequest): Promise<RecoveryPlan> {
    try {
      return await apiClient.post<RecoveryPlan>("/recovery-plans", request);
    } catch {
      return {
        ...MOCK_RECOVERY_PLANS["rec-plan-grid-b-01"],
        incidentId: request.incidentId,
        impactAnalysisId: request.impactAnalysisId,
        generatedAt: new Date().toISOString(),
      };
    }
  },

  async reviewPlan(planId: string, review: RecoveryPlanReviewRequest): Promise<RecoveryPlan> {
    try {
      return await apiClient.post<RecoveryPlan>(`/recovery-plans/${planId}/review`, review);
    } catch {
      const existing = MOCK_RECOVERY_PLANS[planId] || MOCK_RECOVERY_PLANS["rec-plan-grid-b-01"];
      const updated: RecoveryPlan = {
        ...existing,
        status: review.status,
        reviewedBy: review.reviewedBy,
        reviewedAt: new Date().toISOString(),
        reviewNotes: review.reviewNotes,
      };
      MOCK_RECOVERY_PLANS[planId] = updated;
      return updated;
    }
  },
};
