/**
 * HTTP API client for SharePlate web
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const isDemoMode = () => {
  return import.meta.env.VITE_DEMO_MODE === 'true' || localStorage.getItem('shareplate_force_demo') === 'true';
};

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('shareplate_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error: any) {
    // If backend server is offline or unreachable, warn and allow fallback
    console.warn(`[SharePlate API] Endpoint ${endpoint} unreachable:`, error.message);
    throw error;
  }
}
