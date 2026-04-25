import type { Meta, StoryObj } from '@storybook/react';
import {
  SearchKeywordsTable,
  type SearchKeywordRow,
} from './SearchKeywordsTable';

const meta: Meta<typeof SearchKeywordsTable> = {
  title: 'Components/Content/Search Keywords Table',
  component: SearchKeywordsTable,
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj<typeof SearchKeywordsTable>;

const ROWS: SearchKeywordRow[] = [
  { id: '1', keyword: '1. password reset', count: '11200' },
  { id: '2', keyword: '2. billing duplicate charges', count: '1200' },
  { id: '3', keyword: '3. slack integration', count: '200' },
  { id: '4', keyword: '4. export data', count: '20' },
  { id: '5', keyword: '5. gmail addon install', count: '2' },
];

export const Default: Story = {
  render: () => (
    <div style={{ width: 890 }}>
      <SearchKeywordsTable rows={ROWS} />
    </div>
  ),
};
