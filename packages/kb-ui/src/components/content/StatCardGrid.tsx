import * as React from 'react';
import { RiInformationLine } from '@remixicon/react';
import { Card } from '../primitives/Card';
import { StatCard, type StatCardProps } from './StatCard';
import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * StatCardGrid — header + horizontal row of `StatCard`s wrapped
 * in the canonical `Card` primitive. Mirrors the Figma
 * "Support Performance" / "AI Search Performance" surfaces.
 *
 * Padding: Figma uses `scale/space/3xl = 20px` (not 24). We
 * pass `padding="none"` and apply `p-5` so we hit the exact
 * 20 px gutter from the design.
 * ───────────────────────────────────────────────────────────── */

export type StatCardGridProps = {
  /** Section title — e.g. "Support Performance". */
  title: string;
  /** Optional native tooltip text rendered on the info icon. */
  infoTooltip?: string;
  /** Stats (typically 4) distributed evenly across the card. */
  stats: StatCardProps[];
  className?: string;
  /** Optional right-aligned slot rendered in the header row (e.g. a "View all" button). */
  headerRight?: React.ReactNode;
};

export function StatCardGrid({ title, infoTooltip, stats, className, headerRight }: StatCardGridProps) {
  return (
    <Card
      padding="none"
      data-kb-component="stat-card-grid"
      className={cn('p-5', className)}
    >
      <div className="flex items-center gap-1.5">
        <h3 className="text-[14px] font-medium leading-5 text-[#0f172a]">{title}</h3>
        <span
          className="inline-flex"
          {...(infoTooltip ? { title: infoTooltip, 'aria-label': infoTooltip } : {})}
        >
          <RiInformationLine size={16} className="text-[#64748b]" aria-hidden="true" />
        </span>
        {headerRight !== undefined ? <div className="ml-auto flex items-center">{headerRight}</div> : null}
      </div>
      <div className="mt-4 flex items-start gap-6">
        {stats.map((stat, i) => (
          <StatCard key={`${stat.label}-${i}`} {...stat} className="flex-1" />
        ))}
      </div>
    </Card>
  );
}
