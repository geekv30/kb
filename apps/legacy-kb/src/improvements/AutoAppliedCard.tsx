// Layout A: one auto-applied suggestion in the rail beside the article.
// Always open — nothing is waiting on a decision — and it says, top to
// bottom: which one (the number in the article), that it was applied
// automatically and is live, what it is and why, what the text was
// before, the conversations behind it, and Revert.

import { Button } from '../components/ui/Button';
import { cn } from '../lib/cn';
import { AppliedNumber, AppliedStatus, htmlToText, type AppliedItem } from './autoApplied';
import { SuggestionTypeLabel } from './ReviewAtoms';
import { SourcesLink } from './SuggestionCard';
import { MaterialIcon } from '../components/ui/MaterialIcon';

export interface AutoAppliedCardProps {
  item: AppliedItem;
  /** Revert (live) or Re-apply (reverted). */
  onToggle: (id: string) => void;
  onOpenSources: (id: string) => void;
}

const SMALL_BUTTON = 'h-[32px] shrink-0 gap-[6px] px-[12px] py-0 text-[13px] leading-[20px]';

export function AutoAppliedCard({ item, onToggle, onOpenSources }: AutoAppliedCardProps) {
  const { suggestion: s, index, live } = item;
  const before = htmlToText(s.payload.oldHTML);
  return (
    <article
      data-card-state={live ? 'auto-applied' : 'reverted'}
      aria-label={`Suggestion ${index}: ${s.title}`}
      className={cn(
        'box-border rounded-[5px] border border-solid p-[16px] font-inter',
        live ? 'border-legacy-input-border bg-white' : 'border-legacy-row-hover bg-legacy-row-hover',
      )}
    >
      <div className="flex items-center gap-[8px]">
        <AppliedNumber index={index} live={live} />
        <AppliedStatus live={live} />
        <span className="ml-auto">
          <SuggestionTypeLabel type={s.type} />
        </span>
      </div>
      <h3 className={cn('m-0 mt-[10px] p-0 text-[14px] leading-[20px] font-medium', live ? 'text-legacy-ink' : 'text-legacy-body')}>
        {s.title}
      </h3>
      <p className="m-0 mt-[2px] p-0 text-[13px] leading-[20px] text-legacy-meta">{s.description}</p>

      {live ? (
        <div className="mt-[12px] rounded-[4px] bg-legacy-draft-bg px-[12px] py-[8px]">
          <p className="m-0 p-0 text-[11px] leading-[16px] font-semibold tracking-[0.04em] text-legacy-meta uppercase">
            Before
          </p>
          <p className={cn('m-0 mt-[2px] line-clamp-3 p-0 text-[13px] leading-[20px]', before ? 'text-legacy-body' : 'text-legacy-meta italic')}>
            {before || 'Nothing. Hiver AI added this paragraph.'}
          </p>
        </div>
      ) : null}

      <div className="mt-[12px] flex items-center justify-between">
        <SourcesLink count={s.sourceCount} onClick={() => onOpenSources(s.id)} />
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
    </article>
  );
}
