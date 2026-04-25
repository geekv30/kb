import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { AnalyticsDonutChart } from './AnalyticsDonutChart';

const meta: Meta<typeof AnalyticsDonutChart> = {
  title: 'Components/Content/Analytics Donut Chart',
  component: AnalyticsDonutChart,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof AnalyticsDonutChart>;

// 6 segments — matches Figma Views-by-Category 1974:53988 (verified via get_variable_defs).
const categoryData = [
  { label: 'Category 1', value: 28 },
  { label: 'Category 2', value: 22 },
  { label: 'Category 3', value: 18 },
  { label: 'Category 4', value: 14 },
  { label: 'Category 5', value: 10 },
  { label: 'Category 6', value: 8 },
];

export const Default: Story = {
  render: () => (
    <div className="bg-white p-6">
      <AnalyticsDonutChart data={categoryData} />
    </div>
  ),
};

export const WithoutLegend: Story = {
  render: () => (
    <div className="bg-white p-6">
      <AnalyticsDonutChart data={categoryData} showLegend={false} />
    </div>
  ),
};
