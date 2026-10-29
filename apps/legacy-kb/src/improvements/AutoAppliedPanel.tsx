// Layout B: the edit page's AI banner (same box, type and button as the
// manual "Hiver AI suggested 3 improvements" banner), saying auto mode
// applied N suggestions. "Show changes" swaps the editor for the red /
// green view of every change, each with its own line and Revert right
// under it (AutoChangesView); "Mark as reviewed" settles the article.

import { Button } from '../components/ui/Button';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { pluralize } from '../lib/format';
import type { AppliedItem } from './autoApplied';

export interface AutoAppliedPanelProps {
  items: AppliedItem[];
  needsReview: boolean;
  /** Changes shown: the editor is swapped for the red / green view. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkReviewed: () => void;
}

const SMALL_BUTTON = 'h-[32px] shrink-0 px-[12px] py-0 text-[13px] leading-[20px] whitespace-nowrap';

export function AutoAppliedPanel({ items, needsReview, open, onOpenChange, onMarkReviewed }: AutoAppliedPanelProps) {
  const reverted = items.filter((i) => !i.live).length;
  return (
    <section
      aria-label="AI suggestions"
      className="box-border flex items-center gap-[12px] rounded-[4px] border border-solid border-legacy-input-border bg-legacy-wash px-[16px] py-[12px] font-inter"
    >
      <MaterialIcon name="auto_awesome" size={20} className="shrink-0 text-legacy-blue" />
      <p className="m-0 min-w-0 flex-1 p-0 text-[14px] leading-[20px] font-normal text-legacy-body">
        Auto mode applied <strong className="font-medium text-legacy-ink">{pluralize(items.length, 'Hiver AI suggestion')}</strong> to
        this article{reverted > 0 ? `, ${reverted} reverted` : ''}.
      </p>
      <Button variant="secondary" aria-pressed={open} onClick={() => onOpenChange(!open)} className={SMALL_BUTTON}>
        {open ? 'Hide changes' : 'Show changes'}
      </Button>
      {needsReview ? (
        <Button variant="secondary" onClick={onMarkReviewed} className={SMALL_BUTTON}>
          Mark as reviewed
        </Button>
      ) : null}
    </section>
  );
}
