import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';
import { checkA11y } from '../test/a11y';

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
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    resolveLogin!();
  });

  // Accessibility tests

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <LoginPage
        title="TestApp"
        subtitle="Sign in to continue"
        onLogin={vi.fn()}
      />,
    );
    await checkA11y(container);
  });

  it('should have no accessibility violations when error is shown', async () => {
    const { container } = render(
      <LoginPage
        title="TestApp"
        error="Invalid credentials"
        onLogin={vi.fn()}
      />,
    );
    await checkA11y(container);
  });

  // Semantic HTML structure

  it('wraps the page in a <main> landmark', () => {
    render(<LoginPage title="App" onLogin={vi.fn()} />);
    expect(screen.getByRole('main')).toBeInTheDocument();
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

  it('renders a <form> element for the login form', () => {
    render(<LoginPage title="App" onLogin={vi.fn()} />);
    expect(screen.getByRole('form', { name: 'Login form' })).toBeInTheDocument();
  });

  it('has a heading with the app title', () => {
    render(<LoginPage title="MyApp" onLogin={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'MyApp', level: 1 })).toBeInTheDocument();
  });

  // ARIA attributes

  it('labels username input with a <label> element via htmlFor', () => {
    render(<LoginPage title="App" usernameLabel="Email address" onLogin={vi.fn()} />);
    const input = screen.getByLabelText('Email address');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });

  it('labels password input with a <label> element via htmlFor', () => {
    render(<LoginPage title="App" onLogin={vi.fn()} />);
    const input = screen.getByLabelText('Password');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'password');
  });

  it('marks username input as required via aria-required', () => {
    render(<LoginPage title="App" onLogin={vi.fn()} />);
    const input = screen.getByLabelText('Username');
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  it('marks password input as required via aria-required', () => {
    render(<LoginPage title="App" onLogin={vi.fn()} />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  it('sets aria-busy on the form while loading', async () => {
    let resolveLogin: () => void;
    const loginPromise = new Promise<void>((resolve) => {
      resolveLogin = resolve;
    });
    const onLogin = vi.fn().mockReturnValue(loginPromise);
    const user = userEvent.setup();

    render(<LoginPage title="App" onLogin={onLogin} />);

    const form = screen.getByRole('form', { name: 'Login form' });
    expect(form).toHaveAttribute('aria-busy', 'false');

    await user.type(screen.getByLabelText('Username'), 'u');
    await user.type(screen.getByLabelText('Password'), 'p');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(form).toHaveAttribute('aria-busy', 'true');
    resolveLogin!();
  });

  it('sets aria-disabled on button when loading', async () => {
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

    const button = screen.getByRole('button', { name: 'Signing in...' });
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toBeDisabled();
    resolveLogin!();
  });

  // Error message announcement

  it('renders error message container with aria-live="polite"', () => {
    render(<LoginPage title="App" error="Bad credentials" onLogin={vi.fn()} />);
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
  });

  it('error message has role="alert"', () => {
    render(<LoginPage title="App" error="Bad credentials" onLogin={vi.fn()} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Bad credentials');
  });

  it('inputs reference error element via aria-describedby when error is shown', () => {
    render(<LoginPage title="App" error="Oops" onLogin={vi.fn()} />);
    const usernameInput = screen.getByLabelText('Username');
    const errorEl = screen.getByRole('alert');
    expect(usernameInput).toHaveAttribute('aria-describedby', errorEl.id);
  });

  it('inputs do not have aria-describedby when there is no error', () => {
    render(<LoginPage title="App" onLogin={vi.fn()} />);
    const usernameInput = screen.getByLabelText('Username');
    expect(usernameInput).not.toHaveAttribute('aria-describedby');
  });

  // Keyboard navigation

  it('can tab from username to password to submit button', async () => {
    const user = userEvent.setup();
    render(<LoginPage title="App" onLogin={vi.fn()} />);

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    expect(usernameInput).toHaveFocus();

    await user.tab();
    expect(passwordInput).toHaveFocus();

    await user.tab();
    expect(submitButton).toHaveFocus();
  });

  it('submits the form when pressing Enter on the submit button', async () => {
    const onLogin = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<LoginPage title="App" onLogin={onLogin} />);

    await user.type(screen.getByLabelText('Username'), 'testuser');
    await user.type(screen.getByLabelText('Password'), 'testpass');

    await user.tab();
    await user.keyboard('{Enter}');

    expect(onLogin).toHaveBeenCalledWith('testuser', 'testpass');
  });

  it('submit button has type="submit"', () => {
    render(<LoginPage title="App" onLogin={vi.fn()} />);
    const button = screen.getByRole('button', { name: 'Sign In' });
    expect(button).toHaveAttribute('type', 'submit');
  });
});
