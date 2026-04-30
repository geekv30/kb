import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { TextInput } from './TextInput';

const meta: Meta<typeof TextInput> = {
  title: 'Components/Primitives/TextInput',
  component: TextInput,
  parameters: { layout: 'centered' },
  globals: { backgrounds: { value: 'white' } },
  args: {
    placeholder: 'Enter value...',
    value: '',
    disabled: false,
  },
  render: (args) => <TextInput {...args} />,
};
export default meta;

export const Default: StoryObj<typeof TextInput> = {};
