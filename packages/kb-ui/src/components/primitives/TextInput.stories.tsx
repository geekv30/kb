import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { TextInput } from './TextInput';
import { Avatar } from './Avatar';

const meta: Meta<typeof TextInput> = {
  title: 'Components/Primitives/TextInput',
  component: TextInput,
  parameters: { layout: 'centered', backgrounds: { default: 'white' } },
};
export default meta;
type Story = StoryObj<typeof TextInput>;

export const Empty: Story = {
  render: () => (
    <div className="w-80 p-4">
      <TextInput placeholder="Enter value..." />
    </div>
  ),
};
export const WithValue: Story = {
  render: () => (
    <div className="w-80 p-4">
      <TextInput value="article-default-slug" />
    </div>
  ),
};
export const WithPrefix: Story = {
  render: () => (
    <div className="w-80 p-4">
      <TextInput value="Varun K" prefix={<Avatar initials="VK" />} />
    </div>
  ),
};
export const WithCharCount: Story = {
  render: () => (
    <div className="w-80 p-4">
      <TextInput value="article-default-slug" charCount={{ current: 14, max: 32 }} />
    </div>
  ),
};
export const Disabled: Story = {
  render: () => (
    <div className="w-80 p-4">
      <TextInput value="Disabled input" disabled />
    </div>
  ),
};
