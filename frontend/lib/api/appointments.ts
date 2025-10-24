/**
 * API client for parsed appointments
 */

import { ParsedAppointment } from "@/types/parsed-appointment";
import { getApiBaseUrl, API_ENDPOINTS } from "./config";
import { getStoredToken } from "./auth";

/**
 * Get authorization headers if token exists
 */
function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Fetch all parsed appointments from the backend
 */
export async function fetchParsedAppointments(): Promise<ParsedAppointment[]> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${API_ENDPOINTS.PARSED_APPOINTMENTS}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
    // Don't cache in production to ensure fresh data
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch parsed appointments: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data;
}

/**
 * Upcoming Appointment interface
 * Used for NFZ appointments fetched directly from the API
 */
export interface UpcomingAppointment {
  id: string;
  place: string;
  provider: string;
  phone: string | null;
  address: string;
  locality: string;
  date: string;
  benefit: string;
  average_wait_days: number;
  latitude: number | string | null;
  longitude: number | string | null;
}
