/**
 * Shared System Constants and Authoritative Business Thresholds for EzyKwelez
 */

import { OccupancyStatus, ConnectivityQuality } from "../enums";

export const APP_NAME = "EzyKwelez";
export const API_DEFAULT_PORT = 8000;
export const DEFAULT_PAGE_SIZE = 20;

export const SEVERITY_WEIGHTS = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 4,
  CRITICAL: 8,
} as const;

/**
 * Authoritative Occupancy Thresholds (Percentage)
 * 0–49%: Low
 * 50–74%: Moderate
 * 75–89%: Busy
 * 90–100%: Very Busy
 * >100%: Over Capacity
 */
export const OCCUPANCY_THRESHOLDS = {
  LOW_MAX: 49,
  MODERATE_MAX: 74,
  BUSY_MAX: 89,
  VERY_BUSY_MAX: 100,
} as const;

/**
 * Authoritative Connectivity Thresholds (Score 0-100)
 * 80–100: Excellent
 * 60–79: Good
 * 40–59: Fair
 * 20–39: Weak
 * 0–19: Very Weak
 */
export const CONNECTIVITY_THRESHOLDS = {
  VERY_WEAK_MAX: 19,
  WEAK_MAX: 39,
  FAIR_MAX: 59,
  GOOD_MAX: 79,
  EXCELLENT_MAX: 100,
} as const;

/**
 * Pure helper function to classify occupancy percentage according to canonical domain rules
 */
export function classifyOccupancy(percentage: number): OccupancyStatus {
  if (percentage <= OCCUPANCY_THRESHOLDS.LOW_MAX) return OccupancyStatus.LOW;
  if (percentage <= OCCUPANCY_THRESHOLDS.MODERATE_MAX) return OccupancyStatus.MODERATE;
  if (percentage <= OCCUPANCY_THRESHOLDS.BUSY_MAX) return OccupancyStatus.BUSY;
  if (percentage <= OCCUPANCY_THRESHOLDS.VERY_BUSY_MAX) return OccupancyStatus.VERY_BUSY;
  return OccupancyStatus.OVER_CAPACITY;
}

/**
 * Pure helper function to classify connectivity score according to canonical domain rules
 */
export function classifyConnectivity(score: number): ConnectivityQuality {
  if (score <= CONNECTIVITY_THRESHOLDS.VERY_WEAK_MAX) return ConnectivityQuality.VERY_WEAK;
  if (score <= CONNECTIVITY_THRESHOLDS.WEAK_MAX) return ConnectivityQuality.WEAK;
  if (score <= CONNECTIVITY_THRESHOLDS.FAIR_MAX) return ConnectivityQuality.FAIR;
  if (score <= CONNECTIVITY_THRESHOLDS.GOOD_MAX) return ConnectivityQuality.GOOD;
  return ConnectivityQuality.EXCELLENT;
}
