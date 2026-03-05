import { useEffect, type CSSProperties } from 'react';
import type { TraceStep } from '../trace/types';
import { TRACE_STATUS_COLORS } from '../trace/types';
import { formatDuration } from '../trace/utils';

let pulseInjected = false;
function ensurePulseKeyframes() {
  if (pulseInjected || typeof document === 'undefined') return;
  pulseInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes trace-overlay-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.35; }
    }
  `;
  document.head.appendChild(style);
}

const STATUS_ICONS: Record<TraceStep['status'], string> = {
  completed: '✓',
  failed: '✗',
  running: '●',
  skipped: '⏭',
  pending: '○',
};

export interface TraceNodeOverlayProps {
  step: TraceStep;
  style?: CSSProperties;
}

/**
 * Renders a status badge + duration overlay for a trace node.
 * Shows per-status icon: ✓ completed, ✗ failed, ⏭ skipped, ● running, ○ pending.
 * Position this absolutely within a relative-positioned node container.
 */
export default function TraceNodeOverlay({ step, style }: TraceNodeOverlayProps) {
  useEffect(() => {
    ensurePulseKeyframes();
  }, []);

  const color = TRACE_STATUS_COLORS[step.status];
  const isRunning = step.status === 'running';
  // Only show duration when durationMs is actually provided
  const duration = step.durationMs != null ? formatDuration(step.durationMs) : null;
  const icon = STATUS_ICONS[step.status];

  const containerStyle: CSSProperties = {
    position: 'absolute',
    top: -10,
    right: -10,
    zIndex: 10,
    pointerEvents: 'none',
    ...style,
  };

  const badgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: `${color}22`,
    border: `1px solid ${color}77`,
    borderRadius: 9999,
    padding: '2px 7px',
    fontSize: 10,
    fontWeight: 700,
    color,
    whiteSpace: 'nowrap',
    ...(isRunning ? { animation: 'trace-overlay-pulse 1.4s ease-in-out infinite' } : {}),
  };

  return (
    <div style={containerStyle}>
      <span style={badgeStyle} aria-label={`${step.status}${duration ? ` ${duration}` : ''}`}>
        <span aria-hidden="true">{icon}</span>
        {duration ? ` ${duration}` : ''}
      </span>
    </div>
  );
}
