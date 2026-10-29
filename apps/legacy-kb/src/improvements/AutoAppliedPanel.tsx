// Layout B: the article's auto-applied suggestions as a numbered list
// above the editor. Same story sentence as layout A, then one row per
// suggestion: its number (also in the article), what it is and why, its
// status, "Show change" (before → after) and Revert. Once the article is
// marked as reviewed the list folds to one line.

import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { cn } from '../lib/cn';
import type { StoreState } from '../store/types';
import { AppliedNumber, AppliedStatus, AutoAppliedStory, htmlToText, type AppliedItem } from './autoApplied';
import { SourcesLink } from './SuggestionCard';

export interface AutoAppliedPanelProps {
  state: StoreState;
  articleId: string;
  items: AppliedItem[];
  needsReview: boolean;
  onToggle: (id: string) => void;
  onMarkReviewed: () => void;
  onOpenSources: (id: string) => void;
  /** Row hovered / opened: the editor highlights that paragraph. */
  onFocus: (id: string | null) => void;
}

const SMALL_BUTTON = 'h-[28px] shrink-0 gap-[6px] px-[10px] py-0 text-[13px] leading-[20px]';
const TEXT_BUTTON =
  'm-0 inline-flex cursor-pointer items-center gap-[2px] rounded-[4px] border-0 bg-transparent px-[6px] py-[4px] font-inter text-[13px] leading-[20px] font-medium text-legacy-blue outline-none hover:bg-legacy-icon-hover focus-visible:shadow-[0_0_0_2px_#1473e6]';

export function AutoAppliedPanel(props: AutoAppliedPanelProps) {
  const { state, articleId, items, needsReview, onMarkReviewed } = props;
  const [expanded, setExpanded] = useState(needsReview);
  // Marking as reviewed folds the list; it can be reopened.
  useEffect(() => {
    if (!needsReview) setExpanded(false);
  }, [needsReview]);

  return (
    <section
      aria-label="Auto-applied suggestions"
      className="box-border rounded-[4px] border border-solid border-legacy-input-border bg-legacy-wash font-inter"
    >
      <div className="flex items-start gap-[12px] px-[16px] py-[12px]">
        <MaterialIcon name="auto_awesome" size={20} className="mt-[1px] shrink-0 text-legacy-blue" />
        <div className="min-w-0 flex-1">
          <AutoAppliedStory state={state} items={items} articleId={articleId} />
        </div>
        {needsReview ? (
          <Button variant="primary" onClick={onMarkReviewed} className="h-[32px] shrink-0 px-[12px] py-0 text-[13px] leading-[20px]">
            Mark as reviewed
          </Button>
        ) : (
          <button type="button" aria-expanded={expanded} onClick={() => setExpanded((e) => !e)} className={TEXT_BUTTON}>
            {expanded ? 'Hide suggestions' : 'Show suggestions'}
            <MaterialIcon name={expanded ? 'expand_less' : 'expand_more'} size={18} className="text-legacy-blue" />
          </button>
        )}
      </div>
      {needsReview || expanded ? (
        <ol className="m-0 list-none border-0 border-t border-solid border-legacy-input-border bg-white p-0">
          {items.map((item) => (
            <Row key={item.suggestion.id} item={item} {...props} />
          ))}
        </ol>
      ) : null}
    </section>
  );
}

function Row({ item, onToggle, onOpenSources, onFocus }: AutoAppliedPanelProps & { item: AppliedItem }) {
  const { suggestion: s, index, live } = item;
  const [open, setOpen] = useState(false);
  const before = htmlToText(s.payload.oldHTML);
  const after = htmlToText(s.payload.newHTML);
  return (
    <li
      onMouseEnter={() => onFocus(live ? s.id : null)}
      onMouseLeave={() => onFocus(null)}
      className="border-0 border-b border-solid border-legacy-input-border px-[16px] py-[10px] last:border-b-0"
    >
      <div className="flex items-center gap-[10px]">
        <AppliedNumber index={index} live={live} />
        <div className="min-w-0 flex-1">
          <p className={cn('m-0 truncate p-0 text-[14px] leading-[20px] font-medium', live ? 'text-legacy-ink' : 'text-legacy-body')}>
            {s.title}
            <span className="font-normal text-legacy-meta"> · {s.description}</span>
          </p>
        </div>
        <AppliedStatus live={live} />
        {live ? (
          <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={TEXT_BUTTON}>
            {open ? 'Hide change' : 'Show change'}
          </button>
        ) : null}
        <Button
          variant={live ? 'secondary' : 'ghost'}
          onClick={() => onToggle(s.id)}
          aria-label={`${live ? 'Revert' : 'Re-apply'} suggestion ${index}: ${s.title}`}
          className={cn(SMALL_BUTTON, !live && 'border-legacy-input-border')}
        >
          {live ? <MaterialIcon name="undo" size={16} className="text-legacy-blue" /> : null}
          {live ? 'Revert' : 'Re-apply'}
        </Button>
      </div>
      {live && open ? (
        <div className="mt-[8px] ml-[30px] grid grid-cols-2 gap-[12px]">
          <div className="rounded-[4px] bg-legacy-draft-bg px-[12px] py-[8px]">
            <p className="m-0 p-0 text-[11px] leading-[16px] font-semibold tracking-[0.04em] text-legacy-meta uppercase">Before</p>
            <p className={cn('m-0 mt-[2px] p-0 text-[13px] leading-[20px]', before ? 'text-legacy-body' : 'text-legacy-meta italic')}>
              {before || 'Nothing. Hiver AI added this paragraph.'}
            </p>
          </div>
          <div className="rounded-[4px] bg-legacy-success-bg px-[12px] py-[8px]">
            <p className="m-0 p-0 text-[11px] leading-[16px] font-semibold tracking-[0.04em] text-legacy-success uppercase">
              After (live)
            </p>
            <p className="m-0 mt-[2px] p-0 text-[13px] leading-[20px] text-legacy-ink">{after}</p>
          </div>
          <div className="col-span-2">
            <SourcesLink count={s.sourceCount} onClick={() => onOpenSources(s.id)} />
          </div>
        </div>
      ) : null}
    </li>
  );
}
