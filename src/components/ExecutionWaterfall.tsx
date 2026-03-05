import { useState, useMemo } from 'react';
import type { TraceStep } from '../trace/types';
import { TRACE_STATUS_COLORS } from '../trace/types';
import { formatDuration } from '../trace/utils';

interface StepTiming {
  step: TraceStep;
  startMs: number;
  endMs: number;
}

/**
 * Compute start/end times for each step using cumulative durations (sequential model).
 * Steps with no durationMs are given 0 duration.
 */
function computeTimings(steps: TraceStep[]): StepTiming[] {
  const sorted = [...steps].sort((a, b) => a.sequenceNum - b.sequenceNum);
  let cursor = 0;
  return sorted.map((step) => {
    const dur = step.durationMs ?? 0;
    const timing = { step, startMs: cursor, endMs: cursor + dur };
    cursor += dur;
    return timing;
  });
}

/**
 * Find the critical path: the longest sequential chain of executed steps.
 * For a linear pipeline this is all non-skipped, non-pending executed steps.
 * Returns a Set of stepNames on the critical path.
 */
function computeCriticalPath(timings: StepTiming[]): Set<string> {
  // Group into continuous runs of executed steps (completed/running/failed)
  // Find the group with the longest cumulative duration.
  const executed = timings.filter(
    (t) =>
      t.step.status === 'completed' ||
      t.step.status === 'running' ||
      t.step.status === 'failed',
  );

  if (executed.length === 0) return new Set();

  // Sequential model: all executed steps are treated as the critical path.
  // In a sequential pipeline every executed step contributes to end-to-end latency.
  // A parallel-branch DAG model (longest-path) would require explicit parent/child
  // relationships in TraceStep, which are not currently part of the interface.
  return new Set(executed.map((t) => t.step.stepName));
}

interface TooltipState {
  stepName: string;
  stepType: string;
  status: TraceStep['status'];
  durationMs?: number;
  x: number;
  y: number;
}

export interface ExecutionWaterfallProps {
  steps: TraceStep[];
  onStepClick?: (stepName: string) => void;
}

/** Horizontal waterfall chart showing step execution timing, colored by status, with critical path highlighted. */
export default function ExecutionWaterfall({ steps, onStepClick }: ExecutionWaterfallProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  const timings = useMemo(() => computeTimings(steps), [steps]);
  const criticalPath = useMemo(() => computeCriticalPath(timings), [timings]);

  const totalMs = useMemo(() => {
    if (timings.length === 0) return 1;
    return Math.max(...timings.map((t) => t.endMs), 1);
  }, [timings]);

  if (steps.length === 0) {
    return (
      <div
        style={{
          color: '#6c7086',
          fontSize: 13,
          textAlign: 'center',
          padding: '20px 0',
        }}
      >
        No steps to display.
      </div>
    );
  }

  const ROW_HEIGHT = 28;
  const LABEL_WIDTH = 180;
  const BAR_PADDING = 4;

  const handleBarClick = (stepName: string) => {
    setSelectedStep(stepName);
    onStepClick?.(stepName);
  };

  const handleMouseEnter = (
    e: React.MouseEvent,
    t: StepTiming,
  ) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltip({
      stepName: t.step.stepName,
      stepType: t.step.stepType,
      status: t.step.status,
      durationMs: t.step.durationMs,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  return (
    <div style={{ position: 'relative', overflowX: 'auto' }}>
      {/* Time axis header */}
      <div
        style={{
          display: 'flex',
          marginBottom: 4,
          paddingLeft: LABEL_WIDTH,
          fontSize: 10,
          color: '#6c7086',
        }}
      >
        <span>0</span>
        <span style={{ marginLeft: 'auto' }}>{formatDuration(totalMs)}</span>
      </div>

      {/* Rows */}
      {timings.map((t) => {
        const color = TRACE_STATUS_COLORS[t.step.status];
        const isCritical = criticalPath.has(t.step.stepName);
        const isSelected = selectedStep === t.step.stepName;
        const leftPct = (t.startMs / totalMs) * 100;
        const widthPct = Math.max(((t.endMs - t.startMs) / totalMs) * 100, 0.5);

        return (
          <div
            key={t.step.stepName}
            style={{
              display: 'flex',
              alignItems: 'center',
              height: ROW_HEIGHT,
              borderBottom: '1px solid #1e1e2e',
              background: isSelected ? '#313244' : 'transparent',
              cursor: 'pointer',
            }}
            onClick={() => handleBarClick(t.step.stepName)}
          >
            {/* Step label */}
            <div
              style={{
                width: LABEL_WIDTH,
                flexShrink: 0,
                paddingRight: 8,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  color: '#cdd6f4',
                  fontSize: 12,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={t.step.stepName}
              >
                {t.step.stepName}
              </div>
              <div style={{ color: '#6c7086', fontSize: 10 }}>{t.step.stepType}</div>
            </div>

            {/* Bar track */}
            <div
              style={{
                flex: 1,
                position: 'relative',
                height: ROW_HEIGHT - BAR_PADDING * 2,
                margin: `${BAR_PADDING}px 0`,
              }}
            >
              <div
                role="button"
                aria-label={`${t.step.stepName} — ${t.step.status} ${formatDuration(t.step.durationMs)}`}
                style={{
                  position: 'absolute',
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                  top: 0,
                  bottom: 0,
                  background: `${color}33`,
                  border: isCritical
                    ? `2px solid ${color}`
                    : `1px solid ${color}66`,
                  borderRadius: 3,
                  boxShadow: isSelected ? `0 0 0 2px ${color}88` : undefined,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 4,
                  overflow: 'hidden',
                  minWidth: 4,
                  transition: 'box-shadow 0.1s',
                }}
                onMouseEnter={(e) => handleMouseEnter(e, t)}
                onMouseLeave={() => setTooltip(null)}
              >
                <span
                  style={{
                    color,
                    fontSize: 10,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  {formatDuration(t.step.durationMs)}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            background: '#313244',
            border: '1px solid #45475a',
            borderRadius: 6,
            padding: '6px 10px',
            fontSize: 12,
            color: '#cdd6f4',
            pointerEvents: 'none',
            zIndex: 100,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 2 }}>{tooltip.stepName}</div>
          <div style={{ color: '#a6adc8', fontSize: 11 }}>
            {tooltip.stepType} ·{' '}
            <span style={{ color: TRACE_STATUS_COLORS[tooltip.status] }}>
              {tooltip.status}
            </span>
          </div>
          <div style={{ color: '#a6adc8', fontSize: 11, marginTop: 2 }}>
            {formatDuration(tooltip.durationMs)}
          </div>
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginTop: 8,
          padding: '6px 0',
          fontSize: 11,
          color: '#6c7086',
          borderTop: '1px solid #313244',
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span
            style={{
              width: 12,
              height: 3,
              background: '#a6e3a1',
              borderRadius: 2,
              display: 'inline-block',
            }}
          />
          Critical path
        </span>
        {(['completed', 'failed', 'running', 'skipped', 'pending'] as TraceStep['status'][]).map(
          (s) => (
            <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: TRACE_STATUS_COLORS[s],
                  display: 'inline-block',
                }}
              />
              {s}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
