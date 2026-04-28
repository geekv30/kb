import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { StatCard } from './StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'Components/Charts & Stats/Stat Card',
  component: StatCard,
  parameters: { layout: 'padded' },
  args: {
    label: 'Total Views',
    value: '112,678',
    trendDelta: '+15%',
    trendDirection: 'up',
  },
  render: (args) => (
    <div className="bg-white p-6">
      <StatCard {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof StatCard> = {};
