// Top-of-rail summary card, ported from kb-ui `AISuggestionsCard`.
//
//   pre-review → "AI suggestions", the summary, prev/next, and the
//                full-width "Review suggestions (N)" button.
//   reviewing  → compact one-row header with the REMAINING count.
//   terminal   → "Suggestions" + total count, the summary, and a
//                disabled "Reviewed all" button.

import { Button } from '../components/ui/Button';
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
}

const CARD = 'box-border rounded-[5px] border border-solid border-legacy-input-border bg-white font-inter';
const TITLE = 'm-0 p-0 text-[14px] leading-[17px] font-medium text-legacy-ink';

export function SuggestionsSummaryCard({ mode, count, summary, onReview, onPrev, onNext }: SuggestionsSummaryCardProps) {
  if (mode === 'reviewing') {
    return (
      <section aria-label="AI suggestions" className={`${CARD} flex items-center gap-[8px] px-[16px] py-[10px]`}>
        <AIMark size={20} />
        <h2 className={TITLE}>AI suggestions</h2>
        <CountPill count={count} label={`${count} left to review`} />
      </section>
    );
  }

  const isTerminal = mode === 'terminal';
  return (
    // Top padding 8: the 32px header row already centers the 17px title,
    // so the title's optical inset matches the 16px sides.
    <section aria-label="AI suggestions" className={`${CARD} px-[16px] pt-[8px] pb-[16px]`}>
      <div className="flex h-[32px] items-center gap-[8px]">
        <AIMark size={20} />
        <h2 className={TITLE}>{isTerminal ? 'Suggestions' : 'AI suggestions'}</h2>
        {isTerminal ? <CountPill count={count} label={`${count} suggestions reviewed`} /> : null}
        <div className="ml-auto -mr-[10px]">
          {/* In terminal mode every suggestion is decided, so prev/next
              have nowhere to go — shown disabled rather than as dead
              buttons that look live. */}
          <NavArrows onPrev={onPrev} onNext={onNext} prevDisabled={isTerminal} nextDisabled={isTerminal} />
        </div>
      </div>
      <p className="m-0 mt-0 p-0 text-[13px] leading-[20px] font-normal text-legacy-body">{summary}</p>
      {isTerminal ? (
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
