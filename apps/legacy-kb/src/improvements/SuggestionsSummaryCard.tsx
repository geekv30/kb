// Top-of-rail summary card, ported from kb-ui `AISuggestionsCard`.
//
// One layout in every mode — icon, title, count pill, then the summary —
// so the card never changes shape as the review moves along. No arrows
// or chevrons here: up / down chevrons belong to the active card, where
// they step between suggestions.
//
//   pre-review → count = suggestions to review, plus the full-width
//                "Review suggestions" button.
//   reviewing  → count = suggestions LEFT; nothing below the summary.
//   terminal   → "Suggestions" + total count, and a disabled
//                "Reviewed all" button — or, once the review is final,
//                a read-only note saying who closed it and when.

import { Button } from '../components/ui/Button';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { cn } from '../lib/cn';
import { AIMark, CountPill } from './ReviewAtoms';
import type { ReviewMode } from './reviewState';

export interface SuggestionsSummaryCardProps {
  mode: ReviewMode;
  /** pre-review / reviewing: suggestions left. terminal: total. */
  count: number;
  summary: string;
  onReview?: () => void;
  /** terminal: replaces the "Reviewed all" button with a read-only status line. */
  historyNote?: string;
  /** terminal: heading instead of "Suggestions" (auto mode: "Edited by AI"). */
  title?: string;
  /** terminal: count pill's accessible name. */
  countLabel?: string;
  /** terminal: the status line's icon; `null` for none (auto mode, where the header already has the AI mark). */
  historyIcon?: string | null;
}

export function SuggestionsSummaryCard({
  mode,
  count,
  summary,
  onReview,
  historyNote,
  title,
  countLabel,
  historyIcon = 'check_circle',
}: SuggestionsSummaryCardProps) {
  const isTerminal = mode === 'terminal';
  return (
    // Top padding 8: the 32px header row already centers the 17px title,
    // so the title's optical inset matches the 16px sides.
    <section
      aria-label="AI suggestions"
      className="box-border rounded-[5px] border border-solid border-legacy-input-border bg-white px-[16px] pt-[8px] pb-[16px] font-inter"
    >
      <div className="flex h-[32px] items-center gap-[8px]">
        <AIMark size={20} />
        <h2 className="m-0 p-0 text-[14px] leading-[17px] font-medium text-legacy-ink">
          {isTerminal ? (title ?? 'Suggestions') : 'AI suggestions'}
        </h2>
        <CountPill
          count={count}
          label={isTerminal ? (countLabel ?? `${count} suggestions reviewed`) : `${count} left to review`}
        />
      </div>
      <p className="m-0 mt-0 p-0 text-[13px] leading-[20px] font-normal text-legacy-body">{summary}</p>
      {mode === 'reviewing' ? null : isTerminal && historyNote ? (
        <p className="m-0 mt-[12px] flex items-center gap-[6px] border-0 border-t border-solid border-legacy-input-border p-0 pt-[12px] text-[13px] leading-[20px] font-medium text-legacy-meta">
          {historyIcon ? (
            <MaterialIcon
              name={historyIcon}
              size={16}
              className={cn('shrink-0', historyIcon === 'check_circle' ? 'text-legacy-success' : 'text-legacy-blue')}
            />
          ) : null}
          {historyNote}
        </p>
      ) : isTerminal ? (
        <Button variant="primary" disabled className="mt-[16px] w-full">
          <MaterialIcon name="check" size={18} className="mr-[8px] text-white" />
          Reviewed all
        </Button>
      ) : (
        <Button variant="primary" className="mt-[16px] w-full" onClick={onReview}>
          Review suggestions
        </Button>
      )}
    </section>
  );
}
