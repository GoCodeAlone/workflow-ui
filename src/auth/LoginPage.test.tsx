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

  it('displays error message', () => {
    render(
      <LoginPage
        title="App"
        error="Invalid credentials"
        onLogin={vi.fn()}
      />,
    );
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('calls onLogin with username and password', async () => {
    const onLogin = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<LoginPage title="App" onLogin={onLogin} />);

    await user.type(screen.getByPlaceholderText('admin'), 'testuser');
    await user.type(screen.getByPlaceholderText('••••••••'), 'testpass');
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

    await user.type(screen.getByPlaceholderText('admin'), 'u');
    await user.type(screen.getByPlaceholderText('••••••••'), 'p');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    resolveLogin!();
  });
});
