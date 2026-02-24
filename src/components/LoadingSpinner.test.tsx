import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default aria-label', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingSpinner message="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('uses message as aria-label when provided', () => {
    render(<LoadingSpinner message="Saving" />);
    expect(screen.getByRole('status', { name: 'Saving' })).toBeInTheDocument();
  });

  it('renders without message (no text node)', () => {
    const { container } = render(<LoadingSpinner />);
    // Only the spinner ring, no extra text
    const spans = container.querySelectorAll('span');
    expect(spans.length).toBe(0);
  });

  it('renders sm size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders lg size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('applies custom style', () => {
    const { container } = render(
      <LoadingSpinner style={{ margin: '20px' }} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.margin).toBe('20px');
  });

  it('applies custom color to spinner', () => {
    const { container } = render(<LoadingSpinner color="#ff0000" />);
    // The DOM structure is: container > div[role=status] > div(ring)
    // Select the ring by querying inside the status element.
    // jsdom normalises borderTopColor into the border-color shorthand as rgb().
    const status = container.querySelector('[role="status"]') as HTMLElement;
    const ring = status.querySelector('div') as HTMLElement;
    const styleAttr = ring.getAttribute('style') ?? '';
    expect(styleAttr).toContain('rgb(255, 0, 0)');
  });
});
