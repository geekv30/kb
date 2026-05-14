// Figma: 9aGp5t9fH1d0PXi4LMhOdb#74:9431 (leftmost card in the grid)
//        9aGp5t9fH1d0PXi4LMhOdb#81:17189 (pre-review in editor chrome)
//        9aGp5t9fH1d0PXi4LMhOdb#81:14752 (terminal — all reviewed)
import * as React from 'react';
import { Check } from '@untitledui/icons';
import { cn } from '../../utils/cn';
import { AiIcon } from '../brand/AiIcon';
import { Button } from '../primitives/Button';
import { AICard } from './AICard';
import { NavArrow } from './NavArrow';

export type AISuggestionsCardMode = 'pre-review' | 'reviewing' | 'terminal';

export type AISuggestionsCardProps = {
  /**
   * `pre-review`  — "AI Suggestions" + primary `Review Suggestions (N)` CTA.
   * `reviewing`   — compact header (chunk 4): "AI Suggestions" + count pill,
   *                 no description, no nav arrows, no CTA. Used while a
   *                 paired suggestion card is active so the summary card
   *                 doesn't compete visually with the active card.
   *                 Figma has no explicit variant for this — minimal version
   *                 derived to match the terminal mode's compact rhythm
   *                 (icon + title + count pill in a single 56-px row).
   * `terminal`    — "Suggestions" + count badge + disabled `✓ Reviewed All` pill.
   */
  mode: AISuggestionsCardMode;
  /**
   * Number to display in the count badge / CTA text. Semantics differ
   * by mode (consumer-decided, not derived here):
   *   - `pre-review` → total suggestions (kickoff CTA "Review Suggestions (N)")
   *   - `reviewing`  → REMAINING unresolved (`total - accepted - dismissed`)
   *   - `terminal`   → total suggestions (the "I reviewed N" summary)
   */
  count: number;
  summary: string;
  onReview?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  className?: string;
  /**
   * Optional override for the card title. When omitted, the title is
   * derived from `mode` ("AI Suggestions" for `pre-review`, "Suggestions"
   * for `terminal`).
   */
  title?: string;
  /**
   * Optional override for the active-mode CTA. Replaces the default
   * `Review Suggestions (N)` button when provided. Has no effect in
   * `terminal` mode.
   */
  cta?: React.ReactNode;
  /**
   * Optional override for the terminal-mode label. Defaults to
   * `"Reviewed All"` when omitted. Has no effect in `pre-review` mode.
   */
  terminalLabel?: string;
};

function CountPill({ count }: { count: number }) {
  return (
    <span
      data-kb-part="ai-suggestions-card-count"
      className={cn(
        'inline-flex min-w-[20px] items-center justify-center rounded-full border border-card-border bg-surface-muted px-1.5',
        'text-[12px] font-medium leading-[18px] text-text-meta tabular-nums',
      )}
    >
      {count}
    </span>
  );
}

export function AISuggestionsCard({
  mode,
  count,
  summary,
  onReview,
  onPrev,
  onNext,
  className,
  title,
  cta,
  terminalLabel,
}: AISuggestionsCardProps) {
  const isTerminal = mode === 'terminal';
  const isReviewing = mode === 'reviewing';
  const resolvedTitle = title ?? (isTerminal ? 'Suggestions' : 'AI Suggestions');
  const resolvedTerminalLabel = terminalLabel ?? 'Reviewed All';

  /* ─────────────────────────────────────────────────────────────
   * Reviewing (chunk 4) — compact single-row variant.
   *
   * The summary card collapses to a 56-px tall pill: AI sparkle + title
   * + count pill. No description, no nav arrows, no CTA. Matches the
   * terminal mode's geometry but reads as a quiet header instead of an
   * end-state. Figma has no explicit variant for this — derived to keep
   * the rail visually clean while a paired suggestion card is active.
   *
   * Padding drops from 16 to `px-4 py-3` so the row reads as a header
   * rather than a card body. Background stays white + 1-px slate border
   * so it visually belongs to the same family as the active card below it.
   * ───────────────────────────────────────────────────────────── */
  if (isReviewing) {
    return (
      <AICard
        mode="active"
        className={cn(
          'px-4 py-3',
          // Chunk 5 — when the rail's `sticky` wrapper pins this compact
          // header at the top, scrolled cards behind it can overlap the
          // bottom edge. AICard already provides an opaque white bg and a
          // 1px slate border; add a subtle drop shadow so the overlap
          // reads as "tucked under" rather than visually broken. Same
          // tone as Figma `Shadows/md` used on the AI suggestion card
          // chrome (low-opacity 2-step shadow), but only applied here so
          // pre-review and terminal stay unchanged.
          'shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.06),0px_4px_6px_-1px_rgba(0,0,0,0.05)]',
          className,
        )}
        data-kb-component="ai-suggestions-card"
        data-kb-mode={mode}
        header={
          <div className="flex items-center gap-2">
            <AiIcon size={16} aria-hidden="true" />
            <span className="text-[14px] font-medium leading-[20px] text-text-primary">
              {resolvedTitle}
            </span>
            <CountPill count={count} />
          </div>
        }
      />
    );
  }

  return (
    <AICard
      mode="active"
      footerGap={16}
      className={className}
      data-kb-component="ai-suggestions-card"
      data-kb-mode={mode}
      header={
        <div className="flex items-center gap-2">
          <AiIcon size={16} aria-hidden="true" />
          {/* Per Figma `ai-suggestions-card-pre-review.png` — the title
           * is weight=medium, not semibold. Semibold read too heavy
           * compared to surrounding card UI in the live render. */}
          <span className="text-[14px] font-medium leading-[20px] text-text-primary">
            {resolvedTitle}
          </span>
          {isTerminal && <CountPill count={count} />}
        </div>
      }
      body={
        <p className="mt-2 text-[14px] font-normal leading-[20px] text-text-meta">
          {summary}
        </p>
      }
      footer={
        <>
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
                'text-[14px] font-medium leading-[20px] text-text-meta',
                'cursor-not-allowed',
              )}
            >
              <Check aria-hidden="true" className="h-[14px] w-[14px]" />
              <span>{resolvedTerminalLabel}</span>
            </button>
          ) : cta !== undefined ? (
            cta
          ) : (
            <Button variant="subtle" onClick={onReview}>
              Review Suggestions ({count})
            </Button>
          )}
        </>
      }
    />
  );
}
