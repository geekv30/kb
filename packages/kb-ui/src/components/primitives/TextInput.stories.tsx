import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import '../../tokens.css';
import { TextInput } from './TextInput';

const meta: Meta<typeof TextInput> = {
  title: 'Components/Primitives/TextInput',
  component: TextInput,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function TextInputPlayground() {
  const [value, setValue] = useState('');

  return (
    <div className="w-80 font-sans">
      <TextInput
        placeholder="Enter value..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

export const Playground: StoryObj<typeof TextInput> = {
  render: () => <TextInputPlayground />,
};
