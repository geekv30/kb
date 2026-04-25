import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Primitives/Card',
  component: Card,
  parameters: { layout: 'centered', backgrounds: { default: 'white' } },
};
export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card style={{ width: 360 }}>
      <div className="text-[14px] font-medium text-text-secondary">Card title</div>
      <div className="mt-1 text-[14px] text-text-muted">
        Default `md` padding (24 px). The chrome is `rounded-[12px]` + `border-card-border` +
        `bg-white` — the canonical KB surface.
      </div>
    </Card>
  ),
};

export const SmallPadding: Story = {
  render: () => (
    <Card padding="sm" style={{ width: 360 }}>
      <div className="text-[14px] font-medium text-text-secondary">Small padding (16 px)</div>
      <div className="mt-1 text-[14px] text-text-muted">
        Use for compact surfaces — list items, dense tile grids.
      </div>
    </Card>
  ),
};

export const LargePadding: Story = {
  render: () => (
    <Card padding="lg" style={{ width: 360 }}>
      <div className="text-[14px] font-medium text-text-secondary">Large padding (32 px)</div>
      <div className="mt-1 text-[14px] text-text-muted">
        Use for hero/empty-state cards that need extra breathing room.
      </div>
    </Card>
  ),
};

export const NoPadding: Story = {
  render: () => (
    <Card padding="none" style={{ width: 360 }}>
      <div className="border-b border-card-divider px-6 py-4 text-[14px] font-medium text-text-secondary">
        Header (paints to edge)
      </div>
      <div className="px-6 py-4 text-[14px] text-text-muted">
        Use `padding="none"` when the caller needs to control padding internally — typically tables
        whose header row paints to the card edge, or any card with a flush divider.
      </div>
    </Card>
  ),
};

export const WithSection: Story = {
  render: () => (
    <Card as="section" aria-labelledby="card-section-title" style={{ width: 360 }}>
      <h3 id="card-section-title" className="text-[14px] font-medium text-text-secondary">
        Landmark section
      </h3>
      <div className="mt-1 text-[14px] text-text-muted">
        `as="section"` renders a `<section>` element with landmark semantics — pair with
        `aria-labelledby` (or `aria-label`) so assistive tech announces it.
      </div>
    </Card>
  ),
};
