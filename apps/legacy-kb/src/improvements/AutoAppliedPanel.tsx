// Layout B: the edit page's AI banner (same box, type and button as the
// manual "Hiver AI suggested 3 improvements" banner), saying auto mode
// applied N suggestions. "Show" opens compact rows in the same box, in
// the review rail's language: type + title, a quiet "Auto-applied", and
// the round Revert. Hovering a row marks its paragraph in the editor.

import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { Tooltip } from '../components/ui/Tooltip';
import { cn } from '../lib/cn';
import { pluralize } from '../lib/format';
import type { AppliedItem } from './autoApplied';
import { IconButton, RevertButton, SuggestionTypeLabel } from './ReviewAtoms';
import { UndoGlyph } from './SuggestionCard';

export interface AutoAppliedPanelProps {
  items: AppliedItem[];
  needsReview: boolean;
  onToggle: (id: string) => void;
  onMarkReviewed: () => void;
  /** Row hovered: the editor marks that paragraph. */
  onFocus: (id: string | null) => void;
}

export function AutoAppliedPanel({ items, needsReview, onToggle, onMarkReviewed, onFocus }: AutoAppliedPanelProps) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!needsReview) setOpen(false);
  }, [needsReview]);
  const live = items.filter((i) => i.live).length;

  return (
    <section
      aria-label="AI suggestions"
      className="box-border rounded-[4px] border border-solid border-legacy-input-border bg-legacy-wash font-inter"
    >
      <div className="flex items-center gap-[12px] px-[16px] py-[12px]">
        <MaterialIcon name="auto_awesome" size={20} className="shrink-0 text-legacy-blue" />
        <p className="m-0 min-w-0 flex-1 p-0 text-[14px] leading-[20px] font-normal text-legacy-body">
          Auto mode applied <strong className="font-medium text-legacy-ink">{pluralize(items.length, 'Hiver AI suggestion')}</strong>{' '}
          to this article
          {live < items.length ? `, ${items.length - live} reverted` : ''}.
        </p>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="m-0 inline-flex shrink-0 cursor-pointer items-center gap-[2px] rounded-[4px] border-0 bg-transparent py-[4px] pr-[4px] pl-[8px] font-inter text-[13px] leading-[20px] font-medium text-legacy-body outline-none hover:bg-legacy-icon-hover focus-visible:shadow-[0_0_0_2px_#1473e6]"
        >
          {open ? 'Hide' : 'Show'}
          <MaterialIcon name="expand_more" size={18} className={cn('text-legacy-meta transition-transform duration-200', open && 'rotate-180')} />
        </button>
        {needsReview ? (
          <Button
            variant="secondary"
            onClick={onMarkReviewed}
            className="h-[32px] shrink-0 px-[12px] py-0 text-[13px] leading-[20px] whitespace-nowrap"
          >
            Mark as reviewed
          </Button>
        ) : null}
      </div>
      {open ? (
        <ul className="m-0 list-none border-0 border-t border-solid border-legacy-input-border p-0 motion-safe:animate-lk-fade-in-reduced">
          {items.map(({ suggestion: s, live: isLive }) => (
            <li
              key={s.id}
              onMouseEnter={() => onFocus(isLive ? s.id : null)}
              onMouseLeave={() => onFocus(null)}
              className="flex h-[44px] items-center gap-[12px] border-0 border-b border-solid border-legacy-input-border px-[16px] last:border-b-0"
            >
              <span className="w-[84px] shrink-0">
                <SuggestionTypeLabel type={s.type} />
              </span>
              <span className={cn('min-w-0 flex-1 truncate text-[14px] leading-[20px] font-medium', isLive ? 'text-legacy-ink' : 'text-legacy-meta')}>
                {s.title}
              </span>
              <span className="text-[12px] leading-[20px] font-medium text-legacy-meta">{isLive ? 'Auto-applied' : 'Reverted'}</span>
              {isLive ? (
                <RevertButton suggestionTitle={s.title} onClick={() => onToggle(s.id)} />
              ) : (
                <Tooltip content="Re-apply">
                  <IconButton label={`Re-apply: ${s.title}`} onClick={() => onToggle(s.id)} className="hover:bg-legacy-toolbar-hover">
                    <UndoGlyph />
                  </IconButton>
                </Tooltip>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
