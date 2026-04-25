// Figma: 9aGp5t9fH1d0PXi4LMhOdb#76:12567
import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { RiMailLine, RiCloseLine } from '@remixicon/react';
import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────────────────────── */

export type ConversationSource = {
  id: string;
  senderName: string;
  senderEmail?: string;
  /** Pre-formatted timestamp, e.g. `"Feb 4, 2:45 PM"`. */
  timestamp: string;
  subject: string;
  snippet: string;
};

export type SourcesSideSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources: ConversationSource[];
  /** Called with the conversation id when a card is clicked. */
  onSourceClick?: (id: string) => void;
  /** Override the header count. Defaults to `sources.length`. */
  count?: number;
  className?: string;
};

/* ─────────────────────────────────────────────────────────────
 * Internal: conversation card
 *
 * Rendered as a <button> when `onSourceClick` is provided so the
 * card is focusable and keyboard-operable. Falls back to a plain
 * <div> when no handler is set — reading-only sheets do not need
 * the button semantics and keep the DOM lighter.
 * ───────────────────────────────────────────────────────────── */

type ConversationCardProps = {
  source: ConversationSource;
  onClick?: (id: string) => void;
};

function ConversationCard({ source, onClick }: ConversationCardProps) {
  const content = (
    <>
      {/* Row 1: mail icon + sender + timestamp */}
      <div className="flex items-center gap-2">
        <RiMailLine
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-[#64758b]"
        />
        <span className="flex-1 truncate text-[14px] font-semibold leading-[20px] text-[#0f172a]">
          {source.senderName}
        </span>
        <span className="shrink-0 text-[12px] font-normal leading-[18px] text-[#64758b]">
          {source.timestamp}
        </span>
      </div>

      {/* Row 2: subject */}
      <div className="mt-2 truncate text-[14px] font-medium leading-[20px] text-[#0f172a]">
        {source.subject}
      </div>

      {/* Row 3: preview snippet (single-line, ellipsized) */}
      <div className="mt-1 truncate text-[14px] font-normal leading-[20px] text-[#64758b]">
        {source.snippet}
      </div>
    </>
  );

  const baseClass = cn(
    'block w-full rounded-[10px] border border-card-border bg-white px-3 py-3 text-left',
    'shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(source.id)}
        data-kb-part="sources-side-sheet-card"
        className={cn(
          baseClass,
          'transition-colors hover:bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-black/10',
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      data-kb-part="sources-side-sheet-card"
      className={baseClass}
    >
      {content}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Main component
 * ───────────────────────────────────────────────────────────── */

export function SourcesSideSheet({
  open,
  onOpenChange,
  sources,
  onSourceClick,
  count,
  className,
}: SourcesSideSheetProps) {
  const displayCount = count ?? sources.length;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Dimmed backdrop — dark solid overlay matches Figma (76:12567).
         * The Figma shows a near-solid dark wash; 85% opacity is the closest
         * Tailwind alpha that matches. */}
        <Dialog.Overlay
          data-kb-part="sources-side-sheet-overlay"
          className="fixed inset-0 z-40 bg-black/85"
        />

        {/* Right-docked sheet. Radix does not auto-position Content — we
         * position it explicitly via fixed + right-0. */}
        <Dialog.Content
          data-kb-component="sources-side-sheet"
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex w-[400px] flex-col bg-white',
            'border-l border-card-border',
            'shadow-[-4px_0_16px_rgba(15,23,42,0.08)]',
            'focus:outline-none',
            className,
          )}
          aria-describedby={undefined}
        >
          {/* Dialog.Title is required for a11y. Visible text is rendered
           * explicitly in the header row; title lives in a VisuallyHidden
           * wrapper so screen readers still announce it. */}
          <VisuallyHidden asChild>
            <Dialog.Title>Sources</Dialog.Title>
          </VisuallyHidden>

          {/* Header — subtle grey tint distinguishes it from the white
           * card list area, matches Figma (76:12567). */}
          <div
            data-kb-part="sources-side-sheet-header"
            className={cn(
              'flex h-[56px] shrink-0 items-center gap-2 border-b border-card-border bg-[#f8fafc] px-5',
            )}
          >
            <span className="text-[16px] font-semibold leading-[24px] text-[#0f172a]">
              Sources
            </span>

            {/* Count pill — soft grey rounded rectangle. `px-2` leaves
             * room for double-digit counts without looking tight. */}
            <span
              data-kb-part="sources-side-sheet-count"
              className={cn(
                'inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-full px-2',
                'bg-[#0f172a] text-[12px] font-medium leading-[18px] text-white tabular-nums',
              )}
              aria-label={`${displayCount} sources`}
            >
              {displayCount}
            </span>

            <div className="flex-1" />

            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close sources"
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

          {/* Body — scrollable list of conversation cards */}
          <div
            data-kb-part="sources-side-sheet-body"
            className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4"
          >
            {sources.map((source) => (
              <ConversationCard
                key={source.id}
                source={source}
                onClick={onSourceClick}
              />
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
