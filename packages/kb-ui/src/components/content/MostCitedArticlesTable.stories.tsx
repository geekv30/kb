import type { Meta, StoryObj } from '@storybook/react';
import {
  MostCitedArticlesTable,
  type MostCitedRow,
} from './MostCitedArticlesTable';

const meta: Meta<typeof MostCitedArticlesTable> = {
  title: 'Components/Content/Most Cited Articles Table',
  component: MostCitedArticlesTable,
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj<typeof MostCitedArticlesTable>;

const ROWS: MostCitedRow[] = [
  {
    id: '1',
    title: 'Syncing past emails while creating a new Shared Mailbox',
    citations: 224,
  },
  {
    id: '2',
    title: 'Importing Previous Emails When Setting Up a New Shared Mailbox',
    citations: 128,
  },
  {
    id: '3',
    title: 'Importing Previous Emails When Setting Up a New Shared Mailbox',
    citations: 88,
  },
  {
    id: '4',
    title: 'Importing Previous Emails When Setting Up a New Shared Mailbox',
    citations: 64,
  },
  {
    id: '5',
    title: 'Importing Previous Emails When Setting Up a New Shared Mailbox',
    citations: 22,
  },
];

export const Default: Story = {
  render: () => (
    <div style={{ width: 890 }}>
      <MostCitedArticlesTable rows={ROWS} />
    </div>
  ),
};
