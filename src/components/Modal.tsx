import {
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type ReactNode,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { colors, baseStyles } from '../theme';

export interface ModalAction {
  /** Stable unique identifier for this action button (used as React key). */
  id?: string;
  /** Button label. */
  label: string;
  /** Click handler. */
  onClick: () => void;
  /** Button variant. Default: 'secondary' */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Disable the button. */
  disabled?: boolean;
}

export interface ModalProps {
  /** Whether the modal is visible. */
  open: boolean;
  /** Called when the modal should close (backdrop click or Escape key). */
  onClose: () => void;
  /** Modal title. */
  title?: string;
  /** Modal body content. */
  children?: ReactNode;
  /** Action buttons rendered in the footer. */
  actions?: ModalAction[];
  /** Modal width. Default: '480px' */
  width?: string;
  /** Override modal container style. */
  style?: CSSProperties;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  actions,
  width = '480px',
  style,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Focus trap: focus the dialog on open.
  useEffect(() => {
    if (open) {
      dialogRef.current?.focus();
    }
  }, [open]);

  // Prevent body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      onClose();
    }
  }

  if (!open) return null;

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  };

  const dialogStyle: CSSProperties = {
    backgroundColor: colors.surface0,
    borderRadius: '12px',
    border: `1px solid ${colors.surface1}`,
    width,
    maxWidth: '90vw',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    outline: 'none',
    ...style,
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px 16px',
    borderBottom: title ? `1px solid ${colors.surface1}` : undefined,
    flexShrink: 0,
  };

  const bodyStyle: CSSProperties = {
    padding: '20px 24px',
    overflowY: 'auto',
    flex: 1,
    color: colors.text,
    fontSize: '14px',
    lineHeight: '1.6',
  };

  const footerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
    padding: '16px 24px 20px',
    borderTop: `1px solid ${colors.surface1}`,
    flexShrink: 0,
  };

  const modal = (
    // Backdrop
    <div
      style={overlayStyle}
      onClick={onClose}
      role="presentation"
    >
      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        style={dialogStyle}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {(title != null) && (
          <div style={headerStyle}>
            <h2
              id={titleId}
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: colors.text,
              }}
            >
              {title}
            </h2>
            <button
              aria-label="Close"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: colors.overlay1,
                fontSize: '20px',
                lineHeight: 1,
                padding: '0 4px',
              }}
            >
              ×
            </button>
          </div>
        )}

        {children != null && (
          <div style={bodyStyle}>{children}</div>
        )}

        {actions && actions.length > 0 && (
          <div style={footerStyle}>
            {actions.map((action, idx) => (
              <button
                key={action.id ?? idx}
                onClick={action.onClick}
                disabled={action.disabled}
                style={{
                  ...baseStyles.button[action.variant ?? 'secondary'],
                  opacity: action.disabled ? 0.5 : 1,
                  cursor: action.disabled ? 'not-allowed' : 'pointer',
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(modal, document.body);
}
