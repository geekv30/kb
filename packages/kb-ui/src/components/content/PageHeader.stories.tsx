import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { RiBookOpenLine } from '@remixicon/react';
import { PageHeader } from './PageHeader';

const meta: Meta<typeof PageHeader> = {
  title: 'Components/Content/PageHeader',
  component: PageHeader,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  render: () => (
    <div style={{ background: '#f5f5f5', padding: 24, minHeight: 240 }}>
      <PageHeader
        icon={<RiBookOpenLine className="size-[22px] text-blue-500" />}
        title="Getting Started"
        subtitle="12 articles · 3 sub-categories"
        onNewClick={() => alert('new')}
      />
    </div>
  ),
};

export const WithoutSubtitle: Story = {
  render: () => (
    <div style={{ background: '#f5f5f5', padding: 24, minHeight: 240 }}>
      <PageHeader
        icon={<RiBookOpenLine className="size-[22px] text-blue-500" />}
        title="Getting Started"
        onNewClick={() => alert('new')}
      />
    </div>
  ),
};
