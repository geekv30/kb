import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Breadcrumb } from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Primitives/Breadcrumb',
  component: Breadcrumb,
  parameters: { layout: 'centered', backgrounds: { default: 'white' } },
};
export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  render: () => (
    <Breadcrumb
      items={[
        { id: 'home', label: 'Home', onClick: () => {} },
        { id: 'gs', label: 'Getting Started', onClick: () => {} },
        { id: 'inst', label: 'Installation', onClick: () => {} },
        { id: 'qs', label: 'Quick Start' },
      ]}
    />
  ),
};
// Figma variant: `Breadcrumb` set Levels=1 — home icon + single current-page pill.
export const Levels1: Story = {
  render: () => (
    <Breadcrumb
      items={[
        { id: 'home', label: 'Home', onClick: () => {} },
        { id: 'overview', label: 'Overview' },
      ]}
    />
  ),
};
// Figma variant: `Breadcrumb` set Levels=2 — home + 1 clickable crumb + current pill.
export const Levels2: Story = {
  render: () => (
    <Breadcrumb
      items={[
        { id: 'home', label: 'Home', onClick: () => {} },
        { id: 'docs', label: 'Documentation', onClick: () => {} },
        { id: 'api', label: 'API Reference' },
      ]}
    />
  ),
};
// Figma variant: `Breadcrumb` set Levels=3 — home + 2 clickable crumbs + current pill.
export const Levels3: Story = {
  render: () => (
    <Breadcrumb
      items={[
        { id: 'home', label: 'Home', onClick: () => {} },
        { id: 'product', label: 'Product', onClick: () => {} },
        { id: 'inbox', label: 'Shared Inbox', onClick: () => {} },
        { id: 'assign', label: 'Assigning conversations' },
      ]}
    />
  ),
};
