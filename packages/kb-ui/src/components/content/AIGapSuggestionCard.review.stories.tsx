import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { AIGapSuggestionCard } from './AIGapSuggestionCard';
import type { AISuggestion } from './ai-suggestion-types';
import { FigmaCompare } from '../../_review/FigmaCompare';
import activeAdditionFigmaImg from '../../../../../design/screenshots/ai-gap-active-addition.png';
import activeReplaceFigmaImg from '../../../../../design/screenshots/ai-gap-active-replace.png';
import activeRemovalFigmaImg from '../../../../../design/screenshots/ai-gap-active-removal.png';
import acceptedAdditionFigmaImg from '../../../../../design/screenshots/ai-gap-accepted-addition.png';
import dismissedReplaceFigmaImg from '../../../../../design/screenshots/ai-gap-dismissed-replace.png';
import { figmaNode as activeAdditionFigma } from './AIGapSuggestionCard.active-addition.figma';
import { figmaNode as activeReplaceFigma } from './AIGapSuggestionCard.active-replace.figma';
import { figmaNode as activeRemovalFigma } from './AIGapSuggestionCard.active-removal.figma';
import { figmaNode as acceptedAdditionFigma } from './AIGapSuggestionCard.accepted-addition.figma';
import { figmaNode as dismissedReplaceFigma } from './AIGapSuggestionCard.dismissed-replace.figma';

const meta: Meta<typeof AIGapSuggestionCard> = {
  title: 'Review/Content/AIGapSuggestionCard',
  component: AIGapSuggestionCard,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

/* Realistic suggestions — content matches the Figma raster exactly so the
 * rendered pane and the Figma pane are an apples-to-apples comparison. */
const additionSuggestion: AISuggestion = {
  id: 'sug-addition',
  type: 'addition',
  title: 'Mobile app password reset instructions',
  description:
    'Add detailed mobile app password reset instructions with proper steps and bullet points',
  sourceCount: 4,
};

const replaceSuggestion: AISuggestion = {
  id: 'sug-replace',
  type: 'replace',
  title: 'SSO Reset Instructions',
  description: 'Update the admin panel URL for SSO password resets',
  sourceCount: 4,
};

const removalSuggestion: AISuggestion = {
  id: 'sug-removal',
  type: 'removal',
  title: 'Legacy Instructions',
  description:
    'Remove outdated reference to the old Chrome extension reset flow and steps',
  sourceCount: 4,
};

const noop = () => {};

/* Per-story renderer keeps each card sized to its Figma cell so visual
 * comparison is 1:1 (active = 196 / 176 tall, collapsed = 76). */
function CardReview({
  storyKey,
  componentLabel,
  frameLabel,
  figmaImage,
  figmaNodeUrl,
  width,
  height,
  children,
}: {
  storyKey: string;
  componentLabel: string;
  frameLabel: string;
  figmaImage: string;
  figmaNodeUrl: string;
  width: number;
  height: number;
  children: React.ReactNode;
}) {
  return (
    <FigmaCompare
      storyKey={storyKey}
      figmaImage={figmaImage}
      componentLabel={componentLabel}
      frameLabel={frameLabel}
      figmaNodeUrl={figmaNodeUrl}
    >
      <div
        className="font-sans"
        style={{ width, height, padding: 0 }}
      >
        {children}
      </div>
    </FigmaCompare>
  );
}

function makeFigmaUrl(node: {
  fileKey: string;
  nodeId: string;
}): string {
  return `https://www.figma.com/design/${node.fileKey}/?node-id=${node.nodeId.replace(':', '-')}`;
}

export const ActiveAddition: StoryObj<typeof AIGapSuggestionCard> = {
  render: () => (
    <CardReview
      storyKey="content-aigap-active-addition"
      componentLabel="AIGapSuggestionCard"
      frameLabel="Figma · type=addition, state=default"
      figmaImage={activeAdditionFigmaImg}
      figmaNodeUrl={makeFigmaUrl(activeAdditionFigma)}
      width={452}
      height={196}
    >
      <AIGapSuggestionCard
        suggestion={additionSuggestion}
        state="active"
        onPrev={noop}
        onNext={noop}
        onAccept={noop}
        onReject={noop}
        onUndo={noop}
        onOpenSources={noop}
      />
    </CardReview>
  ),
};

export const ActiveReplace: StoryObj<typeof AIGapSuggestionCard> = {
  render: () => (
    <CardReview
      storyKey="content-aigap-active-replace"
      componentLabel="AIGapSuggestionCard"
      frameLabel="Figma · type=replace, state=default"
      figmaImage={activeReplaceFigmaImg}
      figmaNodeUrl={makeFigmaUrl(activeReplaceFigma)}
      width={452}
      height={176}
    >
      <AIGapSuggestionCard
        suggestion={replaceSuggestion}
        state="active"
        onPrev={noop}
        onNext={noop}
        onAccept={noop}
        onReject={noop}
        onUndo={noop}
        onOpenSources={noop}
      />
    </CardReview>
  ),
};

export const ActiveRemoval: StoryObj<typeof AIGapSuggestionCard> = {
  render: () => (
    <CardReview
      storyKey="content-aigap-active-removal"
      componentLabel="AIGapSuggestionCard"
      frameLabel="Figma · type=removal, state=default"
      figmaImage={activeRemovalFigmaImg}
      figmaNodeUrl={makeFigmaUrl(activeRemovalFigma)}
      width={452}
      height={196}
    >
      <AIGapSuggestionCard
        suggestion={removalSuggestion}
        state="active"
        onPrev={noop}
        onNext={noop}
        onAccept={noop}
        onReject={noop}
        onUndo={noop}
        onOpenSources={noop}
      />
    </CardReview>
  ),
};

export const AcceptedAddition: StoryObj<typeof AIGapSuggestionCard> = {
  render: () => (
    <CardReview
      storyKey="content-aigap-accepted-addition"
      componentLabel="AIGapSuggestionCard"
      frameLabel="Figma · type=addition, state=accepted"
      figmaImage={acceptedAdditionFigmaImg}
      figmaNodeUrl={makeFigmaUrl(acceptedAdditionFigma)}
      width={452}
      height={76}
    >
      <AIGapSuggestionCard
        suggestion={additionSuggestion}
        state="accepted"
        onUndo={noop}
      />
    </CardReview>
  ),
};

export const DismissedReplace: StoryObj<typeof AIGapSuggestionCard> = {
  render: () => (
    <CardReview
      storyKey="content-aigap-dismissed-replace"
      componentLabel="AIGapSuggestionCard"
      frameLabel="Figma · type=replace, state=dismissed"
      figmaImage={dismissedReplaceFigmaImg}
      figmaNodeUrl={makeFigmaUrl(dismissedReplaceFigma)}
      width={452}
      height={76}
    >
      <AIGapSuggestionCard
        suggestion={replaceSuggestion}
        state="dismissed"
        onUndo={noop}
      />
    </CardReview>
  ),
};
