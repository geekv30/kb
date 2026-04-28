import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Primitives/Card',
  component: Card,
  parameters: { layout: 'centered', backgrounds: { default: 'white' } },
  args: {
    padding: 'md',
    as: 'div',
  },
  render: (args) => (
    <Card {...args} style={{ width: 360 }}>
      <div className="text-[14px] font-medium text-text-secondary">Card title</div>
      <div className="mt-1 text-[14px] text-text-muted">
        Default `md` padding (24 px). The chrome is `rounded-[12px]` + `border-card-border` +
        `bg-white` — the canonical KB surface.
      </div>
    </Card>
  ),
};
export default meta;

export const Default: StoryObj<typeof Card> = {};
