# @gocodealone/workflow-ui

A shared React component library providing UI utilities for workflow orchestration applications. Built with React 19, TypeScript, and Zustand.

## Features

- 🎨 **Theme System** — Catppuccin Mocha color palette with pre-styled components
- 🔐 **Authentication** — Configurable Zustand auth store with LoginPage component
- 🌐 **API Client** — Shared fetch wrapper with auth token injection
- 📡 **SSE Support** — Server-Sent Events connection utility
- ⚡ **TypeScript** — Full type safety with TypeScript 5.9
- 📦 **Tree-shakeable** — Modular exports for optimal bundle size

## Installation

This package is published to GitHub Packages. Configure npm to use GitHub Packages for the `@gocodealone` scope:

```bash
# Add to your .npmrc
@gocodealone:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Then install:

```bash
npm install @gocodealone/workflow-ui
```

## Quick Start

### Theme

Use the Catppuccin Mocha color palette and pre-styled base components:

```tsx
import { colors, statusColors, baseStyles } from '@gocodealone/workflow-ui/theme';

function App() {
  return (
    <div style={baseStyles.container}>
      <div style={baseStyles.card}>
        <h1 style={{ color: colors.blue }}>Hello World</h1>
        <button style={baseStyles.button.primary}>
          Click Me
        </button>
      </div>
    </div>
  );
}
```

### API Client

Configure once at app startup, then use the typed HTTP methods:

```tsx
import { configureApi, apiGet, apiPost } from '@gocodealone/workflow-ui/api';

// Configure at app root
configureApi({
  baseUrl: '/api/v1',
  onResponseError: (status) => {
    if (status === 401) {
      // Handle unauthorized
    }
  },
});

// Use anywhere
const data = await apiGet<User[]>('/users');
await apiPost('/users', { name: 'Alice' });
```

### Authentication

Create an auth store and use the LoginPage component:

```tsx
import { createAuthStore, LoginPage } from '@gocodealone/workflow-ui/auth';

// Create store (once at module scope)
export const useAuthStore = createAuthStore({
  loginPath: '/auth/login',
  mePath: '/auth/me',
});

// Use in your app
function App() {
  const { isAuthenticated, login, error } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <LoginPage
        title="My App"
        subtitle="Sign in to continue"
        onLogin={login}
        error={error}
      />
    );
  }

  return <div>Authenticated!</div>;
}
```

### Server-Sent Events

Connect to SSE endpoints with automatic auth token handling:

```tsx
import { connectSSE } from '@gocodealone/workflow-ui/sse';
import { useEffect } from 'react';

function EventListener() {
  useEffect(() => {
    const es = connectSSE({
      url: '/events',
      onEvent: (event) => {
        console.log('Received:', event.type, event.data);
      },
      onError: (err) => console.error('SSE error:', err),
    });

    return () => es.close();
  }, []);

  return <div>Listening for events...</div>;
}
```

## API Reference

### `/theme`

#### `colors`
Catppuccin Mocha color palette with semantic naming:
- Base colors: `base`, `mantle`, `crust`, `surface0-2`, `overlay0-2`
- Text colors: `text`, `subtext0-1`
- Accent colors: `blue`, `green`, `yellow`, `red`, `mauve`, `pink`, etc.

#### `statusColors`
Status-to-color mappings for common states:
```typescript
statusColors.active // green
statusColors.error  // red
statusColors.pending // yellow
```

#### `baseStyles`
Pre-styled component objects:
- `baseStyles.container` — Full-height page container
- `baseStyles.card` — Card with border and padding
- `baseStyles.input` — Text input
- `baseStyles.button.primary` — Primary action button
- `baseStyles.button.secondary` — Secondary button
- `baseStyles.button.danger` — Destructive action button
- `baseStyles.table`, `baseStyles.th`, `baseStyles.td` — Table styles

### `/api`

#### `configureApi(config: ApiClientConfig)`
Configure the API client. Call once at app startup.

**Config options:**
- `baseUrl?: string` — Base URL prefix (default: `/api`)
- `getToken?: () => string | null` — Token retrieval function
- `onResponseError?: (status: number, body: string) => void` — Error handler

#### HTTP Methods
All methods return typed promises and inject auth tokens automatically:
- `apiGet<T>(path: string): Promise<T>`
- `apiPost<T>(path: string, body?: unknown): Promise<T>`
- `apiPut<T>(path: string, body?: unknown): Promise<T>`
- `apiPatch<T>(path: string, body: unknown): Promise<T>`
- `apiDelete<T>(path: string): Promise<T>`

### `/auth`

#### `createAuthStore(config?: AuthStoreConfig)`
Factory function to create a Zustand auth store.

**Config options:**
- `loginPath?: string` — Login endpoint (default: `/auth/login`)
- `mePath?: string` — User profile endpoint (default: `/auth/me`)
- `tokenKey?: string` — localStorage key (default: `auth_token`)
- `parseLoginResponse?: (data: unknown) => { token: string; user?: BaseUser }`
- `buildLoginBody?: (username: string, password: string) => unknown`
- `onLogout?: (token: string | null) => void`

**Store interface:**
```typescript
interface BaseAuthState {
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
```

#### `LoginPage` Component
Pre-styled login form using theme system.

**Props:**
```typescript
interface LoginPageProps {
  title: string;
  subtitle?: string;
  usernameLabel?: string;
  usernameType?: string;
  usernamePlaceholder?: string;
  onLogin: (username: string, password: string) => Promise<void>;
  error?: string | null;
  style?: CSSProperties;
}
```

### `/sse`

#### `connectSSE(config: SSEConfig): EventSource`
Connect to a Server-Sent Events endpoint. Returns the EventSource instance.

**Config:**
```typescript
interface SSEConfig {
  url?: string;              // Default: '/events'
  withAuth?: boolean;        // Default: true
  tokenKey?: string;         // Default: 'auth_token'
  onEvent: (event: { type: string; data: unknown }) => void;
  onError?: (event: Event) => void;
}
```

## Development

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

Output: `dist/` with ESM, CJS, and type definitions.

### Test

```bash
npm test              # Run once
npm run test:watch    # Watch mode
```

### Lint

```bash
npm run lint
```

### Local Development

Link locally for testing in other projects:

```bash
npm link
cd ../your-project
npm link @gocodealone/workflow-ui
```

## Peer Dependencies

- `react`: ^18.0.0 || ^19.0.0
- `react-dom`: ^18.0.0 || ^19.0.0
- `zustand`: ^4.0.0 || ^5.0.0

## License

MIT © GoCodeAlone
