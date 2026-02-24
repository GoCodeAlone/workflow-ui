import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './Modal';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Test">
        <p>Content</p>
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog when open', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Hello">
        <p>Modal body</p>
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Modal body')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Close me">
        <p>content</p>
      </Modal>,
    );
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(
      <Modal open={true} onClose={onClose} title="Backdrop">
        <p>content</p>
      </Modal>,
    );
    // Click the overlay (parent of dialog)
    const overlay = container.ownerDocument.querySelector('[role="presentation"]');
    if (overlay) {
      await user.click(overlay);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it('calls onClose on Escape key', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Escape">
        <p>content</p>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    dialog.focus();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('renders action buttons', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <Modal
        open={true}
        onClose={vi.fn()}
        title="Confirm"
        actions={[
          { label: 'Cancel', onClick: onCancel, variant: 'secondary' },
          { label: 'Confirm', onClick: onConfirm, variant: 'primary' },
        ]}
      >
        <p>Are you sure?</p>
      </Modal>,
    );
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('renders without title', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <p>No title content</p>
      </Modal>,
    );
    expect(screen.getByText('No title content')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('disabled action button cannot be clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Modal
        open={true}
        onClose={vi.fn()}
        title="Disabled"
        actions={[{ label: 'Blocked', onClick, disabled: true }]}
      >
        <p>content</p>
      </Modal>,
    );
    const btn = screen.getByRole('button', { name: 'Blocked' });
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });
});
