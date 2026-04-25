import type { Meta, StoryObj } from '@storybook/react';
import {
  ArticlePerformanceTable,
  type ArticlePerformanceRow,
} from './ArticlePerformanceTable';

const meta: Meta<typeof ArticlePerformanceTable> = {
  title: 'Components/Content/Article Performance Table',
  component: ArticlePerformanceTable,
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj<typeof ArticlePerformanceTable>;

const ROWS: ArticlePerformanceRow[] = [
  {
    id: '1',
    title: 'Syncing past emails while cr...',
    category: 'Getting Started',
    totalViews: '11,200',
    avgTimeSpent: '02m : 45s',
    helpfulness: '91%',
    helpfulnessVariant: 'up',
  },
  {
    id: '2',
    title: 'How to Sync Previous Emails...',
    category: 'Understanding the Basics',
    totalViews: '11,200',
    avgTimeSpent: '02m : 45s',
    helpfulness: '91%',
    helpfulnessVariant: 'down',
  },
  {
    id: '3',
    title: 'Setting Up a New Shared Ma...',
    category: 'Advanced Techniques',
    totalViews: '11,200',
    avgTimeSpent: '02m : 45s',
    helpfulness: '91%',
    helpfulnessVariant: 'up',
  },
  {
    id: '4',
    title: 'Creating a New Shared Mail...',
    category: 'Best Practices',
    totalViews: '11,200',
    avgTimeSpent: '02m : 45s',
    helpfulness: '91%',
    helpfulnessVariant: 'down',
  },
];

export const Default: Story = {
  render: () => (
    <div style={{ width: 890 }}>
      <ArticlePerformanceTable rows={ROWS} />
    </div>
  ),
};
