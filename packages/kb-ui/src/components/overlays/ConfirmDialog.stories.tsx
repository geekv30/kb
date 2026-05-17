import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Trash01 } from '@untitledui/icons';
import '../../tokens.css';
import { ConfirmDialog } from './ConfirmDialog';
import { Button } from '../primitives/Button';

/* ─────────────────────────────────────────────────────────────
 * Four discrete stories exercising every branch of
 * `ConfirmDialog`:
 *
 *   - Primary       — title + message + primary confirm.
 *   - Destructive   — title + message + danger confirm.
 *   - WithTitleIcon — exercises the `titleIcon` slot alongside
 *                     a destructive action.
 *   - MessageOnly   — no title; exercises the optional-title
 *                     branch where only the body copy renders.
 *
 * Per project convention these are discrete stories (no
 * argTypes/controls) so each appears in the Storybook sidebar.
 * Controls are reserved for collapsing sibling variants — here
 * each story exercises a different branch worth eyeballing.
 *
 * Each story is a controlled wrapper opened from a trigger so
 * the open/close cycle is exercisable — mirrors the pattern in
 * Modal.stories / NewCategoryModal.stories next door.
 * ───────────────────────────────────────────────────────────── */

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Components/Overlays/Confirm Dialog',
  component: ConfirmDialog,
  parameters: { layout: 'centered' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

function ConfirmDialogPrimary() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open confirm
      </Button>
      <ConfirmDialog
        open={open}
        title="Publish article?"
        message="This will make the article visible to all readers. You can unpublish at any time."
        confirmLabel="Publish"
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

export const Primary: StoryObj<typeof ConfirmDialog> = {
  render: () => <ConfirmDialogPrimary />,
};

function ConfirmDialogDestructive() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open destructive confirm
      </Button>
      <ConfirmDialog
        open={open}
        title="Discard review?"
        message="Your accept and reject decisions for this review will be cleared. The suggestions remain available to review again later."
        confirmLabel="Discard review"
        cancelLabel="Keep reviewing"
        confirmVariant="destructive"
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

export const Destructive: StoryObj<typeof ConfirmDialog> = {
  render: () => <ConfirmDialogDestructive />,
};

function ConfirmDialogWithTitleIcon() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open confirm with icon
      </Button>
      <ConfirmDialog
        open={open}
        title="Delete article?"
        titleIcon={<Trash01 />}
        message="This article will be permanently removed. This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

export const WithTitleIcon: StoryObj<typeof ConfirmDialog> = {
  render: () => <ConfirmDialogWithTitleIcon />,
};

function ConfirmDialogMessageOnly() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open message-only confirm
      </Button>
      <ConfirmDialog
        open={open}
        message="Your changes haven't been saved. Leave this page anyway?"
        confirmLabel="Leave page"
        cancelLabel="Stay"
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

export const MessageOnly: StoryObj<typeof ConfirmDialog> = {
  render: () => <ConfirmDialogMessageOnly />,
};
