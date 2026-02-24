import { useEffect, useRef, useCallback, useId, type CSSProperties, type ReactNode, type MouseEvent } from 'react';
import { colors, baseStyles } from '../../theme';

export type ModalVariant = 'info' | 'confirmation' | 'error';

export interface ModalProps {
  /** Whether the modal is open. */
  open: boolean;
  /** Called when the modal should close. */
  onClose: () => void;
  /** Modal title. */
  title: string;
  /** Modal content. */
  children: ReactNode;
  /** Variant determines styling. Default: 'info' */
  variant?: ModalVariant;
  /** Text for the confirm/primary button. Default: 'OK' */
  confirmLabel?: string;
  /** Called when confirm button is clicked. If omitted, only a close button is shown. */
  onConfirm?: () => void;
  /** Text for the cancel/close button. Default: 'Cancel' for confirmation, 'Close' otherwise */
  cancelLabel?: string;
  /** Override container style. */
  style?: CSSProperties;
}

const variantColors: Record<ModalVariant, string> = {
  info: colors.blue,
  confirmation: colors.yellow,
  error: colors.red,
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  variant = 'info',
  confirmLabel = 'OK',
  onConfirm,
  cancelLabel,
  style,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
      previousFocusRef.current?.focus();
    }
  }, [open]);

  // Handle native dialog cancel event (ESC key)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handler = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener('cancel', handler);
    return () => dialog.removeEventListener('cancel', handler);
  }, [onClose]);

  const handleBackdropClick = useCallback(
    (e: MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  const defaultCancelLabel =
    cancelLabel ?? (variant === 'confirmation' ? 'Cancel' : 'Close');
  const accentColor = variantColors[variant];

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      aria-labelledby={titleId}
      style={{
        backgroundColor: colors.surface0,
        color: colors.text,
        border: `1px solid ${colors.surface1}`,
        borderRadius: '12px',
        padding: 0,
        maxWidth: '480px',
        width: '100%',
        ...style,
      }}
    >
      <div style={{ padding: '24px' }}>
        <header
          style={{
            marginBottom: '16px',
            borderBottom: `2px solid ${accentColor}`,
            paddingBottom: '12px',
          }}
        >
          <h2
            id={titleId}
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
              color: accentColor,
            }}
          >
            {title}
          </h2>
        </header>

        <div style={{ marginBottom: '24px', lineHeight: 1.5 }}>{children}</div>

        <footer
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={baseStyles.button.secondary}
          >
            {defaultCancelLabel}
          </button>
          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              style={
                variant === 'error'
                  ? baseStyles.button.danger
                  : baseStyles.button.primary
              }
            >
              {confirmLabel}
            </button>
          )}
        </footer>
      </div>
    </dialog>
  );
}
