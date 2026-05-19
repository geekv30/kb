import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import '../../tokens.css';
import { PublishingIndicator } from './PublishingIndicator';
import { Button } from '../primitives/Button';

/* ─────────────────────────────────────────────────────────────
 * Playground — controls let you toggle `open` and edit `label`
 * to verify the enter motion (and label legibility) against
 * the Modal centering pattern.
 *
 * The "Open for 1.2s" button demonstrates the realistic usage
 * pattern: the indicator appears, then dismisses after the
 * mock-publish latency completes.
 * ───────────────────────────────────────────────────────────── */

const meta: Meta<typeof PublishingIndicator> = {
  title: 'Components/Overlays/PublishingIndicator',
  component: PublishingIndicator,
  parameters: { layout: 'centered' },
  globals: { backgrounds: { value: 'canvas' } },
  argTypes: {
    open: { control: 'boolean' },
    label: { control: 'text' },
    withBackdrop: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof PublishingIndicator>;

function Playground({
  open: initialOpen,
  label,
  withBackdrop,
}: {
  open: boolean;
  label?: string;
  withBackdrop?: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);

  // Mirror the controls panel into local state so toggling `open` from
  // Storybook controls reflects immediately without remounting.
  useEffect(() => {
    setOpen(initialOpen);
  }, [initialOpen]);

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex gap-2">
        <Button variant="primary" onClick={() => setOpen(true)}>
          Show indicator
        </Button>
        <Button
          variant="subtle"
          onClick={() => {
            setOpen(true);
            window.setTimeout(() => setOpen(false), 1200);
          }}
        >
          Open for 1.2s
        </Button>
        <Button variant="subtle" onClick={() => setOpen(false)}>
          Hide
        </Button>
      </div>
      <p className="text-[13px] text-text-meta">
        Backdrop washes the page; card sits dead-center via the same
        grid-place-items centering pattern as Modal.
      </p>
      <PublishingIndicator
        open={open}
        label={label}
        withBackdrop={withBackdrop}
      />
    </div>
  );
}

export const Default: Story = {
  args: {
    open: true,
    label: 'Publishing...',
    withBackdrop: true,
  },
  render: (args) => (
    <Playground
      open={args.open}
      label={args.label}
      withBackdrop={args.withBackdrop}
    />
  ),
};
