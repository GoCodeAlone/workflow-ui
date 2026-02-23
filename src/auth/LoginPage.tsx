import { useState, type FormEvent, type CSSProperties } from 'react';
import { colors, baseStyles } from '../theme';

export interface LoginPageProps {
  /** App title displayed above the form. */
  title: string;
  /** Subtitle below the title. */
  subtitle?: string;
  /** Label for the username/email field. Default: 'Username' */
  usernameLabel?: string;
  /** Input type for the username field. Default: 'text' */
  usernameType?: string;
  /** Placeholder for the username field. Default: 'admin' */
  usernamePlaceholder?: string;
  /** Login handler. Called with (username, password). */
  onLogin: (username: string, password: string) => Promise<void>;
  /** Error message to display. */
  error?: string | null;
  /** Override container style. */
  style?: CSSProperties;
}

export default function LoginPage({
  title,
  subtitle,
  usernameLabel = 'Username',
  usernameType = 'text',
  usernamePlaceholder = 'admin',
  onLogin,
  error,
  style,
}: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onLogin(username, password);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        ...baseStyles.container,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <div
        style={{
          width: '360px',
          padding: '40px',
          backgroundColor: colors.surface0,
          borderRadius: '12px',
          border: `1px solid ${colors.surface1}`,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: colors.blue,
              margin: '0 0 8px',
              letterSpacing: '-0.5px',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ color: colors.subtext0, fontSize: '14px', margin: 0 }}>
              {subtitle}
            </p>
          )}
        </div>

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              backgroundColor: `${colors.red}22`,
              border: `1px solid ${colors.red}`,
              borderRadius: '6px',
              padding: '10px 14px',
              color: colors.red,
              fontSize: '14px',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} aria-label="Sign in">
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="login-username"
              style={{
                display: 'block',
                color: colors.subtext1,
                fontSize: '13px',
                fontWeight: '500',
                marginBottom: '6px',
              }}
            >
              {usernameLabel}
            </label>
            <input
              id="login-username"
              type={usernameType}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={usernamePlaceholder}
              autoFocus
              required
              aria-required="true"
              style={baseStyles.input}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="login-password"
              style={{
                display: 'block',
                color: colors.subtext1,
                fontSize: '13px',
                fontWeight: '500',
                marginBottom: '6px',
              }}
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              aria-required="true"
              style={baseStyles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            style={{
              ...baseStyles.button.primary,
              width: '100%',
              padding: '10px',
              fontSize: '15px',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}
