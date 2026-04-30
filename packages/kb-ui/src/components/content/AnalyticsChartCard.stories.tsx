import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { AnalyticsAreaChart } from './AnalyticsAreaChart';
import { AnalyticsChartCard } from './AnalyticsChartCard';
import { DateRangePill, type DateRange } from './DateRangePill';

/* 30-day daily article-views series — shared shape with the
 * AnalyticsAreaChart story. Apr 1 (Wed) → Apr 30 (Thu), 2026.
 *
 * Weekday peaks (Tue–Wed mid-month), B2B weekend dips, slight upward
 * trend across the month. `unique` ≈ 38–42% of `views`.
 */
const articleViewsData = [
  { x: 'Apr 1', views: 4800, unique: 1920 },
  { x: 'Apr 2', views: 5100, unique: 2040 },
  { x: 'Apr 3', views: 4600, unique: 1850 },
  { x: 'Apr 4', views: 2700, unique: 1080 },
  { x: 'Apr 5', views: 2400, unique: 980 },
  { x: 'Apr 6', views: 5200, unique: 2080 },
  { x: 'Apr 7', views: 6100, unique: 2440 },
  { x: 'Apr 8', views: 6400, unique: 2560 },
  { x: 'Apr 9', views: 5800, unique: 2320 },
  { x: 'Apr 10', views: 4900, unique: 1960 },
  { x: 'Apr 11', views: 2900, unique: 1160 },
  { x: 'Apr 12', views: 2600, unique: 1040 },
  { x: 'Apr 13', views: 5500, unique: 2200 },
  { x: 'Apr 14', views: 6300, unique: 2520 },
  { x: 'Apr 15', views: 6800, unique: 2720 },
  { x: 'Apr 16', views: 6500, unique: 2600 },
  { x: 'Apr 17', views: 5200, unique: 2080 },
  { x: 'Apr 18', views: 3100, unique: 1240 },
  { x: 'Apr 19', views: 2800, unique: 1120 },
  { x: 'Apr 20', views: 5900, unique: 2360 },
  { x: 'Apr 21', views: 6700, unique: 2680 },
  { x: 'Apr 22', views: 7200, unique: 2880 },
  { x: 'Apr 23', views: 6900, unique: 2760 },
  { x: 'Apr 24', views: 5600, unique: 2240 },
  { x: 'Apr 25', views: 3300, unique: 1320 },
  { x: 'Apr 26', views: 3000, unique: 1200 },
  { x: 'Apr 27', views: 6200, unique: 2480 },
  { x: 'Apr 28', views: 7100, unique: 2840 },
  { x: 'Apr 29', views: 7400, unique: 2960 },
  { x: 'Apr 30', views: 7000, unique: 2800 },
];

const meta: Meta<typeof AnalyticsChartCard> = {
  title: 'Components/Charts & Stats/Analytics Chart Card',
  component: AnalyticsChartCard,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

function AnalyticsChartCardPlayground() {
  // Wire a real interactive DateRangePill into headerRight so the
  // composition demo isn't just static — the manager can click the
  // pill and watch the selection toggle. Chart data stays at 30 days
  // regardless of pill state; this story showcases composition, not
  // data filtering.
  const [range, setRange] = React.useState<DateRange>('30d');

  return (
    <div style={{ width: 720 }}>
      <AnalyticsChartCard
        title="Article views over time"
        subtitle="Total and unique views across all knowledge-base articles, broken down per day."
        infoTooltip="Drag the date range pill in the upper-right to compare windows. Hover any point for exact counts."
        headerRight={<DateRangePill value={range} onChange={setRange} />}
      >
        <AnalyticsAreaChart
          data={articleViewsData}
          xKey="x"
          series={[
            { name: 'Total Views', dataKey: 'views', variant: 'views' },
            { name: 'Unique Views', dataKey: 'unique', variant: 'unique' },
          ]}
          yTicks={[0, 2000, 4000, 6000, 8000, 10000]}
          showLegend={true}
        />
      </AnalyticsChartCard>
    </div>
  );
}

export const Playground: StoryObj<typeof AnalyticsChartCard> = {
  render: () => <AnalyticsChartCardPlayground />,
};
