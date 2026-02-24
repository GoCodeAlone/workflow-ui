import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it('renders with status text', () => {
    render(<StatusBadge status="running" />);
    expect(screen.getByRole('status')).toHaveTextContent('Running');
  });

  it('renders custom label', () => {
    render(<StatusBadge status="failed" label="Deploy Failed" />);
    expect(screen.getByRole('status')).toHaveTextContent('Deploy Failed');
  });

  it('has accessible aria-label', () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Status: Completed',
    );
  });

  it('uses custom label in aria-label', () => {
    render(<StatusBadge status="error" label="Critical Error" />);
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Status: Critical Error',
    );
  });

  it('renders different sizes', () => {
    const { rerender } = render(<StatusBadge status="idle" size="sm" />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<StatusBadge status="idle" size="lg" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('hides decorative dot from assistive technology', () => {
    const { container } = render(<StatusBadge status="active" />);
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).toBeInTheDocument();
  });
});
