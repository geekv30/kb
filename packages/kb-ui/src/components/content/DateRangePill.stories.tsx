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

export const CustomPresets: StoryObj<typeof DateRangePill> = {
  name: 'Custom Presets',
  args: {
    value: 'today' as never,
    presets: [
      { value: 'today', label: 'Today' },
      { value: 'yesterday', label: 'Yesterday' },
      { value: 'this-quarter', label: 'This Quarter' },
    ],
  },
};
