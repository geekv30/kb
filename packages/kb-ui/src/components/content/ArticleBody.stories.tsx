import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { ArticleBody } from './ArticleBody';

const meta: Meta<typeof ArticleBody> = {
  title: 'Components/Content/Article Body',
  component: ArticleBody,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof ArticleBody>;

/**
 * AllInactive — the three suggestion blocks are rendered as highlight
 * regions (green / red+green / red). Matches the "initial review" article
 * state used by frame 2 of the AI Gaps flow.
 */
export const AllInactive: Story = {
  render: () => (
    <div style={{ background: '#f5f5f5', padding: 32 }}>
      <ArticleBody
        decisions={{ s1: 'inactive', s2: 'inactive', s3: 'inactive' }}
      />
    </div>
  ),
};

/**
 * AllAccepted — terminal state after every suggestion is accepted:
 *  - Addition becomes plain body copy (kept).
 *  - Replace shows only the new URL paragraph.
 *  - Troubleshooting section is removed.
 */
export const AllAccepted: Story = {
  render: () => (
    <div style={{ background: '#f5f5f5', padding: 32 }}>
      <ArticleBody
        decisions={{ s1: 'accepted', s2: 'accepted', s3: 'accepted' }}
      />
    </div>
  ),
};
