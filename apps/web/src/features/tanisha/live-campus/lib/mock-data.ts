/**
 * Deterministic Mock Data Provider for Live Campus Conditions
 * Feature Owner: Tanisha
 * Module: @/features/tanisha/live-campus
 *
 * NOTE: All data returned here is SIMULATED and explicitly tagged as dataMode: "simulated".
 * No real student telemetry is tracked.
 */

import {
  LiveCampusConditionsResponse,
  OccupancySnapshot,
  ConnectivitySnapshot,
} from "../types/campus";
import {
  calculateOccupancyPercentage,
  deriveOccupancyStatus,
  deriveConnectivityQuality,
  calculateCampusOverview,
  buildLocationConditions,
} from "./calculations";

export type SimulationScenario = "normal" | "peak_rush" | "outage_scenario";

interface RawOccupancySeed {
  id: string;
  name: string;
  capacity: number;
  currentCount: number;
  zone: string;
  minutesAgo: number;
}

interface RawConnectivitySeed {
  id: string;
  name: string;
  signalScore: number;
  signalDbm: number;
  networkName: string;
  zone: string;
  minutesAgo: number;
}

// ============================================================================
// Scenario Datasets
// ============================================================================

const SCENARIO_OCCUPANCY_SEEDS: Record<SimulationScenario, RawOccupancySeed[]> = {
  normal: [
    {
      id: "loc-library",
      name: "Library Main Hall",
      capacity: 250,
      currentCount: 210, // 84.0% -> busy
      zone: "Zone A - Academic Quad",
      minutesAgo: 1.2,
    },
    {
      id: "loc-canteen",
      name: "Central Canteen & Food Court",
      capacity: 200,
      currentCount: 188, // 94.0% -> very_busy
      zone: "Zone B - Student Commons",
      minutesAgo: 0.5,
    },
    {
      id: "loc-academic-block",
      name: "Main Academic Block (Building A)",
      capacity: 600,
      currentCount: 468, // 78.0% -> busy
      zone: "Zone A - Academic Quad",
      minutesAgo: 2.0,
    },
    {
      id: "loc-computer-lab",
      name: "Computer Science Lab Complex",
      capacity: 50,
      currentCount: 31, // 62.0% -> moderate
      zone: "Zone C - Science & Tech",
      minutesAgo: 0.8,
    },
    {
      id: "loc-student-activity",
      name: "Student Activity Center",
      capacity: 150,
      currentCount: 57, // 38.0% -> low
      zone: "Zone B - Student Commons",
      minutesAgo: 1.5,
    },
    {
      id: "loc-hostel",
      name: "North Hostel Block",
      capacity: 400,
      currentCount: 220, // 55.0% -> moderate
      zone: "Zone D - Residential",
      minutesAgo: 3.1,
    },
  ],

  peak_rush: [
    {
      id: "loc-library",
      name: "Library Main Hall",
      capacity: 250,
      currentCount: 245, // 98.0% -> very_busy
      zone: "Zone A - Academic Quad",
      minutesAgo: 0.4,
    },
    {
      id: "loc-canteen",
      name: "Central Canteen & Food Court",
      capacity: 200,
      currentCount: 215, // 107.5% -> over_capacity
      zone: "Zone B - Student Commons",
      minutesAgo: 0.2,
    },
    {
      id: "loc-academic-block",
      name: "Main Academic Block (Building A)",
      capacity: 600,
      currentCount: 550, // 91.7% -> very_busy
      zone: "Zone A - Academic Quad",
      minutesAgo: 1.1,
    },
    {
      id: "loc-computer-lab",
      name: "Computer Science Lab Complex",
      capacity: 50,
      currentCount: 48, // 96.0% -> very_busy
      zone: "Zone C - Science & Tech",
      minutesAgo: 0.6,
    },
    {
      id: "loc-student-activity",
      name: "Student Activity Center",
      capacity: 150,
      currentCount: 125, // 83.3% -> busy
      zone: "Zone B - Student Commons",
      minutesAgo: 0.9,
    },
    {
      id: "loc-hostel",
      name: "North Hostel Block",
      capacity: 400,
      currentCount: 160, // 40.0% -> low
      zone: "Zone D - Residential",
      minutesAgo: 2.5,
    },
  ],

  outage_scenario: [
    {
      id: "loc-library",
      name: "Library Main Hall",
      capacity: 250,
      currentCount: 248, // 99.2% -> very_busy (refuge from outage)
      zone: "Zone A - Academic Quad",
      minutesAgo: 0.3,
    },
    {
      id: "loc-canteen",
      name: "Central Canteen & Food Court",
      capacity: 200,
      currentCount: 195, // 97.5% -> very_busy
      zone: "Zone B - Student Commons",
      minutesAgo: 0.4,
    },
    {
      id: "loc-academic-block",
      name: "Main Academic Block (Building A)",
      capacity: 600,
      currentCount: 120, // 20.0% -> low (disrupted building evacuated)
      zone: "Zone A - Academic Quad",
      minutesAgo: 1.0,
    },
    {
      id: "loc-computer-lab",
      name: "Computer Science Lab Complex",
      capacity: 50,
      currentCount: 5, // 10.0% -> low (lab offline)
      zone: "Zone C - Science & Tech",
      minutesAgo: 0.5,
    },
    {
      id: "loc-student-activity",
      name: "Student Activity Center",
      capacity: 150,
      currentCount: 142, // 94.7% -> very_busy (temporary holding area)
      zone: "Zone B - Student Commons",
      minutesAgo: 0.8,
    },
    {
      id: "loc-hostel",
      name: "North Hostel Block",
      capacity: 400,
      currentCount: 290, // 72.5% -> moderate
      zone: "Zone D - Residential",
      minutesAgo: 2.1,
    },
  ],
};

