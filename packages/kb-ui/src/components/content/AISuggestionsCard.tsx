// Figma: 9aGp5t9fH1d0PXi4LMhOdb#74:9431 (leftmost card in the grid)
//        9aGp5t9fH1d0PXi4LMhOdb#81:17189 (pre-review in editor chrome)
//        9aGp5t9fH1d0PXi4LMhOdb#81:14752 (terminal — all reviewed)
import { RiCheckLine } from '@remixicon/react';
import { cn } from '../../utils/cn';
import { AiIcon } from '../brand/AiIcon';
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
};

function CountPill({ count }: { count: number }) {
  return (
    <span
      data-kb-part="ai-suggestions-card-count"
      className={cn(
        'inline-flex min-w-[20px] items-center justify-center rounded-full border border-card-border bg-[#f1f5f9] px-1.5',
        'text-[12px] font-medium leading-[18px] text-[#475569] tabular-nums',
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
}: AISuggestionsCardProps) {
  const isTerminal = mode === 'terminal';
  const title = isTerminal ? 'Suggestions' : 'AI Suggestions';

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
          <span className="text-[14px] font-semibold leading-[20px] text-[#0f172a]">
            {title}
          </span>
          {isTerminal && <CountPill count={count} />}
        </div>
      }
      body={
        <p className="mt-2 text-[14px] font-normal leading-[20px] text-[#475569]">
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
                'text-[14px] font-medium leading-[20px] text-[#475569]',
                'cursor-not-allowed',
              )}
            >
              <RiCheckLine aria-hidden="true" className="h-[14px] w-[14px]" />
              <span>Reviewed All</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onReview}
              className={cn(
                'inline-flex items-center justify-center rounded-[8px] bg-[#0f172a] px-3 py-2',
                'text-[14px] font-medium leading-[20px] text-white',
                'transition-colors hover:bg-[#1e293b]',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
              )}
            >
              Review Suggestions ({count})
            </button>
          )}
        </>
      }
    />
  );
}
