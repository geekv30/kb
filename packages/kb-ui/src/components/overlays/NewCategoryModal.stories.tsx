import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import '../../tokens.css';
import { NewCategoryModal, type ParentCategoryOption } from './NewCategoryModal';
import { Button } from '../primitives/Button';

/* ─────────────────────────────────────────────────────────────
 * Two stories — both share the chrome verified against Figma
 * node 1958:34896 ("New Category") from file
 * 251DTRmxl2L6jmXd3FWzHe.
 *
 *   - Playground: mode="create" (default). Empty form, CTA reads
 *     "Create Category".
 *   - EditMode:   mode="edit". Pre-filled fields, CTA reads
 *     "Save changes", title reads "Edit Category".
 *
 * Per project convention, sibling stories collapse via argTypes
 * only when there is value in interactive switching. These two
 * exist as discrete stories so each appears in the Storybook
 * sidebar — `mode` is set inline in each `render`.
 * ───────────────────────────────────────────────────────────── */

const parentOptions: ParentCategoryOption[] = [
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'live-chat', label: 'Live Chat & Multi-channel' },
  { id: 'managing-emails', label: 'Managing Emails' },
  { id: 'automations-workflows', label: 'Automations & Workflows' },
  { id: 'reporting-analytics', label: 'Reporting & Analytics' },
];

const meta: Meta<typeof NewCategoryModal> = {
  title: 'Components/Overlays/New Category Modal',
  component: NewCategoryModal,
  parameters: { layout: 'centered' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

function NewCategoryModalPlayground() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open New Category Modal
      </Button>
      <NewCategoryModal
        open={open}
        onOpenChange={setOpen}
        parentOptions={parentOptions}
        onSubmit={(values) => {
          // eslint-disable-next-line no-console
          console.log('create category', values);
        }}
      />
    </>
  );
}

export const Playground: StoryObj<typeof NewCategoryModal> = {
  render: () => <NewCategoryModalPlayground />,
};

function NewCategoryModalEditMode() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open Edit Category Modal
      </Button>
      <NewCategoryModal
        open={open}
        onOpenChange={setOpen}
        mode="edit"
        parentOptions={parentOptions}
        initialValues={{
          name: 'Setting up Hiver',
          parentCategoryId: 'getting-started',
          description:
            'Install the extension, connect Gmail, and verify your workspace.',
        }}
        onSubmit={(values) => {
          // eslint-disable-next-line no-console
          console.log('edit category', values);
        }}
      />
    </>
  );
}

export const EditMode: StoryObj<typeof NewCategoryModal> = {
  render: () => <NewCategoryModalEditMode />,
};
