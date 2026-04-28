import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { AnalyticsAreaChart } from './AnalyticsAreaChart';
import { AnalyticsChartCard } from './AnalyticsChartCard';

const articleViewsData = [
  { x: 'mon', views: 4200, unique: 1800 },
  { x: 'tue', views: 5300, unique: 2200 },
  { x: 'wed', views: 5100, unique: 2400 },
  { x: 'fri', views: 7400, unique: 2900 },
  { x: 'sat', views: 8900, unique: 3300 },
  { x: 'sun', views: 9600, unique: 3500 },
];

const meta: Meta<typeof AnalyticsChartCard> = {
  title: 'Components/Charts & Stats/Analytics Chart Card',
  component: AnalyticsChartCard,
  parameters: { layout: 'padded', backgrounds: { default: 'app' } },
  args: {
    title: 'Article views over time',
    infoTooltip: 'Total and unique views per day across the selected range.',
    subtitle: '',
  },
  render: (args) => (
    <div className="bg-[#f8fafc] p-6" style={{ width: 720 }}>
      <AnalyticsChartCard {...args}>
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
export default meta;

export const Default: StoryObj<typeof AnalyticsChartCard> = {};
