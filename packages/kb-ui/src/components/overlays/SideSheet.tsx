import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { RiCloseLine } from '@remixicon/react';
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
};

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
}: SideSheetProps) {
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
          <div
            data-kb-part="side-sheet-header"
            className={cn(
              'flex h-[56px] shrink-0 items-center gap-2 border-b border-card-border bg-[#f8fafc] px-5',
            )}
          >
            {title !== undefined ? (
              <Dialog.Title
                data-kb-part="side-sheet-title"
                className="text-[16px] font-semibold leading-[24px] text-[#0f172a]"
              >
                {title}
              </Dialog.Title>
            ) : null}

            {typeof count === 'number' ? (
              <span
                data-kb-part="side-sheet-count"
                className={cn(
                  'inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-full px-2',
                  'bg-[#0f172a] text-[12px] font-medium leading-[18px] text-white tabular-nums',
                )}
                aria-label={`${count} items`}
              >
                {count}
              </span>
            ) : null}

            <div className="flex-1" />

            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-[6px]',
                  'text-[#64758b] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a]',
                  'focus:outline-none focus:ring-2 focus:ring-black/10',
                )}
              >
                <RiCloseLine aria-hidden="true" className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body — scrollable region. Padding mirrors SourcesSideSheet
           * (px-5 py-4) so composed sheets keep consistent gutters. */}
          <div
            data-kb-part="side-sheet-body"
            className="flex flex-1 flex-col overflow-y-auto px-5 py-4"
          >
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
