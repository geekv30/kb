import type { Meta, StoryObj } from '@storybook/react-vite';
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
