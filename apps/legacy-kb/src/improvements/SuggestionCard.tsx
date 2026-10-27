// One AI suggestion in the review rail, in the old Help Center's visual
// language. Behavior is a 1:1 port of kb-ui `AIGapSuggestionCard`:
//
//   idle      → the whole card activates on click / Enter / Space;
//               Accept and Dismiss work without activating first.
//   active    → prev/next (disabled at the ends), "N of M", Sources,
//               Dismiss, Accept.
//   accepted  → one-row chip with the decision and an Undo button.
//   dismissed → same chip, "Dismissed".

import type { KeyboardEvent, MouseEvent } from 'react';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { cn } from '../lib/cn';
import type { AISuggestion } from '../store/types';
import { DecisionButton, IconButton, NavArrows, SuggestionTypeLabel } from './ReviewAtoms';
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
        <IconButton
          label={`Undo ${statusLabel.toLowerCase()}: ${suggestion.title}`}
          className="ml-auto"
          onClick={() => onUndo(suggestion.id)}
        >
          <MaterialIcon name="undo" size={20} className="text-legacy-body" />
        </IconButton>
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

  // On an idle card the decision buttons sit inside the card's click
  // target, so they stop the click from also activating the card.
  const decide = (handler: ((id: string) => void) | undefined) =>
    handler
      ? (e: MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          handler(suggestion.id);
        }
      : undefined;
  const accept = decide(onAccept);
  const reject = decide(onReject);

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
        'p-[16px] outline-none',
        'transition-[background-color,border-color,box-shadow] duration-[200ms] ease-out-strong',
        isIdle ? 'border-legacy-input-border' : 'border-legacy-blue shadow-legacy-modal',
        activate && 'cursor-pointer hover:bg-legacy-wash focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#1473e6]',
      )}
    >
      <SuggestionTypeLabel type={suggestion.type} />
      <h3 className="m-0 mt-[8px] p-0 text-[14px] leading-[17px] font-medium text-legacy-ink">{suggestion.title}</h3>
      <p className="m-0 mt-[4px] p-0 text-[13px] leading-[20px] font-normal text-legacy-meta">
        {suggestion.description}
      </p>

      <div className="mt-[12px] flex items-center justify-between border-0 border-t border-solid border-legacy-input-border pt-[12px]">
        {/* -10px: the arrow glyph sits 10px inside its 32px button; this
            puts the glyph on the card's text column. */}
        <div className="-ml-[10px] flex items-center gap-[4px]">
          {isIdle ? (
            <NavArrows prevDisabled nextDisabled />
          ) : (
            <NavArrows onPrev={onPrev} onNext={onNext} prevDisabled={!canGoPrev} nextDisabled={!canGoNext} />
          )}
          {!isIdle && position ? (
            <span
              aria-label={`Suggestion ${position.index} of ${position.total}`}
              className="text-[12px] leading-[20px] font-normal text-legacy-meta tabular-nums"
            >
              {position.index} of {position.total}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-[8px]">
          <SourcesLink
            count={suggestion.sourceCount}
            onClick={!isIdle && onOpenSources ? () => onOpenSources(suggestion.id) : undefined}
          />
          {reject ? <DecisionButton decision="dismiss" suggestionTitle={suggestion.title} onClick={reject} /> : null}
          {accept ? <DecisionButton decision="accept" suggestionTitle={suggestion.title} onClick={accept} /> : null}
        </div>
      </div>
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
      <span className="mr-[4px] inline-flex items-center gap-[4px] text-[13px] leading-[20px] font-medium text-legacy-meta">
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
      className="m-0 mr-[4px] inline-flex cursor-pointer items-center gap-[4px] rounded-[4px] border-0 bg-transparent p-0 font-inter text-[13px] leading-[20px] font-medium text-legacy-blue outline-none hover:underline focus-visible:shadow-[0_0_0_2px_#1473e6]"
    >
      <MaterialIcon name="description" size={16} className="text-legacy-blue" />
      {label}
    </button>
  );
}
