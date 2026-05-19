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
 *
 * Optional radius / bodyPadding / footerLayout props let consumers
 * match modals with chunkier chrome — see NewCategoryModal.
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
  /** Outer corner radius in px. Defaults to 8 (existing Convert-to-External-KB modal). */
  radius?: number;
  /** Body padding in px (uniform). Defaults to 16. */
  bodyPadding?: number;
  /**
   * When `'inside'` (default), footer renders inside the body
   * container with `pt-2` (existing behavior).
   * When `'section'`, footer renders as a separate section below
   * the body with its own padding (`pb-5 pt-4 px-5`, white bg).
   */
  footerLayout?: 'inside' | 'section';
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

const headerBaseClass =
  'flex shrink-0 items-center justify-between gap-2 border-b border-card-border bg-surface-subtle px-4 py-3';
const headerLeftClass = 'flex items-center gap-2 min-w-0';
const headerIconClass =
  'flex h-4 w-4 shrink-0 items-center justify-center text-text-primary [&_svg]:h-4 [&_svg]:w-4';
const titleClass =
  'text-[16px] font-medium leading-6 text-text-primary truncate';
const bodyBaseClass = 'flex flex-col gap-4';
/* Footer (inside mode): renders inside the body container with a
 * pt-2 (8px) gap on top of the body's `gap-4` → 24px total above
 * the actions row, matching Figma `_Modal-Actions`. */
const footerInsideClass = 'flex items-end justify-end gap-2 pt-2';
/* Footer (section mode): renders as a separate, white-bg section
 * BELOW the body container. Padding `pb-5 pt-4 px-5` per Figma
 * 1958:34896 (New Category). */
const footerSectionClass =
  'flex items-end justify-end gap-2 bg-white pb-5 pt-4 px-5';

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
  /** Outer corner radius — header consumes the top radius. */
  radius: number;
  /** Body padding (uniform). */
  bodyPadding: number;
  /** Where the footer renders relative to the body container. */
  footerLayout: 'inside' | 'section';
};

