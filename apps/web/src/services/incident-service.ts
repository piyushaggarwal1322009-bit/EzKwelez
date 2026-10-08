import { apiClient } from "./api-client";
import {
  CreateIncidentRequest,
  IncidentAffectedEntity,
  Criticality,
  DataMode,
  FailureType,
  Incident,
  IncidentAssessment,
  IncidentSeverity,
  IncidentSource,
  IncidentStatus,
  IncidentToImpactHandoff,
  IncidentType,
  IncidentUpdate,
  IncidentUpdateType,
  TransitionIncidentRequest,
} from "@ezykwelez/shared";

export interface IncidentFilterParams {
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  type?: IncidentType;
  locationId?: string;
  limit?: number;
  offset?: number;
}

const MOCK_INCIDENTS: Incident[] = [
  {
    id: "inc-00000000-0000-0000-0000-000000000001",
    campusId: "c0000000-0000-0000-0000-000000000001",
    title: "Grid B Main Feeder Trip",
    description: "Main 11kV transformer tie-breaker trip de-energizing Ramanujan Science Block B main power bus and optics lab.",
    type: IncidentType.POWER_OUTAGE,
    severity: IncidentSeverity.CRITICAL,
    status: IncidentStatus.ACTIVE,
    source: IncidentSource.SYSTEM,
    locationId: "b0000000-0000-0000-0000-000000000002",
    rootNodeId: "n0000000-0000-0000-0000-000000000001",
    dataMode: DataMode.SIMULATED,
    startedAt: "2026-10-07T08:15:00Z",
    detectedAt: "2026-10-07T08:15:00Z",
    createdAt: "2026-10-07T08:15:00Z",
    updatedAt: "2026-10-07T08:25:00Z",
  },
];

const MOCK_INCIDENT_UPDATES: Record<string, IncidentUpdate[]> = {
  "inc-00000000-0000-0000-0000-000000000001": [
    {
      id: "upd-001",
      incidentId: "inc-00000000-0000-0000-0000-000000000001",
      type: IncidentUpdateType.STATUS_CHANGED,
      message: "Automated telemetry detected bus voltage drop to zero. Incident escalated to Active Critical.",
      statusBefore: IncidentStatus.REPORTED,
      statusAfter: IncidentStatus.ACTIVE,
      createdBy: "system_telemetry",
      createdAt: "2026-10-07T08:16:00Z",
    },
    {
      id: "upd-002",
      incidentId: "inc-00000000-0000-0000-0000-000000000001",
      type: IncidentUpdateType.COMMENT_ADDED,
      message: "Lead electrician dispatched to Substation Grid B to inspect transformer tie-breaker.",
      statusBefore: IncidentStatus.ACTIVE,
      statusAfter: IncidentStatus.INVESTIGATING,
      createdBy: "campus_ops_lead",
      createdAt: "2026-10-07T08:22:00Z",
    },
  ],
};

