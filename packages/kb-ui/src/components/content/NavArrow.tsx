import { RiArrowUpSLine, RiArrowDownSLine } from '@remixicon/react';
import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * NavArrow
 *
 * Up/down 24-px chevron button used by the AI suggestion review
 * surface to walk through the queue. Previously inlined verbatim
 * in `AIGapSuggestionCard` and `AISuggestionsCard` — both copies
 * shipped the same `size-6 rounded-[4px] hover:bg-[#f1f5f9]`
 * geometry, so they're now one atom.
 * ───────────────────────────────────────────────────────────── */

export type NavArrowProps = {
  direction: 'up' | 'down';
  onClick?: () => void;
  className?: string;
};

export function NavArrow({ direction, onClick, className }: NavArrowProps) {
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
        className,
      )}
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
    </button>
  );
}
