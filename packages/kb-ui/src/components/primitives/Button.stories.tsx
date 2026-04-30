import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { RiAddLine } from '@remixicon/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Primitives/Button',
  component: Button,
  parameters: { layout: 'centered' },
  globals: { backgrounds: { value: 'white' } },
  args: {
    variant: 'primary',
    children: 'New',
    disabled: false,
  },
  render: (args) => <Button {...args} icon={<RiAddLine size={14} />} />,
};
export default meta;

export const Default: StoryObj<typeof Button> = {};
