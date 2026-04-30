import type { Meta, StoryObj } from '@storybook/react-vite';
import { RiGitMergeLine, RiSparkling2Line } from '@remixicon/react';
import '../../tokens.css';
import {
  SuggestionCard,
  DEFAULT_SUGGESTION_KINDS,
} from './SuggestionCard';

// Mirrors the brand-pink constant in SuggestionCard.tsx so custom kinds
// register glyphs that read as part of the same visual family.
const PINK = '#D92FFF';

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

// Demonstrates the three new extension hooks: kindRegistry, meta, icon.
// First card adds a brand-new `merge-articles` kind via kindRegistry +
// passes a custom `meta` slot. Second card overrides the title icon.
export const CustomKindAndMeta: StoryObj<typeof SuggestionCard> = {
  name: 'Custom Kind & Meta',
  render: () => {
    const kindRegistry = {
      ...DEFAULT_SUGGESTION_KINDS,
      'merge-articles': {
        label: 'Merge Articles',
        icon: <RiGitMergeLine size={16} color={PINK} />,
      },
    };

    return (
      <div className="bg-white p-6 max-w-[600px] flex flex-col gap-[16px]">
        <SuggestionCard
          title="Merge duplicate Password Reset guides"
          description="Two articles cover the same flow — combining them avoids drift."
          kind="merge-articles"
          kindRegistry={kindRegistry}
          conversationCount={4}
          impact="medium"
          meta={
            <span className="text-[14px] font-medium text-[#475569]">
              Last edited 3h ago
            </span>
          }
          onClick={() => {}}
        />
        <SuggestionCard
          title="Refresh AI-suggested rewrites"
          description="Custom title icon override demonstrating the `icon` prop."
          kind="article-edit"
          icon={<RiSparkling2Line size={18} color={PINK} />}
          conversationCount={9}
          impact="high"
          onClick={() => {}}
        />
      </div>
    );
  },
};
