import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { AnalyticsAreaChart } from './AnalyticsAreaChart';
import { AnalyticsChartCard } from './AnalyticsChartCard';
import { AnalyticsDonutChart } from './AnalyticsDonutChart';

const meta: Meta<typeof AnalyticsChartCard> = {
  title: 'Components/Content/Analytics Chart Card',
  component: AnalyticsChartCard,
  parameters: { layout: 'padded', backgrounds: { default: 'app' } },
};
export default meta;
type Story = StoryObj<typeof AnalyticsChartCard>;

const articleViewsData = [
  { x: 'mon', views: 4200, unique: 1800 },
  { x: 'tue', views: 5300, unique: 2200 },
  { x: 'wed', views: 5100, unique: 2400 },
  { x: 'fri', views: 7400, unique: 2900 },
  { x: 'sat', views: 8900, unique: 3300 },
  { x: 'sun', views: 9600, unique: 3500 },
];

const aiDeflectionData = [
  { x: 'mon', rate: 18 },
  { x: 'tue', rate: 24 },
  { x: 'wed', rate: 30 },
  { x: 'fri', rate: 42 },
  { x: 'sat', rate: 48 },
  { x: 'sun', rate: 55 },
];

const categoryData = [
  { label: 'Category 1', value: 35 },
  { label: 'Category 2', value: 20 },
  { label: 'Category 3', value: 18 },
  { label: 'Category 4', value: 15 },
  { label: 'Category 5', value: 12 },
];

export const WithChart: Story = {
  render: () => (
    <div className="bg-[#f8fafc] p-6" style={{ width: 720 }}>
      <AnalyticsChartCard
        title="Article views over time"
        infoTooltip="Total and unique views per day across the selected range."
      >
        <AnalyticsAreaChart
          data={articleViewsData}
          xKey="x"
          series={[
            { name: 'Total Views', dataKey: 'views', variant: 'views' },
            { name: 'Unique Views', dataKey: 'unique', variant: 'unique' },
          ]}
          yTicks={[0, 3000, 6000, 9000, 12000]}
        />
      </AnalyticsChartCard>
    </div>
  ),
};

export const WithGoalLine: Story = {
  render: () => (
    <div className="bg-[#f8fafc] p-6" style={{ width: 720 }}>
      <AnalyticsChartCard
        title="AI deflection rate over time"
        infoTooltip="Share of AI conversations that did not require a support ticket."
        subtitle="% of AI conversations that did not result in a support ticket"
      >
        <AnalyticsAreaChart
          data={aiDeflectionData}
          xKey="x"
          series={[
            { name: 'Deflection rate', dataKey: 'rate', variant: 'positive' },
          ]}
          yTicks={[0, 25, 50, 75, 100]}
          yTickFormat={(v) => `${v}`}
          goalLine={{ y: 70, label: 'Goal : 70%' }}
          showLegend={false}
        />
      </AnalyticsChartCard>
    </div>
  ),
};

export const WithDonut: Story = {
  render: () => (
    <div className="bg-[#f8fafc] p-6" style={{ width: 480 }}>
      <AnalyticsChartCard
        title="Views by Category"
        infoTooltip="Distribution of views across top categories."
      >
        <AnalyticsDonutChart data={categoryData} />
      </AnalyticsChartCard>
    </div>
  ),
};
