import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { AIGapSuggestionCard } from './AIGapSuggestionCard';
import type { AISuggestion } from './ai-suggestion-types';

/* ─────────────────────────────────────────────────────────────
 * AIGapSuggestionCard Playground — sidebar rail with three
 * stacked cards covering the full surface area:
 *   1. Active   — default extension, mobile password reset
 *   2. Accepted — terminal state for a removal suggestion
 *   3. Active   — every extension slot used (meta chip,
 *                 custom action, custom decision labels)
 * 354px rail width matches the editor's right rail in prod.
 * ───────────────────────────────────────────────────────────── */

const SUGGESTION_ADDITION: AISuggestion = {
  id: 'sug-1',
  type: 'addition',
  title: 'Mobile app password reset instructions',
  description:
    'Add detailed mobile app password reset instructions with proper steps and bullet points',
  sourceCount: 4,
};

const SUGGESTION_REMOVAL: AISuggestion = {
  id: 'sug-2',
  type: 'removal',
  title: 'Outdated Confluence migration steps',
  description:
    'Remove the legacy Confluence-to-Hiver migration paragraph — content moved to a dedicated guide last quarter.',
  sourceCount: 2,
};

const SUGGESTION_FLAGGED: AISuggestion = {
  id: 'sug-3',
  type: 'addition',
  title: 'Two-factor authentication setup walkthrough',
  description:
    'Add a step-by-step walkthrough for configuring 2FA across both web and mobile clients.',
  sourceCount: 7,
};

const meta: Meta<typeof AIGapSuggestionCard> = {
  title: 'Components/AI/AI Gap Suggestion Card',
  component: AIGapSuggestionCard,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

function AIGapSuggestionCardPlayground() {
  return (
    <div className="w-[354px] flex flex-col gap-4">
      <AIGapSuggestionCard
        suggestion={SUGGESTION_ADDITION}
        state="active"
        onPrev={() => {}}
        onNext={() => {}}
        onOpenSources={() => {}}
        onAccept={() => {}}
        onReject={() => {}}
        onUndo={() => {}}
      />
      <AIGapSuggestionCard
        suggestion={SUGGESTION_REMOVAL}
        state="accepted"
        onPrev={() => {}}
        onNext={() => {}}
        onOpenSources={() => {}}
        onAccept={() => {}}
        onReject={() => {}}
        onUndo={() => {}}
      />
      <AIGapSuggestionCard
        suggestion={SUGGESTION_FLAGGED}
        state="active"
        onPrev={() => {}}
        onNext={() => {}}
        onOpenSources={() => {}}
        onAccept={() => {}}
        onReject={() => {}}
        onUndo={() => {}}
        meta={
          <span className="inline-flex h-[20px] items-center rounded-full bg-[#fef3c7] px-2 text-[11px] font-medium text-[#92400e]">
            FLAGGED
          </span>
        }
        actions={
          <button
            type="button"
            onClick={() => {}}
            className="text-[12px] font-medium text-[#475569] underline"
          >
            Flag for compliance review
          </button>
        }
        decisionLabels={{ accepted: 'APPROVED', dismissed: 'REJECTED' }}
      />
    </div>
  );
}

export const Playground: StoryObj<typeof AIGapSuggestionCard> = {
  render: () => <AIGapSuggestionCardPlayground />,
};
