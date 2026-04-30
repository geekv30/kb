import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Dropdown } from './Dropdown';

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Primitives/Dropdown',
  component: Dropdown,
  parameters: { layout: 'centered', backgrounds: { default: 'white' } },
  args: {
    label: 'Category',
    value: 'Hiver in Incognito',
    placeholder: '',
    disabled: false,
  },
  render: (args) => (
    <div className="w-80 p-4 bg-white">
      <Dropdown {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof Dropdown> = {};

export const WithMenu: StoryObj<typeof Dropdown> = {
  name: 'With Menu',
  args: {
    label: 'Sort by',
    options: [
      { value: 'newest', label: 'Newest first' },
      { value: 'oldest', label: 'Oldest first' },
      { value: 'popular', label: 'Most popular' },
    ],
    onSelect: (v: string) => console.log(v),
  },
};
