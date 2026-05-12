import * as React from 'react';
import { ArrowUpRight, ArrowDownRight } from '@untitledui/icons';
import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * StatCard — a single labelled metric with an optional trend
 * delta (up/down/neutral). Composed by `StatCardGrid` for the
 * Support Performance / AI Search Performance dashboard rows.
 *
 * Kept layout-only (no card chrome): the parent `StatCardGrid`
 * provides the `Card` wrapper. This way `StatCard` can also be
 * embedded inside other surfaces (drilldowns, summaries) without
 * duplicating chrome.
 * ───────────────────────────────────────────────────────────── */

export type StatTrendDirection = 'up' | 'down' | 'neutral';

export type StatCardProps = {
  /** Stat label e.g. "Total Views". */
  label: string;
  /** Pre-formatted value e.g. "112,678", "70.2%", "02m : 45s". */
  value: string;
  /** Pre-formatted delta e.g. "+15%". Sign already encoded in the string. */
  trendDelta?: string;
  /** 'up' = green arrow, 'down' = red arrow, 'neutral' = no arrow / grey delta. */
  trendDirection?: StatTrendDirection;
  className?: string;
};

const TREND_TEXT_CLASS: Record<StatTrendDirection, string> = {
  up: 'text-trend-up',
  down: 'text-trend-down',
  neutral: 'text-trend-neutral',
};

export function StatCard({
  label,
  value,
  trendDelta,
  trendDirection = 'neutral',
  className,
}: StatCardProps) {
  const showTrend = Boolean(trendDelta);
  const TrendIcon =
    trendDirection === 'up'
      ? ArrowUpRight
      : trendDirection === 'down'
        ? ArrowDownRight
        : null;

  return (
    <div
      data-kb-component="stat-card"
      data-kb-trend={trendDirection}
      className={cn('flex flex-col gap-2', className)}
    >
      <div className="text-[14px] font-normal leading-5 text-text-meta">{label}</div>
      <div className="flex items-center gap-2">
        <span className="text-[18px] font-medium leading-[28px] text-text-primary">{value}</span>
        {showTrend && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-[13px] font-medium leading-[19px]',
              TREND_TEXT_CLASS[trendDirection],
            )}
          >
            {TrendIcon && <TrendIcon size={14} aria-hidden="true" />}
            <span>{trendDelta}</span>
          </span>
        )}
      </div>
    </div>
  );
}
