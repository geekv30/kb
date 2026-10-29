// One AI suggestion in the review rail, in the old Help Center's visual
// language. Kept short on purpose — the highlight in the article shows
// the change, so the card only names it:
//
//   idle      → type + title; the whole card activates on click /
//               Enter / Space.
//   active    → type + "N / M", title, a one-line why, then prev/next
//               and Sources, Dismiss, Accept (kb-ui card layout).
//   accepted  → one-row grey chip that recedes into the page, with the
//               decision and an Undo icon.
//   dismissed → same chip, "Dismissed".

import type { KeyboardEvent } from 'react';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { Tooltip } from '../components/ui/Tooltip';
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
        // Decided suggestions recede: grey fill, no visible border.
        'flex h-[42px] items-center border-legacy-row-hover bg-legacy-row-hover py-0 pr-[4px] pl-[16px]',
        'motion-safe:animate-lk-chip-enter motion-reduce:animate-lk-fade-in-reduced',
      )}
    >
      <SuggestionTypeLabel type={suggestion.type} />
      <span aria-hidden className="mx-[8px] h-[16px] w-px shrink-0 bg-legacy-picker-border" />
      <span className="text-[11px] leading-[20px] font-semibold tracking-[0.04em] text-legacy-meta uppercase">
        {statusLabel}
      </span>
      {onUndo ? (
        <span className="ml-auto">
          <Tooltip content="Undo">
            <IconButton
              label={`Undo ${statusLabel.toLowerCase()}: ${suggestion.title}`}
              onClick={() => onUndo(suggestion.id)}
              className="hover:bg-legacy-toolbar-hover"
            >
              <UndoGlyph />
            </IconButton>
          </Tooltip>
        </span>
      ) : null}
    </div>
  );
}

/** Untitled UI `ReverseLeft` path — the new UI's undo glyph. */
export function UndoGlyph() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-legacy-body"
    >
      <path d="M4 7h10a6 6 0 0 1 0 12H4M4 7l4-4M4 7l4 4" />
    </svg>
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
        isIdle ? 'border-legacy-input-border px-[16px] py-[12px]' : 'border-legacy-input-border p-[16px] shadow-legacy-modal',
        activate && 'cursor-pointer hover:bg-legacy-wash focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#1473e6]',
      )}
    >
      <div className="flex h-[20px] items-center justify-between">
        <SuggestionTypeLabel type={suggestion.type} />
        {!isIdle && position ? (
          <span
            aria-label={`Suggestion ${position.index} of ${position.total}`}
            className="text-[12px] leading-[20px] font-medium text-legacy-meta tabular-nums"
          >
            {position.index} / {position.total}
          </span>
        ) : null}
      </div>
      <h3 className="m-0 mt-[8px] p-0 text-[14px] leading-[20px] font-medium text-legacy-ink">{suggestion.title}</h3>

      {!isIdle ? (
        <>
          <p className="m-0 mt-[4px] p-0 text-[13px] leading-[20px] font-normal text-legacy-meta">
            {suggestion.description}
          </p>
          <div className="mt-[16px] flex items-center justify-between">
            {/* -10px: the arrow glyph sits 10px inside its 32px button; this
                puts the glyph on the card's text column. */}
            <div className="-my-[6px] -ml-[10px]">
              <NavArrows onPrev={onPrev} onNext={onNext} prevDisabled={!canGoPrev} nextDisabled={!canGoNext} />
            </div>
            <div className="flex items-center gap-[8px]">
              <SourcesLink
                count={suggestion.sourceCount}
                onClick={onOpenSources ? () => onOpenSources(suggestion.id) : undefined}
              />
              {reject ? <DecisionButton decision="dismiss" suggestionTitle={suggestion.title} onClick={reject} /> : null}
              {accept ? <DecisionButton decision="accept" suggestionTitle={suggestion.title} onClick={accept} /> : null}
            </div>
          </div>
        </>
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

export function SourcesLink({ count, onClick }: SourcesLinkProps) {
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
      className="group m-0 inline-flex cursor-pointer items-center gap-[4px] rounded-[4px] border-0 bg-transparent p-0 font-inter text-[13px] leading-[20px] font-medium text-legacy-meta no-underline outline-none hover:text-legacy-ink focus-visible:shadow-[0_0_0_2px_#1473e6]"
    >
      <MaterialIcon name="description" size={16} className="text-legacy-meta group-hover:text-legacy-ink" />
      {/* Underline the words only — on the button it ran under the icon too. */}
      <span className="group-hover:underline">{label}</span>
    </button>
  );
}
