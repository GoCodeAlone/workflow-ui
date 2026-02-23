import { Component, type ReactNode, type ErrorInfo } from 'react';
import { colors, baseStyles } from '../../theme';

export interface ErrorBoundaryProps {
  /** Content to render. */
  children: ReactNode;
  /** Custom fallback UI. If not provided, a default error message is shown. */
  fallback?: ReactNode | ((error: Error) => ReactNode);
  /** Called when an error is caught. */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (error) {
      if (fallback) {
        return typeof fallback === 'function' ? fallback(error) : fallback;
      }

      return (
        <div
          role="alert"
          style={{
            ...baseStyles.card,
            borderColor: colors.red,
            textAlign: 'center',
            padding: '32px',
          }}
        >
          <h2
            style={{
              color: colors.red,
              fontSize: '18px',
              fontWeight: 600,
              margin: '0 0 8px',
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              color: colors.subtext0,
              fontSize: '14px',
              margin: '0 0 16px',
            }}
          >
            {error.message}
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            style={baseStyles.button.primary}
            aria-label="Retry"
          >
            Try Again
          </button>
        </div>
      );
    }

    return children;
  }
}