function ModalChrome({
  title,
  titleIcon,
  titleTrailing,
  children,
  footer,
  asDialogTitle,
  radius,
  bodyPadding,
  footerLayout,
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
      <div
        data-kb-part="modal-header"
        className={headerBaseClass}
        style={{ borderTopLeftRadius: radius, borderTopRightRadius: radius }}
      >
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

      <div
        data-kb-part="modal-body"
        className={bodyBaseClass}
        style={{ padding: bodyPadding }}
      >
        {children}
        {footer !== undefined && footerLayout === 'inside' ? (
          <div data-kb-part="modal-footer" className={footerInsideClass}>
            {footer}
          </div>
        ) : null}
      </div>

      {footer !== undefined && footerLayout === 'section' ? (
        <div data-kb-part="modal-footer" className={footerSectionClass}>
          {footer}
        </div>
      ) : null}
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
  radius = 8,
  bodyPadding = 16,
  footerLayout = 'inside',
}: ModalProps) {
  /* Inline mode — render chrome directly (no Radix Dialog/Portal/
   * Overlay). Mirrors SideSheet's inline mode for use inside review
   * panes. No focus trap, no Esc-to-close — host owns that. */
  if (inline) {
    return (
      <div
        data-kb-component="modal"
        data-kb-mode="inline"
        style={{ width: `${width}px`, borderRadius: radius }}
        className={cn(
          'flex flex-col bg-white border border-card-border overflow-hidden',
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
          radius={radius}
          bodyPadding={bodyPadding}
          footerLayout={footerLayout}
        >
          {children}
        </ModalChrome>
      </div>
    );
  }

  /* Portal mode — centered modal over a dimmed backdrop. Backdrop
   * uses text-primary/40 wash + z-90 to match the existing demo
   * ConfirmDialog stacking; content sits on z-91 (via wrapper).
   *
   * Positioning vs. animation (centering-drift fix):
   *   Centering is delegated to a non-animated `grid place-items-center`
   *   wrapper around `Dialog.Content`. The Content element itself
   *   animates ONLY scale + opacity around an explicit
   *   `transform-origin: center`. The previous implementation combined
   *   `left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2` (positioning)
   *   with a scale keyframe on the same transform stack, which surfaced
   *   a visible "(-3, 3) → (0, 0)" drift on long /edit pages: Radix's
   *   scroll-lock removes the body scrollbar and adds compensating
   *   padding on open, shifting the viewport math for `left-1/2`/`top-1/2`
   *   mid-paint while the scale animation is in flight.
   *   The wrapper carries `pointer-events-none` so overlay clicks (which
   *   close the dialog via Radix) still reach `Dialog.Overlay`; the
   *   Content re-enables pointer events on itself.
   *
   * Motion (Phase D1 + Chunk 12 reduced-motion fix, emil-design-eng skill):
   *   - Backdrop: opacity fade — 200ms enter / 140ms exit, `var(--ease-out-strong)`
   *   - Content: scale 0.96 → 1 + opacity fade — 200ms enter / 140ms exit
   *     transform-origin: center (skill confirms modals stay centered)
   *   - Exit faster than enter (close feels snappy, not draggy)
   *   - Keyframes (not transitions) so Radix can suspend unmount via
   *     `animationend` while the exit animation plays out
   *
   *   Reduced-motion users (`prefers-reduced-motion: reduce`):
   *     The previous version relied on `motion-safe:` alone, which suppresses
   *     the animation entirely and made the modal "stutter into existence"
   *     (Radix mounts instantly + no opacity fade = hard pop). Emil's rule
   *     for reduced-motion is to drop *movement* (transforms), not all motion.
   *     `motion-reduce:` variants apply opacity-only fades (kb-modal-*-reduced
   *     keyframes in tokens.css) at 100ms enter / 80ms exit so the mount/
   *     unmount still has a perceptible cushion without any scale or slide.
   *     Radix detects an animation is running on both code paths, so
   *     `animationend` correctly suspends unmount in either branch. */
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          data-kb-part="modal-overlay"
          className={cn(
            'fixed inset-0 z-[90] bg-text-primary/40',
            'motion-safe:data-[state=open]:animate-kb-backdrop-in',
            'motion-safe:data-[state=closed]:animate-kb-backdrop-out',
            'motion-reduce:data-[state=open]:animate-kb-backdrop-in-reduced',
            'motion-reduce:data-[state=closed]:animate-kb-backdrop-out-reduced',
          )}
        />

        {/* Centering wrapper — no animation, no transform. Grid
         * place-items handles centering robustly across viewport
         * changes (scroll lock, zoom). `pointer-events-none` lets
         * overlay clicks pass through to `Dialog.Overlay` so
         * overlay-click-to-close still works; `Dialog.Content` then
         * re-enables pointer events on itself. */}
        <div className="fixed inset-0 z-[91] grid place-items-center p-4 pointer-events-none">
          <Dialog.Content
            data-kb-component="modal"
            style={{ width: `${width}px`, borderRadius: radius }}
            className={cn(
              'pointer-events-auto',
              'max-w-[calc(100vw-32px)]',
              'flex flex-col bg-white border border-card-border overflow-hidden',
              'shadow-[0_24px_48px_rgba(15,23,42,0.20)]',
              'focus:outline-none origin-center',
              'motion-safe:data-[state=open]:animate-kb-modal-in',
              'motion-safe:data-[state=closed]:animate-kb-modal-out',
              'motion-reduce:data-[state=open]:animate-kb-modal-in-reduced',
              'motion-reduce:data-[state=closed]:animate-kb-modal-out-reduced',
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
              radius={radius}
              bodyPadding={bodyPadding}
              footerLayout={footerLayout}
            >
              {children}
            </ModalChrome>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
