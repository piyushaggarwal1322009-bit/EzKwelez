import { apiClient } from "./api-client";
import {
  CreateIncidentRequest,
  Incident,
  IncidentSeverity,
  IncidentStatus,
  IncidentToImpactHandoff,
  IncidentType,
  IncidentUpdate,
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
    return apiClient.get<Incident[]>(`/incidents${qs ? `?${qs}` : ""}`);
  },

  async getIncident(id: string): Promise<Incident> {
    return apiClient.get<Incident>(`/incidents/${id}`);
  },

  async createIncident(
    payload: CreateIncidentRequest,
    idempotencyKey?: string
  ): Promise<Incident> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    return apiClient.post<Incident>("/incidents", payload, { headers });
  },

  async transitionIncident(
    id: string,
    payload: TransitionIncidentRequest
  ): Promise<Incident> {
    return apiClient.post<Incident>(`/incidents/${id}/transitions`, payload);
  },

  async getIncidentUpdates(id: string): Promise<IncidentUpdate[]> {
    return apiClient.get<IncidentUpdate[]>(`/incidents/${id}/updates`);
  },

  async getImpactHandoff(id: string): Promise<IncidentToImpactHandoff> {
    return apiClient.get<IncidentToImpactHandoff>(`/incidents/${id}/impact-handoff`);
  },
};
