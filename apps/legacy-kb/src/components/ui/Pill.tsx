import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import type { SuggestionImpact } from '../../store/selectors';
import type { ArticleStatus } from '../../store/types';

export type PillTone =
  | 'success'
  | 'draft'
  | 'search-published'
  | 'search-draft'
  | 'impact-high'
  | 'impact-medium'
  | 'impact-low';

export interface PillProps {
  tone: PillTone;
  children: ReactNode;
  className?: string;
}

/*
 * Live `Be` (table status) and `Y` (search result) pills:
 * Inter 12/20 500, padding 1px 10px, radius 15px.
 */
const TONE_CLASSES: Record<PillTone, string> = {
  success: 'bg-legacy-success-bg text-legacy-success',
  draft: 'bg-legacy-draft-bg text-legacy-draft',
  'search-published': 'bg-legacy-search-published text-white',
  'search-draft': 'bg-legacy-search-draft text-white',
  'impact-high': 'bg-legacy-danger-bg text-legacy-danger',
  'impact-medium': 'bg-legacy-impact-medium-bg text-legacy-impact-medium',
  'impact-low': 'bg-legacy-nav-active text-legacy-meta',
};

export function Pill({ tone, children, className }: PillProps) {
  return (
    <span
      className={cn(
        'block rounded-[15px] px-[10px] py-[1px] text-[12px] leading-[20px] font-medium whitespace-nowrap',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export interface StatusPillProps {
  status: ArticleStatus;
  /** `search` uses the solid search-dropdown colors. */
  context?: 'table' | 'search';
}

export function StatusPill({ status, context = 'table' }: StatusPillProps) {
  const published = status === 'PUBLISHED';
  const tone: PillTone =
    context === 'search'
      ? published
        ? 'search-published'
        : 'search-draft'
      : published
        ? 'success'
        : 'draft';
  return <Pill tone={tone}>{published ? 'Published' : 'Draft'}</Pill>;
}

const IMPACT_LABEL: Record<SuggestionImpact, string> = { high: 'High', medium: 'Medium', low: 'Low' };

/** AI suggestions hub IMPACT column: the status-pill geometry, three tones. */
export function ImpactPill({ impact }: { impact: SuggestionImpact }) {
  return <Pill tone={`impact-${impact}`}>{IMPACT_LABEL[impact]}</Pill>;
}
