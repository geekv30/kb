import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { AIGapSuggestionCard } from './AIGapSuggestionCard';
import type { AISuggestion } from './ai-suggestion-types';

const meta: Meta<typeof AIGapSuggestionCard> = {
  title: 'Components/Content/AI Gap Suggestion Card',
  component: AIGapSuggestionCard,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof AIGapSuggestionCard>;

const CANVAS: React.CSSProperties = {
  background: '#f5f5f5',
  padding: 32,
  minHeight: 260,
};

const RAIL: React.CSSProperties = {
  width: 354,
};

const addition: AISuggestion = {
  id: 'sug-1',
  type: 'addition',
  title: 'Mobile app password reset instructions',
  description:
    'Add detailed mobile app password reset instructions with proper steps and bullet points',
  sourceCount: 4,
};

const replace: AISuggestion = {
  id: 'sug-2',
  type: 'replace',
  title: 'SSO Reset Instructions',
  description: 'Update the admin panel URL for SSO password resets.',
  sourceCount: 4,
};

const removal: AISuggestion = {
  id: 'sug-3',
  type: 'removal',
  title: 'Legacy Instructions',
  description:
    'Remove outdated reference to the old Chrome extension reset flow and steps',
  sourceCount: 4,
};

/* ── Active states ─────────────────────────────────────────── */

export const ActiveAddition: Story = {
  render: () => (
    <div style={CANVAS}>
      <div style={RAIL}>
        <AIGapSuggestionCard
          suggestion={addition}
          state="active"
          onPrev={() => console.log('[AIGapSuggestionCard] prev')}
          onNext={() => console.log('[AIGapSuggestionCard] next')}
          onOpenSources={(id) => console.log('[AIGapSuggestionCard] sources', id)}
          onAccept={(id) => console.log('[AIGapSuggestionCard] accept', id)}
          onReject={(id) => console.log('[AIGapSuggestionCard] reject', id)}
        />
      </div>
    </div>
  ),
};

export const ActiveReplace: Story = {
  render: () => (
    <div style={CANVAS}>
      <div style={RAIL}>
        <AIGapSuggestionCard
          suggestion={replace}
          state="active"
          onPrev={() => console.log('[AIGapSuggestionCard] prev')}
          onNext={() => console.log('[AIGapSuggestionCard] next')}
          onOpenSources={(id) => console.log('[AIGapSuggestionCard] sources', id)}
          onAccept={(id) => console.log('[AIGapSuggestionCard] accept', id)}
          onReject={(id) => console.log('[AIGapSuggestionCard] reject', id)}
        />
      </div>
    </div>
  ),
};

export const ActiveRemoval: Story = {
  render: () => (
    <div style={CANVAS}>
      <div style={RAIL}>
        <AIGapSuggestionCard
          suggestion={removal}
          state="active"
          onPrev={() => console.log('[AIGapSuggestionCard] prev')}
          onNext={() => console.log('[AIGapSuggestionCard] next')}
          onOpenSources={(id) => console.log('[AIGapSuggestionCard] sources', id)}
          onAccept={(id) => console.log('[AIGapSuggestionCard] accept', id)}
          onReject={(id) => console.log('[AIGapSuggestionCard] reject', id)}
        />
      </div>
    </div>
  ),
};

/* ── Chip states ───────────────────────────────────────────── */

export const AcceptedAddition: Story = {
  render: () => (
    <div style={CANVAS}>
      <div style={RAIL}>
        <AIGapSuggestionCard
          suggestion={addition}
          state="accepted"
          onUndo={(id) => console.log('[AIGapSuggestionCard] undo', id)}
        />
      </div>
    </div>
  ),
};

export const DismissedReplace: Story = {
  render: () => (
    <div style={CANVAS}>
      <div style={RAIL}>
        <AIGapSuggestionCard
          suggestion={replace}
          state="dismissed"
          onUndo={(id) => console.log('[AIGapSuggestionCard] undo', id)}
        />
      </div>
    </div>
  ),
};
