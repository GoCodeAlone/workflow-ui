import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';

describe('LoginPage', () => {
  it('renders with title and subtitle', () => {
    render(
      <LoginPage
        title="TestApp"
        subtitle="Test subtitle"
        onLogin={vi.fn()}
      />,
    );
    expect(screen.getByText('TestApp')).toBeInTheDocument();
    expect(screen.getByText('Test subtitle')).toBeInTheDocument();
  });

  it('renders custom username label', () => {
    render(
      <LoginPage
        title="App"
        usernameLabel="Email"
        onLogin={vi.fn()}
      />,
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('displays error message with alert role', () => {
    render(
      <LoginPage
        title="App"
        error="Invalid credentials"
        onLogin={vi.fn()}
      />,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Invalid credentials');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });

  it('calls onLogin with username and password', async () => {
    const onLogin = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<LoginPage title="App" onLogin={onLogin} />);

    await user.type(screen.getByLabelText('Username'), 'testuser');
    await user.type(screen.getByLabelText('Password'), 'testpass');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(onLogin).toHaveBeenCalledWith('testuser', 'testpass');
  });

  it('shows loading state during submit', async () => {
    let resolveLogin: () => void;
    const loginPromise = new Promise<void>((resolve) => {
      resolveLogin = resolve;
    });
    const onLogin = vi.fn().mockReturnValue(loginPromise);
    const user = userEvent.setup();

    render(<LoginPage title="App" onLogin={onLogin} />);

    await user.type(screen.getByLabelText('Username'), 'u');
    await user.type(screen.getByLabelText('Password'), 'p');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    resolveLogin!();
  });

  it('uses semantic main element', () => {
    render(<LoginPage title="App" onLogin={vi.fn()} />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('has accessible form with aria-label', () => {
    render(<LoginPage title="App" onLogin={vi.fn()} />);
    expect(screen.getByRole('form', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('labels are associated with inputs via htmlFor', () => {
    render(<LoginPage title="App" onLogin={vi.fn()} />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('inputs have aria-required', () => {
    render(<LoginPage title="App" onLogin={vi.fn()} />);
    expect(screen.getByLabelText('Username')).toHaveAttribute('aria-required', 'true');
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-required', 'true');
  });
});
