// Figma: 9aGp5t9fH1d0PXi4LMhOdb#74:9431 (leftmost card in the grid)
//        9aGp5t9fH1d0PXi4LMhOdb#81:17189 (pre-review in editor chrome)
//        9aGp5t9fH1d0PXi4LMhOdb#81:14752 (terminal — all reviewed)
import * as React from 'react';
import {
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiCheckLine,
} from '@remixicon/react';
import { cn } from '../../utils/cn';
import { AiIcon } from '../brand/AiIcon';

/* ─────────────────────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────────────────────── */

export type AISuggestionsCardMode = 'pre-review' | 'terminal';

export type AISuggestionsCardProps = {
  /**
   * `pre-review`  — "AI Suggestions" + primary `Review Suggestions (N)` CTA.
   * `terminal`    — "Suggestions" + count badge + disabled `✓ Reviewed All` pill.
   */
  mode: AISuggestionsCardMode;
  /** Used inside the primary CTA (pre-review) and the count badge (terminal). */
  count: number;
  /** One-line AI summary of the overall review — same copy in both modes. */
  summary: string;
  /** Fired when the user clicks `Review Suggestions (N)` (pre-review only). */
  onReview?: () => void;
  /** Prev arrow — always present, functional in both modes. */
  onPrev?: () => void;
  /** Next arrow — always present, functional in both modes. */
  onNext?: () => void;
  className?: string;
};

/* ─────────────────────────────────────────────────────────────
 * Local atoms
 *
 * The ▲▼ pair and the footer-row layout is identical to
 * AIGapSuggestionCard but intentionally duplicated locally —
 * extracting a shared atom is out of scope for this dispatch.
 * ───────────────────────────────────────────────────────────── */

type NavArrowProps = {
  direction: 'up' | 'down';
  onClick?: () => void;
};

function NavArrow({ direction, onClick }: NavArrowProps) {
  const Icon = direction === 'up' ? RiArrowUpSLine : RiArrowDownSLine;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'up' ? 'Previous suggestion' : 'Next suggestion'}
      className={cn(
        'inline-flex size-6 items-center justify-center rounded-[4px]',
        'text-[#64748b] transition-colors',
        'hover:bg-[#f1f5f9] hover:text-[#0f172a]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10',
      )}
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Count pill (terminal mode)
 * ───────────────────────────────────────────────────────────── */

function CountPill({ count }: { count: number }) {
  return (
    <span
      data-kb-part="ai-suggestions-card-count"
      className={cn(
        'inline-flex min-w-[20px] items-center justify-center rounded-full border border-card-border bg-[#f1f5f9] px-1.5',
        'text-[12px] font-medium leading-[18px] text-[#475569] tabular-nums',
      )}
    >
      {count}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Main component
 * ───────────────────────────────────────────────────────────── */

export function AISuggestionsCard({
  mode,
  count,
  summary,
  onReview,
  onPrev,
  onNext,
  className,
}: AISuggestionsCardProps) {
  const isTerminal = mode === 'terminal';
  const title = isTerminal ? 'Suggestions' : 'AI Suggestions';

  return (
    <section
      data-kb-component="ai-suggestions-card"
      data-kb-mode={mode}
      className={cn(
        'flex w-full flex-col rounded-[12px] border border-card-border bg-white',
        'p-4',
        className,
      )}
    >
      {/* Header — AI sparkle + title (+ count pill when terminal) */}
      <div className="flex items-center gap-2">
        <AiIcon size={16} aria-hidden="true" />
        <span
          className={cn(
            'text-[14px] font-semibold leading-[20px] text-[#0f172a]',
          )}
        >
          {title}
        </span>
        {isTerminal && <CountPill count={count} />}
      </div>

      {/* Summary — 14/regular, secondary text */}
      <p
        className={cn(
          'mt-2 text-[14px] font-normal leading-[20px] text-[#475569]',
        )}
      >
        {summary}
      </p>

      {/* Footer — arrows left, CTA right */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <NavArrow direction="up" onClick={onPrev} />
          <NavArrow direction="down" onClick={onNext} />
        </div>

        {isTerminal ? (
          <button
            type="button"
            disabled
            aria-label="Reviewed all suggestions"
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-2',
              'text-[14px] font-medium leading-[20px] text-[#475569]',
              'cursor-not-allowed',
            )}
          >
            <RiCheckLine aria-hidden="true" className="h-[14px] w-[14px]" />
            <span>Reviewed All</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onReview}
            className={cn(
              'inline-flex items-center justify-center rounded-[8px] bg-[#0f172a] px-3 py-2',
              'text-[14px] font-medium leading-[20px] text-white',
              'transition-colors hover:bg-[#1e293b]',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
            )}
          >
            Review Suggestions ({count})
          </button>
        )}
      </div>
    </section>
  );
}
