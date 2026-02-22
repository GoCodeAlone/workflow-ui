// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureApi, apiGet, apiPost, apiPut, apiPatch, apiDelete, getApiConfig } from './client';

describe('API Client', () => {
  beforeEach(() => {
    configureApi({ baseUrl: '/api' });
    vi.restoreAllMocks();
    localStorage.removeItem('auth_token');
  });

  describe('configureApi', () => {
    it('sets the base URL', () => {
      configureApi({ baseUrl: '/api/v1' });
      expect(getApiConfig().baseUrl).toBe('/api/v1');
    });

    it('merges config', () => {
      configureApi({ baseUrl: '/api/v1' });
      const onErr = vi.fn();
      configureApi({ onResponseError: onErr });
      const cfg = getApiConfig();
      expect(cfg.baseUrl).toBe('/api/v1');
      expect(cfg.onResponseError).toBe(onErr);
    });
  });

  describe('apiGet', () => {
    it('fetches with GET and auth header', async () => {
      localStorage.setItem('auth_token', 'test-token');
      const mockResponse = { data: 'test' };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify(mockResponse), { status: 200 }),
      );

      const result = await apiGet('/items');
      expect(fetch).toHaveBeenCalledWith('/api/items', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('uses configured base URL', async () => {
      configureApi({ baseUrl: '/api/v1' });
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('{}', { status: 200 }),
      );

      await apiGet('/items');
      expect(fetch).toHaveBeenCalledWith('/api/v1/items', expect.any(Object));
    });

    it('omits auth header when no token', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('{}', { status: 200 }),
      );

      await apiGet('/items');
      expect(fetch).toHaveBeenCalledWith('/api/items', {
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('apiPost', () => {
    it('sends POST with JSON body', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('{"id":"1"}', { status: 201 }),
      );

      const result = await apiPost('/items', { name: 'test' });
      expect(fetch).toHaveBeenCalledWith('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"name":"test"}',
      });
      expect(result).toEqual({ id: '1' });
    });

    it('sends POST without body', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(null, { status: 200 }),
      );

      await apiPost('/items/1/activate');
      expect(fetch).toHaveBeenCalledWith('/api/items/1/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: undefined,
      });
    });
  });

  describe('apiPut', () => {
    it('sends PUT with JSON body', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('{"ok":true}', { status: 200 }),
      );

      await apiPut('/items/1', { name: 'updated' });
      expect(fetch).toHaveBeenCalledWith('/api/items/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: '{"name":"updated"}',
      });
    });
  });

  describe('apiPatch', () => {
    it('sends PATCH with JSON body', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('{"ok":true}', { status: 200 }),
      );

      await apiPatch('/items/1', { name: 'patched' });
      expect(fetch).toHaveBeenCalledWith('/api/items/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: '{"name":"patched"}',
      });
    });
  });

  describe('apiDelete', () => {
    it('sends DELETE request', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(null, { status: 200 }),
      );

      await apiDelete('/items/1');
      expect(fetch).toHaveBeenCalledWith('/api/items/1', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('error handling', () => {
    it('throws on non-OK response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('Not found', { status: 404 }),
      );

      await expect(apiGet('/missing')).rejects.toThrow('HTTP 404: Not found');
    });

    it('calls onResponseError callback', async () => {
      const onErr = vi.fn();
      configureApi({ onResponseError: onErr });
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('Unauthorized', { status: 401 }),
      );

      await expect(apiGet('/secret')).rejects.toThrow();
      expect(onErr).toHaveBeenCalledWith(401, 'Unauthorized');
    });
  });

  describe('custom getToken', () => {
    it('uses custom token provider', async () => {
      configureApi({ getToken: () => 'custom-token' });
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('{}', { status: 200 }),
      );

      await apiGet('/items');
      expect(fetch).toHaveBeenCalledWith('/api/items', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer custom-token',
        },
      });
    });
  });
});
