import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JsonTreeViewer from './JsonTreeViewer';

beforeEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    writable: true,
    configurable: true,
  });
});

describe('JsonTreeViewer', () => {
  it('renders the label', () => {
    render(<JsonTreeViewer data={{ a: 1 }} label="My Data" />);
    expect(screen.getByText('My Data')).toBeInTheDocument();
  });

  it('expands and collapses on toggle click', async () => {
    const user = userEvent.setup();
    render(<JsonTreeViewer data={{ x: 'hello' }} label="Toggle" />);

    // Initially expanded
    expect(screen.getByText(/hello/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /toggle/i }));
    // Collapsed — tree content hidden
    expect(screen.queryByText(/hello/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /toggle/i }));
    // Expanded again
    expect(screen.getByText(/hello/)).toBeInTheDocument();
  });

  it('renders a copy button', () => {
    render(<JsonTreeViewer data={{ a: 1 }} label="Test" />);
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  it('copy button calls clipboard.writeText', async () => {
    const user = userEvent.setup();
    const writeFn = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: { writeText: writeFn },
      configurable: true,
      writable: true,
    });
    render(<JsonTreeViewer data={{ key: 'val' }} label="Test" />);
    await user.click(screen.getByRole('button', { name: /copy/i }));
    expect(writeFn).toHaveBeenCalledWith(JSON.stringify({ key: 'val' }, null, 2));
  });

  it('shows PII lock icon when a value contains [REDACTED]', () => {
    render(<JsonTreeViewer data={{ token: '[REDACTED]' }} label="Sensitive" />);
    expect(screen.getAllByLabelText(/redacted pii/i).length).toBeGreaterThan(0);
  });

  it('shows PII lock icon on container label when any nested value is redacted', () => {
    render(<JsonTreeViewer data={{ nested: { secret: '[REDACTED]' } }} label="Root" />);
    expect(screen.getByLabelText(/contains redacted pii/i)).toBeInTheDocument();
  });

  it('does not show PII lock when no [REDACTED] values', () => {
    render(<JsonTreeViewer data={{ name: 'Alice' }} label="Clean" />);
    expect(screen.queryByLabelText(/redacted pii/i)).not.toBeInTheDocument();
  });

  it('renders string values', () => {
    render(<JsonTreeViewer data={{ greeting: 'hello world' }} label="Strings" />);
    expect(screen.getByText(/"hello world"/)).toBeInTheDocument();
  });

  it('renders number values', () => {
    render(<JsonTreeViewer data={{ count: 42 }} label="Numbers" />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders null values', () => {
    render(<JsonTreeViewer data={{ nothing: null }} label="Nulls" />);
    expect(screen.getByText('null')).toBeInTheDocument();
  });

  it('renders boolean values', () => {
    render(<JsonTreeViewer data={{ flag: true }} label="Booleans" />);
    expect(screen.getByText('true')).toBeInTheDocument();
  });

  it('handles clipboard denial without throwing', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
      writable: true,
      configurable: true,
    });
    const user = userEvent.setup();
    render(<JsonTreeViewer data={{ x: 1 }} label="Test" />);
    await expect(user.click(screen.getByRole('button', { name: /copy/i }))).resolves.not.toThrow();
  });

  it('renders empty object without throwing', () => {
    expect(() => render(<JsonTreeViewer data={{}} label="Empty" />)).not.toThrow();
  });
});
