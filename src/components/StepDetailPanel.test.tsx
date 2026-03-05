import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StepDetailPanel from './StepDetailPanel';
import type { TraceStep } from '../trace/types';

const makeStep = (overrides: Partial<TraceStep> = {}): TraceStep => ({
  stepName: 'validate-input',
  stepType: 'step.condition',
  status: 'completed',
  sequenceNum: 3,
  durationMs: 42,
  ...overrides,
});

describe('StepDetailPanel', () => {
  it('renders nothing visible when step is null', () => {
    const { container } = render(<StepDetailPanel step={null} onClose={vi.fn()} />);
    // Panel exists but is translated off-screen (transform: translateX(100%))
    const panel = container.firstChild as HTMLElement;
    expect(panel.style.transform).toContain('translateX(100%)');
  });

  it('renders step name and type in header', () => {
    render(<StepDetailPanel step={makeStep()} onClose={vi.fn()} />);
    expect(screen.getByText('validate-input')).toBeInTheDocument();
    expect(screen.getByText('step.condition')).toBeInTheDocument();
  });

  it('renders status badge in header', () => {
    render(<StepDetailPanel step={makeStep({ status: 'failed' })} onClose={vi.fn()} />);
    expect(screen.getByText('failed')).toBeInTheDocument();
  });

  it('renders timing section with sequence number and duration', () => {
    render(<StepDetailPanel step={makeStep({ sequenceNum: 5, durationMs: 300 })} onClose={vi.fn()} />);
    expect(screen.getByText('#5')).toBeInTheDocument();
    expect(screen.getByText('300ms')).toBeInTheDocument();
  });

  it('renders startedAt when provided', () => {
    render(
      <StepDetailPanel
        step={makeStep({ startedAt: '2026-01-01T12:34:56Z' })}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Started at')).toBeInTheDocument();
  });

  it('renders input data section when inputData present', () => {
    render(
      <StepDetailPanel
        step={makeStep({ inputData: { key: 'value' } })}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Input Data')).toBeInTheDocument();
  });

  it('renders output data section when outputData present', () => {
    render(
      <StepDetailPanel
        step={makeStep({ outputData: { result: 42 } })}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Output Data')).toBeInTheDocument();
  });

  it('renders error message for failed step', () => {
    render(
      <StepDetailPanel
        step={makeStep({ status: 'failed', errorMessage: 'timeout exceeded' })}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('timeout exceeded')).toBeInTheDocument();
  });

  it('renders stack trace when stackTrace provided', () => {
    render(
      <StepDetailPanel
        step={makeStep({
          status: 'failed',
          errorMessage: 'oops',
          stackTrace: 'at foo (bar.go:12)',
        })}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText(/at foo/)).toBeInTheDocument();
  });

  it('renders conditional section when routeTaken provided', () => {
    render(
      <StepDetailPanel
        step={makeStep({ routeTaken: 'branch-yes' })}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('branch-yes')).toBeInTheDocument();
    expect(screen.getByText('Route taken')).toBeInTheDocument();
  });

  it('renders skipped notice for skipped step', () => {
    render(<StepDetailPanel step={makeStep({ status: 'skipped' })} onClose={vi.fn()} />);
    expect(screen.getByText(/skipped during execution/i)).toBeInTheDocument();
  });

  it('calls onClose when × button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<StepDetailPanel step={makeStep()} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: /close step detail panel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('slides in when step is provided (transform translateX(0))', () => {
    const { container } = render(<StepDetailPanel step={makeStep()} onClose={vi.fn()} />);
    const panel = container.firstChild as HTMLElement;
    expect(panel.style.transform).toContain('translateX(0)');
  });

  it('renders PII lock icon when input contains [REDACTED]', () => {
    render(
      <StepDetailPanel
        step={makeStep({ inputData: { token: '[REDACTED]' } })}
        onClose={vi.fn()}
      />,
    );
    // JsonTreeViewer should show lock indicator
    expect(screen.getAllByLabelText(/redacted pii/i).length).toBeGreaterThan(0);
  });
});