const SCENARIO_CONNECTIVITY_SEEDS: Record<SimulationScenario, RawConnectivitySeed[]> = {
  normal: [
    {
      id: "loc-library",
      name: "Library Main Hall",
      signalScore: 92, // excellent
      signalDbm: -52,
      networkName: "CAMPUS-IOT-SECURE",
      zone: "Zone A - Academic Quad",
      minutesAgo: 1.2,
    },
    {
      id: "loc-canteen",
      name: "Central Canteen & Food Court",
      signalScore: 52, // fair
      signalDbm: -76,
      networkName: "CAMPUS-STUDENT-GUEST",
      zone: "Zone B - Student Commons",
      minutesAgo: 0.5,
    },
    {
      id: "loc-academic-block",
      name: "Main Academic Block (Building A)",
      signalScore: 74, // good
      signalDbm: -65,
      networkName: "CAMPUS-ACADEMIC-CORE",
      zone: "Zone A - Academic Quad",
      minutesAgo: 2.0,
    },
    {
      id: "loc-computer-lab",
      name: "Computer Science Lab Complex",
      signalScore: 88, // excellent
      signalDbm: -55,
      networkName: "CAMPUS-IOT-SECURE",
      zone: "Zone C - Science & Tech",
      minutesAgo: 0.8,
    },
    {
      id: "loc-student-activity",
      name: "Student Activity Center",
      signalScore: 68, // good
      signalDbm: -69,
      networkName: "CAMPUS-STUDENT-GUEST",
      zone: "Zone B - Student Commons",
      minutesAgo: 1.5,
    },
    {
      id: "loc-hostel",
      name: "North Hostel Block",
      signalScore: 32, // weak
      signalDbm: -84,
      networkName: "CAMPUS-RESIDENCE-MESH",
      zone: "Zone D - Residential",
      minutesAgo: 3.1,
    },
    {
      id: "loc-main-gate",
      name: "Main Perimeter Gate & Checkpoint",
      signalScore: 38, // weak
      signalDbm: -82,
      networkName: "CAMPUS-PERIMETER-WIFI",
      zone: "Zone E - Campus Perimeter",
      minutesAgo: 1.8,
    },
  ],

  peak_rush: [
    {
      id: "loc-library",
      name: "Library Main Hall",
      signalScore: 81, // excellent
      signalDbm: -58,
      networkName: "CAMPUS-IOT-SECURE",
      zone: "Zone A - Academic Quad",
      minutesAgo: 0.4,
    },
    {
      id: "loc-canteen",
      name: "Central Canteen & Food Court",
      signalScore: 34, // weak (channel congestion)
      signalDbm: -83,
      networkName: "CAMPUS-STUDENT-GUEST",
      zone: "Zone B - Student Commons",
      minutesAgo: 0.2,
    },
    {
      id: "loc-academic-block",
      name: "Main Academic Block (Building A)",
      signalScore: 62, // good
      signalDbm: -72,
      networkName: "CAMPUS-ACADEMIC-CORE",
      zone: "Zone A - Academic Quad",
      minutesAgo: 1.1,
    },
    {
      id: "loc-computer-lab",
      name: "Computer Science Lab Complex",
      signalScore: 84, // excellent
      signalDbm: -57,
      networkName: "CAMPUS-IOT-SECURE",
      zone: "Zone C - Science & Tech",
      minutesAgo: 0.6,
    },
    {
      id: "loc-student-activity",
      name: "Student Activity Center",
      signalScore: 54, // fair
      signalDbm: -75,
      networkName: "CAMPUS-STUDENT-GUEST",
      zone: "Zone B - Student Commons",
      minutesAgo: 0.9,
    },
    {
      id: "loc-hostel",
      name: "North Hostel Block",
      signalScore: 36, // weak
      signalDbm: -83,
      networkName: "CAMPUS-RESIDENCE-MESH",
      zone: "Zone D - Residential",
      minutesAgo: 2.5,
    },
    {
      id: "loc-main-gate",
      name: "Main Perimeter Gate & Checkpoint",
      signalScore: 28, // weak
      signalDbm: -86,
      networkName: "CAMPUS-PERIMETER-WIFI",
      zone: "Zone E - Campus Perimeter",
      minutesAgo: 1.0,
    },
  ],

  outage_scenario: [
    {
      id: "loc-library",
      name: "Library Main Hall",
      signalScore: 78, // good
      signalDbm: -63,
      networkName: "CAMPUS-IOT-SECURE",
      zone: "Zone A - Academic Quad",
      minutesAgo: 0.3,
    },
    {
      id: "loc-canteen",
      name: "Central Canteen & Food Court",
      signalScore: 48, // fair
      signalDbm: -78,
      networkName: "CAMPUS-STUDENT-GUEST",
      zone: "Zone B - Student Commons",
      minutesAgo: 0.4,
    },
    {
      id: "loc-academic-block",
      name: "Main Academic Block (Building A)",
      signalScore: 12, // very_weak (outage impact)
      signalDbm: -92,
      networkName: "CAMPUS-ACADEMIC-CORE",
      zone: "Zone A - Academic Quad",
      minutesAgo: 1.0,
    },
    {
      id: "loc-computer-lab",
      name: "Computer Science Lab Complex",
      signalScore: 15, // very_weak (outage impact)
      signalDbm: -90,
      networkName: "CAMPUS-IOT-SECURE",
      zone: "Zone C - Science & Tech",
      minutesAgo: 0.5,
    },
    {
      id: "loc-student-activity",
      name: "Student Activity Center",
      signalScore: 61, // good
      signalDbm: -73,
      networkName: "CAMPUS-STUDENT-GUEST",
      zone: "Zone B - Student Commons",
      minutesAgo: 0.8,
    },
    {
      id: "loc-hostel",
      name: "North Hostel Block",
      signalScore: 30, // weak
      signalDbm: -85,
      networkName: "CAMPUS-RESIDENCE-MESH",
      zone: "Zone D - Residential",
      minutesAgo: 2.1,
    },
    {
      id: "loc-main-gate",
      name: "Main Perimeter Gate & Checkpoint",
      signalScore: 35, // weak
      signalDbm: -83,
      networkName: "CAMPUS-PERIMETER-WIFI",
      zone: "Zone E - Campus Perimeter",
      minutesAgo: 1.4,
    },
  ],
};

