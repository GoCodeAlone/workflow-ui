import type { CSSProperties } from 'react';
import { colors } from '../theme';

export type LoadingSpinnerSize = 'sm' | 'md' | 'lg';

export interface LoadingSpinnerProps {
  /** Spinner size. Default: 'md' */
  size?: LoadingSpinnerSize;
  /** Optional message displayed below the spinner. */
  message?: string;
  /** Override wrapper style. */
  style?: CSSProperties;
  /** Color of the spinning arc. Default: colors.blue */
  color?: string;
}

const spinnerDimension: Record<LoadingSpinnerSize, number> = {
  sm: 16,
  md: 32,
  lg: 48,
};

const borderWidth: Record<LoadingSpinnerSize, number> = {
  sm: 2,
  md: 3,
  lg: 4,
};

const messageFontSize: Record<LoadingSpinnerSize, string> = {
  sm: '11px',
  md: '13px',
  lg: '15px',
};

/** Inject the spin keyframes once. */
let spinInjected = false;
function ensureSpinKeyframes() {
  if (spinInjected || typeof document === 'undefined') return;
  spinInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes workflow-ui-spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default function LoadingSpinner({
  size = 'md',
  message,
  style,
  color,
}: LoadingSpinnerProps) {
  ensureSpinKeyframes();

  const dim = spinnerDimension[size];
  const bw = borderWidth[size];
  const spinColor = color ?? colors.blue;

  const wrapperStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    ...style,
  };

  const ringStyle: CSSProperties = {
    width: dim,
    height: dim,
    borderRadius: '50%',
    border: `${bw}px solid ${colors.surface1}`,
    borderTopColor: spinColor,
    animation: 'workflow-ui-spin 0.75s linear infinite',
    flexShrink: 0,
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message ?? 'Loading'}
      style={wrapperStyle}
    >
      <div style={ringStyle} />
      {message && (
        <span
          style={{
            color: colors.subtext0,
            fontSize: messageFontSize[size],
          }}
        >
          {message}
        </span>
      )}
    </div>
  );
}
