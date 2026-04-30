import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { RiAddLine } from '@remixicon/react';
import '../../tokens.css';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Primitives/Button',
  component: Button,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function ButtonPlayground() {
  const [count, setCount] = useState(0);
  const bump = () => setCount((c) => c + 1);

  return (
    <div className="flex flex-col gap-4 font-sans">
      <div className="flex flex-col gap-1">
        <h2 className="text-[16px] font-semibold leading-6 text-text-primary">
          Button — interactive
        </h2>
        <p className="text-[13px] leading-5 text-text-muted">
          Hover, focus (Tab), and click any non-disabled button to increment the counter.
        </p>
      </div>

      <div className="text-[13px] leading-5 text-text-muted">
        Clicks: <span className="font-medium text-text-primary">{count}</span>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="primary" onClick={bump}>
          Click me
        </Button>
        <Button variant="subtle" onClick={bump}>
          Cancel
        </Button>
        <Button variant="ghost" onClick={bump}>
          Learn more
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="primary" disabled>
          Disabled
        </Button>
        <Button variant="primary" icon={<RiAddLine size={14} />} onClick={bump}>
          New article
        </Button>
      </div>
    </div>
  );
}

export const Playground: StoryObj<typeof Button> = {
  render: () => <ButtonPlayground />,
};
