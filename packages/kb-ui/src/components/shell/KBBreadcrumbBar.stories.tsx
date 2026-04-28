import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { KBBreadcrumbBar } from './KBBreadcrumbBar';

const meta: Meta<typeof KBBreadcrumbBar> = {
  title: 'Components/Navigation/KB Breadcrumb Bar',
  component: KBBreadcrumbBar,
  parameters: { layout: 'fullscreen' },
  args: {
    variant: 'editor',
    sidebarCollapsed: false,
    publishDisabled: false,
    items: [
      { id: '1', label: 'Offer Multi-channel Support' },
      { id: '2', label: 'Managing emails' },
      { id: '3', label: 'Search, filter, and create email views' },
    ],
  },
  render: (args) => (
    <div style={{ borderBottom: '1px solid #e2e8f0' }}>
      <KBBreadcrumbBar {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof KBBreadcrumbBar> = {};
