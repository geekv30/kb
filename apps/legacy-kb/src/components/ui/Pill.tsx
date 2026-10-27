import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import type { ArticleStatus } from '../../store/types';

export type PillTone = 'success' | 'draft' | 'search-published' | 'search-draft';

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
