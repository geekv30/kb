import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { ArticleSettingsPanel, type ArticleSettings } from './ArticleSettingsPanel';

const CANVAS: React.CSSProperties = {
  background: '#f5f5f5',
  padding: 32,
  minHeight: 820,
};

const populatedSettings: ArticleSettings = {
  author: { name: 'Varun Kelkar', initials: 'VK' },
  category: 'Managing emails',
  slug: 'how-to-reset-your-password',
  tags: ['Security', 'Account', 'Password'],
  publishDate: 'Apr 12, 2026',
  seoTitle: 'Reset Your Password — Hiver Help',
  visibility: 'Public',
  reviewers: [
    { name: 'Ananya Kapoor', initials: 'AK' },
    { name: 'Maya Rao', initials: 'MR' },
    { name: 'Tanvi Shah', initials: 'TS' },
  ],
};

const meta: Meta<typeof ArticleSettingsPanel> = {
  title: 'Components/Article/Article Settings Panel',
  component: ArticleSettingsPanel,
  parameters: { layout: 'padded' },
  args: {
    value: populatedSettings,
    defaultCollapsed: false,
  },
  render: (args) => (
    <div style={CANVAS}>
      <ArticleSettingsPanel {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof ArticleSettingsPanel> = {};
