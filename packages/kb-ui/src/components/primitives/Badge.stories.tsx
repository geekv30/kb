import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Primitives/Badge',
  component: Badge,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

const ARTICLES: Array<{
  title: string;
  status: 'Published' | 'Draft' | 'Archived';
  variant: 'published' | 'draft' | 'neutral';
}> = [
  {
    title: 'How to reset your password',
    status: 'Published',
    variant: 'published',
  },
  { title: 'Setting up SSO', status: 'Draft', variant: 'draft' },
  {
    title: 'Migrating from Confluence',
    status: 'Archived',
    variant: 'neutral',
  },
  {
    title: 'Hiver KB onboarding checklist',
    status: 'Published',
    variant: 'published',
  },
];

function BadgePlayground() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3 font-sans">
      {ARTICLES.map((article) => (
        <div
          key={article.title}
          className="flex items-center justify-between"
        >
          <span className="text-[14px] text-[#0f172a]">{article.title}</span>
          <Badge variant={article.variant}>{article.status}</Badge>
        </div>
      ))}
    </div>
  );
}

export const Playground: StoryObj<typeof Badge> = {
  render: () => <BadgePlayground />,
};
