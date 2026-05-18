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
  const [a, setA] = useState('');
  const [b, setB] = useState('Search, filter, and create email views & other things');

  return (
    <div className="flex flex-col gap-4 font-sans w-80">
      <div className="flex flex-col gap-1">
        <span className="text-[13px] font-medium leading-[19px] text-text-primary">
          Default
        </span>
        <TextInput
          placeholder="Enter value..."
          value={a}
          onChange={(e) => setA(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[13px] font-medium leading-[19px] text-text-primary">
          Error variant — border flips to red (#dc2626)
        </span>
        <TextInput
          value={b}
          onChange={(e) => setB(e.target.value)}
          error
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[13px] font-medium leading-[19px] text-text-primary">
          Read-only — used by the SEO panel's URL field
        </span>
        <TextInput
          value="help.hiverhq.com/getting-started/setting-up-shared-inboxes"
          readOnly
        />
      </div>
    </div>
  );
}

export const Playground: StoryObj<typeof TextInput> = {
  render: () => <TextInputPlayground />,
};
