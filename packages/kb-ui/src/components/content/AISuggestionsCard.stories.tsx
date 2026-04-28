import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { AISuggestionsCard } from './AISuggestionsCard';

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

const meta: Meta<typeof AISuggestionsCard> = {
  title: 'Components/AI/AI Suggestions Card',
  component: AISuggestionsCard,
  parameters: { layout: 'padded' },
  args: {
    mode: 'pre-review',
    count: 3,
    summary: SUMMARY,
    onReview: () => {},
    onPrev: () => {},
    onNext: () => {},
  },
  render: (args) => (
    <div style={CANVAS}>
      <div style={RAIL}>
        <AISuggestionsCard {...args} />
      </div>
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof AISuggestionsCard> = {};
