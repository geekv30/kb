import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { RiBookOpenLine } from '@remixicon/react';
import { PageHeader } from './PageHeader';

const meta: Meta<typeof PageHeader> = {
  title: 'Components/Layout/Page Header',
  component: PageHeader,
  parameters: { layout: 'padded' },
  args: {
    title: 'Getting Started',
    subtitle: '12 articles · 3 sub-categories',
    onNewClick: () => {},
  },
  render: (args) => (
    <div style={{ background: '#f5f5f5', padding: 24, minHeight: 240 }}>
      <PageHeader
        {...args}
        icon={<RiBookOpenLine className="size-[22px] text-blue-500" />}
      />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof PageHeader> = {};
