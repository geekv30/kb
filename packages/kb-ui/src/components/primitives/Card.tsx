import * as React from 'react';
import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * Card primitive — the canonical "white surface card" used across
 * the kb-ui content surfaces. Centralises the border + radius +
 * bg pattern that has been inlined across AI gap cards, suggestion
 * cards, settings panel etc.
 *
 * Phase 7 (Analytics) is the first consumer — every analytics
 * surface (StatCardGrid, AnalyticsChartCard, table cards, the
 * AIConversationLogsCard) wraps this. Existing AI gap components
 * continue to inline their chrome for now (low-risk; future cleanup).
 * ───────────────────────────────────────────────────────────── */

export type CardPadding = 'sm' | 'md' | 'lg' | 'none';

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Inner padding preset. Most analytics cards use `md` (24 px).
   * `none` is for callers that need to control padding themselves
   * (e.g. tables — header row paints to the edge).
   */
  padding?: CardPadding;
  /** Render `<section>` instead of `<div>` for landmark semantics. */
  as?: 'div' | 'section';
};

const PADDING_CLASS: Record<CardPadding, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  none: '',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ padding = 'md', as: Tag = 'div', className, children, ...rest }, ref) => {
    return (
      <Tag
        ref={ref as React.Ref<HTMLDivElement>}
        data-kb-component="card"
        className={cn(
          'rounded-[12px] border border-card-border bg-white',
          PADDING_CLASS[padding],
          className,
        )}
        {...rest}
      >
        {children}
      </Tag>
    );
  },
);
Card.displayName = 'Card';
