import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { ArticlesTable } from './ArticlesTable';
import { SubCategoriesTable } from './SubCategoriesTable';

const meta: Meta<typeof ArticlesTable> = {
  title: 'Components/Content/ArticlesTable',
  component: ArticlesTable,
  parameters: { layout: 'padded', backgrounds: { default: 'canvas' } },
};
export default meta;
type Story = StoryObj<typeof ArticlesTable>;

const subCats = [
  { id: 'onboarding', title: 'Onboarding', articleCount: 4 },
  { id: 'billing', title: 'Billing & Subscriptions', articleCount: 7 },
  { id: 'integrations', title: 'Integrations', articleCount: 12 },
];

const articles = [
  {
    id: 'a1',
    title: 'How to set up your first workspace',
    status: 'published' as const,
    authorInitials: 'RM',
    lastUpdated: 'Apr 12, 2026 · 3:42 PM',
  },
  {
    id: 'a2',
    title: 'Invite teammates and assign roles',
    status: 'draft' as const,
    authorInitials: 'SK',
    lastUpdated: 'Apr 10, 2026 · 11:08 AM',
  },
  {
    id: 'a3',
    title: 'Understanding your billing cycle',
    status: 'published' as const,
    authorInitials: 'JL',
    lastUpdated: 'Apr 08, 2026 · 9:15 AM',
  },
  {
    id: 'a4',
    title: 'Connect Slack for real-time alerts',
    status: 'draft' as const,
    authorInitials: 'MP',
    lastUpdated: 'Apr 03, 2026 · 4:27 PM',
  },
];

export const Default: Story = {
  render: () => (
    <div style={{ background: '#f5f5f5', padding: 24, minHeight: '100vh' }}>
      <div className="flex flex-col gap-4 max-w-[1080px]">
        <SubCategoriesTable items={subCats} />
        <ArticlesTable articles={articles} />
      </div>
    </div>
  ),
};
