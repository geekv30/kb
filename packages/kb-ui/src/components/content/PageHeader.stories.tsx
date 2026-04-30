import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { RiBookOpenLine, RiAddLine } from '@remixicon/react';
import { PageHeader } from './PageHeader';
import { Button } from '../primitives/Button';

const meta: Meta<typeof PageHeader> = {
  title: 'Components/Layout/Page Header',
  component: PageHeader,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

function PageHeaderPlayground() {
  return (
    <PageHeader
      title="Getting Started"
      subtitle="12 articles · 3 sub-categories · Last updated 4 days ago"
      icon={<RiBookOpenLine className="size-[22px] text-blue-500" />}
      cta={
        <Button
          variant="primary"
          icon={<RiAddLine size={14} />}
          onClick={() => {}}
        >
          New article
        </Button>
      }
    />
  );
}

export const Playground: StoryObj<typeof PageHeader> = {
  render: () => <PageHeaderPlayground />,
};
