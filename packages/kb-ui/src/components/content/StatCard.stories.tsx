import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { StatCard } from './StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'Components/Content/Stat Card',
  component: StatCard,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  render: () => (
    <div className="bg-white p-6">
      <StatCard label="Total Views" value="112,678" trendDelta="+15%" trendDirection="up" />
    </div>
  ),
};

export const Down: Story = {
  render: () => (
    <div className="bg-white p-6">
      <StatCard
        label="AI Deflection Rate"
        value="19.8%"
        trendDelta="+12%"
        trendDirection="down"
      />
    </div>
  ),
};

export const Neutral: Story = {
  render: () => (
    <div className="bg-white p-6">
      <StatCard
        label="Active Categories"
        value="42"
        trendDelta="0%"
        trendDirection="neutral"
      />
    </div>
  ),
};

export const WithoutTrend: Story = {
  render: () => (
    <div className="bg-white p-6">
      <StatCard label="Total Articles" value="1,284" />
    </div>
  ),
};
