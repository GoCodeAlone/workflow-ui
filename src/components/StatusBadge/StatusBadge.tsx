import type { CSSProperties } from 'react';
import { colors, statusColors } from '../../theme';

export type StatusType =
  | 'idle'
  | 'running'
  | 'completed'
  | 'failed'
  | 'error'
  | 'pending'
  | 'canceled'
  | 'active';

export interface StatusBadgeProps {
  /** The status to display. */
  status: StatusType;
  /** Optional label override. Defaults to the status string. */
  label?: string;
  /** Optional size variant. */
  size?: StatusBadgeSize;
  /** Override container style. */
  style?: CSSProperties;
}

type StatusBadgeSize = 'sm' | 'md' | 'lg';

const sizeStyles: Record<StatusBadgeSize, CSSProperties> = {
  sm: { fontSize: '11px', padding: '2px 8px' },
  md: { fontSize: '12px', padding: '4px 10px' },
  lg: { fontSize: '14px', padding: '6px 14px' },
};

const dotSizes: Record<StatusBadgeSize, number> = {
  sm: 6,
  md: 8,
  lg: 10,
};

export default function StatusBadge({
  status,
  label,
  size = 'md',
  style,
}: StatusBadgeProps) {
  const color = statusColors[status] ?? colors.overlay0;
  const displayLabel = label ?? status.charAt(0).toUpperCase() + status.slice(1);
  const dotSize = dotSizes[size];

  return (
    <span
      role="status"
      aria-label={`Status: ${displayLabel}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        borderRadius: '9999px',
        fontWeight: 500,
        color,
        backgroundColor: `${color}22`,
        ...sizeStyles[size],
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      {displayLabel}
    </span>
  );
}
