import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { AnalyticsAreaChart } from './AnalyticsAreaChart';

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

const meta: Meta<typeof AnalyticsAreaChart> = {
  title: 'Components/Charts & Stats/Analytics Area Chart',
  component: AnalyticsAreaChart,
  parameters: { layout: 'padded' },
  args: {
    data: articleViewsData,
    xKey: 'x',
    series: [
      { name: 'Total Views', dataKey: 'views', variant: 'views' },
      { name: 'Unique Views', dataKey: 'unique', variant: 'unique' },
    ],
    yTicks: [0, 3000, 6000, 9000, 12000],
    showLegend: true,
  },
  render: (args) => (
    <div style={{ width: 720 }} className="bg-white p-6">
      <AnalyticsAreaChart {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof AnalyticsAreaChart> = {};

export const CustomPalette: StoryObj<typeof AnalyticsAreaChart> = {
  name: 'Custom Palette',
  args: {
    data: articleViewsData,
    xKey: 'x',
    series: [{ name: 'Churn', dataKey: 'views', variant: 'churn' }],
    seriesPalette: { churn: '#ef4444' },
    yTicks: [0, 3000, 6000, 9000, 12000],
    showLegend: true,
  },
};
