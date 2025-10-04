/**
 * API client for parsed appointments
 */

import { ParsedAppointment } from '@/types/parsed-appointment';
import { getApiBaseUrl, API_ENDPOINTS } from './config';

/**
 * Fetch all parsed appointments from the backend
 */
export async function fetchParsedAppointments(): Promise<ParsedAppointment[]> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${API_ENDPOINTS.PARSED_APPOINTMENTS}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    // Don't cache in production to ensure fresh data
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch parsed appointments: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}
