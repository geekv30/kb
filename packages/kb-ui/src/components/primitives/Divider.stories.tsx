import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Components/Primitives/Divider',
  component: Divider,
  parameters: { layout: 'centered', backgrounds: { default: 'white' } },
  args: {
    subtle: false,
  },
  render: (args) => (
    <div className="w-64 p-4 bg-white">
      <Divider {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof Divider> = {};
