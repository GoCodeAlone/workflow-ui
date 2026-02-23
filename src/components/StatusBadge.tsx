import type { CSSProperties } from 'react';
import { colors, statusColors } from '../theme';

export type StatusValue =
  | 'idle'
  | 'running'
  | 'completed'
  | 'failed'
  | 'pending'
  | 'active'
  | 'stopped'
  | 'error'
  | 'canceled';

export type StatusBadgeSize = 'sm' | 'md' | 'lg';

export interface StatusBadgeProps {
  /** The status to display. */
  status: StatusValue;
  /** Optional label override — defaults to the status string. */
  label?: string;
  /** Badge size. Default: 'md' */
  size?: StatusBadgeSize;
  /** Override container style. */
  style?: CSSProperties;
}

const dotSize: Record<StatusBadgeSize, number> = {
  sm: 6,
  md: 8,
  lg: 10,
};

const fontSize: Record<StatusBadgeSize, string> = {
  sm: '11px',
  md: '13px',
  lg: '15px',
};

const padding: Record<StatusBadgeSize, string> = {
  sm: '2px 6px',
  md: '3px 8px',
  lg: '4px 10px',
};

/** Inline keyframe style injected once. */
let pulseInjected = false;
function ensurePulseKeyframes() {
  if (pulseInjected || typeof document === 'undefined') return;
  pulseInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes workflow-ui-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.35; }
    }
  `;
  document.head.appendChild(style);
}

export default function StatusBadge({
  status,
  label,
  size = 'md',
  style,
}: StatusBadgeProps) {
  ensurePulseKeyframes();

  const color = statusColors[status] ?? colors.overlay0;
  const isRunning = status === 'running' || status === 'active';
  const displayLabel = label ?? status.charAt(0).toUpperCase() + status.slice(1);

  const containerStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: `${color}22`,
    border: `1px solid ${color}55`,
    borderRadius: '9999px',
    padding: padding[size],
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    fontSize: fontSize[size],
    fontWeight: '500',
    color,
    whiteSpace: 'nowrap',
    ...style,
  };

  const dotStyle: CSSProperties = {
    width: dotSize[size],
    height: dotSize[size],
    borderRadius: '50%',
    backgroundColor: color,
    flexShrink: 0,
    ...(isRunning
      ? { animation: 'workflow-ui-pulse 1.4s ease-in-out infinite' }
      : {}),
  };

  return (
    <span style={containerStyle}>
      <span style={dotStyle} />
      {displayLabel}
    </span>
  );
}
