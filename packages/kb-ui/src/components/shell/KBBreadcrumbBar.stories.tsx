import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { KBBreadcrumbBar } from './KBBreadcrumbBar';

const meta: Meta<typeof KBBreadcrumbBar> = {
  title: 'Components/Shell/KBBreadcrumbBar',
  component: KBBreadcrumbBar,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof KBBreadcrumbBar>;

export const Category: Story = {
  render: () => (
    <div style={{ borderBottom: '1px solid #e2e8f0' }}>
      <KBBreadcrumbBar
        variant="category"
        items={[{ id: '1', label: 'Offer Multi-channel Support' }]}
      />
    </div>
  ),
};

export const Editor: Story = {
  render: () => (
    <div style={{ borderBottom: '1px solid #e2e8f0' }}>
      <KBBreadcrumbBar
        variant="editor"
        items={[
          { id: '1', label: 'Offer Multi-channel Support' },
          { id: '2', label: 'Managing emails' },
          { id: '3', label: 'Search, filter, and create email views' },
        ]}
      />
    </div>
  ),
};
