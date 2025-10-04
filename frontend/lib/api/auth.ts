/**
 * Authentication utilities for the frontend
 */

import { getApiBaseUrl } from './config';

export interface LoginRequest {
  email: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

/**
 * Login with email only
 */
export async function login(request: LoginRequest): Promise<AuthResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/auth/login`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Login failed');
  }

  return response.json();
}

/**
 * Get current user information
 */
export async function getCurrentUser(): Promise<User> {
  const token = getStoredToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/auth/me`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid, clear it
      clearStoredToken();
      throw new Error('Authentication expired. Please login again.');
    }
    throw new Error('Failed to get user information');
  }

  return response.json();
}

/**
 * Store JWT token in localStorage and set a session cookie
 */
export function storeToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
    // Also set a session cookie for middleware
    document.cookie = "auth-token=true; path=/; samesite=strict";
  }
}

/**
 * Get stored JWT token from localStorage
 */
export function getStoredToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

/**
 * Clear stored JWT token
 */
export function clearStoredToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
  return !!getStoredToken();
}

/**
 * Logout user by clearing token and cookie
 */
export function logout(): void {
  if (typeof window !== 'undefined') {
    clearStoredToken();
    // Clear the auth cookie
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=strict";
  }
}
