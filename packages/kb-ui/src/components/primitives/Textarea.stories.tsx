import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import '../../tokens.css';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Primitives/Textarea',
  component: Textarea,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function TextareaPlayground() {
  const [value, setValue] = useState('');

  return (
    <div className="w-96 font-sans">
      <Textarea
        placeholder="Describe what this category contains — agents will see this on the category landing."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        charCount={{ current: value.length, max: 120 }}
      />
    </div>
  );
}

function TextareaWithoutCounter() {
  const [value, setValue] = useState('');

  return (
    <div className="w-96 font-sans">
      <Textarea
        placeholder="Describe what this category contains — agents will see this on the category landing."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

export const Playground: StoryObj<typeof Textarea> = {
  render: () => <TextareaPlayground />,
};

export const WithoutCounter: StoryObj<typeof Textarea> = {
  render: () => <TextareaWithoutCounter />,
};
