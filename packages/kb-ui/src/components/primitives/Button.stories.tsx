import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { RiAddLine, RiDeleteBinLine, RiSendPlaneLine } from '@remixicon/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Primitives/Button',
  component: Button,
  parameters: { layout: 'centered', backgrounds: { default: 'white' } },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  render: () => (
    <Button variant="primary" icon={<RiAddLine size={14} />}>
      New
    </Button>
  ),
};
export const Subtle: Story = {
  render: () => (
    <Button variant="subtle" icon={<RiSendPlaneLine size={14} />}>
      Publish
    </Button>
  ),
};
export const Ghost: Story = { render: () => <Button variant="ghost">Save as draft</Button> };
export const IconOnly: Story = {
  render: () => <Button variant="icon" icon={<RiDeleteBinLine size={14} />} aria-label="Delete" />,
};
export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-3 p-6 bg-white rounded-lg">
      <Button variant="primary" icon={<RiAddLine size={14} />}>
        New
      </Button>
      <Button variant="subtle" icon={<RiSendPlaneLine size={14} />}>
        Publish
      </Button>
      <Button variant="ghost">Save as draft</Button>
      <Button variant="icon" icon={<RiDeleteBinLine size={14} />} aria-label="Delete" />
    </div>
  ),
};
export const Disabled: Story = {
  render: () => (
    <Button variant="primary" disabled>
      Disabled
    </Button>
  ),
};
// Figma variant: State=disabled, Appearance=filled (secondary) — `Button` set `Icon only=False, Type=secondary, Appearance=filled, Size=md, State=disabled, On Dark=False`
export const DisabledSubtle: Story = {
  render: () => (
    <Button variant="subtle" icon={<RiSendPlaneLine size={14} />} disabled>
      Publish
    </Button>
  ),
};
// Figma variant: State=disabled, Appearance=ghost — `Icon only=False, Type=primary, Appearance=ghost, Size=md, State=disabled, On Dark=False`
export const DisabledGhost: Story = {
  render: () => (
    <Button variant="ghost" disabled>
      Save as draft
    </Button>
  ),
};
// Figma variant: State=disabled, Icon only=True — `Icon only=True, Type=secondary, Appearance=ghost, Size=md, State=disabled, On Dark=False`
export const DisabledIconOnly: Story = {
  render: () => (
    <Button variant="icon" icon={<RiDeleteBinLine size={14} />} aria-label="Delete" disabled />
  ),
};
