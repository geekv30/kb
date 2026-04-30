import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { HelpfulnessTag } from './HelpfulnessTag';
import { Card } from '../primitives/Card';

const meta: Meta<typeof HelpfulnessTag> = {
  title: 'Components/Article/Helpfulness Tag',
  component: HelpfulnessTag,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

type ArticleRow = {
  title: string;
  value: string;
  variant: 'up' | 'down';
};

const ARTICLES: ArticleRow[] = [
  { title: 'Reset your password', value: '91%', variant: 'up' },
  { title: 'Setting up SSO with Okta', value: '24%', variant: 'down' },
  { title: 'Migrating from Confluence to Hiver', value: '72%', variant: 'up' },
  { title: 'Legacy API removal guide', value: '12%', variant: 'down' },
  { title: 'Enabling two-factor authentication', value: '88%', variant: 'up' },
  { title: 'Bulk-importing contacts via CSV', value: '66%', variant: 'up' },
];

function HelpfulnessTagPlayground() {
  return (
    <Card padding="md" style={{ width: 480 }}>
      <h3 className="text-[14px] font-semibold text-[#0f172a] mb-3">
        Helpfulness — last 30 days
      </h3>
      <ul>
        {ARTICLES.map((article) => (
          <li
            key={article.title}
            className="flex items-center justify-between py-2"
          >
            <span className="text-[14px] text-[#0f172a]">{article.title}</span>
            <HelpfulnessTag value={article.value} variant={article.variant} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

export const Playground: StoryObj<typeof HelpfulnessTag> = {
  render: () => <HelpfulnessTagPlayground />,
};
