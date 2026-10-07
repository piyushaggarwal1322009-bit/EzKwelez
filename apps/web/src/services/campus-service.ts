import { apiClient } from "./api-client";
import {
  CampusLocation,
  EntityOperationalState,
  LiveCampusConditionsSummary,
  LocationCondition,
} from "@ezykwelez/shared";

export interface CampusConditionsResponse {
  summary: LiveCampusConditionsSummary;
  locations: LocationCondition[];
  dataMode: string;
}

export const campusService = {
  async getLocations(): Promise<CampusLocation[]> {
    return apiClient.get<CampusLocation[]>("/campus/locations");
  },

  async getConditions(): Promise<CampusConditionsResponse> {
    return apiClient.get<CampusConditionsResponse>("/campus/conditions");
  },

  async getLocationCondition(locationId: string): Promise<LocationCondition> {
    return apiClient.get<LocationCondition>(`/campus/conditions/${locationId}`);
  },

  async getEntityState(campusId: string, nodeId: string): Promise<EntityOperationalState> {
    return apiClient.get<EntityOperationalState>(`/campuses/${campusId}/state/${nodeId}`);
  },
};
