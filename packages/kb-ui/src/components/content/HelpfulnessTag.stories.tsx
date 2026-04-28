import type { Meta, StoryObj } from '@storybook/react';
import { HelpfulnessTag } from './HelpfulnessTag';

const meta: Meta<typeof HelpfulnessTag> = {
  title: 'Components/Article/Helpfulness Tag',
  component: HelpfulnessTag,
  parameters: { layout: 'centered' },
  args: {
    value: '91%',
    variant: 'up',
  },
  render: (args) => <HelpfulnessTag {...args} />,
};
export default meta;

export const Default: StoryObj<typeof HelpfulnessTag> = {};
