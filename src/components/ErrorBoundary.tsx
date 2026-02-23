import { Component, type ReactNode, type ErrorInfo, type CSSProperties } from 'react';
import { colors } from '../theme';

export interface ErrorBoundaryProps {
  /** Content to render when there is no error. */
  children: ReactNode;
  /** Custom fallback UI. Receives the caught error. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** Called when an error is caught. */
  onError?: (error: Error, info: ErrorInfo) => void;
  /** Override error card style. */
  style?: CSSProperties;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** Default error display shown when no fallback prop is provided. */
function DefaultErrorFallback({
  error,
  onReset,
  style,
}: {
  error: Error;
  onReset: () => void;
  style?: CSSProperties;
}) {
  const cardStyle: CSSProperties = {
    backgroundColor: `${colors.red}11`,
    border: `1px solid ${colors.red}55`,
    borderRadius: '8px',
    padding: '20px 24px',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    maxWidth: '600px',
    ...style,
  };

  return (
    <div role="alert" style={cardStyle}>
      <p
        style={{
          margin: '0 0 6px',
          fontWeight: '600',
          fontSize: '15px',
          color: colors.red,
        }}
      >
        Something went wrong
      </p>
      <p
        style={{
          margin: '0 0 16px',
          fontSize: '13px',
          color: colors.subtext0,
          fontFamily: 'monospace',
          wordBreak: 'break-word',
        }}
      >
        {error.message}
      </p>
      <button
        onClick={onReset}
        style={{
          backgroundColor: colors.surface1,
          color: colors.text,
          border: 'none',
          borderRadius: '6px',
          padding: '6px 14px',
          fontSize: '13px',
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  );
}

/**
 * React error boundary that catches render errors in the component tree.
 * Must be a class component — hooks cannot catch render errors.
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (error) {
      if (this.props.fallback) {
        return this.props.fallback(error, this.reset);
      }
      return (
        <DefaultErrorFallback
          error={error}
          onReset={this.reset}
          style={this.props.style}
        />
      );
    }
    return this.props.children;
  }
}
