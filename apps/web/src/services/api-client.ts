/**
 * Central API Client for EzyKwelez
 * Encapsulates fetch logic, response envelopes, error handling, and request provenance
 */

import { ApiResponseEnvelope, ApiErrorEnvelope } from "@ezykwelez/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiClientError extends Error {
  code: string;
  requestId?: string;
  details?: Record<string, unknown>;
  status: number;

  constructor(message: string, status: number, code: string = "API_ERROR", requestId?: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 10000, ...customConfig } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...customConfig.headers,
  };

  const config: RequestInit = {
    ...customConfig,
    headers,
    signal: controller.signal,
  };

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    // Parse JSON
    let data: any;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const errorPayload = data?.detail?.error || data?.error;
      throw new ApiClientError(
        errorPayload?.message || `Request failed with HTTP status ${response.status}`,
        response.status,
        errorPayload?.code || `HTTP_${response.status}`,
        errorPayload?.requestId,
        errorPayload?.details
      );
    }

    // Extract envelope data if present
    if (data && typeof data === "object" && "data" in data) {
      return data.data as T;
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new ApiClientError(`Request to ${endpoint} timed out after ${timeoutMs}ms`, 408, "TIMEOUT");
    }
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError(error.message || "Network connection failed", 0, "NETWORK_ERROR");
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, { method: "GET", ...options }),
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),
  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),
  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),
  delete: <T>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, { method: "DELETE", ...options }),
};
