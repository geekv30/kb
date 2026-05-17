// Branded confirm dialog used in place of `window.confirm`. Chrome (overlay,
// header background, shadow, focus trap, animation, a11y) is provided by the
// `Modal` primitive — this wrapper only owns the action layout (subtle cancel
// + primary/danger confirm) and the optional title icon slot.

import * as React from 'react';
import { Modal } from './Modal';
import { Button } from '../primitives/Button';

export type ConfirmDialogProps = {
  /** Controls visibility. Parent owns the open/close lifecycle. */
  open: boolean;
  /** Optional title. When omitted only the message renders. */
  title?: string;
  /** Optional 16×16 icon shown to the left of the title in the modal header. */
  titleIcon?: React.ReactNode;
  /** Body copy — short sentence(s). */
  message: string;
  /** Confirm button label. Defaults to 'Confirm'. */
  confirmLabel?: string;
  /** Cancel button label. Defaults to 'Cancel'. */
  cancelLabel?: string;
  /**
   * Visual treatment for the confirm action.
   *  - `'primary'`     → black kb-ui primary button (default)
   *  - `'destructive'` → red button for irreversible actions
   */
  confirmVariant?: 'primary' | 'destructive';
  /** Fired when the user confirms. Parent should close the dialog. */
  onConfirm: () => void;
  /**
   * Fired when the user cancels (cancel button, backdrop click, Esc key).
   * Parent should close the dialog.
   */
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  titleIcon,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
      title={title}
      titleIcon={titleIcon}
      footer={
        <>
          <Button variant="subtle" onClick={onCancel}>
            {cancelLabel}
          </Button>
          {confirmVariant === 'destructive' ? (
            <Button variant="danger" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          ) : (
            <Button variant="primary" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          )}
        </>
      }
    >
      <p className="text-[14px] leading-5 text-text-meta">{message}</p>
    </Modal>
  );
}
