import type { Meta, StoryObj } from '@storybook/react';
import {
  ContentGapsTable,
  type ContentGapRow,
} from './ContentGapsTable';

const meta: Meta<typeof ContentGapsTable> = {
  title: 'Components/Content/Content Gaps Table',
  component: ContentGapsTable,
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj<typeof ContentGapsTable>;

const TOPICS = [
  'Cancel Subscription / account deletion',
  'Mobile app availability',
  'Dark mode / UI customisation',
] as const;

const ROWS: ContentGapRow[] = Array.from({ length: 12 }, (_, idx) => {
  const isLast = idx === 11;
  return {
    id: String(idx + 1),
    topic: TOPICS[idx % 3]!,
    frequency: isLast ? '852' : String(11201 + idx),
    ticketRate: idx === 0 ? '45%' : '50%',
  };
});

export const Default: Story = {
  render: () => (
    <div style={{ width: 890 }}>
      <ContentGapsTable rows={ROWS} />
    </div>
  ),
};
