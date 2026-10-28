// Floating "Back to suggestion" pill for the review page. Shown while the
// card under review is scrolled out of view, on the edge it went off
// (top when it is above, bottom when below), centered over the rail.

import { MaterialIcon } from '../components/ui/MaterialIcon';
import { cn } from '../lib/cn';

export type CardPlacement = 'visible' | 'above' | 'below';

export interface BackToSuggestionProps {
  placement: Exclude<CardPlacement, 'visible'>;
  /** 1-based position of the active suggestion. */
  position: { index: number; total: number };
  /** Rail's left edge and width, in px relative to the positioned parent. */
  left: number;
  width: number;
  onClick: () => void;
}

export function BackToSuggestion({ placement, position, left, width, onClick }: BackToSuggestionProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute z-[6] flex justify-center',
        placement === 'above' ? 'top-[12px]' : 'bottom-[16px]',
      )}
      style={{ left, width }}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'pointer-events-auto m-0 inline-flex cursor-pointer items-center gap-[6px] rounded-[16px] border border-solid border-legacy-input-border bg-white py-[6px] pr-[14px] pl-[10px] font-inter text-[13px] leading-[20px] font-medium text-legacy-body shadow-legacy-menu outline-none',
          'transition-[background-color,transform] duration-[160ms] ease-out-strong hover:bg-legacy-wash motion-safe:active:scale-[0.97]',
          'focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#1473e6]',
          'motion-safe:animate-lk-toast-in motion-reduce:animate-lk-fade-in-reduced',
        )}
      >
        <MaterialIcon
          name={placement === 'above' ? 'arrow_upward' : 'arrow_downward'}
          size={16}
          className="text-legacy-meta"
        />
        Back to suggestion {position.index} of {position.total}
      </button>
    </div>
  );
}
