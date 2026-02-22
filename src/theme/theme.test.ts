import { describe, it, expect } from 'vitest';
import { colors, statusColors } from './colors';
import { baseStyles } from './baseStyles';

describe('Theme', () => {
  describe('colors', () => {
    it('has all Catppuccin Mocha palette colors', () => {
      expect(colors.base).toBe('#1e1e2e');
      expect(colors.text).toBe('#cdd6f4');
      expect(colors.blue).toBe('#89b4fa');
      expect(colors.red).toBe('#f38ba8');
      expect(colors.green).toBe('#a6e3a1');
    });
  });

  describe('statusColors', () => {
    it('maps common statuses to colors', () => {
      expect(statusColors.active).toBe(colors.green);
      expect(statusColors.error).toBe(colors.red);
      expect(statusColors.pending).toBe(colors.yellow);
      expect(statusColors.completed).toBe(colors.teal);
    });
  });

  describe('baseStyles', () => {
    it('defines container styles', () => {
      expect(baseStyles.container.backgroundColor).toBe(colors.base);
      expect(baseStyles.container.color).toBe(colors.text);
    });

    it('defines button variants', () => {
      expect(baseStyles.button.primary.backgroundColor).toBe(colors.blue);
      expect(baseStyles.button.danger.backgroundColor).toBe(colors.red);
      expect(baseStyles.button.secondary.backgroundColor).toBe(colors.surface1);
    });

    it('defines input styles', () => {
      expect(baseStyles.input.backgroundColor).toBe(colors.mantle);
      expect(baseStyles.input.boxSizing).toBe('border-box');
    });
  });
});
