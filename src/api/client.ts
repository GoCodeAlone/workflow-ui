/** Configuration for the shared API client. */
export interface ApiClientConfig {
  /** Base URL prefix for all API calls. Default: '/api' */
  baseUrl?: string;
  /**
   * Function to retrieve the auth token.
   * Default: () => localStorage.getItem('auth_token')
   */
  getToken?: () => string | null;
  /**
   * Called on non-OK responses before throwing.
   * Use for auto-logout on 401, logging, etc.
   */
  onResponseError?: (status: number, body: string) => void;
}

let globalConfig: ApiClientConfig = {};

/**
 * Configure the API client globally. Call once at app startup.
 *
 * @example
 * // Ratchet (default /api base):
 * configureApi({});
 *
 * // Workflow (custom base + 401 handler):
 * configureApi({
 *   baseUrl: '/api/v1',
 *   onResponseError: (status) => { if (status === 401) logout(); },
 * });
 */
export function configureApi(config: ApiClientConfig): void {
  globalConfig = { ...globalConfig, ...config };
}

/** Returns the current API client configuration. */
export function getApiConfig(): ApiClientConfig {
  return globalConfig;
}

function getBaseUrl(): string {
  return globalConfig.baseUrl ?? '/api';
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const getToken = globalConfig.getToken ?? (() => localStorage.getItem('auth_token'));
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    if (globalConfig.onResponseError) {
      globalConfig.onResponseError(res.status, text);
    }
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  return JSON.parse(text) as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    headers: authHeaders(),
  });
  return handleResponse<T>(res);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse<T>(res);
}
