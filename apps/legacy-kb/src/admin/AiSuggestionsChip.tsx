// The Admin Panel nudge: a pill beside a help center's name saying how
// many of its articles Hiver AI wants to improve. Geometry follows the
// Internal / External tag it sits next to (24px radius, 13px text); the
// color is the panel's own active-filter blue, with the Hiver AI nav
// sparkle, so it reads as AI and as clickable without a new accent.
// Hover adds the active filter's border; press scales to 0.97.

import { Link } from 'react-router-dom';
import { cn } from '../lib/cn';
import { AdminIcon } from './AdminIcon';

export interface AiSuggestionsChipProps {
  /** Articles with suggestions waiting; the chip hides at 0. */
  articles: number;
  to: string;
  className?: string;
}

export function aiSuggestionsLabel(articles: number): string {
  return `${articles} ${articles === 1 ? 'article' : 'articles'} to improve`;
}

export function AiSuggestionsChip({ articles, to, className }: AiSuggestionsChipProps) {
  if (articles <= 0) return null;
  return (
    <Link
      to={to}
      aria-label={`${aiSuggestionsLabel(articles)} — review Hiver AI suggestions`}
      className={cn(
        'box-border inline-flex h-[24px] shrink-0 items-center gap-[4px] rounded-[24px] border border-solid border-transparent bg-admin-pill-active-bg py-0 pr-[9px] pl-[7px] no-underline outline-none',
        'font-inter text-[13px] leading-[18px] font-medium whitespace-nowrap text-admin-pill-active-text',
        'transition-[border-color,transform] duration-[160ms] ease-out-strong hover:border-admin-primary motion-safe:active:scale-[0.97]',
        'focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#506dff]',
        className,
      )}
    >
      <AdminIcon name="navHiverAi" size={14} className="text-admin-pill-active-text" />
      {aiSuggestionsLabel(articles)}
    </Link>
  );
}
