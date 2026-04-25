import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { StatCardGrid } from './StatCardGrid';

const meta: Meta<typeof StatCardGrid> = {
  title: 'Components/Content/Stat Card Grid',
  component: StatCardGrid,
  parameters: { layout: 'padded', backgrounds: { default: 'app' } },
};
export default meta;
type Story = StoryObj<typeof StatCardGrid>;

export const SupportPerformance: Story = {
  render: () => (
    <div className="bg-[#f8fafc] p-6" style={{ width: 938 }}>
      <StatCardGrid
        title="Support Performance"
        infoTooltip="High-level KB metrics over the selected time range."
        stats={[
          { label: 'Total Views', value: '112,678', trendDelta: '+15%', trendDirection: 'up' },
          { label: 'Total Searches', value: '321,950', trendDelta: '+15%', trendDirection: 'up' },
          {
            label: 'Missed Search Rate',
            value: '70.2%',
            trendDelta: '+15%',
            trendDirection: 'up',
          },
          {
            label: 'AI Deflection Rate',
            value: '19.8%',
            trendDelta: '+12%',
            trendDirection: 'down',
          },
        ]}
      />
    </div>
  ),
};

export const AISearchPerformance: Story = {
  render: () => (
    <div className="bg-[#f8fafc] p-6" style={{ width: 938 }}>
      <StatCardGrid
        title="AI Search Performance"
        infoTooltip="AI-driven KB search and answer metrics."
        stats={[
          { label: 'Total AI Queries', value: '112,678', trendDelta: '+15%', trendDirection: 'up' },
          { label: 'Answer Rate', value: '321,950', trendDelta: '+15%', trendDirection: 'up' },
          { label: 'Helpfulness Rate', value: '70.2%', trendDelta: '+15%', trendDirection: 'up' },
          {
            label: 'Deflection Rate',
            value: '19.8%',
            trendDelta: '+12%',
            trendDirection: 'down',
          },
        ]}
      />
    </div>
  ),
};
