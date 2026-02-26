import { useState, useId, type FormEvent, type CSSProperties } from 'react';
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
  /** Placeholder for the username field. Default: 'Enter username' */
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
  usernamePlaceholder = 'Enter username',
  onLogin,
  error,
  style,
}: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const titleId = useId();
  const usernameId = useId();
  const passwordId = useId();
  const errorId = useId();

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
            id={titleId}
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

        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {error && (
            <div
              id={errorId}
              role="alert"
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
        </div>

        <form
          onSubmit={handleSubmit}
          aria-label="Login form"
          aria-busy={loading}
          noValidate
        >
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor={usernameId}
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
              id={usernameId}
              type={usernameType}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={usernamePlaceholder}
              autoFocus
              required
              aria-required="true"
              aria-describedby={error ? errorId : undefined}
              style={{
                ...baseStyles.input,
                outlineColor: colors.blue,
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor={passwordId}
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
              id={passwordId}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              aria-required="true"
              aria-describedby={error ? errorId : undefined}
              style={{
                ...baseStyles.input,
                outlineColor: colors.blue,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            aria-disabled={loading}
            style={{
              ...baseStyles.button.primary,
              width: '100%',
              padding: '10px',
              fontSize: '15px',
              opacity: loading ? 0.7 : 1,
              outlineColor: colors.blue,
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}
