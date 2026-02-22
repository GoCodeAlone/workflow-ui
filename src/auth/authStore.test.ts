// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createAuthStore } from './authStore';
import { configureApi } from '../api/client';

describe('createAuthStore', () => {
  beforeEach(() => {
    localStorage.removeItem('auth_token');
    configureApi({ baseUrl: '/api' });
    vi.restoreAllMocks();
  });

  it('creates a store with initial state', () => {
    const useAuth = createAuthStore();
    const state = useAuth.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('reads existing token from localStorage', () => {
    localStorage.setItem('auth_token', 'existing-token');
    const useAuth = createAuthStore();
    const state = useAuth.getState();
    expect(state.token).toBe('existing-token');
    expect(state.isAuthenticated).toBe(true);
  });

  it('uses custom tokenKey', () => {
    localStorage.setItem('my_token', 'custom-token');
    const useAuth = createAuthStore({ tokenKey: 'my_token' });
    expect(useAuth.getState().token).toBe('custom-token');
  });

  describe('login', () => {
    it('sends login request and stores token', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ token: 'new-token', user: { id: '1', email: 'test@test.com' } }), { status: 200 }),
      );

      const useAuth = createAuthStore();
      await useAuth.getState().login('admin', 'password');

      const state = useAuth.getState();
      expect(state.token).toBe('new-token');
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual({ id: '1', email: 'test@test.com' });
      expect(localStorage.getItem('auth_token')).toBe('new-token');
    });

    it('uses custom parseLoginResponse', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ access_token: 'jwt-token' }), { status: 200 }),
      );

      const useAuth = createAuthStore({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        parseLoginResponse: (data: any) => ({ token: data.access_token }),
      });
      await useAuth.getState().login('admin', 'pass');
      expect(useAuth.getState().token).toBe('jwt-token');
    });

    it('uses custom buildLoginBody', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ token: 'tok' }), { status: 200 }),
      );

      const useAuth = createAuthStore({
        buildLoginBody: (email, password) => ({ email, password }),
      });
      await useAuth.getState().login('user@test.com', 'pass');
      expect(fetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
        body: '{"email":"user@test.com","password":"pass"}',
      }));
    });

    it('sets error on failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('Invalid credentials', { status: 401 }),
      );

      const useAuth = createAuthStore();
      await expect(useAuth.getState().login('admin', 'wrong')).rejects.toThrow();

      const state = useAuth.getState();
      expect(state.error).toContain('401');
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('clears token and state', () => {
      localStorage.setItem('auth_token', 'tok');
      const useAuth = createAuthStore();
      useAuth.getState().logout();

      const state = useAuth.getState();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('calls onLogout callback', () => {
      localStorage.setItem('auth_token', 'tok');
      const onLogout = vi.fn();
      const useAuth = createAuthStore({ onLogout });
      useAuth.getState().logout();
      expect(onLogout).toHaveBeenCalledWith('tok');
    });
  });

  describe('loadUser', () => {
    it('loads user from /auth/me', async () => {
      localStorage.setItem('auth_token', 'tok');
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ id: '1', email: 'u@t.com' }), { status: 200 }),
      );

      const useAuth = createAuthStore();
      await useAuth.getState().loadUser();
      expect(useAuth.getState().user).toEqual({ id: '1', email: 'u@t.com' });
    });

    it('clears auth on failure', async () => {
      localStorage.setItem('auth_token', 'bad-tok');
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('Unauthorized', { status: 401 }),
      );

      const useAuth = createAuthStore();
      await useAuth.getState().loadUser();
      expect(useAuth.getState().isAuthenticated).toBe(false);
      expect(useAuth.getState().token).toBeNull();
    });
  });

  describe('clearError', () => {
    it('clears the error state', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('fail', { status: 500 }),
      );

      const useAuth = createAuthStore();
      await useAuth.getState().login('a', 'b').catch(() => {});
      expect(useAuth.getState().error).not.toBeNull();

      useAuth.getState().clearError();
      expect(useAuth.getState().error).toBeNull();
    });
  });
});
