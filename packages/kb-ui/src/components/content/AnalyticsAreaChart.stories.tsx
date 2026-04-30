import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { AnalyticsAreaChart } from './AnalyticsAreaChart';
import { Card } from '../primitives/Card';

/* 30-day daily article-views series for a Hiver KB org.
 * - Weekdays trend ~4600–7400 with mid-week peaks (Tue–Wed).
 * - Weekends drop to ~2400–3300 (B2B usage profile).
 * - Slight upward trend across the month (org adoption growing).
 * - `unique` tracks ~38–42% of total views.
 *
 * Dates are Apr 1 (Wed) → Apr 30 (Thu), 2026.
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

const meta: Meta<typeof AnalyticsAreaChart> = {
  title: 'Components/Charts & Stats/Analytics Area Chart',
  component: AnalyticsAreaChart,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

function AnalyticsAreaChartPlayground() {
  return (
    <Card padding="md" style={{ width: 720 }}>
      <h3 className="text-[14px] font-semibold text-[#0f172a] mb-4">
        Article views — last 30 days
      </h3>
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
    </Card>
  );
}

export const Playground: StoryObj<typeof AnalyticsAreaChart> = {
  render: () => <AnalyticsAreaChartPlayground />,
};
