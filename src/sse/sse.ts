/** Configuration for an SSE connection. */
export interface SSEConfig {
  /** URL path for the SSE endpoint. Default: '/events' */
  url?: string;
  /** Include auth token as query parameter. Default: true */
  withAuth?: boolean;
  /** Token key in localStorage. Default: 'auth_token' */
  tokenKey?: string;
  /** Called for each parsed message event. */
  onEvent: (event: { type: string; data: unknown; [key: string]: unknown }) => void;
  /** Called on connection error. */
  onError?: (event: Event) => void;
}

/**
 * Connect to a Server-Sent Events endpoint.
 * Returns the EventSource instance (caller is responsible for closing it).
 *
 * @example
 * const es = connectSSE({
 *   url: '/events',
 *   onEvent: (event) => console.log(event.type, event.data),
 * });
 * // Later: es.close();
 */
export function connectSSE(config: SSEConfig): EventSource {
  const { url = '/events', withAuth = true, tokenKey = 'auth_token', onEvent, onError } = config;

  let fullUrl = url;
  if (withAuth) {
    const token = localStorage.getItem(tokenKey);
    if (token) {
      const sep = url.includes('?') ? '&' : '?';
      fullUrl = `${url}${sep}token=${encodeURIComponent(token)}`;
    }
  }

  const es = new EventSource(fullUrl);

  es.onmessage = (e) => {
    try {
      const parsed = JSON.parse(e.data);
      onEvent(parsed);
    } catch {
      // ignore malformed events
    }
  };

  if (onError) {
    es.onerror = onError;
  }

  return es;
}
