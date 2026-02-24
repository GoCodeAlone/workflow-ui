import type { CSSProperties, ReactNode, KeyboardEvent } from 'react';
import { colors } from '../theme';

export interface SidebarItem {
  /** Unique identifier for the item. */
  id: string;
  /** Display label. */
  label: string;
  /** Optional icon element. */
  icon?: ReactNode;
  /** Path or href (informational — used by onNavigate). */
  path?: string;
  /** Whether this item is currently active. */
  active?: boolean;
  /** Disable this item. */
  disabled?: boolean;
}

export interface SidebarProps {
  /** Navigation items to display. */
  items: SidebarItem[];
  /** Called when user clicks a non-disabled item. */
  onNavigate: (item: SidebarItem) => void;
  /** Whether the sidebar is in collapsed (icon-only) mode. */
  collapsed?: boolean;
  /** Called when the toggle button is clicked. */
  onToggleCollapse?: () => void;
  /** Sidebar title / logo area content. */
  header?: ReactNode;
  /** Footer area content. */
  footer?: ReactNode;
  /** Override sidebar root style. */
  style?: CSSProperties;
}

const SIDEBAR_FULL_WIDTH = 220;
const SIDEBAR_COLLAPSED_WIDTH = 56;

export default function Sidebar({
  items,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  header,
  footer,
  style,
}: SidebarProps) {
  const width = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_FULL_WIDTH;

  const sidebarStyle: CSSProperties = {
    width,
    minWidth: width,
    maxWidth: width,
    backgroundColor: colors.mantle,
    borderRight: `1px solid ${colors.surface0}`,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    transition: 'width 0.2s ease, min-width 0.2s ease, max-width 0.2s ease',
    overflow: 'hidden',
    ...style,
  };

  const headerAreaStyle: CSSProperties = {
    padding: collapsed ? '16px 0' : '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed ? 'center' : 'space-between',
    borderBottom: `1px solid ${colors.surface0}`,
    minHeight: 56,
    flexShrink: 0,
  };

  const navStyle: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '8px 0',
  };

  const footerAreaStyle: CSSProperties = {
    padding: collapsed ? '12px 0' : '12px 8px',
    borderTop: `1px solid ${colors.surface0}`,
    flexShrink: 0,
  };

  return (
    <nav style={sidebarStyle} aria-label="Sidebar navigation">
      {/* Header */}
      <div style={headerAreaStyle}>
        {!collapsed && header && (
          <div
            style={{
              color: colors.text,
              fontSize: '15px',
              fontWeight: '600',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}
          >
            {header}
          </div>
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand' : 'Collapse'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: colors.overlay1,
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              borderRadius: '4px',
              flexShrink: 0,
            }}
          >
            {collapsed ? '›' : '‹'}
          </button>
        )}
      </div>

      {/* Nav items */}
      <div style={navStyle}>
        {items.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      {/* Footer */}
      {footer && <div style={footerAreaStyle}>{footer}</div>}
    </nav>
  );
}

interface SidebarNavItemProps {
  item: SidebarItem;
  collapsed: boolean;
  onNavigate: (item: SidebarItem) => void;
}

function SidebarNavItem({ item, collapsed, onNavigate }: SidebarNavItemProps) {
  const isActive = item.active ?? false;
  const isDisabled = item.disabled ?? false;

  const baseItemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: collapsed ? '10px 0' : '9px 12px',
    margin: '1px 6px',
    borderRadius: '6px',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    color: isDisabled
      ? colors.overlay0
      : isActive
        ? colors.blue
        : colors.subtext1,
    backgroundColor: isActive ? `${colors.blue}18` : 'transparent',
    fontSize: '14px',
    fontWeight: isActive ? '500' : '400',
    textDecoration: 'none',
    transition: 'background-color 0.15s, color 0.15s',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    justifyContent: collapsed ? 'center' : 'flex-start',
    opacity: isDisabled ? 0.5 : 1,
    userSelect: 'none',
  };

  function handleClick() {
    if (!isDisabled) onNavigate(item);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }

  return (
    <div
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-current={isActive ? 'page' : undefined}
      aria-disabled={isDisabled}
      aria-label={collapsed ? item.label : undefined}
      title={collapsed ? item.label : undefined}
      style={baseItemStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {item.icon && (
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: '16px',
          }}
        >
          {item.icon}
        </span>
      )}
      {!collapsed && (
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.label}
        </span>
      )}
    </div>
  );
}
