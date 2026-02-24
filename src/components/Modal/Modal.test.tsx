import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './Modal';

// jsdom doesn't implement HTMLDialogElement.showModal/close natively
beforeEach(() => {
  HTMLDialogElement.prototype.showModal =
    HTMLDialogElement.prototype.showModal ||
    function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
  HTMLDialogElement.prototype.close =
    HTMLDialogElement.prototype.close ||
    function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    };
});

describe('Modal', () => {
  it('renders title and content when open', () => {
    render(
      <Modal open onClose={vi.fn()} title="Confirm Action">
        Are you sure?
      </Modal>,
    );
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('uses semantic dialog element', () => {
    render(
      <Modal open onClose={vi.fn()} title="Test">
        Content
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has aria-labelledby linking to title', () => {
    render(
      <Modal open onClose={vi.fn()} title="My Dialog">
        Content
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    const labelledById = dialog.getAttribute('aria-labelledby');
    expect(labelledById).toBeTruthy();
    const titleEl = screen.getByText('My Dialog');
    expect(titleEl).toHaveAttribute('id', labelledById);
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal open onClose={onClose} title="Test">
        Content
      </Modal>,
    );
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders confirm button when onConfirm is provided', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal open onClose={vi.fn()} onConfirm={onConfirm} title="Confirm">
        Proceed?
      </Modal>,
    );
    await user.click(screen.getByRole('button', { name: 'OK' }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('shows Cancel label for confirmation variant', () => {
    render(
      <Modal
        open
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        variant="confirmation"
        title="Confirm"
      >
        Sure?
      </Modal>,
    );
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('supports custom button labels', () => {
    render(
      <Modal
        open
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete"
        variant="error"
        confirmLabel="Delete"
        cancelLabel="Keep"
      >
        Delete this?
      </Modal>,
    );
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
  });

  it('calls onClose on backdrop click', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal open onClose={onClose} title="Test">
        Content
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    await user.click(dialog);
    expect(onClose).toHaveBeenCalled();
  });
});
