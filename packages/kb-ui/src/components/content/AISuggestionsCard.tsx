// Figma: 9aGp5t9fH1d0PXi4LMhOdb#74:9431 (leftmost card in the grid)
//        9aGp5t9fH1d0PXi4LMhOdb#81:17189 (pre-review in editor chrome)
//        9aGp5t9fH1d0PXi4LMhOdb#81:14752 (terminal — all reviewed)
import * as React from 'react';
import { RiCheckLine } from '@remixicon/react';
import { cn } from '../../utils/cn';
import { AiIcon } from '../brand/AiIcon';
import { Button } from '../primitives/Button';
import { AICard } from './AICard';
import { NavArrow } from './NavArrow';

export type AISuggestionsCardMode = 'pre-review' | 'terminal';

export type AISuggestionsCardProps = {
  /**
   * `pre-review`  — "AI Suggestions" + primary `Review Suggestions (N)` CTA.
   * `terminal`    — "Suggestions" + count badge + disabled `✓ Reviewed All` pill.
   */
  mode: AISuggestionsCardMode;
  count: number;
  summary: string;
  onReview?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  className?: string;
  /**
   * Optional override for the card title. When omitted, the title is
   * derived from `mode` ("AI Suggestions" for `pre-review`, "Suggestions"
   * for `terminal`).
   */
  title?: string;
  /**
   * Optional override for the active-mode CTA. Replaces the default
   * `Review Suggestions (N)` button when provided. Has no effect in
   * `terminal` mode.
   */
  cta?: React.ReactNode;
  /**
   * Optional override for the terminal-mode label. Defaults to
   * `"Reviewed All"` when omitted. Has no effect in `pre-review` mode.
   */
  terminalLabel?: string;
};

function CountPill({ count }: { count: number }) {
  return (
    <span
      data-kb-part="ai-suggestions-card-count"
      className={cn(
        'inline-flex min-w-[20px] items-center justify-center rounded-full border border-card-border bg-surface-muted px-1.5',
        'text-[12px] font-medium leading-[18px] text-text-meta tabular-nums',
      )}
    >
      {count}
    </span>
  );
}

export function AISuggestionsCard({
  mode,
  count,
  summary,
  onReview,
  onPrev,
  onNext,
  className,
  title,
  cta,
  terminalLabel,
}: AISuggestionsCardProps) {
  const isTerminal = mode === 'terminal';
  const resolvedTitle = title ?? (isTerminal ? 'Suggestions' : 'AI Suggestions');
  const resolvedTerminalLabel = terminalLabel ?? 'Reviewed All';

  return (
    <AICard
      mode="active"
      footerGap={16}
      className={className}
      data-kb-component="ai-suggestions-card"
      data-kb-mode={mode}
      header={
        <div className="flex items-center gap-2">
          <AiIcon size={16} aria-hidden="true" />
          {/* Per Figma `ai-suggestions-card-pre-review.png` — the title
           * is weight=medium, not semibold. Semibold read too heavy
           * compared to surrounding card UI in the live render. */}
          <span className="text-[14px] font-medium leading-[20px] text-text-primary">
            {resolvedTitle}
          </span>
          {isTerminal && <CountPill count={count} />}
        </div>
      }
      body={
        <p className="mt-2 text-[14px] font-normal leading-[20px] text-text-meta">
          {summary}
        </p>
      }
      footer={
        <>
          <div className="flex items-center gap-1">
            <NavArrow direction="up" onClick={onPrev} />
            <NavArrow direction="down" onClick={onNext} />
          </div>
          {isTerminal ? (
            <button
              type="button"
              disabled
              aria-label="Reviewed all suggestions"
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2',
                'text-[14px] font-medium leading-[20px] text-text-meta',
                'cursor-not-allowed',
              )}
            >
              <RiCheckLine aria-hidden="true" className="h-[14px] w-[14px]" />
              <span>{resolvedTerminalLabel}</span>
            </button>
          ) : cta !== undefined ? (
            cta
          ) : (
            <Button variant="subtle" onClick={onReview}>
              Review Suggestions ({count})
            </Button>
          )}
        </>
      }
    />
  );
}
