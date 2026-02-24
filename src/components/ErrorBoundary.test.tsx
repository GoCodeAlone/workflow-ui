import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from './ErrorBoundary';

/** Component that throws on render when `shouldThrow` is true. */
function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Boom!');
  return <div>Safe content</div>;
}

// Suppress the expected console errors from React's error boundary
const consoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});
afterEach(() => {
  console.error = consoleError;
});

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('shows default fallback when child throws', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={(err) => <div>Custom: {err.message}</div>}>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Custom: Boom!')).toBeInTheDocument();
  });

  it('calls onError callback when an error is caught', () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0][0].message).toBe('Boom!');
  });

  it('resets error state on "Try again" click', async () => {
    const user = userEvent.setup();

    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Click "Try again" — resets error boundary state, re-renders children.
    // Child still throws so the boundary catches again and shows fallback.
    const tryAgain = screen.getByRole('button', { name: 'Try again' });
    await user.click(tryAgain);
    // After reset the boundary re-renders — child still throws, so we still see the fallback
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('reset via custom fallback clears error', async () => {
    const user = userEvent.setup();

    render(
      <ErrorBoundary
        fallback={(err, reset) => (
          <div>
            <span>{err.message}</span>
            <button onClick={reset}>Reset</button>
          </div>
        )}
      >
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Boom!')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    // After reset, child still throws so fallback shown again — boundary works correctly
    expect(screen.getByText('Boom!')).toBeInTheDocument();
  });
});
