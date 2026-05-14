import { ChevronUp, ChevronDown } from '@untitledui/icons';
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
  /**
   * Chunk 4 — disables the button and dims the icon. When `true`,
   * `onClick` is dropped and the button is `aria-disabled` so screen
   * readers announce the state.
   */
  disabled?: boolean;
  className?: string;
};

export function NavArrow({ direction, onClick, disabled, className }: NavArrowProps) {
  const Icon = direction === 'up' ? ChevronUp : ChevronDown;
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      aria-label={direction === 'up' ? 'Previous suggestion' : 'Next suggestion'}
      className={cn(
        'inline-flex size-6 items-center justify-center rounded-[4px]',
        // Idle baseline. Hover affordances dropped when disabled.
        disabled
          ? 'cursor-not-allowed text-text-disabled'
          : 'text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10',
        className,
      )}
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
    </button>
  );
}
