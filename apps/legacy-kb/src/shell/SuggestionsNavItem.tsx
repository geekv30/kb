import { Link } from 'react-router-dom';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { NAV_LI_CLASS, NAV_LI_STYLE, navLabelClass, navLinkClass } from './CategoryNavItem';

export interface SuggestionsNavItemProps {
  to: string;
  selected: boolean;
  /** Articles with suggestions waiting to go live. 0 hides the pill. */
  pendingCount: number;
}

/*
 * AI › Suggestions row. Same li / row / label geometry and states as a
 * category row; a 16px `auto_awesome` in place of the folder (no drag
 * handle, no name tooltip) and a trailing count pill: 12/20 500 white
 * on #1473e6, radius 15px, padding 0 7px, min-width 20px.
 */
export function SuggestionsNavItem({ to, selected, pendingCount }: SuggestionsNavItemProps) {
  const countLabel = `${pendingCount} ${pendingCount === 1 ? 'article' : 'articles'} to review`;
  return (
    <li className={NAV_LI_CLASS} style={NAV_LI_STYLE}>
      <Link
        to={to}
        aria-current={selected ? 'page' : undefined}
        aria-label={pendingCount > 0 ? `Suggestions, ${countLabel}` : undefined}
        className={navLinkClass(selected)}
      >
        <span className="box-border flex w-full flex-row items-center gap-[8px]">
          <span className="flex h-[16px] w-[16px] shrink-0 items-center justify-center">
            <MaterialIcon name="auto_awesome" size={16} className="block text-legacy-blue" />
          </span>
          <span className="min-w-0 flex-1 basis-0">
            <span className="relative flex">
              <span className={navLabelClass(selected)}>Suggestions</span>
            </span>
          </span>
          {pendingCount > 0 ? (
            <span
              aria-hidden
              className="box-border flex h-[20px] min-w-[20px] shrink-0 items-center justify-center rounded-[15px] bg-legacy-blue px-[7px] text-[12px] leading-[20px] font-medium text-white tabular-nums"
            >
              {pendingCount}
            </span>
          ) : null}
        </span>
      </Link>
    </li>
  );
}
