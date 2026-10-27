// One AI suggestion in the review rail, in the old Help Center's visual
// language. Kept short on purpose — the highlight in the article shows
// the change, so the card only names it:
//
//   idle      → type + title; the whole card activates on click /
//               Enter / Space.
//   active    → type, "N of M" + prev/next, title, Sources, Dismiss,
//               Accept.
//   accepted  → one-row chip with the decision and an Undo button.
//   dismissed → same chip, "Dismissed".

import type { KeyboardEvent } from 'react';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { cn } from '../lib/cn';
import type { AISuggestion } from '../store/types';
import { DecisionButton, NavArrows, SuggestionTypeLabel } from './ReviewAtoms';
import type { ReviewDecision } from './reviewState';

export type SuggestionCardState = 'idle' | 'active' | ReviewDecision;

export interface SuggestionCardProps {
  suggestion: AISuggestion;
  state: SuggestionCardState;
  /** idle: click-to-activate. Omit to make the card inert. */
  onActivate?: (id: string) => void;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onUndo?: (id: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
  onOpenSources?: (id: string) => void;
  /** active: `false` disables the matching arrow. */
  canGoPrev?: boolean;
  canGoNext?: boolean;
  /** active: 1-based position in the full list. */
  position?: { index: number; total: number };
}

const CARD_BASE = 'box-border rounded-[5px] border border-solid bg-white font-inter';

export function SuggestionCard(props: SuggestionCardProps) {
  if (props.state === 'accepted' || props.state === 'dismissed') {
    return <DecisionChip {...props} decision={props.state} />;
  }
  return <ReviewCard {...props} />;
}

/* ── Decided chip ──────────────────────────────────────────── */

function DecisionChip({
  suggestion,
  decision,
  onUndo,
}: SuggestionCardProps & { decision: ReviewDecision }) {
  const statusLabel = decision === 'accepted' ? 'Accepted' : 'Dismissed';
  return (
    <div
      data-card-state={decision}
      className={cn(
        CARD_BASE,
        'flex h-[42px] items-center border-legacy-input-border py-0 pr-[4px] pl-[16px]',
        'motion-safe:animate-lk-chip-enter motion-reduce:animate-lk-fade-in-reduced',
      )}
    >
      <SuggestionTypeLabel type={suggestion.type} />
      <span aria-hidden className="mx-[8px] h-[16px] w-px shrink-0 bg-legacy-input-border" />
      <span className="text-[12px] leading-[20px] font-medium text-legacy-meta">{statusLabel}</span>
      {onUndo ? (
        <button
          type="button"
          aria-label={`Undo ${statusLabel.toLowerCase()}: ${suggestion.title}`}
          onClick={() => onUndo(suggestion.id)}
          className={cn(
            'm-0 ml-auto h-[32px] cursor-pointer rounded-[4px] border-0 bg-transparent px-[12px] py-0 font-inter text-[13px] leading-[20px] font-medium text-legacy-body outline-none',
            'transition-[background-color,transform] duration-[160ms] ease-out-strong hover:bg-legacy-icon-hover motion-safe:active:scale-[0.96]',
            'focus-visible:shadow-[0_0_0_2px_#1473e6]',
          )}
        >
          Undo
        </button>
      ) : null}
    </div>
  );
}

/* ── Idle + active card ────────────────────────────────────── */

function ReviewCard({
  suggestion,
  state,
  onActivate,
  onAccept,
  onReject,
  onPrev,
  onNext,
  onOpenSources,
  canGoPrev = true,
  canGoNext = true,
  position,
}: SuggestionCardProps) {
  const isIdle = state === 'idle';
  const activate = isIdle && onActivate ? () => onActivate(suggestion.id) : undefined;

  const handleKeyDown = activate
    ? (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      }
    : undefined;

  const accept = onAccept ? () => onAccept(suggestion.id) : undefined;
  const reject = onReject ? () => onReject(suggestion.id) : undefined;

  return (
    <div
      data-card-state={state}
      role={activate ? 'button' : undefined}
      tabIndex={activate ? 0 : undefined}
      aria-label={activate ? `Review suggestion: ${suggestion.title}` : undefined}
      onClick={activate}
      onKeyDown={handleKeyDown}
      className={cn(
        CARD_BASE,
        'outline-none',
        'transition-[background-color,border-color,box-shadow] duration-[200ms] ease-out-strong',
        isIdle ? 'border-legacy-input-border px-[16px] py-[12px]' : 'border-legacy-card-active p-[16px] shadow-legacy-modal',
        activate && 'cursor-pointer hover:bg-legacy-wash focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#1473e6]',
      )}
    >
      <div className="flex h-[20px] items-center justify-between">
        <SuggestionTypeLabel type={suggestion.type} />
        {!isIdle ? (
          // -10px: the arrow glyph sits 10px inside its 32px button; this
          // puts the glyph on the card's right text edge.
          <div className="-my-[6px] -mr-[10px] flex items-center gap-[4px]">
            {position ? (
              <span
                aria-label={`Suggestion ${position.index} of ${position.total}`}
                className="mr-[4px] text-[12px] leading-[20px] font-normal text-legacy-meta tabular-nums"
              >
                {position.index} of {position.total}
              </span>
            ) : null}
            <NavArrows onPrev={onPrev} onNext={onNext} prevDisabled={!canGoPrev} nextDisabled={!canGoNext} />
          </div>
        ) : null}
      </div>
      <h3 className="m-0 mt-[6px] p-0 text-[14px] leading-[20px] font-medium text-legacy-ink">{suggestion.title}</h3>

      {!isIdle ? (
        <div className="mt-[12px] flex items-center justify-between">
          <SourcesLink count={suggestion.sourceCount} onClick={onOpenSources ? () => onOpenSources(suggestion.id) : undefined} />
          <div className="flex items-center gap-[8px]">
            {reject ? <DecisionButton decision="dismiss" suggestionTitle={suggestion.title} onClick={reject} /> : null}
            {accept ? <DecisionButton decision="accept" suggestionTitle={suggestion.title} onClick={accept} /> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ── Sources link ──────────────────────────────────────────── */

interface SourcesLinkProps {
  count: number;
  /** Without a handler the count renders as plain meta text, not a link. */
  onClick?: () => void;
}

function SourcesLink({ count, onClick }: SourcesLinkProps) {
  const label = `${count} ${count === 1 ? 'source' : 'sources'}`;
  if (!onClick) {
    return (
      <span className="inline-flex items-center gap-[4px] text-[13px] leading-[20px] font-medium text-legacy-meta">
        <MaterialIcon name="description" size={16} className="text-legacy-meta" />
        {label}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      className="group m-0 inline-flex cursor-pointer items-center gap-[4px] rounded-[4px] border-0 bg-transparent p-0 font-inter text-[13px] leading-[20px] font-medium text-legacy-meta outline-none hover:text-legacy-ink hover:underline focus-visible:shadow-[0_0_0_2px_#1473e6]"
    >
      <MaterialIcon name="description" size={16} className="text-legacy-meta group-hover:text-legacy-ink" />
      {label}
    </button>
  );
}
