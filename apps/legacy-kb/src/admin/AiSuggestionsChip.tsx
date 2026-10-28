// The Admin Panel nudge: how many of a help center's articles Hiver AI
// wants to improve, linking to its AI › Suggestions list. Built as the
// design system's Badge (subtle, info, md, pill) with the Hiver AI nav
// sparkle as its icon. Hidden at 0.

import { AdminIcon } from './AdminIcon';
import { DsBadgeLink } from './ds/DsBadge';

export interface AiSuggestionsChipProps {
  /** Articles with suggestions waiting; the badge hides at 0. */
  articles: number;
  to: string;
}

export function aiSuggestionsLabel(articles: number): string {
  return `${articles} ${articles === 1 ? 'article' : 'articles'} to improve`;
}

export function AiSuggestionsChip({ articles, to }: AiSuggestionsChipProps) {
  if (articles <= 0) return null;
  return (
    <DsBadgeLink
      to={to}
      aria-label={`${aiSuggestionsLabel(articles)}, review Hiver AI suggestions`}
      icon={<AdminIcon name="navHiverAi" size={14} />}
    >
      {aiSuggestionsLabel(articles)}
    </DsBadgeLink>
  );
}
