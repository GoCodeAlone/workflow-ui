import { colors } from './colors';

/** Base component styles using the Catppuccin Mocha palette. */
export const baseStyles = {
  container: {
    backgroundColor: colors.base,
    color: colors.text,
    minHeight: '100vh',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  card: {
    backgroundColor: colors.surface0,
    borderRadius: '8px',
    padding: '16px',
    border: `1px solid ${colors.surface1}`,
  },
  input: {
    backgroundColor: colors.mantle,
    color: colors.text,
    border: `1px solid ${colors.surface1}`,
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  button: {
    primary: {
      backgroundColor: colors.blue,
      color: colors.base,
      border: 'none',
      borderRadius: '6px',
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
    },
    secondary: {
      backgroundColor: colors.surface1,
      color: colors.text,
      border: 'none',
      borderRadius: '6px',
      padding: '8px 16px',
      fontSize: '14px',
      cursor: 'pointer',
    },
    danger: {
      backgroundColor: colors.red,
      color: colors.base,
      border: 'none',
      borderRadius: '6px',
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
    },
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '14px',
  },
  th: {
    padding: '10px 12px',
    textAlign: 'left' as const,
    color: colors.subtext0,
    fontWeight: '500',
    borderBottom: `1px solid ${colors.surface1}`,
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  td: {
    padding: '10px 12px',
    borderBottom: `1px solid ${colors.surface0}`,
    color: colors.text,
  },
};
