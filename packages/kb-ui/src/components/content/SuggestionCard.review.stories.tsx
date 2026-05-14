import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { SuggestionCard } from './SuggestionCard';
import { FigmaCompare } from '../../_review/FigmaCompare';
import suggestionCardFigma from '../../../../../design/screenshots/suggestion-card.png';
import { figmaNode } from './SuggestionCard.figma';

const meta: Meta<typeof SuggestionCard> = {
  title: 'Review/Content/SuggestionCard',
  component: SuggestionCard,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function SuggestionCardReview() {
  return (
    <FigmaCompare
      storyKey="content-suggestion-card"
      figmaImage={suggestionCardFigma}
      componentLabel="SuggestionCard"
      frameLabel="Figma · AI Optimise hub cards"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div
        className="font-sans flex flex-col"
        style={{
          width: 624,
          height: 292,
          gap: 16,
        }}
      >
        <SuggestionCard
          title="How to reset Password"
          description="Updating reset instructions, legacy URL and removing oudated instructions"
          kind="article-edit"
          suggestionCount={3}
          conversationCount={12}
          impact="high"
        />
        <SuggestionCard
          title="How to enable two-factor authentication"
          description="AI will write an article on how to enable two-factor authentication under security > SSO"
          kind="new-article"
          suggestionCount={4}
          conversationCount={15}
          impact="medium"
        />
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj<typeof SuggestionCard> = {
  render: () => <SuggestionCardReview />,
};
