import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Primitives/Badge',
  component: Badge,
  parameters: { layout: 'centered', backgrounds: { default: 'white' } },
  args: {
    variant: 'published',
    children: 'Published',
  },
  render: (args) => (
    <div className="bg-white p-4">
      <Badge {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof Badge> = {};
