import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Components/Primitives/Divider',
  component: Divider,
  parameters: { layout: 'centered' },
  globals: { backgrounds: { value: 'white' } },
  args: {
    subtle: false,
  },
  render: (args) => <Divider {...args} />,
};
export default meta;

export const Default: StoryObj<typeof Divider> = {};
