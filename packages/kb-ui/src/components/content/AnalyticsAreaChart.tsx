import * as React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * AnalyticsAreaChart — Recharts wrapper used by every line/area
 * chart on the analytics surfaces. Supports 1 or 2 series, an
 * optional dashed goal-line annotation, caller-controlled y-ticks,
 * and a custom legend rendered as plain JSX (Recharts' built-in
 * legend is harder to align with the rest of our chart legends).
 *
 * Series colors and area-wash gradients are driven off the
 * `chart-*` design tokens (see `tokens.css`).
 *
 * Gradient `<linearGradient id>`s are scoped to a `useId()` so
 * multiple chart instances on the same page do not collide.
 * ───────────────────────────────────────────────────────────── */

export type AreaSeriesKey = 'views' | 'unique' | 'positive' | (string & {});

export const DEFAULT_SERIES_PALETTE: Record<string, string> = {
  views: 'var(--color-chart-views)',
  unique: 'var(--color-chart-unique)',
  positive: 'var(--color-chart-positive)',
};

export type AnalyticsAreaSeries = {
  /** Display name in legend + tooltip. */
  name: string;
  /** dataKey from the data array. */
  dataKey: string;
  /** Color preset — maps to chart-* tokens. */
  variant: AreaSeriesKey;
};

export type AnalyticsAreaChartGoalLine = {
  /** y-axis value at which the dashed line sits. */
  y: number;
  /** Label rendered at the right end of the line, e.g. "Goal : 70%". */
  label: string;
};

export type AnalyticsAreaChartProps = {
  /** Array of `{ x: string, [seriesKey]: number, ... }` rows. */
  data: Array<Record<string, string | number>>;
  /** dataKey for the x axis (typically `'x'`). */
  xKey: string;
  /** Series definitions — 1 or 2 series. */
  series: [AnalyticsAreaSeries] | [AnalyticsAreaSeries, AnalyticsAreaSeries];
  /** Optional dashed goal-line annotation. */
  goalLine?: AnalyticsAreaChartGoalLine;
  /** Y-axis tick values — caller controls. e.g. `[0, 3000, 6000, 9000, 12000]`. */
  yTicks?: number[];
  /** Format y-axis tick. Defaults to `(v) => v >= 1000 ? `${v / 1000}k` : `${v}`. */
  yTickFormat?: (value: number) => string;
  /** X-axis tick values — caller controls which `xKey` values render a label.
   *  Use when the data has more points than visible labels (e.g. weekday-only
   *  axis on a daily series). When omitted, every `xKey` value renders. */
  xTicks?: string[];
  /** Show legend below chart. Default true. */
  showLegend?: boolean;
  /** Render height in px. Default 280. */
  height?: number;
  className?: string;
  seriesPalette?: Record<string, string>;
};

const defaultYTickFormat = (v: number): string =>
  v >= 1000 ? `${v / 1000}k` : `${v}`;

/* GoalLineLabel — custom Recharts label rendered as a dark pill at the
 * top-right of the chart with white text + a small connector dot anchored
 * to the dashed goal line. Matches Figma AI-deflection-rate 1974:53443.
 *
 * Recharts passes the chart viewBox via `props.viewBox` when used as a
 * function-as-label on `<ReferenceLine>`. The viewBox can technically be
 * Cartesian or Polar; for area charts it is always Cartesian. We narrow
 * defensively and bail out if any required field is missing. */
type GoalLineLabelProps = {
  value: string;
  viewBox?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
};

const GoalLineLabel: React.FC<GoalLineLabelProps> = ({ value, viewBox }) => {
  if (
    !viewBox ||
    typeof viewBox.x !== 'number' ||
    typeof viewBox.y !== 'number' ||
    typeof viewBox.width !== 'number'
  ) {
    return null;
  }
  const labelW = 96;
  const labelH = 24;
  const padding = 12;
  const x = viewBox.x + viewBox.width - labelW - padding;
  const y = viewBox.y - labelH / 2;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={labelW}
        height={labelH}
        rx={6}
        ry={6}
        fill="var(--color-chart-goal-label-bg)"
      />
      <circle
        cx={x - 4}
        cy={y + labelH / 2}
        r={3}
        fill="var(--color-chart-goal-line)"
      />
      <text
        x={x + labelW / 2}
        y={y + labelH / 2 + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
        fontWeight={500}
        fill="white"
      >
        {value}
      </text>
    </g>
  );
};

