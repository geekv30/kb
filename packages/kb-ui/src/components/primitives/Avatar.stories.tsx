import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Primitives/Avatar',
  component: Avatar,
  parameters: { layout: 'centered', backgrounds: { default: 'white' } },
  args: {
    initials: 'VK',
    showStatus: false,
  },
  render: (args) => (
    <div className="bg-white p-4">
      <Avatar {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof Avatar> = {};

export const WithImage: StoryObj<typeof Avatar> = {
  name: 'With Image',
  args: {
    src: 'https://i.pravatar.cc/64?img=12',
    name: 'Anjali Kumar',
    initials: 'AK',
  },
};
