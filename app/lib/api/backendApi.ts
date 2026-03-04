/**
 * Authenticated API client for the Spring Boot backend.
 * Uses VITE_BACKEND_URL (e.g. http://localhost:8080/api in dev,
 * https://mindvex-backend.onrender.com/api in prod).
 */

// Use the configured backend URL from environment
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api';
console.log('[Debug] PROXY Backend URL:', BACKEND_URL); // Debug log to verify URL in browser console

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const base: Record<string, string> = { 'Content-Type': 'application/json' };

  if (token) {
    base.Authorization = `Bearer ${token}`;
  }

  return base;
}

export function isBackendAuthenticated(): boolean {
  return typeof window !== 'undefined' && !!localStorage.getItem('auth_token');
}

export async function backendGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Backend GET ${path} failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function backendPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Backend POST ${path} failed with status ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export async function backendDelete(path: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(`Backend DELETE ${path} failed with status ${res.status}`);
  }
}

/** Repository History API types matching the Spring Boot backend DTOs */
export interface BackendRepositoryHistoryItem {
  id: number;
  url: string;
  name: string;
  description?: string;
  branch?: string;
  commitHash?: string;
  createdAt: string;
  lastAccessedAt: string;
}

export interface BackendRepositoryHistoryRequest {
  url: string;
  name: string;
  description?: string;
  branch?: string;
  commitHash?: string;
}

export const repositoryHistoryApi = {
  getAll: (limit = 50) => backendGet<BackendRepositoryHistoryItem[]>(`/repository-history?limit=${limit}`),

  add: (request: BackendRepositoryHistoryRequest) =>
    backendPost<BackendRepositoryHistoryItem>('/repository-history', request),

  remove: (id: number) => backendDelete(`/repository-history/${id}`),

  clearAll: () => backendDelete('/repository-history'),
};
