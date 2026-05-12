import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * Types
 *
 * Canonical confirm-style modal primitive — matches Figma node
 * 2111:1955 ("Convert to External KB?") from file
 * 251DTRmxl2L6jmXd3FWzHe. Built on Radix Dialog so consumers get
 * focus trap, Esc-to-close, and overlay-click-to-close for free.
 *
 * Mirrors SideSheet's `inline` mode so a Modal can also be hosted
 * inside a review pane without escaping to document.body.
 * ───────────────────────────────────────────────────────────── */

export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Title text shown in the header row. */
  title?: React.ReactNode;
  /** Optional 16×16 icon rendered to the left of the title. */
  titleIcon?: React.ReactNode;
  /**
   * Optional trailing slot in the header (right side) — e.g. a
   * close X button. Reserved for future variants; pass nothing
   * for the canonical Figma look.
   */
  titleTrailing?: React.ReactNode;
  /**
   * Body content. The footer slot (if used) sits inside the same
   * padded body container per the Figma `_Modal-Actions` structure.
   */
  children: React.ReactNode;
  /**
   * Right-aligned action row at the bottom of the body. Pass a
   * fragment containing `Button`s — canonical pair is subtle
   * Cancel + primary Confirm.
   */
  footer?: React.ReactNode;
  /** Pixel width. Defaults to 384 per Figma. */
  width?: number;
  className?: string;
  /**
   * When `true`, render the modal inline (no Radix Dialog, no
   * portal, no overlay) — mirrors SideSheet's `inline` mode for
   * use inside review panes. The `open` prop is ignored in inline
   * mode (the modal always renders) and the consumer cannot Esc
   * to close.
   */
  inline?: boolean;
};

/* ─────────────────────────────────────────────────────────────
 * Chrome class fragments — shared between portal and inline modes
 * so any future refactor that splits them stays visually identical.
 *
 * Header maps to Figma `_Modal-Title`:
 *   bg surface-subtle (#f8fafc), border-b card-border (#e2e8f0 —
 *   closest kb-ui token to Figma's #e5e5e5; within one slate step
 *   and unified across all card chrome), px-4 py-3, rounded-top-8.
 *
 * Body maps to the Figma body container: flex-col, gap-4 (16px),
 * p-4 (16px all sides). The footer slot rides inside this same
 * padded container (just like Figma's `_Modal-Actions` nested
 * inside the body) with a pt-2 (8px) gap on top of `gap-4` to
 * hit the exact 24px space the Figma example shows above the
 * actions row.
 * ───────────────────────────────────────────────────────────── */

const headerClass =
  'flex shrink-0 items-center justify-between gap-2 rounded-t-[8px] border-b border-card-border bg-surface-subtle px-4 py-3';
const headerLeftClass = 'flex items-center gap-2 min-w-0';
const headerIconClass =
  'flex h-4 w-4 shrink-0 items-center justify-center text-text-primary [&_svg]:h-4 [&_svg]:w-4';
const titleClass =
  'text-[16px] font-medium leading-6 text-text-primary truncate';
const bodyClass = 'flex flex-col gap-4 p-4';
const footerClass = 'flex items-end justify-end gap-2 pt-2';

/* ─────────────────────────────────────────────────────────────
 * Internal — renders the visual chrome (header + body + footer).
 * Shared by both portal and inline modes; the only difference
 * between them is whether the Title is a Radix `Dialog.Title`
 * (portal) or a plain `<div>` (inline, where there is no
 * `Dialog.Root` parent to consume the slot).
 * ───────────────────────────────────────────────────────────── */

type ChromeProps = Pick<
  ModalProps,
  'title' | 'titleIcon' | 'titleTrailing' | 'children' | 'footer'
> & {
  /** When true, wrap the title in `Dialog.Title` (portal mode). */
  asDialogTitle: boolean;
};

function ModalChrome({
  title,
  titleIcon,
  titleTrailing,
  children,
  footer,
  asDialogTitle,
}: ChromeProps) {
  const titleNode =
    title !== undefined ? (
      asDialogTitle ? (
        <Dialog.Title
          data-kb-part="modal-title"
          className={titleClass}
        >
          {title}
        </Dialog.Title>
      ) : (
        <div data-kb-part="modal-title" className={titleClass}>
          {title}
        </div>
      )
    ) : null;

  return (
    <>
      <div data-kb-part="modal-header" className={headerClass}>
        <div className={headerLeftClass}>
          {titleIcon !== undefined ? (
            <span
              data-kb-part="modal-title-icon"
              aria-hidden="true"
              className={headerIconClass}
            >
              {titleIcon}
            </span>
          ) : null}
          {titleNode}
        </div>

        {titleTrailing !== undefined ? (
          <div data-kb-part="modal-title-trailing" className="flex items-center gap-1">
            {titleTrailing}
          </div>
        ) : null}
      </div>

      <div data-kb-part="modal-body" className={bodyClass}>
        {children}
        {footer !== undefined ? (
          <div data-kb-part="modal-footer" className={footerClass}>
            {footer}
          </div>
        ) : null}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Main component — canonical confirm modal primitive.
 * ───────────────────────────────────────────────────────────── */

export function Modal({
  open,
  onOpenChange,
  title,
  titleIcon,
  titleTrailing,
  children,
  footer,
  width = 384,
  className,
  inline = false,
}: ModalProps) {
  /* Inline mode — render chrome directly (no Radix Dialog/Portal/
   * Overlay). Mirrors SideSheet's inline mode for use inside review
   * panes. No focus trap, no Esc-to-close — host owns that. */
  if (inline) {
    return (
      <div
        data-kb-component="modal"
        data-kb-mode="inline"
        style={{ width: `${width}px` }}
        className={cn(
          'flex flex-col bg-white rounded-[8px] border border-card-border',
          'shadow-[0_24px_48px_rgba(15,23,42,0.20)]',
          'focus:outline-none',
          className,
        )}
      >
        <ModalChrome
          title={title}
          titleIcon={titleIcon}
          titleTrailing={titleTrailing}
          footer={footer}
          asDialogTitle={false}
        >
          {children}
        </ModalChrome>
      </div>
    );
  }

  /* Portal mode — centered modal over a dimmed backdrop. Backdrop
   * uses text-primary/40 wash + z-90 to match the existing demo
   * ConfirmDialog stacking; content sits on z-91. */
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          data-kb-part="modal-overlay"
          className="fixed inset-0 z-[90] bg-text-primary/40"
        />

        <Dialog.Content
          data-kb-component="modal"
          style={{ width: `${width}px` }}
          className={cn(
            'fixed left-1/2 top-1/2 z-[91] -translate-x-1/2 -translate-y-1/2',
            'max-w-[calc(100vw-32px)]',
            'flex flex-col bg-white rounded-[8px] border border-card-border',
            'shadow-[0_24px_48px_rgba(15,23,42,0.20)]',
            'animate-toast-in focus:outline-none',
            className,
          )}
          aria-describedby={undefined}
        >
          {/* Radix requires a `Dialog.Title` for a11y. When no title
           * prop is supplied, mount a VisuallyHidden one so screen
           * readers still announce the dialog correctly. When a
           * title prop is supplied, the chrome below renders it as
           * the real Dialog.Title. */}
          {title === undefined ? (
            <VisuallyHidden asChild>
              <Dialog.Title>Modal</Dialog.Title>
            </VisuallyHidden>
          ) : null}

          <ModalChrome
            title={title}
            titleIcon={titleIcon}
            titleTrailing={titleTrailing}
            footer={footer}
            asDialogTitle={title !== undefined}
          >
            {children}
          </ModalChrome>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
