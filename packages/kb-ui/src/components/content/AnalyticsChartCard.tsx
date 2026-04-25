import * as React from 'react';
import { RiInformationLine } from '@remixicon/react';
import { Card, type CardPadding } from '../primitives/Card';
import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * AnalyticsChartCard — composition wrapper used by every chart
 * instance on the analytics pages. Wraps `Card` and provides
 * a standard header (title + optional ⓘ + optional subtitle +
 * optional right slot) above the chart children.
 *
 * Padding: defaults to `lg` (32 px) — matches Figma's chart cards
 * (e.g. `1974:53443`). Confirm vs Figma if this looks off in a
 * specific instance.
 * ───────────────────────────────────────────────────────────── */

export type AnalyticsChartCardProps = React.PropsWithChildren<{
  title: string;
  /** ⓘ tooltip text (rendered as `title` attr on the info icon). */
  infoTooltip?: string;
  /** Small subtitle below title (e.g. "% of AI conversations…"). */
  subtitle?: string;
  /** Right-side header slot — used by Frame 6 dropdown ("Sort by"). */
  headerRight?: React.ReactNode;
  className?: string;
  /** Card padding override. Default `lg` (32 px). */
  padding?: CardPadding;
}>;

export function AnalyticsChartCard({
  title,
  infoTooltip,
  subtitle,
  headerRight,
  className,
  padding,
  children,
}: AnalyticsChartCardProps) {
  return (
    <Card
      padding={padding ?? 'lg'}
      data-kb-component="analytics-chart-card"
      className={className}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[14px] font-medium leading-5 text-[#0f172a]">
              {title}
            </h3>
            {infoTooltip && (
              <span
                className="inline-flex"
                title={infoTooltip}
                aria-label={infoTooltip}
              >
                <RiInformationLine
                  size={16}
                  className="text-[#64758b]"
                  aria-hidden="true"
                />
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[12px] font-normal leading-4 text-[#64758b]">
              {subtitle}
            </p>
          )}
        </div>
        {headerRight && (
          <div className={cn('flex shrink-0 items-center')}>{headerRight}</div>
        )}
      </div>
      {children}
    </Card>
  );
}
