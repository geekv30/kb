import type { Meta, StoryObj } from '@storybook/react';
import { HelpfulnessTag } from './HelpfulnessTag';

const meta: Meta<typeof HelpfulnessTag> = {
  title: 'Components/Content/Helpfulness Tag',
  component: HelpfulnessTag,
  parameters: { layout: 'centered' },
};
export default meta;

type Story = StoryObj<typeof HelpfulnessTag>;

export const Up: Story = {
  args: { value: '91%', variant: 'up' },
};

export const Down: Story = {
  args: { value: '24%', variant: 'down' },
};

export const LowSingleDigit: Story = {
  args: { value: '5%', variant: 'up' },
};
