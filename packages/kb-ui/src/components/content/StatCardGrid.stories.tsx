import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { StatCardGrid } from './StatCardGrid';
import { Button } from '../primitives/Button';

const meta: Meta<typeof StatCardGrid> = {
  title: 'Components/Charts & Stats/Stat Card Grid',
  component: StatCardGrid,
  parameters: { layout: 'padded', backgrounds: { default: 'app' } },
  args: {
    title: 'Support Performance',
    infoTooltip: 'High-level KB metrics over the selected time range.',
    stats: [
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
    ],
  },
  render: (args) => (
    <div className="bg-[#f8fafc] p-6" style={{ width: 938 }}>
      <StatCardGrid {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof StatCardGrid> = {};

export const CustomHeaderSlot: StoryObj<typeof StatCardGrid> = {
  name: 'Custom Header Slot',
  args: {
    title: 'Engagement',
    headerRight: (
      <Button variant="ghost" onClick={() => {}}>
        View all
      </Button>
    ),
  },
};
