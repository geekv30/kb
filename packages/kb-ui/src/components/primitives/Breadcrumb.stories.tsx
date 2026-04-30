import type { Meta, StoryObj } from '@storybook/react-vite';
import { RiBookmarkLine } from '@remixicon/react';
import '../../tokens.css';
import { Breadcrumb } from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Primitives/Breadcrumb',
  component: Breadcrumb,
  parameters: { layout: 'centered', backgrounds: { default: 'white' } },
  args: {
    items: [
      { id: 'home', label: 'Home', onClick: () => {} },
      { id: 'gs', label: 'Getting Started', onClick: () => {} },
      { id: 'inst', label: 'Installation', onClick: () => {} },
      { id: 'qs', label: 'Quick Start' },
    ],
  },
  render: (args) => (
    <div className="bg-white p-4">
      <Breadcrumb {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof Breadcrumb> = {};

export const CustomHomeIconAndSeparator: StoryObj<typeof Breadcrumb> = {
  name: 'Custom Home Icon and Separator',
  args: {
    items: [
      { id: 'home', label: 'Home', onClick: () => {} },
      { id: 'gs', label: 'Getting Started', onClick: () => {} },
      { id: 'inst', label: 'Installation', onClick: () => {} },
      { id: 'qs', label: 'Quick Start' },
    ],
    homeIcon: <RiBookmarkLine className="h-4 w-4" />,
    separator: <span className="text-[#94a3b8]">{'>'}</span>,
  },
};
