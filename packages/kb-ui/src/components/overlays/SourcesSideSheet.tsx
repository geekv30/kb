// Figma: 9aGp5t9fH1d0PXi4LMhOdb#76:12567
import * as React from 'react';
import { RiMailLine } from '@remixicon/react';
import { cn } from '../../utils/cn';
import { SideSheet } from './SideSheet';

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
  /** Override the header count. Defaults to `sources.length` (or `items.length` when `items` is provided). */
  count?: number;
  className?: string;
  /**
   * Escape hatch for consumers who need to render arbitrary nodes in
   * the body instead of the default `sources`-derived mail cards. When
   * provided, each entry is rendered as a body row using the same
   * inter-row gap as the default sources path; `sources` is ignored.
   */
  items?: React.ReactNode[];
  /**
   * Forwarded to `SideSheet`. When `true`, the sheet renders inline
   * (no Radix Portal) so it can sit inside another layout tree like
   * the FigmaCompare review pane. Defaults to `false`.
   */
  inline?: boolean;
};

/* ─────────────────────────────────────────────────────────────
 * MailItem — the canonical sources-card row.
 *
 * Lifted verbatim from the previous inline `ConversationCard` so the
 * default render stays byte-identical. Exposed as both
 * `SourcesSideSheet.MailItem` and a named `SourcesSideSheetMailItem`
 * export so consumers can reuse it inside their own `items` arrays.
 *
 * Props mirror `ConversationSource` (minus `id`, which is only used
 * as a React key and as the click-handler payload at the parent).
 * ───────────────────────────────────────────────────────────── */

export type MailItemProps = {
  senderName: string;
  senderEmail?: string;
  /** Pre-formatted timestamp, e.g. `"Feb 4, 2:45 PM"`. */
  timestamp: string;
  subject: string;
  snippet: string;
  /** Optional click handler — when set, the row renders as a focusable button. */
  onClick?: () => void;
  className?: string;
};

export function MailItem({
  senderName,
  // senderEmail is part of `ConversationSource` and accepted here for
  // API parity, but the original card layout (matched 1:1 to Figma)
  // does not surface it inline. Kept in the prop signature so consumers
  // can pass a `ConversationSource` through without mapping.
  senderEmail: _senderEmail,
  timestamp,
  subject,
  snippet,
  onClick,
  className,
}: MailItemProps) {
  const content = (
    <>
      {/* Row 1: mail icon + sender + timestamp */}
      <div className="flex items-center gap-2">
        <RiMailLine
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-text-muted"
        />
        <span className="flex-1 truncate text-[14px] font-semibold leading-[20px] text-text-primary">
          {senderName}
        </span>
        <span className="shrink-0 text-[12px] font-normal leading-[18px] text-text-muted">
          {timestamp}
        </span>
      </div>

      {/* Row 2: subject */}
      <div className="mt-2 truncate text-[14px] font-medium leading-[20px] text-text-primary">
        {subject}
      </div>

      {/* Row 3: preview snippet (single-line, ellipsized) */}
      <div className="mt-1 truncate text-[14px] font-normal leading-[20px] text-text-muted">
        {snippet}
      </div>
    </>
  );

  const baseClass = cn(
    'block w-full rounded-[10px] border border-card-border bg-white px-3 py-3 text-left',
    'shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
    className,
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        data-kb-part="sources-side-sheet-card"
        className={cn(
          baseClass,
          'transition-colors hover:bg-surface-subtle focus:outline-none focus:ring-2 focus:ring-black/10',
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div data-kb-part="sources-side-sheet-card" className={baseClass}>
      {content}
    </div>
  );
}

/** Named export alias for consumers who avoid namespace imports. */
export const SourcesSideSheetMailItem = MailItem;

/* ─────────────────────────────────────────────────────────────
 * Main component
 *
 * Composes on `<SideSheet>` for chrome (overlay, header, count pill,
 * close, width, body wrapper). Defaults render today's exact mail
 * cards; consumers can opt into arbitrary body content via `items`.
 * ───────────────────────────────────────────────────────────── */

export function SourcesSideSheet({
  open,
  onOpenChange,
  sources,
  onSourceClick,
  count,
  className,
  items,
  inline,
}: SourcesSideSheetProps) {
  const displayCount = count ?? (items ? items.length : sources.length);

  return (
    <SideSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Sources"
      count={displayCount}
      className={className}
      inline={inline}
    >
      {/* gap-3 mirrors today's inter-card spacing on the default path
       * and is preserved for the `items` path so consumer rows stack
       * with the same rhythm as built-in mail cards. */}
      <div
        data-kb-part="sources-side-sheet-body-list"
        className="flex flex-1 flex-col gap-3"
      >
        {items
          ? items.map((node, idx) => (
              // Consumer-supplied nodes: index keys are acceptable here
              // because the array is fully owned by the consumer and we
              // do not reorder it.
              // eslint-disable-next-line react/no-array-index-key
              <React.Fragment key={idx}>{node}</React.Fragment>
            ))
          : sources.map((source) => (
              <MailItem
                key={source.id}
                senderName={source.senderName}
                senderEmail={source.senderEmail}
                timestamp={source.timestamp}
                subject={source.subject}
                snippet={source.snippet}
                onClick={
                  onSourceClick ? () => onSourceClick(source.id) : undefined
                }
              />
            ))}
      </div>
    </SideSheet>
  );
}

// Static accessor — `SourcesSideSheet.MailItem` for namespace-style imports.
SourcesSideSheet.MailItem = MailItem;
