/**
 * API Client Adapter for lib/api
 * Delegates to the central @/services/api-client to prevent duplicate fetch implementations.
 */

import { HealthCheckResponse } from "@ezykwelez/shared";
import { apiClient } from "@/services/api-client";

export async function checkApiHealth(): Promise<HealthCheckResponse> {
  return apiClient.get<HealthCheckResponse>("/health");
}

export { apiClient } from "@/services/api-client";
