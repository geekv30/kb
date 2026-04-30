import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { AnalyticsDonutChart } from './AnalyticsDonutChart';
import { Card } from '../primitives/Card';

const categoryData = [
  { label: 'Getting Started', value: 28 },
  { label: 'Account & Billing', value: 22 },
  { label: 'Integrations', value: 18 },
  { label: 'Email Workflow', value: 14 },
  { label: 'Reporting & Analytics', value: 10 },
  { label: 'Other', value: 8 },
];

const meta: Meta<typeof AnalyticsDonutChart> = {
  title: 'Components/Charts & Stats/Analytics Donut Chart',
  component: AnalyticsDonutChart,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

function AnalyticsDonutChartPlayground() {
  return (
    <Card padding="md" style={{ width: 560 }}>
      <h3 className="text-[14px] font-semibold text-[#0f172a] mb-3">
        Views by Category — last 30 days
      </h3>
      <AnalyticsDonutChart data={categoryData} showLegend={true} />
    </Card>
  );
}

export const Playground: StoryObj<typeof AnalyticsDonutChart> = {
  render: () => <AnalyticsDonutChartPlayground />,
};