export function AnalyticsAreaChart({
  data,
  xKey,
  series,
  goalLine,
  yTicks,
  yTickFormat,
  xTicks,
  showLegend = true,
  height = 280,
  className,
  seriesPalette,
}: AnalyticsAreaChartProps) {
  const palette = seriesPalette ?? DEFAULT_SERIES_PALETTE;
  const colorFor = (seriesKey: AreaSeriesKey): string =>
    palette[seriesKey] ?? '#94a3b8';
  // Scope gradient ids per instance to avoid collisions when multiple
  // charts render on the same page (Recharts gradients are pulled by
  // `url(#id)` from the document — duplicate ids = wrong fills).
  const reactId = React.useId();
  // useId can produce ids with `:` chars on some React versions —
  // strip them so they are SVG-id-safe.
  const gradientIdFor = React.useCallback(
    (variant: AreaSeriesKey) => `area-${variant}-${reactId.replace(/:/g, '')}`,
    [reactId],
  );

  const tickFormat = yTickFormat ?? defaultYTickFormat;

  return (
    <div
      data-kb-component="analytics-area-chart"
      className={cn('flex w-full flex-col', className)}
    >
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 12, right: 16, bottom: 0, left: 0 }}
          >
            <defs>
              {series.map((s) => (
                <linearGradient
                  key={s.variant}
                  id={gradientIdFor(s.variant)}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={colorFor(s.variant)} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={colorFor(s.variant)} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={true}
            />
            <XAxis
              dataKey={xKey}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              interval={0}
              tick={
                xTicks
                  ? (props: {
                      x?: number;
                      y?: number;
                      payload?: { value?: string };
                    }) => {
                      const value = props.payload?.value ?? '';
                      if (!xTicks.includes(value)) return <g />;
                      return (
                        <text
                          x={props.x}
                          y={props.y}
                          dy={12}
                          textAnchor="middle"
                          fill="var(--color-chart-body)"
                          fontSize={12}
                        >
                          {value}
                        </text>
                      );
                    }
                  : { fill: 'var(--color-chart-body)', fontSize: 12 }
              }
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              tick={{ fill: 'var(--color-chart-body)', fontSize: 12 }}
              {...(yTicks ? { ticks: yTicks, domain: [yTicks[0], yTicks[yTicks.length - 1]] } : {})}
              tickFormatter={tickFormat}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e5e5e5',
                boxShadow:
                  '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.10)',
              }}
              labelStyle={{ color: '#0f172a', fontWeight: 500 }}
            />
            {series.map((s) => (
              <Area
                key={s.dataKey}
                type="monotone"
                name={s.name}
                dataKey={s.dataKey}
                stroke={colorFor(s.variant)}
                fill={`url(#${gradientIdFor(s.variant)})`}
                fillOpacity={1}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
            {goalLine && (
              <ReferenceLine
                y={goalLine.y}
                stroke="var(--color-chart-goal-line)"
                strokeDasharray="6 4"
                label={(props: { viewBox?: GoalLineLabelProps['viewBox'] }) => (
                  <GoalLineLabel
                    value={goalLine.label}
                    viewBox={props.viewBox}
                  />
                )}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {showLegend && (
        <div className="mt-3 flex items-center gap-4">
          {series.map((s) => (
            <div key={s.dataKey} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                style={{ backgroundColor: colorFor(s.variant) }}
                className="inline-block h-1 w-1 rounded-[1px]"
              />
              <span className="text-chart-body text-[12px] font-normal leading-4">
                {s.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
