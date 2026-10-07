/**
 * Deterministic Mock Data Provider for Live Campus Conditions
 * Owner: Tanisha
 *
 * IMPORTANT:
 * All records here are strictly marked with dataMode = 'simulated'.
 * Derived values (percentages, occupancy statuses, connectivity qualities)
 * are computed dynamically through calculations.ts to ensure single source of truth.
 */

import {
  CampusLocation,
  OccupancySnapshot,
  ConnectivitySnapshot,
  LiveCampusConditionsResponse,
} from '../types/campus';
import {
  calculateOccupancyPercentage,
  calculateOccupancyStatus,
  calculateConnectivityQuality,
} from './calculations';

export const MOCK_CAMPUS_LOCATIONS: CampusLocation[] = [
  {
    id: 'loc-library',
    name: 'Central Library',
    category: 'library',
    capacity: 350,
    buildingId: 'bldg-library',
    zone: 'North Academic Quad',
    floor: 'Floors 1-3',
  },
  {
    id: 'loc-canteen',
    name: 'Student Canteen & Dining Hall',
    category: 'dining',
    capacity: 200,
    buildingId: 'bldg-amenities',
    zone: 'Central Plaza',
    floor: 'Ground Floor',
  },
  {
    id: 'loc-academic-block',
    name: 'Main Academic Block (Block A)',
    category: 'academic',
    capacity: 450,
    buildingId: 'bldg-academic-a',
    zone: 'East Campus',
    floor: 'Floors 1-4',
  },
  {
    id: 'loc-comp-lab',
    name: 'Turing Computer Science Lab',
    category: 'laboratory',
    capacity: 80,
    buildingId: 'bldg-tech-center',
    zone: 'North Academic Quad',
    floor: '2nd Floor',
  },
  {
    id: 'loc-activity-area',
    name: 'Student Activity & Recreation Center',
    category: 'recreation',
    capacity: 150,
    buildingId: 'bldg-student-hub',
    zone: 'South Campus',
    floor: '1st Floor',
  },
  {
    id: 'loc-hostel',
    name: 'Hostel Complex (Block C)',
    category: 'residential',
    capacity: 500,
    buildingId: 'bldg-hostel-c',
    zone: 'West Residential Area',
    floor: 'Floors 1-6',
  },
  {
    id: 'loc-main-gate',
    name: 'Main Campus Security Gate',
    category: 'transit',
    capacity: 100,
    buildingId: 'bldg-security',
    zone: 'Perimeter Checkpoint',
    floor: 'Ground',
  },
];

// Raw simulated metrics reflecting real campus operational characteristics:
// - Library: High occupancy, excellent signal
// - Canteen: Very high occupancy, fair signal
// - Academic Block: Busy, good signal
// - Computer Lab: Moderate occupancy, excellent signal
// - Activity Area: Low occupancy, fair signal
// - Hostel: Moderate occupancy, weak signal
// - Main Gate: Low occupancy, weak perimeter signal
interface RawLocationSeed {
  locationId: string;
  currentCount: number;
  signalScore: number;
  signalDbm: number;
  networkName: string;
}

const RAW_SIMULATED_SEEDS: RawLocationSeed[] = [
  {
    locationId: 'loc-library',
    currentCount: 294, // 84% full -> Busy
    signalScore: 92, // Excellent
    signalDbm: -54,
    networkName: 'CAMPUS-EDUROAM-LIB',
  },
  {
    locationId: 'loc-canteen',
    currentCount: 184, // 92% full -> Very Busy
    signalScore: 52, // Fair
    signalDbm: -75,
    networkName: 'CAMPUS-PUBLIC-CANTEEN',
  },
  {
    locationId: 'loc-academic-block',
    currentCount: 346, // 77% full -> Busy
    signalScore: 74, // Good
    signalDbm: -66,
    networkName: 'CAMPUS-WLAN-ACADEMIC',
  },
  {
    locationId: 'loc-comp-lab',
    currentCount: 54, // 68% full -> Moderate
    signalScore: 88, // Excellent
    signalDbm: -58,
    networkName: 'CAMPUS-LAB-GIGABIT',
  },
  {
    locationId: 'loc-activity-area',
    currentCount: 45, // 30% full -> Low
    signalScore: 48, // Fair
    signalDbm: -78,
    networkName: 'CAMPUS-OPEN-AREA',
  },
  {
    locationId: 'loc-hostel',
    currentCount: 265, // 53% full -> Moderate
    signalScore: 32, // Weak
    signalDbm: -84,
    networkName: 'HOSTEL-BLOCK-WIFI',
  },
  {
    locationId: 'loc-main-gate',
    currentCount: 22, // 22% full -> Low
    signalScore: 24, // Weak
    signalDbm: -88,
    networkName: 'GATEWAY-PERIMETER',
  },
];

/**
 * Generates a complete, deterministic simulated response.
 * Uses calculations.ts to derive all percentages, statuses, and qualities.
 */
export function getSimulatedCampusConditions(
  referenceTime: Date = new Date(),
  ageOffsetMs = 0
): LiveCampusConditionsResponse {
  const measuredTime = new Date(referenceTime.getTime() - ageOffsetMs);
  const measuredIso = measuredTime.toISOString();

  const locationsMap = new Map<string, CampusLocation>(
    MOCK_CAMPUS_LOCATIONS.map((loc) => [loc.id, loc])
  );

  const occupancy: OccupancySnapshot[] = [];
  const connectivity: ConnectivitySnapshot[] = [];

  for (const seed of RAW_SIMULATED_SEEDS) {
    const loc = locationsMap.get(seed.locationId);
    if (!loc) continue;

    const percentage = calculateOccupancyPercentage(seed.currentCount, loc.capacity);
    const status = calculateOccupancyStatus(percentage);
    const quality = calculateConnectivityQuality(seed.signalScore);

    occupancy.push({
      locationId: loc.id,
      locationName: loc.name,
      currentCount: seed.currentCount,
      capacity: loc.capacity,
      percentage,
      status,
      measuredAt: measuredIso,
      dataMode: 'simulated',
    });

    connectivity.push({
      locationId: loc.id,
      locationName: loc.name,
      signalScore: seed.signalScore,
      signalDbm: seed.signalDbm,
      networkName: seed.networkName,
      measuredAt: measuredIso,
      dataMode: 'simulated',
      quality,
    });
  }

  return {
    timestamp: measuredIso,
    dataMode: 'simulated',
    locations: MOCK_CAMPUS_LOCATIONS,
    occupancy,
    connectivity,
    metadata: {
      source: 'Deterministic Campus Simulator v1.0',
      version: '1.0.0',
      refreshIntervalMs: 15000,
      notes: 'Demonstration telemetry baseline for hackathon evaluation',
    },
  };
}
