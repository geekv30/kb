import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { ArticleBody } from './ArticleBody';

const meta: Meta<typeof ArticleBody> = {
  title: 'Components/Article/Article Body',
  component: ArticleBody,
  parameters: { layout: 'padded' },
  args: {
    decisions: { s1: 'inactive', s2: 'inactive', s3: 'inactive' },
  },
  render: (args) => (
    <div style={{ background: '#f5f5f5', padding: 32 }}>
      <ArticleBody {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof ArticleBody> = {};
