import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { RiAddLine } from '@remixicon/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Primitives/Button',
  component: Button,
  parameters: { layout: 'centered', backgrounds: { default: 'white' } },
  args: {
    variant: 'primary',
    children: 'New',
    disabled: false,
  },
  render: (args) => (
    <div className="bg-white p-6 rounded-lg">
      <Button {...args} icon={<RiAddLine size={14} />} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof Button> = {};
