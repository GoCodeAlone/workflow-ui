import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar, { type SidebarItem } from './Sidebar';

const makeItems = (): SidebarItem[] => [
  { id: 'home', label: 'Home', path: '/', active: true },
  { id: 'settings', label: 'Settings', path: '/settings' },
  { id: 'disabled', label: 'Disabled', path: '/disabled', disabled: true },
];

describe('Sidebar', () => {
  it('renders all nav items', () => {
    render(<Sidebar items={makeItems()} onNavigate={vi.fn()} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  it('renders nav landmark with accessible label', () => {
    render(<Sidebar items={makeItems()} onNavigate={vi.fn()} />);
    expect(screen.getByRole('navigation', { name: 'Sidebar navigation' })).toBeInTheDocument();
  });

  it('marks active item with aria-current="page"', () => {
    render(<Sidebar items={makeItems()} onNavigate={vi.fn()} />);
    const homeItem = screen.getByRole('button', { name: 'Home' });
    expect(homeItem).toHaveAttribute('aria-current', 'page');
  });

  it('calls onNavigate when a non-disabled item is clicked', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<Sidebar items={makeItems()} onNavigate={onNavigate} />);
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate.mock.calls[0][0].id).toBe('settings');
  });

  it('does not call onNavigate when a disabled item is clicked', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<Sidebar items={makeItems()} onNavigate={onNavigate} />);
    const disabledItem = screen.getByRole('button', { name: 'Disabled' });
    await user.click(disabledItem);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('activates item via Enter key', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<Sidebar items={makeItems()} onNavigate={onNavigate} />);
    const settingsItem = screen.getByRole('button', { name: 'Settings' });
    settingsItem.focus();
    await user.keyboard('{Enter}');
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it('activates item via Space key', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<Sidebar items={makeItems()} onNavigate={onNavigate} />);
    const settingsItem = screen.getByRole('button', { name: 'Settings' });
    settingsItem.focus();
    await user.keyboard(' ');
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it('renders toggle button when onToggleCollapse is provided', () => {
    render(
      <Sidebar items={makeItems()} onNavigate={vi.fn()} onToggleCollapse={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toBeInTheDocument();
  });

  it('calls onToggleCollapse when toggle button is clicked', async () => {
    const user = userEvent.setup();
    const onToggleCollapse = vi.fn();
    render(
      <Sidebar items={makeItems()} onNavigate={vi.fn()} onToggleCollapse={onToggleCollapse} />,
    );
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(onToggleCollapse).toHaveBeenCalledTimes(1);
  });

  it('shows "Expand sidebar" label when collapsed', () => {
    render(
      <Sidebar
        items={makeItems()}
        onNavigate={vi.fn()}
        collapsed={true}
        onToggleCollapse={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument();
  });

  it('hides item labels in collapsed mode', () => {
    const { container } = render(
      <Sidebar items={makeItems()} onNavigate={vi.fn()} collapsed={true} />,
    );
    // Labels are not rendered as visible text nodes when collapsed
    const nav = container.querySelector('nav') as HTMLElement;
    expect(nav).toBeInTheDocument();
    // The item labels should not appear as visible spans in collapsed mode
    const visibleLabels = Array.from(nav.querySelectorAll('span')).filter(
      (el) => el.textContent === 'Home',
    );
    expect(visibleLabels.length).toBe(0);
  });

  it('renders header content when not collapsed', () => {
    render(
      <Sidebar
        items={makeItems()}
        onNavigate={vi.fn()}
        header={<span>My App</span>}
      />,
    );
    expect(screen.getByText('My App')).toBeInTheDocument();
  });

  it('renders footer content', () => {
    render(
      <Sidebar
        items={makeItems()}
        onNavigate={vi.fn()}
        footer={<span>v1.0.0</span>}
      />,
    );
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });

  it('renders icon inside nav item', () => {
    const itemsWithIcon: SidebarItem[] = [
      { id: 'home', label: 'Home', icon: <span data-testid="home-icon">🏠</span> },
    ];
    render(<Sidebar items={itemsWithIcon} onNavigate={vi.fn()} />);
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });
});
