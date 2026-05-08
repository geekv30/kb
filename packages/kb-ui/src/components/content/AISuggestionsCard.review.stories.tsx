import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { AISuggestionsCard } from './AISuggestionsCard';
import { FigmaCompare } from '../../_review/FigmaCompare';
import aiSuggestionsCardFigma from '../../../../../design/screenshots/ai-suggestions-card-pre-review.png';
import { figmaNode } from './AISuggestionsCard.figma';

const meta: Meta<typeof AISuggestionsCard> = {
  title: 'Review/Content/AISuggestionsCard',
  component: AISuggestionsCard,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function AISuggestionsCardReview() {
  return (
    <FigmaCompare
      storyKey="content-ai-suggestions-card"
      figmaImage={aiSuggestionsCardFigma}
      componentLabel="AISuggestionsCard"
      frameLabel="Figma · AI Suggestions / Pre-review"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div
        className="font-sans"
        style={{
          width: 452,
          height: 164,
        }}
      >
        <AISuggestionsCard
          mode="pre-review"
          count={3}
          summary="Refining the article with updated instruction set, updating link and by removing legacy instructions"
          onPrev={() => {}}
          onNext={() => {}}
          onReview={() => {}}
        />
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj<typeof AISuggestionsCard> = {
  render: () => <AISuggestionsCardReview />,
};
