import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { AnalyticsAreaChart } from './AnalyticsAreaChart';

const meta: Meta<typeof AnalyticsAreaChart> = {
  title: 'Components/Content/Analytics Area Chart',
  component: AnalyticsAreaChart,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof AnalyticsAreaChart>;

/*
 * Hardcoded analytics data. 7 weekday points, but Figma renders
 * only mon/tue/wed/fri/sat/sun ticks — "thu" omitted to match the
 * design (intentional weekday gap, not a data omission).
 */
const articleViewsData = [
  { x: 'mon', views: 4200, unique: 1800 },
  { x: 'tue', views: 5300, unique: 2200 },
  { x: 'wed', views: 5100, unique: 2400 },
  { x: 'fri', views: 7400, unique: 2900 },
  { x: 'sat', views: 8900, unique: 3300 },
  { x: 'sun', views: 9600, unique: 3500 },
];

const searchVolumeData = [
  { x: 'mon', searches: 3200 },
  { x: 'tue', searches: 3500 },
  { x: 'wed', searches: 4100 },
  { x: 'fri', searches: 7800 },
  { x: 'sat', searches: 8400 },
  { x: 'sun', searches: 6200 },
];

export const TwoSeries: Story = {
  render: () => (
    <div style={{ width: 720 }} className="bg-white p-6">
      <AnalyticsAreaChart
        data={articleViewsData}
        xKey="x"
        series={[
          { name: 'Total Views', dataKey: 'views', variant: 'views' },
          { name: 'Unique Views', dataKey: 'unique', variant: 'unique' },
        ]}
        yTicks={[0, 3000, 6000, 9000, 12000]}
      />
    </div>
  ),
};

export const OneSeriesPositive: Story = {
  render: () => (
    <div style={{ width: 360 }} className="bg-white p-6">
      <AnalyticsAreaChart
        data={searchVolumeData}
        xKey="x"
        series={[
          { name: 'Searches', dataKey: 'searches', variant: 'unique' },
        ]}
        yTicks={[0, 3000, 6000, 9000, 12000]}
        showLegend={false}
      />
    </div>
  ),
};

export const WithGoalLine: Story = {
  render: () => (
    <div style={{ width: 360 }} className="bg-white p-6">
      <AnalyticsAreaChart
        data={[
          { x: 'mon', positive: 18 },
          { x: 'tue', positive: 24 },
          { x: 'wed', positive: 30 },
          { x: 'fri', positive: 42 },
          { x: 'sat', positive: 48 },
          { x: 'sun', positive: 55 },
        ]}
        xKey="x"
        series={[
          { name: 'AI Deflection Rate', dataKey: 'positive', variant: 'positive' },
        ]}
        yTicks={[0, 25, 50, 75, 100]}
        yTickFormat={(v: number) => `${v}`}
        goalLine={{ y: 70, label: 'Goal : 70%' }}
        showLegend={false}
      />
    </div>
  ),
};
