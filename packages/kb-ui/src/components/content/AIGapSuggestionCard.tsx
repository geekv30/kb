// Figma: 9aGp5t9fH1d0PXi4LMhOdb#74:9431 (3×4 card grid — active + accepted + dismissed)
//        9aGp5t9fH1d0PXi4LMhOdb#81:16926 (active Addition in context)
//        9aGp5t9fH1d0PXi4LMhOdb#81:16342 (active Replace in context)
//        9aGp5t9fH1d0PXi4LMhOdb#81:15737 (active Removal in context)
import * as React from 'react';
import {
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiCheckLine,
  RiCloseLine,
  RiAddLine,
  RiRefreshLine,
  RiFileTextLine,
  RiArrowGoBackLine,
} from '@remixicon/react';
import { cn } from '../../utils/cn';
import type {
  AISuggestion,
  AISuggestionState,
  AISuggestionType,
} from './ai-suggestion-types';

/* ─────────────────────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────────────────────── */

export type AIGapSuggestionCardProps = {
  suggestion: AISuggestion;
  state: AISuggestionState;
  /** Prev arrow — active state only. */
  onPrev?: () => void;
  /** Next arrow — active state only. */
  onNext?: () => void;
  /** `N Sources` opens the sources side-sheet (active state only). */
  onOpenSources?: (id: string) => void;
  /** Green check — active state only. */
  onAccept?: (id: string) => void;
  /** Red × — active state only. */
  onReject?: (id: string) => void;
  /** Undo arrow — accepted/dismissed chip only. */
  onUndo?: (id: string) => void;
  className?: string;
};

/* ─────────────────────────────────────────────────────────────
 * Type chip — icon + label, color-coded per suggestion type.
 *
 * The chip is the same glyph in both the active-card header and
 * the collapsed accepted/dismissed chip, so it's a local atom.
 * ───────────────────────────────────────────────────────────── */

const TYPE_META: Record<
  AISuggestionType,
  { label: string; color: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  // Hex values mirrored 1:1 in tokens.css (--color-ai-addition / -replace /
  // -removal). Kept inline because Tailwind arbitrary classes for dynamic
  // per-type color don't tree-shake via the inline `style={{ color }}` path
  // used in TypeChip — leave as hex; the values won't drift since both live
  // next to each other in spec docs.
  addition: { label: 'Addition', color: '#22c55e', Icon: RiAddLine },
  replace: { label: 'Replace', color: '#3b82f6', Icon: RiRefreshLine },
  removal: { label: 'Removal', color: '#ef4444', Icon: RiCloseLine },
};

function TypeChip({ type }: { type: AISuggestionType }) {
  const { label, color, Icon } = TYPE_META[type];
  return (
    <span
      data-kb-part="ai-gap-type-chip"
      data-kb-type={type}
      className="inline-flex items-center gap-1"
      style={{ color }}
    >
      <Icon className="h-[14px] w-[14px]" />
      <span className="text-[12px] font-medium leading-[18px]">{label}</span>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Local ▲▼ arrow — duplicated here (see AISuggestionsCard) to
 * keep each file self-contained. Intentional per dispatch spec.
 * ───────────────────────────────────────────────────────────── */

function NavArrow({
  direction,
  onClick,
}: {
  direction: 'up' | 'down';
  onClick?: () => void;
}) {
  const Icon = direction === 'up' ? RiArrowUpSLine : RiArrowDownSLine;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'up' ? 'Previous suggestion' : 'Next suggestion'}
      className={cn(
        'inline-flex size-6 items-center justify-center rounded-[4px]',
        'text-[#64748b] transition-colors',
        'hover:bg-[#f1f5f9] hover:text-[#0f172a]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10',
      )}
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Active-state sub-components
 * ───────────────────────────────────────────────────────────── */

function SourcesButton({
  count,
  onClick,
}: {
  count: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-[4px] px-1.5 py-1',
        'text-[14px] font-medium leading-[20px] text-[#475569]',
        'transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10',
      )}
    >
      <RiFileTextLine aria-hidden="true" className="h-4 w-4" />
      <span>{count} Sources</span>
    </button>
  );
}

function RejectButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Reject suggestion"
      className={cn(
        'inline-flex size-6 items-center justify-center rounded-full bg-[var(--color-btn-danger-bg)]',
        'text-ai-removal transition-colors hover:bg-[#fbd6d2]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10',
      )}
    >
      <RiCloseLine aria-hidden="true" className="h-[14px] w-[14px]" />
    </button>
  );
}

function AcceptButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Accept suggestion"
      className={cn(
        'inline-flex size-6 items-center justify-center rounded-full bg-[#0f172a]',
        'text-white transition-colors hover:bg-[#1e293b]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
      )}
    >
      <RiCheckLine aria-hidden="true" className="h-[14px] w-[14px]" />
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Chip (accepted / dismissed) sub-component
 * ───────────────────────────────────────────────────────────── */

function DecisionChip({
  suggestion,
  decision,
  onUndo,
  className,
}: {
  suggestion: AISuggestion;
  decision: Exclude<AISuggestionState, 'active'>;
  onUndo?: (id: string) => void;
  className?: string;
}) {
  const label = decision === 'accepted' ? 'ACCEPTED' : 'DISMISSED';
  return (
    <div
      data-kb-component="ai-gap-suggestion-card"
      data-kb-state={decision}
      data-kb-type={suggestion.type}
      className={cn(
        'flex w-full items-center rounded-[12px] border border-card-border bg-white',
        'px-3 py-2',
        className,
      )}
    >
      <TypeChip type={suggestion.type} />
      <span aria-hidden className="mx-3 h-4 w-px shrink-0 bg-card-divider" />
      <span className="text-[12px] font-medium leading-[18px] text-[#475569] tracking-wide">
        {label}
      </span>
      <button
        type="button"
        onClick={() => onUndo?.(suggestion.id)}
        aria-label={`Undo ${decision} for ${suggestion.title}`}
        className={cn(
          'ml-auto inline-flex size-6 items-center justify-center rounded-[4px]',
          'text-[#64748b] transition-colors',
          'hover:bg-[#f1f5f9] hover:text-[#0f172a]',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10',
        )}
      >
        <RiArrowGoBackLine aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Main component — routes between active card and chip
 * ───────────────────────────────────────────────────────────── */

export function AIGapSuggestionCard({
  suggestion,
  state,
  onPrev,
  onNext,
  onOpenSources,
  onAccept,
  onReject,
  onUndo,
  className,
}: AIGapSuggestionCardProps) {
  if (state !== 'active') {
    return (
      <DecisionChip
        suggestion={suggestion}
        decision={state}
        onUndo={onUndo}
        className={className}
      />
    );
  }

  return (
    <section
      data-kb-component="ai-gap-suggestion-card"
      data-kb-state="active"
      data-kb-type={suggestion.type}
      className={cn(
        'flex w-full flex-col rounded-[12px] border border-card-border bg-white',
        'p-4',
        className,
      )}
    >
      {/* Header — type chip */}
      <TypeChip type={suggestion.type} />

      {/* Title */}
      <h3
        data-kb-part="ai-gap-title"
        className="mt-2 text-[14px] font-semibold leading-[20px] text-[#0f172a]"
      >
        {suggestion.title}
      </h3>

      {/* Description */}
      <p
        data-kb-part="ai-gap-description"
        className="mt-1 text-[14px] font-normal leading-[20px] text-[#475569]"
      >
        {suggestion.description}
      </p>

      {/* Divider — visible hairline (#e5e5e5) per design/ai-gaps.md spec. */}
      <div
        aria-hidden="true"
        data-kb-part="ai-gap-divider"
        className="mt-3 h-px w-full bg-card-divider"
      />

      {/* Footer — arrows left, actions right */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <NavArrow direction="up" onClick={onPrev} />
          <NavArrow direction="down" onClick={onNext} />
        </div>
        <div className="flex items-center gap-2">
          <SourcesButton
            count={suggestion.sourceCount}
            onClick={() => onOpenSources?.(suggestion.id)}
          />
          <RejectButton onClick={() => onReject?.(suggestion.id)} />
          <AcceptButton onClick={() => onAccept?.(suggestion.id)} />
        </div>
      </div>
    </section>
  );
}
