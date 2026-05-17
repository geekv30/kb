import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import '../../tokens.css';
import { ShortcutsModal, type ShortcutGroup } from './ShortcutsModal';
import { Button } from '../primitives/Button';
import { Kbd } from '../primitives/Kbd';

/* ─────────────────────────────────────────────────────────────
 * A single multi-group story exercising header (title + close X),
 * intro paragraph with inline `<Kbd>`, and three sections rendered
 * from `groups`.
 *
 * Groups below are illustrative — generic enough to show layout
 * without implying any product-specific lock-in.
 * ───────────────────────────────────────────────────────────── */

const meta: Meta<typeof ShortcutsModal> = {
  title: 'Components/Overlays/Shortcuts Modal',
  component: ShortcutsModal,
  parameters: { layout: 'centered' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

const groups: ShortcutGroup[] = [
  {
    title: 'Editor',
    items: [
      { keys: ['⌘', 'S'], label: 'Save draft' },
      { keys: ['⌘', '⏎'], label: 'Publish article' },
      { keys: ['Esc'], label: 'Close panel' },
    ],
  },
  {
    title: 'AI Gaps Review',
    items: [
      { keys: ['J'], label: 'Next suggestion' },
      { keys: ['↓'], label: 'Next suggestion' },
      { keys: ['K'], label: 'Previous suggestion' },
      { keys: ['↑'], label: 'Previous suggestion' },
      { keys: ['Y'], label: 'Accept suggestion' },
      { keys: ['⏎'], label: 'Accept suggestion' },
      { keys: ['N'], label: 'Reject suggestion' },
      { keys: ['Esc'], label: 'Close sources sheet' },
    ],
  },
  {
    title: 'Anywhere',
    items: [{ keys: ['?'], label: 'Show this cheat sheet' }],
  },
];

function ShortcutsModalDefaultWrapper() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open shortcuts
      </Button>
      <ShortcutsModal
        open={open}
        onOpenChange={setOpen}
        groups={groups}
        intro={
          <>
            Speed up common actions. Press <Kbd>?</Kbd> any time to reopen this
            sheet.
          </>
        }
      />
    </>
  );
}

export const Default: StoryObj<typeof ShortcutsModal> = {
  render: () => <ShortcutsModalDefaultWrapper />,
};
