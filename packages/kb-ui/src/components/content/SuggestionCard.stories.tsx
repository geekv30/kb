import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { SuggestionCard } from './SuggestionCard';

const meta: Meta<typeof SuggestionCard> = {
  title: 'Components/Content/Suggestion Card',
  component: SuggestionCard,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof SuggestionCard>;

export const Default: Story = {
  render: () => (
    <div className="bg-white p-6 max-w-[600px]">
      <SuggestionCard
        title="How to reset Password"
        description="Updating reset instructions, legacy URL and removing outdated instructions"
        kind="article-edit"
        conversationCount={12}
        impact="high"
        onClick={() => console.log('card clicked')}
      />
    </div>
  ),
};

export const NewArticle: Story = {
  render: () => (
    <div className="bg-white p-6 max-w-[600px]">
      <SuggestionCard
        title="How to enable two-factor authentication"
        description="AI will write an article on how to enable two-factor authentication under security > SSO"
        kind="new-article"
        conversationCount={15}
        impact="medium"
        onClick={() => console.log('card clicked')}
      />
    </div>
  ),
};

export const MoveArticle: Story = {
  render: () => (
    <div className="bg-white p-6 max-w-[600px]">
      <SuggestionCard
        title="How to process reimbursements"
        description="Moving this article from billing to reimbursements"
        kind="move-article"
        pathFrom="Billing"
        pathTo="Reimbursements"
        conversationCount={8}
        impact="low"
        onClick={() => console.log('card clicked')}
      />
    </div>
  ),
};

export const Stack: Story = {
  render: () => (
    <div className="bg-white p-6 max-w-[600px] flex flex-col gap-[16px]">
      <SuggestionCard
        title="How to reset Password"
        description="Updating reset instructions, legacy URL and removing outdated instructions"
        kind="article-edit"
        conversationCount={12}
        impact="high"
        onClick={() => console.log('card 1')}
      />
      <SuggestionCard
        title="How to enable two-factor authentication"
        description="AI will write an article on how to enable two-factor authentication under security > SSO"
        kind="new-article"
        conversationCount={15}
        impact="medium"
        onClick={() => console.log('card 2')}
      />
      <SuggestionCard
        title="How to process reimbursements"
        description="Moving this article from billing to reimbursements"
        kind="move-article"
        pathFrom="Billing"
        pathTo="Reimbursements"
        conversationCount={8}
        impact="low"
        onClick={() => console.log('card 3')}
      />
    </div>
  ),
};
