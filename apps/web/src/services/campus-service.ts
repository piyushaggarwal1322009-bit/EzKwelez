import { apiClient } from "./api-client";
import {
  CampusLocation,
  DataMode,
  EntityType,
  LiveCampusConditionsSummary,
  LocationCondition,
  OccupancyStatus,
  ConnectivityQuality,
} from "@ezykwelez/shared";
import {
  generateMockLiveCampusConditions,
  SimulationScenario,
} from "@/features/tanisha/live-campus";

export interface CampusConditionsResponse {
  summary: LiveCampusConditionsSummary;
  locations: LocationCondition[];
  dataMode: string;
  isFallback?: boolean;
}

function convertTanishaMockToConditionsResponse(
  mockRes: ReturnType<typeof generateMockLiveCampusConditions>
): CampusConditionsResponse {
  const occMap = new Map(mockRes.occupancy.map((o) => [o.id, o]));
  const connMap = new Map(mockRes.connectivity.map((c) => [c.id, c]));

  const locations: LocationCondition[] = mockRes.occupancy.map((occ) => {
    const conn = connMap.get(occ.id);
    const occStatus =
      occ.status === "low"
        ? OccupancyStatus.LOW
        : occ.status === "moderate"
        ? OccupancyStatus.MODERATE
        : occ.status === "busy"
        ? OccupancyStatus.BUSY
        : occ.status === "very_busy"
        ? OccupancyStatus.VERY_BUSY
        : OccupancyStatus.OVER_CAPACITY;

    const connQuality =
      conn?.quality === "excellent"
        ? ConnectivityQuality.EXCELLENT
        : conn?.quality === "good"
        ? ConnectivityQuality.GOOD
        : conn?.quality === "fair"
        ? ConnectivityQuality.FAIR
        : conn?.quality === "weak"
        ? ConnectivityQuality.WEAK
        : ConnectivityQuality.VERY_WEAK;

    const buildingId = occ.zone?.includes("Science")
      ? "b0000000-0000-0000-0000-000000000002"
      : occ.zone?.includes("Commons")
      ? "b0000000-0000-0000-0000-000000000004"
      : "b0000000-0000-0000-0000-000000000003";

    return {
      location: {
        id: occ.id,
        name: occ.name,
        type: EntityType.RESOURCE,
        campusId: "c0000000-0000-0000-0000-000000000001",
        buildingId,
        code: occ.id.toUpperCase(),
        capacity: occ.capacity,
        metadata: { zone: occ.zone },
      },
      occupancy: {
        locationId: occ.id,
        currentStudents: occ.currentCount,
        headcount: occ.currentCount,
        capacity: occ.capacity,
        occupancyPercentage: occ.percentage,
        status: occStatus,
        updatedAt: occ.measuredAt,
        dataMode: DataMode.SIMULATED,
      },
      connectivity: {
        locationId: conn?.id || occ.id,
        signalScore: conn?.signalScore ?? 70,
        quality: connQuality,
        networkName: conn?.networkName || "APEX-CAMPUS-MESH",
        dbm: conn?.signalDbm ?? -65,
        updatedAt: conn?.measuredAt || occ.measuredAt,
        dataMode: DataMode.SIMULATED,
      },
      overallHealth:
        occ.status === "over_capacity" || conn?.quality === "very_weak"
          ? "CRITICAL"
          : occ.status === "busy" || conn?.quality === "weak"
          ? "DEGRADED"
          : "NORMAL",
    };
  });

  return {
    summary: {
      totalLocations: mockRes.overview.locationsMonitored,
      totalOccupancy: mockRes.overview.totalStudentsTracked,
      totalCapacity: mockRes.overview.totalCapacityTracked,
      averageOccupancyRate: mockRes.overview.averageOccupancyPercentage,
      overallSignalScore: mockRes.overview.averageSignalScore,
    },
    locations,
    dataMode: DataMode.SIMULATED,
    isFallback: true,
  };
}

export const campusService = {
  async getLocations(): Promise<CampusLocation[]> {
    try {
      return await apiClient.get<CampusLocation[]>("/campus/locations");
    } catch {
      const mock = convertTanishaMockToConditionsResponse(generateMockLiveCampusConditions("normal"));
      return mock.locations.map((l) => l.location);
    }
  },

  async getConditions(scenario?: SimulationScenario): Promise<CampusConditionsResponse> {
    // If a specific simulation scenario is requested by the operator, generate it directly
    if (scenario && scenario !== "normal") {
      return convertTanishaMockToConditionsResponse(generateMockLiveCampusConditions(scenario));
    }

    try {
      const res = await apiClient.get<CampusConditionsResponse>("/campus/conditions");
      return { ...res, isFallback: false };
    } catch {
      return convertTanishaMockToConditionsResponse(generateMockLiveCampusConditions(scenario || "normal"));
    }
  },

  async getLocationCondition(locationId: string): Promise<LocationCondition> {
    try {
      return await apiClient.get<LocationCondition>(`/campus/conditions/${locationId}`);
    } catch {
      const mock = convertTanishaMockToConditionsResponse(generateMockLiveCampusConditions("normal"));
      const match = mock.locations.find(
        (l) =>
          l.location.id === locationId ||
          l.location.id.toLowerCase() === locationId.toLowerCase() ||
          l.location.name.toLowerCase().includes(locationId.toLowerCase())
      );
      if (match) return match;
      return mock.locations[0];
    }
  },
};

