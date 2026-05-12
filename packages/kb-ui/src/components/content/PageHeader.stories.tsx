import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { BookOpen01, Plus } from '@untitledui/icons';
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
      icon={<BookOpen01 className="size-[22px] text-blue-500" />}
      cta={
        <Button
          variant="primary"
          icon={<Plus size={14} />}
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
