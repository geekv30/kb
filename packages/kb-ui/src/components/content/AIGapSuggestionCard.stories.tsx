import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { AIGapSuggestionCard } from './AIGapSuggestionCard';
import type { AISuggestion } from './ai-suggestion-types';

const CANVAS: React.CSSProperties = {
  background: '#f5f5f5',
  padding: 32,
  minHeight: 260,
};

const RAIL: React.CSSProperties = {
  width: 354,
};

const DEFAULT_SUGGESTION: AISuggestion = {
  id: 'sug-1',
  type: 'addition',
  title: 'Mobile app password reset instructions',
  description:
    'Add detailed mobile app password reset instructions with proper steps and bullet points',
  sourceCount: 4,
};

const meta: Meta<typeof AIGapSuggestionCard> = {
  title: 'Components/AI/AI Gap Suggestion Card',
  component: AIGapSuggestionCard,
  parameters: { layout: 'padded' },
  args: {
    suggestion: DEFAULT_SUGGESTION,
    state: 'active',
    onPrev: () => {},
    onNext: () => {},
    onOpenSources: () => {},
    onAccept: () => {},
    onReject: () => {},
    onUndo: () => {},
  },
  render: (args) => (
    <div style={CANVAS}>
      <div style={RAIL}>
        <AIGapSuggestionCard {...args} />
      </div>
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof AIGapSuggestionCard> = {};

export const CustomActionsMetaAndLabels: StoryObj<typeof AIGapSuggestionCard> = {
  name: 'Custom Actions, Meta & Labels',
  render: (args) => (
    <div style={CANVAS}>
      <div style={RAIL}>
        <AIGapSuggestionCard
          {...args}
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
    </div>
  ),
};
