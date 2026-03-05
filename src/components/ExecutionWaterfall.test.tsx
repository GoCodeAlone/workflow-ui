import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExecutionWaterfall from './ExecutionWaterfall';
import type { TraceStep } from '../trace/types';

const makeStep = (overrides: Partial<TraceStep> = {}): TraceStep => ({
  stepName: 'step-a',
  stepType: 'step.set',
  status: 'completed',
  sequenceNum: 1,
  durationMs: 100,
  ...overrides,
});

describe('ExecutionWaterfall', () => {
  it('renders "No steps" message when steps array is empty', () => {
    render(<ExecutionWaterfall steps={[]} />);
    expect(screen.getByText(/no steps to display/i)).toBeInTheDocument();
  });

  it('renders a row for each step', () => {
    const steps = [
      makeStep({ stepName: 'step-one', sequenceNum: 1 }),
      makeStep({ stepName: 'step-two', sequenceNum: 2, durationMs: 200 }),
    ];
    render(<ExecutionWaterfall steps={steps} />);
    expect(screen.getByText('step-one')).toBeInTheDocument();
    expect(screen.getByText('step-two')).toBeInTheDocument();
  });

  it('renders step type labels', () => {
    render(<ExecutionWaterfall steps={[makeStep({ stepType: 'step.condition' })]} />);
    expect(screen.getByText('step.condition')).toBeInTheDocument();
  });

  it('calls onStepClick with step name when row is clicked', async () => {
    const user = userEvent.setup();
    const onStepClick = vi.fn();
    render(
      <ExecutionWaterfall
        steps={[makeStep({ stepName: 'my-step' })]}
        onStepClick={onStepClick}
      />,
    );
    await user.click(screen.getByText('my-step'));
    expect(onStepClick).toHaveBeenCalledWith('my-step');
  });

  it('does not throw when onStepClick is omitted (optional)', async () => {
    const user = userEvent.setup();
    render(<ExecutionWaterfall steps={[makeStep()]} />);
    await expect(user.click(screen.getByText('step-a'))).resolves.not.toThrow();
  });

  it('renders duration in bar aria-label', () => {
    render(<ExecutionWaterfall steps={[makeStep({ durationMs: 500 })]} />);
    // bar has role="button" with aria-label containing the duration
    const bar = screen.getByRole('button', { name: /500ms/ });
    expect(bar).toBeInTheDocument();
  });

  it('bar aria-label includes status', () => {
    render(<ExecutionWaterfall steps={[makeStep({ status: 'failed', durationMs: 50 })]} />);
    const bar = screen.getByRole('button', { name: /failed/ });
    expect(bar).toBeInTheDocument();
  });

  it('critical path bars have bolder border than non-executed bars', () => {
    const steps = [
      makeStep({ stepName: 'ran', status: 'completed', sequenceNum: 1, durationMs: 100 }),
      makeStep({ stepName: 'skipped', status: 'skipped', sequenceNum: 2, durationMs: 0 }),
    ];
    render(<ExecutionWaterfall steps={steps} />);
    const ranBar = screen.getByRole('button', { name: /ran/ });
    const skippedBar = screen.getByRole('button', { name: /skipped/ });
    // Critical path bar should have 2px border, non-critical 1px
    expect(ranBar.style.border).toContain('2px');
    expect(skippedBar.style.border).toContain('1px');
  });

  it('renders legend row', () => {
    render(<ExecutionWaterfall steps={[makeStep()]} />);
    expect(screen.getByText('Critical path')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
    expect(screen.getByText('failed')).toBeInTheDocument();
  });

  it('bar widths are proportional to duration', () => {
    const steps = [
      makeStep({ stepName: 'short', sequenceNum: 1, durationMs: 100 }),
      makeStep({ stepName: 'long', sequenceNum: 2, durationMs: 300 }),
    ];
    render(<ExecutionWaterfall steps={steps} />);
    const shortBar = screen.getByRole('button', { name: /short/ });
    const longBar = screen.getByRole('button', { name: /long/ });
    // Total = 400ms; short=25%, long=75%
    expect(shortBar.style.width).toBe('25%');
    expect(longBar.style.width).toBe('75%');
  });

  it('second step bar starts after first step', () => {
    const steps = [
      makeStep({ stepName: 'first', sequenceNum: 1, durationMs: 200 }),
      makeStep({ stepName: 'second', sequenceNum: 2, durationMs: 200 }),
    ];
    render(<ExecutionWaterfall steps={steps} />);
    const firstBar = screen.getByRole('button', { name: /first/ });
    const secondBar = screen.getByRole('button', { name: /second/ });
    // total=400, first starts at 0%, second starts at 50%
    expect(firstBar.style.left).toBe('0%');
    expect(secondBar.style.left).toBe('50%');
  });
});
