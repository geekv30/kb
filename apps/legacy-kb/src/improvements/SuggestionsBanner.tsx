import { forwardRef } from 'react';
import { Button } from '../components/ui/Button';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { pluralize } from '../lib/format';

export interface SuggestionsBannerProps {
  /** Pending (not yet published) suggestions on the article. */
  improvements: number;
  /** Conversations those suggestions are based on. */
  conversations: number;
  onReview: () => void;
}

/*
 * Edit-page notice above the CKEditor toolbar, in the old app's light
 * wash: #f2f6ff on a 1px #d1e0f1 border (the input border), radius 4px,
 * padding 12px 16px, 12px gaps. Body 14/20 400 #28476a with the counts
 * in 500 #09274a. The outline button is the old secondary button at
 * 32px / 13/20 so it fits a one-line banner (live buttons are 42px).
 * No dismiss: it goes away once the suggestions are published.
 */
export const SuggestionsBanner = forwardRef<HTMLElement, SuggestionsBannerProps>(function SuggestionsBanner(
  { improvements, conversations, onReview },
  ref,
) {
  return (
    <section
      ref={ref}
      aria-label="AI suggestions"
      className="box-border flex items-center gap-[12px] rounded-[4px] border border-solid border-legacy-input-border bg-legacy-wash px-[16px] py-[12px] font-inter"
    >
      <MaterialIcon name="auto_awesome" size={20} className="shrink-0 text-legacy-blue" />
      <p className="m-0 min-w-0 flex-1 p-0 text-[14px] leading-[20px] font-normal text-legacy-body">
        Hiver AI suggested{' '}
        <strong className="font-medium text-legacy-ink">{pluralize(improvements, 'improvement')}</strong> to this
        article based on{' '}
        <strong className="font-medium text-legacy-ink">
          {pluralize(conversations, 'recent customer conversation')}
        </strong>
        .
      </p>
      <Button
        variant="secondary"
        onClick={onReview}
        className="h-[32px] shrink-0 px-[12px] py-0 text-[13px] leading-[20px] whitespace-nowrap"
      >
        Review suggestions
      </Button>
    </section>
  );
});
