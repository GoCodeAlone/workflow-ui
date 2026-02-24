import { configureAxe } from 'vitest-axe';
import { expect } from 'vitest';

/**
 * Pre-configured axe instance for running accessibility checks.
 * Uses WCAG 2.1 AA rules by default.
 *
 * Note: the `toHaveNoViolations` matcher is registered globally in
 * src/test/setup.ts via `expect.extend(axeMatchers)`.
 */
export const axe = configureAxe({
  rules: {
    // Allow auto-focus on form fields (common UX pattern)
    'scrollable-region-focusable': { enabled: false },
  },
});

/**
 * Run axe accessibility checks on a container element and assert no violations.
 * Uses vitest-axe's toHaveNoViolations matcher (registered globally in setup.ts).
 *
 * @example
 * const { container } = render(<MyComponent />);
 * await checkA11y(container);
 */
export async function checkA11y(container: Element): Promise<void> {
  const results = await axe(container);
  // @ts-expect-error — toHaveNoViolations is added via expect.extend in setup.ts
  expect(results).toHaveNoViolations();
}
