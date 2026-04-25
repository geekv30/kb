import type { Meta, StoryObj } from '@storybook/react';
import {
  ArticlesNeedsAttentionTable,
  type ArticleAttentionRow,
} from './ArticlesNeedsAttentionTable';

const meta: Meta<typeof ArticlesNeedsAttentionTable> = {
  title: 'Components/Content/Articles Needs Attention Table',
  component: ArticlesNeedsAttentionTable,
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj<typeof ArticlesNeedsAttentionTable>;

const ROWS: ArticleAttentionRow[] = [
  {
    id: '1',
    title: 'Syncing past emails while creating',
    helpfulness: '24%',
    variant: 'down',
  },
  {
    id: '2',
    title: 'How to Sync Previous Emails Whe...',
    helpfulness: '31%',
    variant: 'down',
  },
  {
    id: '3',
    title: 'Setting Up a New Shared Mailbox:',
    helpfulness: '91%',
    variant: 'up',
  },
  {
    id: '4',
    title: 'Creating a New Shared Mailbox? H...',
    helpfulness: '95%',
    variant: 'up',
  },
];

export const Default: Story = {
  render: () => (
    <div style={{ width: 437 }}>
      <ArticlesNeedsAttentionTable rows={ROWS} />
    </div>
  ),
};
