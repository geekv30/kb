import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { StatCard } from './StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'Components/Charts & Stats/Stat Card',
  component: StatCard,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

function StatCardPlayground() {
  return (
    <div className="mx-auto w-full max-w-[320px]">
      <StatCard
        label="Total Views"
        value="112,678"
        trendDelta="+15.2%"
        trendDirection="up"
      />
    </div>
  );
}

export const Playground: StoryObj<typeof StatCard> = {
  render: () => <StatCardPlayground />,
};
