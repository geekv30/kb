import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Primitives/Badge',
  component: Badge,
  parameters: { layout: 'centered', backgrounds: { default: 'white' } },
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const Published: Story = {
  render: () => <Badge variant="published">Published</Badge>,
};
export const Draft: Story = { render: () => <Badge variant="draft">Draft</Badge> };
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-1 p-4 items-center">
      <Badge variant="published">Published</Badge>
      <Badge variant="draft">Draft</Badge>
      <Badge variant="neutral">Neutral</Badge>
    </div>
  ),
};
