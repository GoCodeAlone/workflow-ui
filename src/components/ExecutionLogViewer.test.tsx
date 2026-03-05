import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExecutionLogViewer from './ExecutionLogViewer';
import type { LogEntry } from './ExecutionLogViewer';

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const makeEntry = (overrides: Partial<LogEntry> = {}): LogEntry => ({
  id: 1,
  level: 'info',
  message: 'pipeline started',
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const makeEntries = (): LogEntry[] => [
  makeEntry({ id: 1, level: 'debug', message: 'debug msg', moduleName: 'loader' }),
  makeEntry({ id: 2, level: 'info', message: 'info msg', moduleName: 'router' }),
  makeEntry({ id: 3, level: 'warn', message: 'warn msg' }),
  makeEntry({ id: 4, level: 'error', message: 'error msg', moduleName: 'handler' }),
];

describe('ExecutionLogViewer', () => {
  it('renders all log entries when no filter applied', () => {
    render(<ExecutionLogViewer logs={makeEntries()} />);
    expect(screen.getByText('debug msg')).toBeInTheDocument();
    expect(screen.getByText('info msg')).toBeInTheDocument();
    expect(screen.getByText('warn msg')).toBeInTheDocument();
    expect(screen.getByText('error msg')).toBeInTheDocument();
  });

  it('shows "No log entries" when filter matches nothing', async () => {
    const user = userEvent.setup();
    render(<ExecutionLogViewer logs={makeEntries()} />);
    const search = screen.getByPlaceholderText(/search messages/i);
    await user.type(search, 'zzz-no-match');
    expect(screen.getByText(/no log entries match/i)).toBeInTheDocument();
  });

  it('filters entries by level dropdown', async () => {
    const user = userEvent.setup();
    render(<ExecutionLogViewer logs={makeEntries()} />);
    await user.selectOptions(screen.getByRole('combobox'), 'error');
    expect(screen.getByText('error msg')).toBeInTheDocument();
    expect(screen.queryByText('debug msg')).not.toBeInTheDocument();
    expect(screen.queryByText('info msg')).not.toBeInTheDocument();
  });

  it('filters entries by search text (case-insensitive)', async () => {
    const user = userEvent.setup();
    render(<ExecutionLogViewer logs={makeEntries()} />);
    await user.type(screen.getByPlaceholderText(/search messages/i), 'WARN');
    expect(screen.getByText('warn msg')).toBeInTheDocument();
    expect(screen.queryByText('debug msg')).not.toBeInTheDocument();
  });

  it('filters entries by moduleName search', async () => {
    const user = userEvent.setup();
    render(<ExecutionLogViewer logs={makeEntries()} />);
    await user.type(screen.getByPlaceholderText(/search messages/i), 'loader');
    expect(screen.getByText('debug msg')).toBeInTheDocument();
    expect(screen.queryByText('info msg')).not.toBeInTheDocument();
  });

  it('shows error and warn count in toolbar', () => {
    render(<ExecutionLogViewer logs={makeEntries()} />);
    expect(screen.getByText(/1 error/)).toBeInTheDocument();
    expect(screen.getByText(/1 warn/)).toBeInTheDocument();
  });

  it('auto-scrolls to first error entry on load', () => {
    render(<ExecutionLogViewer logs={makeEntries()} />);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it('does not auto-scroll when no errors present', () => {
    render(
      <ExecutionLogViewer
        logs={[makeEntry({ level: 'info' }), makeEntry({ id: 2, level: 'debug' })]}
      />,
    );
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it('renders moduleName as button when onStepClick provided', () => {
    render(<ExecutionLogViewer logs={[makeEntry({ moduleName: 'my-module' })]} onStepClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'my-module' })).toBeInTheDocument();
  });

  it('calls onStepClick when moduleName button is clicked', async () => {
    const user = userEvent.setup();
    const onStepClick = vi.fn();
    render(
      <ExecutionLogViewer
        logs={[makeEntry({ moduleName: 'target-step' })]}
        onStepClick={onStepClick}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'target-step' }));
    expect(onStepClick).toHaveBeenCalledWith('target-step');
  });

  it('renders without onStepClick (optional) without throwing', () => {
    expect(() =>
      render(<ExecutionLogViewer logs={makeEntries()} />),
    ).not.toThrow();
  });

  it('respects external filter.level prop', () => {
    render(
      <ExecutionLogViewer
        logs={makeEntries()}
        filter={{ level: 'warn' }}
      />,
    );
    expect(screen.getByText('warn msg')).toBeInTheDocument();
    expect(screen.queryByText('info msg')).not.toBeInTheDocument();
  });

  it('respects external filter.search prop', () => {
    render(
      <ExecutionLogViewer
        logs={makeEntries()}
        filter={{ search: 'error' }}
      />,
    );
    expect(screen.getByText('error msg')).toBeInTheDocument();
    expect(screen.queryByText('debug msg')).not.toBeInTheDocument();
  });

  it('renders entry count in toolbar', () => {
    render(<ExecutionLogViewer logs={makeEntries()} />);
    expect(screen.getByText('4 entries')).toBeInTheDocument();
  });
});
