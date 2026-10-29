import { forwardRef, type ReactNode } from 'react';
import { Button } from '../components/ui/Button';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { pluralize } from '../lib/format';

export interface SuggestionsBannerProps {
  /** One sentence; counts go in `<BannerCount>` so they read in ink. */
  children: ReactNode;
  actionLabel: string;
  onAction: () => void;
}

/** A count inside the banner sentence: 500 #09274a. */
export function BannerCount({ count, noun }: { count: number; noun: string }) {
  return <strong className="font-medium text-legacy-ink">{pluralize(count, noun)}</strong>;
}

/*
 * Edit-page notice above the CKEditor toolbar, in the old app's light
 * wash: #f2f6ff on a 1px #d1e0f1 border (the input border), radius 4px,
 * padding 12px 16px, 12px gaps. Body 14/20 400 #28476a with the counts
 * in 500 #09274a. The outline button is the old secondary button at
 * 32px / 13/20 so it fits a one-line banner (live buttons are 42px).
 * No dismiss: it goes away once the suggestions are dealt with.
 */
export const SuggestionsBanner = forwardRef<HTMLElement, SuggestionsBannerProps>(function SuggestionsBanner(
  { children, actionLabel, onAction },
  ref,
) {
  return (
    <section
      ref={ref}
      aria-label="AI suggestions"
      className="box-border flex items-center gap-[12px] rounded-[4px] border border-solid border-legacy-input-border bg-legacy-wash px-[16px] py-[12px] font-inter"
    >
      <MaterialIcon name="auto_awesome" size={20} className="shrink-0 text-legacy-blue" />
      <p className="m-0 min-w-0 flex-1 p-0 text-[14px] leading-[20px] font-normal text-legacy-body">{children}</p>
      <Button
        variant="secondary"
        onClick={onAction}
        className="h-[32px] shrink-0 px-[12px] py-0 text-[13px] leading-[20px] whitespace-nowrap"
      >
        {actionLabel}
      </Button>
    </section>
  );
});
