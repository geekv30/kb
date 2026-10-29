// Top-of-rail summary card, ported from kb-ui `AISuggestionsCard`.
//
//   pre-review → "AI suggestions", the summary, prev/next, and the
//                full-width "Review suggestions (N)" button.
//   reviewing  → compact one-row header with the REMAINING count; it
//                is a disclosure that reopens the summary.
//   terminal   → "Suggestions" + total count, the summary, and a
//                disabled "Reviewed all" button — or, once the review
//                is final, a read-only note saying who closed it and when.

import { useId, useState } from 'react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/cn';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { AIMark, CountPill, NavArrows } from './ReviewAtoms';
import type { ReviewMode } from './reviewState';

export interface SuggestionsSummaryCardProps {
  mode: ReviewMode;
  /** pre-review / terminal: total suggestions. reviewing: remaining. */
  count: number;
  summary: string;
  onReview?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  /** terminal: replaces the "Reviewed all" button with a read-only status line. */
  historyNote?: string;
  /** terminal: heading instead of "Suggestions" (auto mode: "Auto-applied"). */
  title?: string;
  /** terminal: count pill's accessible name. */
  countLabel?: string;
  /** terminal: the status line's icon (auto mode: `auto_awesome`). */
  historyIcon?: string;
  /** terminal: keep prev / next live (auto mode steps through applied suggestions). */
  navEnabled?: boolean;
}

const CARD = 'box-border rounded-[5px] border border-solid border-legacy-input-border bg-white font-inter';
const TITLE = 'm-0 p-0 text-[14px] leading-[17px] font-medium text-legacy-ink';

export function SuggestionsSummaryCard({
  mode,
  count,
  summary,
  onReview,
  onPrev,
  onNext,
  historyNote,
  title,
  countLabel,
  historyIcon = 'check_circle',
  navEnabled = false,
}: SuggestionsSummaryCardProps) {
  if (mode === 'reviewing') {
    return <ReviewingHeader count={count} summary={summary} />;
  }

  const isTerminal = mode === 'terminal';
  return (
    // Top padding 8: the 32px header row already centers the 17px title,
    // so the title's optical inset matches the 16px sides.
    <section aria-label="AI suggestions" className={`${CARD} px-[16px] pt-[8px] pb-[16px]`}>
      <div className="flex h-[32px] items-center gap-[8px]">
        <AIMark size={20} />
        <h2 className={TITLE}>{isTerminal ? (title ?? 'Suggestions') : 'AI suggestions'}</h2>
        {isTerminal ? <CountPill count={count} label={countLabel ?? `${count} suggestions reviewed`} /> : null}
        <div className="ml-auto -mr-[10px]">
          {/* In terminal mode every suggestion is decided, so prev/next
              have nowhere to go — shown disabled rather than as dead
              buttons that look live. */}
          <NavArrows
            onPrev={onPrev}
            onNext={onNext}
            prevDisabled={isTerminal && !navEnabled}
            nextDisabled={isTerminal && !navEnabled}
          />
        </div>
      </div>
      <p className="m-0 mt-0 p-0 text-[13px] leading-[20px] font-normal text-legacy-body">{summary}</p>
      {isTerminal && historyNote ? (
        <p className="m-0 mt-[12px] flex items-center gap-[6px] border-0 border-t border-solid border-legacy-input-border p-0 pt-[12px] text-[13px] leading-[20px] font-medium text-legacy-meta">
          <MaterialIcon
            name={historyIcon}
            size={16}
            className={cn('shrink-0', historyIcon === 'check_circle' ? 'text-legacy-success' : 'text-legacy-blue')}
          />
          {historyNote}
        </p>
      ) : isTerminal ? (
        <Button variant="primary" disabled className="mt-[16px] w-full">
          <MaterialIcon name="check" size={18} className="mr-[8px] text-white" />
          Reviewed all
        </Button>
      ) : (
        <Button variant="primary" className="mt-[16px] w-full" onClick={onReview}>
          Review suggestions ({count})
        </Button>
      )}
    </section>
  );
}

/** Reviewing: one row, click to show / hide the summary underneath. */
function ReviewingHeader({ count, summary }: { count: number; summary: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <section aria-label="AI suggestions" className={CARD}>
      <h2 className="m-0 p-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          // A mouse click shouldn't park focus here: Y / N / J / K keep
          // driving the review, and no focus ring lingers on the header.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'm-0 box-border flex w-full cursor-pointer items-center gap-[8px] rounded-[5px] border-0 bg-transparent px-[16px] py-[10px] text-left font-inter outline-none',
            'group focus-visible:shadow-[inset_0_0_0_2px_#1473e6]',
          )}
        >
          <AIMark size={20} />
          <span className={TITLE}>AI suggestions</span>
          <CountPill count={count} label={`${count} left to review`} />
          <MaterialIcon
            name="expand_more"
            size={20}
            className={cn(
              'ml-auto text-legacy-meta transition-[color,transform] duration-[200ms] ease-out-strong group-hover:text-legacy-ink',
              open && 'rotate-180',
            )}
          />
        </button>
      </h2>
      {open ? (
        <p
          id={panelId}
          className="m-0 px-[16px] pt-0 pb-[12px] text-[13px] leading-[20px] font-normal text-legacy-body motion-safe:animate-lk-fade-in-reduced"
        >
          {summary}
        </p>
      ) : null}
    </section>
  );
}
