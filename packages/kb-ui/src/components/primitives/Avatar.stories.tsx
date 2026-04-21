import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Primitives/Avatar',
  component: Avatar,
  parameters: { layout: 'centered', backgrounds: { default: 'white' } },
};
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = { args: { initials: 'VK' } };
export const WithStatus: Story = { args: { initials: 'VK', showStatus: true } };
export const MultipleAvatars: Story = {
  render: () => (
    <div className="flex gap-3 p-4">
      <Avatar initials="VK" showStatus />
      <Avatar initials="AB" />
      <Avatar initials="JD" showStatus />
    </div>
  ),
};
