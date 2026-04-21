import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Dropdown } from './Dropdown';
import { Avatar } from './Avatar';
import { Divider } from './Divider';

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Primitives/Dropdown',
  component: Dropdown,
  parameters: { layout: 'centered', backgrounds: { default: 'white' } },
};
export default meta;
type Story = StoryObj<typeof Dropdown>;

export const Category: Story = {
  render: () => (
    <div className="w-80 p-4">
      <Dropdown label="Category" value="Hiver in Incognito" />
    </div>
  ),
};
export const Author: Story = {
  render: () => (
    <div className="w-80 p-4">
      <Dropdown label="Author" value="Varun K" prefix={<Avatar initials="VK" />} />
    </div>
  ),
};
export const ArticleSlug: Story = {
  render: () => (
    <div className="w-80 p-4">
      <Dropdown label="Article Slug" value="article-default-slug" charCount={{ current: 14, max: 32 }} />
    </div>
  ),
};
export const SettingsPanel: Story = {
  render: () => (
    <div className="flex flex-col gap-5 rounded-xl border border-[#f1f5f9] bg-white p-6 shadow-md w-[452px]">
      <p className="text-[14px] font-medium text-[#334155]">Settings</p>
      <Divider />
      <Dropdown label="Author" value="Varun K" prefix={<Avatar initials="VK" />} />
      <Dropdown label="Category" value="Hiver in Incognito" />
      <Dropdown label="Article Slug" value="article-default-slug" charCount={{ current: 14, max: 32 }} />
    </div>
  ),
};
