/**
 * API Client & Data Provider for Live Campus Conditions
 * Abstracts communication with future backend GET /api/campus/live-conditions
 * Follows Dependency Inversion so UI components depend on typed responses, not mock implementations.
 */

import { LiveCampusConditionsResponse } from '../types/campus';
import { getSimulatedCampusConditions } from './mock-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const LIVE_CONDITIONS_ENDPOINT = '/api/campus/live-conditions';

export interface FetchConditionsOptions {
  forceMock?: boolean;
  simulateError?: boolean;
  simulateEmpty?: boolean;
  simulateStale?: boolean;
}

/**
 * Fetches campus conditions. If the backend is unavailable or not yet implemented,
 * gracefully falls back to deterministic simulated data with explicit 'simulated' marking.
 */
export async function fetchLiveCampusConditions(
  options: FetchConditionsOptions = {}
): Promise<LiveCampusConditionsResponse> {
  // Test scenario simulation hooks
  if (options.simulateError) {
    throw new Error('API unreachable: 503 Service Unavailable (Simulated failure state)');
  }

  if (options.simulateEmpty) {
    return {
      timestamp: new Date().toISOString(),
      dataMode: 'simulated',
      locations: [],
      occupancy: [],
      connectivity: [],
      metadata: {
        source: 'Empty Campus State',
        version: '1.0.0',
        notes: 'Simulated empty state for edge-case validation',
      },
    };
  }

  if (options.simulateStale) {
    // 10 minutes old - will trigger Stale / Unavailable freshness status
    return getSimulatedCampusConditions(new Date(), 10 * 60 * 1000);
  }

  if (options.forceMock) {
    return getSimulatedCampusConditions();
  }

  // Attempt real backend call first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${API_BASE_URL}${LIVE_CONDITIONS_ENDPOINT}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data: LiveCampusConditionsResponse = await res.json();
      return data;
    }
  } catch {
    // Backend endpoint does not yet exist or is unreachable.
    // Gracefully fallback to deterministic simulated data.
  }

  return getSimulatedCampusConditions();
}
