import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { DateRangePill } from './DateRangePill';

const meta: Meta<typeof DateRangePill> = {
  title: 'Components/Layout/Date Range Pill',
  component: DateRangePill,
  parameters: { layout: 'centered' },
  args: {
    value: '7d',
  },
  render: (args) => (
    <div className="bg-white p-6">
      <DateRangePill {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof DateRangePill> = {};
