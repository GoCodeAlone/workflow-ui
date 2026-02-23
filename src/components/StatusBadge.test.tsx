import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it('renders with default label from status', () => {
    render(<StatusBadge status="running" />);
    expect(screen.getByText('Running')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<StatusBadge status="completed" label="Done" />);
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders all supported statuses without throwing', () => {
    const statuses = [
      'idle', 'running', 'completed', 'failed', 'pending',
      'active', 'stopped', 'error', 'canceled',
    ] as const;

    for (const status of statuses) {
      const { unmount } = render(<StatusBadge status={status} />);
      unmount();
    }
  });

  it('renders sm size', () => {
    const { container } = render(<StatusBadge status="idle" size="sm" />);
    // The badge wrapper should be rendered
    expect(container.firstChild).toBeTruthy();
  });

  it('renders lg size', () => {
    const { container } = render(<StatusBadge status="failed" size="lg" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('applies custom style', () => {
    const { container } = render(
      <StatusBadge status="pending" style={{ marginTop: '8px' }} />,
    );
    const badge = container.firstChild as HTMLElement;
    expect(badge.style.marginTop).toBe('8px');
  });

  it('capitalises status as label by default', () => {
    render(<StatusBadge status="failed" />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('renders a dot element alongside the label', () => {
    const { container } = render(<StatusBadge status="running" />);
    // span > span (dot) + text
    const spans = container.querySelectorAll('span');
    expect(spans.length).toBeGreaterThanOrEqual(2);
  });
});
