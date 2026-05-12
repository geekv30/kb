import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Globe01 } from '@untitledui/icons';
import '../../tokens.css';
import { Modal } from './Modal';
import { Button } from '../primitives/Button';

/* ─────────────────────────────────────────────────────────────
 * Single Playground story — verifies the modal chrome against
 * Figma node 2111:1955 ("Convert to External KB?") from file
 * 251DTRmxl2L6jmXd3FWzHe.
 *
 * Per project convention, single-story files do NOT define
 * argTypes/controls — controls are reserved for collapsing
 * sibling variants.
 * ───────────────────────────────────────────────────────────── */

const meta: Meta<typeof Modal> = {
  title: 'Components/Overlays/Modal',
  component: Modal,
  parameters: { layout: 'centered' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

function ModalPlayground() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open modal
      </Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        titleIcon={<Globe01 />}
        title="Convert to External KB?"
        footer={
          <>
            <Button variant="subtle" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Confirm
            </Button>
          </>
        }
      >
        <p className="text-[14px] leading-5 text-text-meta">
          This will make your KB{' '}
          <span className="font-medium text-text-primary">
            publicly accessible
          </span>
          . All published articles will be visible to your customers.
        </p>
        <p className="text-[14px] leading-5 text-text-meta">
          Your content, categories, media, tags, and settings will remain
          exactly as they are.
        </p>
      </Modal>
    </>
  );
}

export const Playground: StoryObj<typeof Modal> = {
  render: () => <ModalPlayground />,
};
