import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import '../../tokens.css';
import { Dropdown } from './Dropdown';

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Primitives/Dropdown',
  component: Dropdown,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function DropdownPlayground() {
  const [selected, setSelected] = React.useState<string>('Newest first');

  return (
    <div className="w-80 font-sans">
      <Dropdown
        label="Sort by"
        value={selected}
        options={[
          { value: 'Newest first', label: 'Newest first' },
          { value: 'Oldest first', label: 'Oldest first' },
          { value: 'Most popular', label: 'Most popular' },
          { value: 'Least popular', label: 'Least popular' },
        ]}
        onSelect={(v) => setSelected(v)}
      />
    </div>
  );
}

export const Playground: StoryObj<typeof Dropdown> = {
  render: () => <DropdownPlayground />,
};
