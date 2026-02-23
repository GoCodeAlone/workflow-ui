import type { CSSProperties } from 'react';
import { colors } from '../../theme';

export interface LoadingSpinnerProps {
  /** Optional loading message. */
  message?: string;
  /** Spinner size in pixels. Default: 32 */
  size?: number;
  /** Color of the spinner. Default: theme blue */
  color?: string;
  /** Override container style. */
  style?: CSSProperties;
}

const keyframesId = 'wf-spinner-spin';

function ensureKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(keyframesId)) return;
  const style = document.createElement('style');
  style.id = keyframesId;
  style.textContent = `@keyframes wf-spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}

export default function LoadingSpinner({
  message,
  size = 32,
  color = colors.blue,
  style,
}: LoadingSpinnerProps) {
  ensureKeyframes();

  return (
    <div
      role="status"
      aria-label={message || 'Loading'}
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        ...style,
      }}
    >
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={{ animation: 'wf-spin 1s linear infinite' }}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={`${color}33`}
          strokeWidth="3"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {message && (
        <span style={{ color: colors.subtext0, fontSize: '14px' }}>{message}</span>
      )}
    </div>
  );
}
