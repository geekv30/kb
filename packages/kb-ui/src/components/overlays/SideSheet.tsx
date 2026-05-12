import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { XClose } from '@untitledui/icons';
import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────────────────────── */

export type SideSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  count?: number;
  width?: number;
  children: React.ReactNode;
  className?: string;
  /**
   * When `true`, render the sheet chrome inline (no Radix Dialog,
   * no Portal, no overlay) so the sheet can sit inside another
   * layout tree such as the FigmaCompare review pane. The `open`
   * prop is ignored in inline mode (the sheet always renders) and
   * `onOpenChange` is invoked from the close button so consumers
   * can still observe close intent.
   *
   * Existing portal-mode usage is unaffected — this prop defaults
   * to `false`.
   */
  inline?: boolean;
};

/* ─────────────────────────────────────────────────────────────
 * Header chrome — shared between portal and inline modes.
 *
 * Lives outside the main component so portal mode can wrap the
 * close button in `Dialog.Close` (Radix-managed) while inline
 * mode wires it directly to `onOpenChange`.
 * ───────────────────────────────────────────────────────────── */

const headerClass =
  'flex h-[56px] shrink-0 items-center gap-2 border-b border-card-border bg-surface-subtle px-5';
const titleClass =
  'text-[16px] font-semibold leading-[24px] text-text-primary';
const countClass =
  'inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-full px-2 bg-surface-muted text-[12px] font-medium leading-[18px] text-text-meta tabular-nums';
const closeBtnClass =
  'inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-black/10';
const bodyClass = 'flex flex-1 flex-col overflow-y-auto px-5 py-4';

/* ─────────────────────────────────────────────────────────────
 * Main component — generic right-docked overlay primitive.
 *
 * Headless behavior + visual chrome shared with SourcesSideSheet
 * (border color, header height, padding) so any feature-level
 * sheet that composes on top of this stays visually consistent
 * with the existing Sources sheet.
 * ───────────────────────────────────────────────────────────── */

export function SideSheet({
  open,
  onOpenChange,
  title,
  count,
  width = 400,
  children,
  className,
  inline = false,
}: SideSheetProps) {
  /* Inline mode — render chrome directly into the React tree
   * without Radix's Portal/Overlay. Used by the FigmaCompare
   * review canvas, which needs the sheet to live inside the
   * pane rather than escape to document.body. */
  if (inline) {
    return (
      <div
        data-kb-component="side-sheet"
        data-kb-mode="inline"
        style={{ width: `${width}px` }}
        className={cn(
          'flex flex-col bg-white h-full',
          'border-l border-card-border',
          'shadow-[-4px_0_16px_rgba(15,23,42,0.08)]',
          'focus:outline-none',
          className,
        )}
      >
        <div data-kb-part="side-sheet-header" className={headerClass}>
          {title !== undefined ? (
            <div data-kb-part="side-sheet-title" className={titleClass}>
              {title}
            </div>
          ) : null}

          {typeof count === 'number' ? (
            <span
              data-kb-part="side-sheet-count"
              className={countClass}
              aria-label={`${count} items`}
            >
              {count}
            </span>
          ) : null}

          <div className="flex-1" />

          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className={closeBtnClass}
          >
            <XClose aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <div data-kb-part="side-sheet-body" className={bodyClass}>
          {children}
        </div>
      </div>
    );
  }

  /* Portal mode — original behavior, unchanged. */
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Dimmed backdrop — mirrors SourcesSideSheet's near-solid
         * dark wash so feature sheets composing on top look identical. */}
        <Dialog.Overlay
          data-kb-part="side-sheet-overlay"
          className="fixed inset-0 z-40 bg-black/85"
        />

        {/* Right-docked sheet. Width is dynamic so it lives on inline
         * style; the rest of the chrome matches SourcesSideSheet. */}
        <Dialog.Content
          data-kb-component="side-sheet"
          style={{ width: `${width}px` }}
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex flex-col bg-white',
            'border-l border-card-border',
            'shadow-[-4px_0_16px_rgba(15,23,42,0.08)]',
            'focus:outline-none',
            className,
          )}
          aria-describedby={undefined}
        >
          {/* Dialog.Title is required for a11y. When the consumer
           * passes a title we render it inline in the header; otherwise
           * we still mount a VisuallyHidden Title so Radix is happy. */}
          {title === undefined ? (
            <VisuallyHidden asChild>
              <Dialog.Title>Side sheet</Dialog.Title>
            </VisuallyHidden>
          ) : null}

          {/* Header — chrome tokens mirror SourcesSideSheet so a future
           * refactor that has SourcesSideSheet compose on top of this
           * does not cause any visual drift. */}
          <div data-kb-part="side-sheet-header" className={headerClass}>
            {title !== undefined ? (
              <Dialog.Title
                data-kb-part="side-sheet-title"
                className={titleClass}
              >
                {title}
              </Dialog.Title>
            ) : null}

            {typeof count === 'number' ? (
              <span
                data-kb-part="side-sheet-count"
                className={countClass}
                aria-label={`${count} items`}
              >
                {count}
              </span>
            ) : null}

            <div className="flex-1" />

            <Dialog.Close asChild>
              <button type="button" aria-label="Close" className={closeBtnClass}>
                <XClose aria-hidden="true" className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body — scrollable region. Padding mirrors SourcesSideSheet
           * (px-5 py-4) so composed sheets keep consistent gutters. */}
          <div data-kb-part="side-sheet-body" className={bodyClass}>
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
