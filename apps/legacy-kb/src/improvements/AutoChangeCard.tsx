// One change Hiver AI made in auto mode, in the review rail. Nothing is
// waiting on a decision, so there's no stepping through cards: every
// change is shown open, with the one action that takes it back.
//
//   applied   (publish) → full card, "Undo" restores the original text live.
//   undone    (publish) → grey chip, "Reapply" puts the change back.
//   included  (merge)   → full card, "Remove" takes it out of the version.
//   removed   (merge)   → grey chip, "Add back".

import { MaterialIcon } from '../components/ui/MaterialIcon';
import { cn } from '../lib/cn';
import type { AISuggestion } from '../store/types';
import { SuggestionTypeLabel } from './ReviewAtoms';
import { SourcesLink, UndoGlyph } from './SuggestionCard';

export type AutoChangeState = 'applied' | 'undone' | 'included' | 'removed';

export interface AutoChangeCardProps {
  suggestion: AISuggestion;
  state: AutoChangeState;
  /** Undo / Reapply (publish) or Remove / Add back (merge). */
  onToggle: (id: string) => void;
  onOpenSources: (id: string) => void;
}

const ACTION: Record<AutoChangeState, string> = {
  applied: 'Undo',
  undone: 'Reapply',
  included: 'Remove',
  removed: 'Add back',
};

const CARD_BASE = 'box-border rounded-[5px] border border-solid bg-white font-inter';

export function AutoChangeCard({ suggestion, state, onToggle, onOpenSources }: AutoChangeCardProps) {
  const action = ACTION[state];
  const toggle = () => onToggle(suggestion.id);

  if (state === 'undone' || state === 'removed') {
    return (
      <div
        data-card-state={state}
        className={cn(
          CARD_BASE,
          'flex h-[42px] items-center border-legacy-row-hover bg-legacy-row-hover py-0 pr-[8px] pl-[16px]',
          'motion-safe:animate-lk-chip-enter motion-reduce:animate-lk-fade-in-reduced',
        )}
      >
        <SuggestionTypeLabel type={suggestion.type} />
        <span aria-hidden className="mx-[8px] h-[16px] w-px shrink-0 bg-legacy-picker-border" />
        <span className="text-[11px] leading-[20px] font-semibold tracking-[0.04em] text-legacy-meta uppercase">
          {state === 'undone' ? 'Undone' : 'Removed'}
        </span>
        <button
          type="button"
          aria-label={`${action}: ${suggestion.title}`}
          onClick={toggle}
          className="m-0 ml-auto cursor-pointer rounded-[4px] border-0 bg-transparent px-[8px] py-[4px] font-inter text-[13px] leading-[20px] font-medium text-legacy-blue outline-none hover:bg-legacy-toolbar-hover focus-visible:shadow-[0_0_0_2px_#1473e6]"
        >
          {action}
        </button>
      </div>
    );
  }

  return (
    <div data-card-state={state} className={cn(CARD_BASE, 'border-legacy-input-border p-[16px]')}>
      <div className="flex h-[20px] items-center">
        <SuggestionTypeLabel type={suggestion.type} />
      </div>
      <h3 className="m-0 mt-[8px] p-0 text-[14px] leading-[20px] font-medium text-legacy-ink">{suggestion.title}</h3>
      <p className="m-0 mt-[4px] p-0 text-[13px] leading-[20px] font-normal text-legacy-meta">{suggestion.description}</p>
      <div className="mt-[12px] flex items-center justify-between">
        <SourcesLink count={suggestion.sourceCount} onClick={() => onOpenSources(suggestion.id)} />
        <button
          type="button"
          aria-label={`${action}: ${suggestion.title}`}
          onClick={toggle}
          className={cn(
            'm-0 inline-flex h-[28px] cursor-pointer items-center gap-[6px] rounded-[4px] border border-solid border-legacy-input-border bg-white px-[10px] py-0 font-inter text-[13px] leading-[20px] font-medium text-legacy-body outline-none',
            'transition-[background-color,transform] duration-[160ms] ease-out-strong hover:bg-legacy-wash motion-safe:active:scale-[0.97]',
            'focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#1473e6]',
          )}
        >
          {state === 'applied' ? <UndoGlyph /> : <MaterialIcon name="close" size={16} className="text-legacy-body" />}
          {action}
        </button>
      </div>
    </div>
  );
}
