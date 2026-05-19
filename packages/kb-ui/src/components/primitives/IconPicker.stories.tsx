import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import '../../tokens.css';
import { IconPicker, ICON_CATALOG } from './IconPicker';
import { Field } from './Field';

/* ─────────────────────────────────────────────────────────────
 * Three stories — each highlights a different way the picker
 * shows up in the product:
 *
 *   - Playground: controllable `tileSize` + `ariaLabel`. The
 *     icon list itself is sourced from `ICON_CATALOG` so the
 *     story stays in sync as the catalog grows.
 *   - InFieldRow: shows the picker as it sits in
 *     NewCategoryModal — below a Field label, inline with form
 *     spacing. Mirrors the in-modal usage.
 *   - WithPreselectedValue: validates the selected-state highlight
 *     in the grid (sky-50 bg + sky-500 ring) by booting open with
 *     "mail" pre-selected.
 *
 * The picker portals into document.body, so Storybook's "padded"
 * layout doesn't clip it — no decorators needed.
 * ───────────────────────────────────────────────────────────── */

const meta: Meta<typeof IconPicker> = {
  title: 'Components/Primitives/Icon Picker',
  component: IconPicker,
  parameters: { layout: 'centered' },
  globals: { backgrounds: { value: 'white' } },
  argTypes: {
    value: { control: 'text' },
    tileSize: { control: { type: 'number', min: 32, max: 96 } },
    ariaLabel: { control: 'text' },
  },
};
export default meta;

function PlaygroundHarness({ initialValue }: { initialValue?: string }) {
  const [value, setValue] = React.useState<string | undefined>(initialValue);
  return (
    <div className="flex flex-col items-start gap-3 font-sans">
      <IconPicker value={value} onChange={setValue} />
      <div className="text-[12px] text-text-meta">
        Selected: <span className="font-mono">{value ?? '(none)'}</span> •{' '}
        Catalog size: <span className="font-mono">{ICON_CATALOG.length}</span>
      </div>
    </div>
  );
}

export const Playground: StoryObj<typeof IconPicker> = {
  args: {
    value: undefined,
    tileSize: 48,
    ariaLabel: 'Choose icon',
  },
  render: (args) => {
    // Spread the controllable args, layer in onChange so the tile
    // updates when the user picks.
    return <PlaygroundInner {...args} />;
  },
};

function PlaygroundInner(args: React.ComponentProps<typeof IconPicker>) {
  const [value, setValue] = React.useState<string | undefined>(args.value);
  // Keep local state in sync if the control panel changes `value`.
  React.useEffect(() => setValue(args.value), [args.value]);
  return (
    <div className="flex flex-col items-start gap-3 font-sans">
      <IconPicker {...args} value={value} onChange={setValue} />
      <div className="text-[12px] text-text-meta">
        Selected: <span className="font-mono">{value ?? '(none)'}</span> •{' '}
        Catalog size: <span className="font-mono">{ICON_CATALOG.length}</span>
      </div>
    </div>
  );
}

export const InFieldRow: StoryObj<typeof IconPicker> = {
  name: 'In a Field row (modal layout)',
  render: () => {
    return (
      <div
        className="rounded-xl border border-[#e5e5e5] bg-white p-5 font-sans"
        style={{ width: 380 }}
      >
        <Field label="Icon">
          <PlaygroundHarness />
        </Field>
      </div>
    );
  },
};

export const WithPreselectedValue: StoryObj<typeof IconPicker> = {
  name: 'With pre-selected value',
  render: () => <PlaygroundHarness initialValue="mail" />,
};
