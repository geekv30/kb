import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { SuggestionCard } from './SuggestionCard';

const meta: Meta<typeof SuggestionCard> = {
  title: 'Components/AI/Suggestion Card',
  component: SuggestionCard,
  parameters: { layout: 'padded' },
  args: {
    title: 'How to reset Password',
    description: 'Updating reset instructions, legacy URL and removing outdated instructions',
    kind: 'article-edit',
    conversationCount: 12,
    impact: 'high',
    pathFrom: 'Billing',
    pathTo: 'Reimbursements',
    onClick: () => {},
  },
  render: (args) => (
    <div className="bg-white p-6 max-w-[600px]">
      <SuggestionCard {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof SuggestionCard> = {};
