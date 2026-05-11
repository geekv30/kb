// Phase 7.5.8 — Branded confirm dialog used in place of `window.confirm`.
//
// Spec (PRD §12.5 / TRD §8.2):
//   - Centered modal with dark backdrop + focus trap (Radix Dialog).
//   - Title (optional), message, confirm + cancel buttons.
//   - `confirmVariant`: 'destructive' (red) | 'primary' (default black).
//   - Cancel always uses the kb-ui subtle button.
//   - Esc dismisses (Radix Dialog default — we honor it via onOpenChange).
//   - Returns focus to the trigger element on close (Radix default).
//
// Used by `useUnsavedChangesGuard` to replace the page-blocking
// `window.confirm` calls in EditorPage and the AI Gaps breadcrumb.

import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@test-kb-ui/kb-ui';
import { cn } from '../lib/cn';

export type ConfirmDialogProps = {
  /** Controls visibility. Parent owns the open/close lifecycle. */
  open: boolean;
  /** Optional title. When omitted only the message renders. */
  title?: string;
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
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-[90] bg-[#0f172a]/40',
            'animate-route-fade-in',
          )}
        />
        <Dialog.Content
          // Center horizontally and vertically. Tailwind's `inset-0` +
          // `m-auto` collapses to centered for fixed elements with width.
          className={cn(
            'fixed left-1/2 top-1/2 z-[91] -translate-x-1/2 -translate-y-1/2',
            'w-[420px] max-w-[calc(100vw-32px)]',
            'rounded-[8px] border border-[#e2e8f0] bg-white',
            'shadow-[0_24px_48px_rgba(15,23,42,0.20)]',
            'p-6 flex flex-col gap-4',
            'animate-toast-in',
            // Honor user's focus rings (we never set outline:none).
            'focus:outline-none',
          )}
        >
          {title ? (
            <Dialog.Title className="text-[16px] font-semibold leading-6 text-[#0f172a]">
              {title}
            </Dialog.Title>
          ) : (
            // Radix requires a Title for a11y. Render a visually-hidden one
            // so the dialog still announces correctly when no title prop
            // is supplied.
            <Dialog.Title className="sr-only">{message}</Dialog.Title>
          )}

          <Dialog.Description className="text-[14px] leading-5 text-[#475569]">
            {message}
          </Dialog.Description>

          <div className="mt-2 flex justify-end gap-2">
            <Button variant="subtle" onClick={onCancel}>
              {cancelLabel}
            </Button>
            {confirmVariant === 'destructive' ? (
              // Phase 15a — adopted Button's `variant="danger"` (introduced
              // alongside `outline` / `danger-outline` with uniform 32 px
              // height). Replaces an inline `<button>` styled with raw red
              // hex values so destructive confirmations match the kb-ui
              // canonical danger color (#f03f33) instead of red-600.
              <Button variant="danger" onClick={onConfirm}>
                {confirmLabel}
              </Button>
            ) : (
              <Button variant="primary" onClick={onConfirm}>
                {confirmLabel}
              </Button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
