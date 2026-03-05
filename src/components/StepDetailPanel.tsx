import { type CSSProperties } from 'react';
import type { TraceStep } from '../trace/types';
import { TRACE_STATUS_COLORS } from '../trace/types';
import JsonTreeViewer from './JsonTreeViewer';

function formatDuration(ms?: number): string {
  if (ms == null) return '—';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: '#6c7086',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
      <span style={{ color: '#a6adc8', fontSize: 12 }}>{label}</span>
      <span style={{ color: '#cdd6f4', fontSize: 12, fontFamily: 'monospace' }}>{value}</span>
    </div>
  );
}

export interface StepDetailPanelProps {
  step: TraceStep | null;
  onClose: () => void;
  style?: CSSProperties;
}

/** Right sidebar panel showing full details for a selected trace step. */
export default function StepDetailPanel({ step, onClose, style }: StepDetailPanelProps) {
  const visible = step !== null;

  const panelStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 320,
    background: '#181825',
    borderLeft: '1px solid #313244',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transform: visible ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 0.2s ease',
    zIndex: 20,
    ...style,
  };

  if (!step) {
    return <div style={panelStyle} aria-hidden="true" />;
  }

  const statusColor = TRACE_STATUS_COLORS[step.status];

  return (
    <div style={panelStyle} role="complementary" aria-label="Step detail panel">
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #313244',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              color: '#cdd6f4',
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={step.stepName}
          >
            {step.stepName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                fontSize: 10,
                padding: '1px 6px',
                borderRadius: 4,
                background: '#313244',
                color: '#a6adc8',
              }}
            >
              {step.stepType}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: `${statusColor}22`,
                border: `1px solid ${statusColor}55`,
                borderRadius: 9999,
                padding: '1px 7px',
                fontSize: 10,
                fontWeight: 700,
                color: statusColor,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: statusColor,
                  flexShrink: 0,
                }}
              />
              {step.status}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close step detail panel"
          style={{
            background: 'none',
            border: 'none',
            color: '#6c7086',
            fontSize: 18,
            cursor: 'pointer',
            padding: 4,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {/* Timing section */}
        <Section title="Timing">
          <InfoRow label="Sequence #" value={`#${step.sequenceNum}`} />
          <InfoRow label="Duration" value={formatDuration(step.durationMs)} />
        </Section>

        {/* Input data */}
        {step.inputData != null && (
          <Section title="Input">
            <JsonTreeViewer data={step.inputData} label="Input Data" />
          </Section>
        )}

        {/* Output data */}
        {step.outputData != null && (
          <Section title="Output">
            <JsonTreeViewer data={step.outputData} label="Output Data" />
          </Section>
        )}

        {/* Error section */}
        {step.status === 'failed' && step.errorMessage && (
          <Section title="Error">
            <div
              style={{
                background: '#f38ba822',
                border: '1px solid #f38ba855',
                borderRadius: 6,
                padding: '8px 12px',
              }}
            >
              <p
                style={{
                  color: '#f38ba8',
                  fontSize: 12,
                  margin: 0,
                  fontFamily: 'monospace',
                  lineHeight: '18px',
                  wordBreak: 'break-word',
                }}
              >
                {step.errorMessage}
              </p>
            </div>
          </Section>
        )}

        {/* Conditional routing section */}
        {step.routeTaken && (
          <Section title="Conditional">
            <InfoRow label="Route taken" value={step.routeTaken} />
            {step.routeFieldValue !== undefined && (
              <InfoRow
                label="Field value"
                value={
                  <span style={{ color: '#a6e3a1' }}>
                    {JSON.stringify(step.routeFieldValue)}
                  </span>
                }
              />
            )}
          </Section>
        )}

        {/* Skipped notice */}
        {step.status === 'skipped' && (
          <Section title="Status">
            <div style={{ color: '#6c7086', fontSize: 12 }}>
              This step was skipped during execution.
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
