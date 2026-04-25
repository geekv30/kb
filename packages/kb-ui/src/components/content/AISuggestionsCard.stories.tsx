import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { AISuggestionsCard } from './AISuggestionsCard';

const meta: Meta<typeof AISuggestionsCard> = {
  title: 'Components/Content/AI Suggestions Card',
  component: AISuggestionsCard,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof AISuggestionsCard>;

/**
 * The rail is intended to live in a 320–380px column. The preview
 * canvas mimics the editor's right rail to keep widths realistic.
 */
const CANVAS: React.CSSProperties = {
  background: '#f5f5f5',
  padding: 32,
  minHeight: 420,
};

const RAIL: React.CSSProperties = {
  width: 354,
};

const SUMMARY =
  'Refining the article with updated instruction set, updating link and by removing legacy instructions';

export const PreReview: Story = {
  render: () => (
    <div style={CANVAS}>
      <div style={RAIL}>
        <AISuggestionsCard
          mode="pre-review"
          count={3}
          summary={SUMMARY}
          onReview={() => {
            // eslint-disable-next-line no-console
            console.log('[AISuggestionsCard] Review clicked');
          }}
          onPrev={() => {
            // eslint-disable-next-line no-console
            console.log('[AISuggestionsCard] Prev clicked');
          }}
          onNext={() => {
            // eslint-disable-next-line no-console
            console.log('[AISuggestionsCard] Next clicked');
          }}
        />
      </div>
    </div>
  ),
};

export const Terminal: Story = {
  render: () => (
    <div style={CANVAS}>
      <div style={RAIL}>
        <AISuggestionsCard
          mode="terminal"
          count={3}
          summary={SUMMARY}
          onPrev={() => {
            // eslint-disable-next-line no-console
            console.log('[AISuggestionsCard] Prev clicked');
          }}
          onNext={() => {
            // eslint-disable-next-line no-console
            console.log('[AISuggestionsCard] Next clicked');
          }}
        />
      </div>
    </div>
  ),
};
