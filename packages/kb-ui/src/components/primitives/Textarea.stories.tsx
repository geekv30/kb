import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import '../../tokens.css';
import { Textarea } from './Textarea';
import { AiIcon } from '../brand/AiIcon';

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

/* ─────────────────────────────────────────────────────────────
 * Chunk-5 stories — the SEO panel's Refine-with-AI affordance
 * lives on top of these two Textarea features:
 *
 *   1. `refining`   — content fades out, content-aware Skeleton
 *                     overlay fades in (matches the textarea's
 *                     last-measured height — no layout jump).
 *   2. `refineSlot` — pinned bottom-right CTA inside the textarea
 *                     frame. Dims to opacity-50 while refining.
 * ───────────────────────────────────────────────────────────── */

function RefineCTA({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1 rounded-[4px] px-0 py-0.5 text-[13px] font-normal leading-[19px] text-text-secondary hover:text-text-primary focus-visible:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-border-faint motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-out active:scale-[0.97]"
      aria-label="Refine with AI"
    >
      <AiIcon size={12} aria-hidden="true" className="shrink-0" />
      <span>Refine with AI</span>
    </button>
  );
}

function TextareaWithRefineSlot() {
  const [value, setValue] = useState(
    'default description filled by defaults and is default due to default reasons',
  );
  return (
    <div className="w-96 font-sans">
      <Textarea
        placeholder="Brief description of this article (shown in search results)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        refineSlot={<RefineCTA onClick={() => undefined} />}
      />
    </div>
  );
}

function TextareaRefining() {
  // Refining is forced on; the slot dims, the Skeleton overlay
  // shimmers, the textarea contents are hidden.
  return (
    <div className="w-96 font-sans">
      <Textarea
        placeholder="Brief description of this article (shown in search results)"
        value={'default description filled by defaults and is default due to default reasons'}
        refining
        refineSlot={<RefineCTA onClick={() => undefined} disabled />}
      />
    </div>
  );
}

function TextareaRefiningRoundtrip() {
  // End-to-end demo: click the CTA, wait 1500ms, contents swap.
  const [value, setValue] = useState(
    'default description filled by defaults and is default due to default reasons',
  );
  const [refining, setRefining] = useState(false);

  const handleRefine = () => {
    if (refining) return;
    setRefining(true);
    window.setTimeout(() => {
      setValue(
        'Step-by-step guide to setting up shared inboxes in Hiver — invite teammates, configure routing rules, and resolve common access issues.',
      );
      setRefining(false);
    }, 1500);
  };

  return (
    <div className="flex w-96 flex-col gap-2 font-sans">
      <Textarea
        placeholder="Brief description of this article (shown in search results)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        refining={refining}
        refineSlot={<RefineCTA onClick={handleRefine} disabled={refining} />}
      />
      <p className="text-[12px] leading-[18px] text-text-muted">
        Click "Refine with AI" — wait 1500ms — new copy lands with a soft fade.
      </p>
    </div>
  );
}

export const Playground: StoryObj<typeof Textarea> = {
  render: () => <TextareaPlayground />,
};

export const WithoutCounter: StoryObj<typeof Textarea> = {
  render: () => <TextareaWithoutCounter />,
};

export const WithRefineSlot: StoryObj<typeof Textarea> = {
  render: () => <TextareaWithRefineSlot />,
};

export const Refining: StoryObj<typeof Textarea> = {
  render: () => <TextareaRefining />,
};

export const RefineRoundtrip: StoryObj<typeof Textarea> = {
  render: () => <TextareaRefiningRoundtrip />,
};