export const incidentService = {
  async listIncidents(params?: IncidentFilterParams): Promise<Incident[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.severity) query.set("severity", params.severity);
    if (params?.type) query.set("type", params.type);
    if (params?.locationId) query.set("locationId", params.locationId);
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.offset) query.set("offset", params.offset.toString());

    const qs = query.toString();
    try {
      return await apiClient.get<Incident[]>(`/incidents${qs ? `?${qs}` : ""}`);
    } catch {
      let filtered = [...MOCK_INCIDENTS];
      if (params?.status) filtered = filtered.filter((i) => i.status === params.status);
      if (params?.severity) filtered = filtered.filter((i) => i.severity === params.severity);
      if (params?.locationId) filtered = filtered.filter((i) => i.locationId === params.locationId);
      return filtered;
    }
  },

  async getIncident(id: string): Promise<Incident> {
    try {
      return await apiClient.get<Incident>(`/incidents/${id}`);
    } catch {
      const match = MOCK_INCIDENTS.find((i) => i.id === id);
      return match || MOCK_INCIDENTS[0];
    }
  },

  async getAssessment(id: string): Promise<IncidentAssessment> {
    return await apiClient.get<IncidentAssessment>(`/incidents/${id}/assessment`);
  },

  async createIncident(
    payload: CreateIncidentRequest,
    idempotencyKey?: string
  ): Promise<Incident> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    try {
      return await apiClient.post<Incident>("/incidents", payload, { headers });
    } catch {
      const newInc: Incident = {
        id: `inc-${Date.now()}`,
        campusId: "c0000000-0000-0000-0000-000000000001",
        title: payload.title,
        description: payload.description || "",
        type: payload.type,
        severity: payload.severity,
        status: payload.status || IncidentStatus.REPORTED,
        source: payload.source || IncidentSource.MANUAL,
        locationId: payload.locationId,
        rootNodeId: payload.rootNodeId,
        dataMode: DataMode.SIMULATED,
        startedAt: payload.startedAt || new Date().toISOString(),
        detectedAt: payload.detectedAt || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_INCIDENTS.unshift(newInc);
      return newInc;
    }
  },

  async createCampusIncident(
    campusId: string,
    payload: CreateIncidentRequest,
    idempotencyKey?: string
  ): Promise<Incident> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
    return apiClient.post<Incident>(`/campuses/${campusId}/incidents`, payload, { headers });
  },

  async addAffectedEntity(
    incidentId: string,
    payload: { nodeId: string; reason: string }
  ): Promise<IncidentAffectedEntity> {
    return apiClient.post<IncidentAffectedEntity>(
      `/incidents/${incidentId}/affected-entities`,
      payload
    );
  },

  async getAffectedEntities(incidentId: string): Promise<IncidentAffectedEntity[]> {
    return apiClient.get<IncidentAffectedEntity[]>(`/incidents/${incidentId}/affected-entities`);
  },

  async transitionIncident(
    id: string,
    payload: TransitionIncidentRequest
  ): Promise<Incident> {
    try {
      return await apiClient.post<Incident>(`/incidents/${id}/transitions`, payload);
    } catch {
      const inc = MOCK_INCIDENTS.find((i) => i.id === id) || MOCK_INCIDENTS[0];
      const updated: Incident = {
        ...inc,
        status: payload.targetStatus,
        updatedAt: new Date().toISOString(),
      };
      const index = MOCK_INCIDENTS.findIndex((i) => i.id === id);
      if (index >= 0) MOCK_INCIDENTS[index] = updated;

      if (!MOCK_INCIDENT_UPDATES[id]) MOCK_INCIDENT_UPDATES[id] = [];
      MOCK_INCIDENT_UPDATES[id].push({
        id: `upd-${Date.now()}`,
        incidentId: id,
        type: IncidentUpdateType.STATUS_CHANGED,
        message: payload.message || `Status shifted to ${payload.targetStatus}`,
        statusBefore: inc.status,
        statusAfter: payload.targetStatus,
        createdBy: payload.actorId || "system",
        createdAt: new Date().toISOString(),
      });

      return updated;
    }
  },

  async getIncidentUpdates(id: string): Promise<IncidentUpdate[]> {
    try {
      return await apiClient.get<IncidentUpdate[]>(`/incidents/${id}/updates`);
    } catch {
      return MOCK_INCIDENT_UPDATES[id] || MOCK_INCIDENT_UPDATES["inc-00000000-0000-0000-0000-000000000001"] || [];
    }
  },

  async getImpactHandoff(id: string): Promise<IncidentToImpactHandoff> {
    try {
      return await apiClient.get<IncidentToImpactHandoff>(`/incidents/${id}/impact-handoff`);
    } catch {
      return {
        incidentId: id,
        rootNodeId: "n0000000-0000-0000-0000-000000000001",
        failureType: FailureType.OUTAGE,
        severity: Criticality.CRITICAL,
        occurredAt: new Date().toISOString(),
        dataMode: DataMode.SIMULATED,
      };
    }
  },
};

