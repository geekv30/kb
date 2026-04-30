import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Primitives/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  globals: { backgrounds: { value: 'white' } },
  args: {
    variant: 'published',
    children: 'Published',
  },
  render: (args) => <Badge {...args} />,
};
export default meta;

export const Default: StoryObj<typeof Badge> = {};
