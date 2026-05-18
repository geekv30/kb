import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import '../../tokens.css';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/Primitives/Switch',
  component: Switch,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function SwitchPlayground() {
  const [a, setA] = React.useState(false);
  const [b, setB] = React.useState(true);
  return (
    <div className="flex flex-col gap-4 font-sans" style={{ maxWidth: 360 }}>
      <h2 className="text-[16px] font-semibold leading-6 text-text-primary">Switch</h2>

      <div className="flex items-center justify-between">
        <label htmlFor="sw-a" className="text-[13px] font-medium leading-[19px] text-text-primary">
          Exclude from search engines
        </label>
        <Switch id="sw-a" checked={a} onCheckedChange={setA} />
      </div>

      <div className="flex items-center justify-between">
        <label htmlFor="sw-b" className="text-[13px] font-medium leading-[19px] text-text-primary">
          Default-on toggle
        </label>
        <Switch id="sw-b" checked={b} onCheckedChange={setB} />
      </div>

      <div className="flex items-center justify-between">
        <label htmlFor="sw-c" className="text-[13px] font-medium leading-[19px] text-text-primary">
          Disabled
        </label>
        <Switch id="sw-c" checked={false} disabled />
      </div>
    </div>
  );
}

export const Playground: StoryObj<typeof Switch> = {
  render: () => <SwitchPlayground />,
};
