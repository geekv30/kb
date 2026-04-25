import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { DateRangePill, type DateRange } from './DateRangePill';

const meta: Meta<typeof DateRangePill> = {
  title: 'Components/Content/Date Range Pill',
  component: DateRangePill,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof DateRangePill>;

export const Default7d: Story = {
  render: () => (
    <div className="bg-white p-6">
      <DateRangePill value="7d" />
    </div>
  ),
};

export const Custom30d: Story = {
  render: () => (
    <div className="bg-white p-6">
      <DateRangePill value="30d" />
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = React.useState<DateRange>('7d');
    return (
      <div className="flex flex-col items-start gap-3 bg-white p-6">
        <DateRangePill value={value} onChange={setValue} />
        <div className="text-[12px] font-mono text-[#475569]">
          current value: <span className="text-[#0f172a]">{value}</span>
        </div>
      </div>
    );
  },
};