// ============================================================================
// Snapshot Generator
// ============================================================================

export function generateMockLiveCampusConditions(
  scenario: SimulationScenario = "normal",
  baseTimestamp: number = Date.now()
): LiveCampusConditionsResponse {
  const occSeeds = SCENARIO_OCCUPANCY_SEEDS[scenario] || SCENARIO_OCCUPANCY_SEEDS.normal;
  const connSeeds = SCENARIO_CONNECTIVITY_SEEDS[scenario] || SCENARIO_CONNECTIVITY_SEEDS.normal;

  const occupancy: OccupancySnapshot[] = occSeeds.map((seed) => {
    const percentage = calculateOccupancyPercentage(seed.currentCount, seed.capacity);
    const status = deriveOccupancyStatus(percentage);
    const measuredTime = new Date(baseTimestamp - seed.minutesAgo * 60 * 1000).toISOString();

    return {
      id: seed.id,
      name: seed.name,
      currentCount: seed.currentCount,
      capacity: seed.capacity,
      percentage,
      status,
      measuredAt: measuredTime,
      dataMode: "simulated",
      zone: seed.zone,
    };
  });

  const connectivity: ConnectivitySnapshot[] = connSeeds.map((seed) => {
    const quality = deriveConnectivityQuality(seed.signalScore);
    const measuredTime = new Date(baseTimestamp - seed.minutesAgo * 60 * 1000).toISOString();

    return {
      id: seed.id,
      name: seed.name,
      signalScore: seed.signalScore,
      signalDbm: seed.signalDbm,
      networkName: seed.networkName,
      measuredAt: measuredTime,
      dataMode: "simulated",
      quality,
      zone: seed.zone,
    };
  });

  const overview = calculateCampusOverview(occupancy, connectivity);
  const locations = buildLocationConditions(occupancy, connectivity);

  return {
    locations,
    occupancy,
    connectivity,
    overview,
    generatedAt: new Date(baseTimestamp).toISOString(),
    dataMode: "simulated",
    isSimulated: true,
  };
}

/**
 * Simulates an asynchronous fetch to a live conditions endpoint.
 * Useful for hook testing and presentation until FastAPI backend is available.
 */
export async function fetchMockLiveConditions(
  scenario: SimulationScenario = "normal",
  delayMs: number = 250,
  forceError: boolean = false
): Promise<LiveCampusConditionsResponse> {
  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  if (forceError) {
    throw new Error("Simulated API connection failure: Unable to reach telemetry hub.");
  }

  return generateMockLiveCampusConditions(scenario);
}
