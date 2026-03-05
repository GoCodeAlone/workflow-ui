import type { CSSProperties } from 'react';
import type { TraceStep } from '../trace/types';
import { TRACE_STATUS_COLORS } from '../trace/types';

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

function formatDuration(ms?: number): string {
  if (ms == null) return '';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

export interface TraceNodeOverlayProps {
  step: TraceStep;
  style?: CSSProperties;
}

/**
 * Renders a status badge + duration overlay for a trace node.
 * Position this absolutely within a relative-positioned node container.
 */
export default function TraceNodeOverlay({ step, style }: TraceNodeOverlayProps) {
  ensurePulseKeyframes();

  const color = TRACE_STATUS_COLORS[step.status];
  const isRunning = step.status === 'running';
  const duration = formatDuration(step.durationMs);

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

  const dotStyle: CSSProperties = {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
  };

  return (
    <div style={containerStyle}>
      <span style={badgeStyle}>
        <span style={dotStyle} aria-hidden="true" />
        {step.status}
        {duration ? ` · ${duration}` : ''}
      </span>
    </div>
  );
}
