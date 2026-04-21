import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { ArticleSettingsPanel, type ArticleSettings } from './ArticleSettingsPanel';

const meta: Meta<typeof ArticleSettingsPanel> = {
  title: 'Components/Content/ArticleSettingsPanel',
  component: ArticleSettingsPanel,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof ArticleSettingsPanel>;

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

export const Default: Story = {
  render: () => (
    <div style={CANVAS}>
      <ArticleSettingsPanel value={populatedSettings} />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div style={CANVAS}>
      <ArticleSettingsPanel value={{}} />
    </div>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <div style={CANVAS}>
      <ArticleSettingsPanel value={populatedSettings} defaultCollapsed />
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const InteractiveInner = () => {
      const [value, setValue] = React.useState<ArticleSettings>(populatedSettings);
      return (
        <div style={CANVAS}>
          <ArticleSettingsPanel
            value={value}
            onChange={(v) => {
              // eslint-disable-next-line no-console
              console.log('[ArticleSettingsPanel] change', v);
              setValue(v);
            }}
          />
          <pre
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 8,
              background: '#0f172a',
              color: '#e2e8f0',
              fontSize: 12,
              lineHeight: '18px',
              maxWidth: 452,
              whiteSpace: 'pre-wrap',
            }}
          >
            {JSON.stringify(value, null, 2)}
          </pre>
        </div>
      );
    };
    return <InteractiveInner />;
  },
};
