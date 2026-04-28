import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { TextInput } from './TextInput';

const meta: Meta<typeof TextInput> = {
  title: 'Components/Primitives/TextInput',
  component: TextInput,
  parameters: { layout: 'centered', backgrounds: { default: 'white' } },
  args: {
    placeholder: 'Enter value...',
    value: '',
    disabled: false,
  },
  render: (args) => (
    <div className="w-80 p-4 bg-white">
      <TextInput {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof TextInput> = {};
