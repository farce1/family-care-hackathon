/**
 * API configuration and utilities
 */

/**
 * Get the backend API base URL from environment variables
 * Falls back to localhost for development
 */
export const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  PARSED_APPOINTMENTS: '/parsed-appointments',
  PARSE_PDF: '/parse-pdf',
} as const;
