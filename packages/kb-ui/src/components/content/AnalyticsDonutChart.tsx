import * as React from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * AnalyticsDonutChart — Recharts pie wrapper used for the
 * "Views by Category" surface. Defaults to 224 px diameter and
 * renders as a full pie (ringThickness 0) with 6 segments to
 * match Figma frame 1974:53988. Pass a non-zero `ringThickness`
 * to opt into a donut style.
 *
 * Legend rows render as a sibling flex column to the chart.
 * Pass `showLegend={false}` for a chart-only render.
 * ───────────────────────────────────────────────────────────── */

export type DonutDatum = {
  /** Display label in legend (and tooltip). */
  label: string;
  /** Numeric value driving slice angle. */
  value: number;
  /** Optional explicit color override. Default: rotate through donut-1..6. */
  color?: string;
};

export type AnalyticsDonutChartProps = {
  /** Typically 6 entries (Figma); palette rotates donut-1..6, then falls back to donut-1. */
  data: DonutDatum[];
  /** Render diameter in px. Default 224 (matches Figma). */
  size?: number;
  /** Thickness of the ring as fraction of radius. Default 0 → full pie (matches Figma). Pass e.g. 0.42 for a donut. */
  ringThickness?: number;
  /** Show side legend. Default true. */
  showLegend?: boolean;
  className?: string;
};

const DONUT_PALETTE = [
  'var(--color-donut-1)',
  'var(--color-donut-2)',
  'var(--color-donut-3)',
  'var(--color-donut-4)',
  'var(--color-donut-5)',
  'var(--color-donut-6)',
];

function colorFor(d: DonutDatum, index: number): string {
  if (d.color) return d.color;
  return DONUT_PALETTE[index] ?? DONUT_PALETTE[0];
}

export function AnalyticsDonutChart({
  data,
  size = 224,
  ringThickness = 0,
  showLegend = true,
  className,
}: AnalyticsDonutChartProps) {
  const outerRadius = size / 2;
  const innerRadius = (size * (1 - ringThickness)) / 2;

  return (
    <div
      data-kb-component="analytics-donut-chart"
      className={cn('flex items-center gap-8', className)}
    >
      <div style={{ width: size, height: size, flexShrink: 0 }}>
        <PieChart width={size} height={size}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={90}
            endAngle={-270}
            stroke="none"
            isAnimationActive={false}
          >
            {data.map((d, i) => (
              <Cell key={`${d.label}-${i}`} fill={colorFor(d, i)} />
            ))}
          </Pie>
        </PieChart>
      </div>

      {showLegend && (
        <ul className="flex flex-col gap-3">
          {data.map((d, i) => (
            <li
              key={`${d.label}-${i}`}
              className="flex items-center gap-2"
            >
              <span
                aria-hidden="true"
                style={{ backgroundColor: colorFor(d, i) }}
                className="inline-block h-1.5 w-1.5 rounded-full"
              />
              <span className="text-chart-body text-[14px] font-normal leading-5">
                {d.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
