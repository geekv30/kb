import { MaterialIcon } from '../components/ui/MaterialIcon';
import { Tooltip } from '../components/ui/Tooltip';
import { pluralize } from '../lib/format';

export interface SuggestionsTablePillProps {
  /** Pending (not yet published) suggestions on the article. */
  count: number;
  onOpen: () => void;
}

/*
 * Category table TITLE-cell indicator. Status-pill type (12/20 500,
 * radius 15px) in the icon-hover wash: #1473e6 on #e4edfa, #d6e4f7 on
 * hover; padding 1px 8px with a 12px `auto_awesome` and a 4px gap.
 * Opens the review view without triggering the row's editor click.
 */
export function SuggestionsTablePill({ count, onOpen }: SuggestionsTablePillProps) {
  const label = pluralize(count, 'suggestion');
  return (
    <Tooltip content="Review AI suggestions">
      <button
        type="button"
        aria-label={`${label}. Review AI suggestions`}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        onKeyDown={(e) => e.stopPropagation()}
        className="m-0 box-border inline-flex cursor-pointer items-center gap-[4px] rounded-[15px] border-0 bg-legacy-icon-hover px-[8px] py-[1px] font-inter text-[12px] leading-[20px] font-medium whitespace-nowrap text-legacy-blue outline-none hover:bg-legacy-ai-pill-hover focus-visible:shadow-[0_0_0_2px_#1473e6]"
      >
        <MaterialIcon name="auto_awesome" size={12} className="text-legacy-blue" />
        {label}
      </button>
    </Tooltip>
  );
}
