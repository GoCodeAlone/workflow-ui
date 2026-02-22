import { create } from 'zustand';
import { apiPost, apiGet } from '../api/client';

/** Base user type. Consumers can extend with additional fields. */
export interface BaseUser {
  id: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
}

export interface BaseAuthState {
  token: string | null;
  user: BaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export interface AuthStoreConfig {
  /** Login API path. Default: '/auth/login' */
  loginPath?: string;
  /** User profile API path. Default: '/auth/me' */
  mePath?: string;
  /**
   * Parse the login response to extract token and optional user.
   * Default: expects { token: string, user?: BaseUser }
   */
  parseLoginResponse?: (data: unknown) => { token: string; user?: BaseUser };
  /** Token key in localStorage. Default: 'auth_token' */
  tokenKey?: string;
  /** Called after logout (e.g., fire-and-forget server call). */
  onLogout?: (token: string | null) => void;
  /**
   * Build the login request body from username/password.
   * Default: { username, password }
   */
  buildLoginBody?: (username: string, password: string) => unknown;
}

/**
 * Create a configured auth store. Call once at module scope.
 *
 * @example
 * // Ratchet:
 * export const useAuthStore = createAuthStore();
 *
 * // Workflow (custom fields):
 * export const useAuthStore = createAuthStore({
 *   buildLoginBody: (email, password) => ({ email, password }),
 *   parseLoginResponse: (data) => ({ token: data.access_token }),
 * });
 */
export function createAuthStore(config?: AuthStoreConfig) {
  const loginPath = config?.loginPath ?? '/auth/login';
  const mePath = config?.mePath ?? '/auth/me';
  const tokenKey = config?.tokenKey ?? 'auth_token';
  const buildBody = config?.buildLoginBody ?? ((username: string, password: string) => ({ username, password }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parseLogin = config?.parseLoginResponse ?? ((data: any) => ({
    token: data.token as string,
    user: data.user as BaseUser | undefined,
  }));

  return create<BaseAuthState>((set) => ({
    token: localStorage.getItem(tokenKey),
    user: null,
    isAuthenticated: !!localStorage.getItem(tokenKey),
    isLoading: false,
    error: null,

    login: async (username: string, password: string) => {
      set({ isLoading: true, error: null });
      try {
        const res = await apiPost(loginPath, buildBody(username, password));
        const { token, user } = parseLogin(res);
        localStorage.setItem(tokenKey, token);
        set({ token, user: user ?? null, isAuthenticated: true, isLoading: false, error: null });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Login failed';
        set({ error: msg, isAuthenticated: false, isLoading: false });
        throw err;
      }
    },

    logout: () => {
      const token = localStorage.getItem(tokenKey);
      if (config?.onLogout) config.onLogout(token);
      localStorage.removeItem(tokenKey);
      set({ token: null, user: null, isAuthenticated: false, error: null });
    },

    loadUser: async () => {
      try {
        const user = await apiGet<BaseUser>(mePath);
        set({ user, isAuthenticated: true });
      } catch {
        localStorage.removeItem(tokenKey);
        set({ token: null, user: null, isAuthenticated: false });
      }
    },

    clearError: () => set({ error: null }),
  }));
}
