import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { StatCardGrid } from './StatCardGrid';
import { DateRangePill, type DateRange } from './DateRangePill';

const meta: Meta<typeof StatCardGrid> = {
  title: 'Components/Charts & Stats/Stat Card Grid',
  component: StatCardGrid,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

function StatCardGridPlayground() {
  const [range, setRange] = React.useState<DateRange>('30d');

  return (
    <StatCardGrid
      title="Support Performance — Last 30 days"
      infoTooltip="Volume, search quality, and deflection metrics for your knowledge base across the selected window."
      stats={[
        { label: 'Total Views', value: '112,678', trendDelta: '+15%', trendDirection: 'up' },
        { label: 'Total Searches', value: '321,950', trendDelta: '+8%', trendDirection: 'up' },
        { label: 'Missed Search Rate', value: '70.2%', trendDelta: '+2.1%', trendDirection: 'up' },
        { label: 'AI Deflection Rate', value: '19.8%', trendDelta: '−3%', trendDirection: 'down' },
      ]}
      headerRight={<DateRangePill value={range} onChange={(v) => setRange(v)} />}
    />
  );
}

export const Playground: StoryObj<typeof StatCardGrid> = {
  render: () => <StatCardGridPlayground />,
};
