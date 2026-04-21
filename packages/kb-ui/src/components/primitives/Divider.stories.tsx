import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Components/Primitives/Divider',
  component: Divider,
  parameters: { layout: 'centered', backgrounds: { default: 'white' } },
};
export default meta;
type Story = StoryObj<typeof Divider>;

export const Default: Story = {
  render: () => (
    <div className="w-64 p-4">
      <Divider />
    </div>
  ),
};
export const Subtle: Story = {
  render: () => (
    <div className="w-64 p-4">
      <Divider subtle />
    </div>
  ),
};
