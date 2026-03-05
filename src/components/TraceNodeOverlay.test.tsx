import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TraceNodeOverlay from './TraceNodeOverlay';
import type { TraceStep } from '../trace/types';

const makeStep = (overrides: Partial<TraceStep> = {}): TraceStep => ({
  stepName: 'my-step',
  stepType: 'step.set',
  status: 'completed',
  sequenceNum: 1,
  ...overrides,
});

describe('TraceNodeOverlay', () => {
  it('shows ✓ icon for completed status', () => {
    render(<TraceNodeOverlay step={makeStep({ status: 'completed' })} />);
    expect(screen.getByLabelText(/completed/i).textContent).toContain('✓');
  });

  it('shows ✗ icon for failed status', () => {
    render(<TraceNodeOverlay step={makeStep({ status: 'failed' })} />);
    expect(screen.getByLabelText(/failed/i).textContent).toContain('✗');
  });

  it('shows ⏭ icon for skipped status', () => {
    render(<TraceNodeOverlay step={makeStep({ status: 'skipped' })} />);
    expect(screen.getByLabelText(/skipped/i).textContent).toContain('⏭');
  });

  it('shows ● icon for running status', () => {
    render(<TraceNodeOverlay step={makeStep({ status: 'running' })} />);
    expect(screen.getByLabelText(/running/i).textContent).toContain('●');
  });

  it('shows ○ icon for pending status', () => {
    render(<TraceNodeOverlay step={makeStep({ status: 'pending' })} />);
    expect(screen.getByLabelText(/pending/i).textContent).toContain('○');
  });

  it('includes duration in aria-label when durationMs provided', () => {
    render(<TraceNodeOverlay step={makeStep({ status: 'completed', durationMs: 250 })} />);
    const badge = screen.getByLabelText(/completed 250ms/i);
    expect(badge).toBeInTheDocument();
  });

  it('shows duration text in badge when durationMs provided', () => {
    render(<TraceNodeOverlay step={makeStep({ status: 'completed', durationMs: 1500 })} />);
    expect(screen.getByLabelText(/completed/i).textContent).toContain('1.5s');
  });

  it('omits duration from badge when durationMs is absent', () => {
    render(<TraceNodeOverlay step={makeStep({ status: 'completed', durationMs: undefined })} />);
    const badge = screen.getByLabelText('completed');
    // aria-label should not contain duration placeholder
    expect(badge.getAttribute('aria-label')).toBe('completed');
  });

  it('renders all statuses without throwing', () => {
    const statuses: TraceStep['status'][] = ['completed', 'failed', 'running', 'skipped', 'pending'];
    for (const status of statuses) {
      const { unmount } = render(<TraceNodeOverlay step={makeStep({ status })} />);
      unmount();
    }
  });
});
