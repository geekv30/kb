import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { DateRangePill, type DateRange } from './DateRangePill';

const meta: Meta<typeof DateRangePill> = {
  title: 'Components/Layout/Date Range Pill',
  component: DateRangePill,
  parameters: { layout: 'centered' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

function DateRangePillPlayground() {
  const [value, setValue] = React.useState<DateRange>('7d');

  return <DateRangePill value={value} onChange={(v) => setValue(v)} />;
}

export const Playground: StoryObj<typeof DateRangePill> = {
  render: () => <DateRangePillPlayground />,
};
