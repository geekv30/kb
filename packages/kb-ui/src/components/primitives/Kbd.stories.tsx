import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Kbd } from './Kbd';

/* ─────────────────────────────────────────────────────────────
 * Three discrete stories exercising `Kbd`:
 *
 *   - SingleKey    — bare letter glyph
 *   - ModifierPlus — modifier + letter (rendered with platform glyph)
 *   - MultiChord   — three-key chord with separators
 *
 * Per project convention these are discrete stories (no
 * argTypes/controls) so each appears in the Storybook sidebar.
 * ───────────────────────────────────────────────────────────── */

const meta: Meta<typeof Kbd> = {
  title: 'Components/Primitives/Kbd',
  component: Kbd,
  parameters: { layout: 'centered' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

export const SingleKey: StoryObj<typeof Kbd> = {
  render: () => <Kbd>?</Kbd>,
};

export const ModifierPlus: StoryObj<typeof Kbd> = {
  render: () => (
    <span className="inline-flex items-center gap-1">
      <Kbd>⌘</Kbd>
      <Kbd>S</Kbd>
    </span>
  ),
};

export const MultiChord: StoryObj<typeof Kbd> = {
  render: () => (
    <span className="inline-flex items-center gap-1">
      <Kbd>⌘</Kbd>
      <Kbd>⇧</Kbd>
      <Kbd>P</Kbd>
    </span>
  ),
};
