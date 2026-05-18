import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Skeleton } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Primitives/Skeleton',
  component: Skeleton,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function SkeletonPlayground() {
  return (
    <div className="flex flex-col gap-6 font-sans" style={{ maxWidth: 360 }}>
      <h2 className="text-[16px] font-semibold leading-6 text-text-primary">Skeleton</h2>

      <section className="flex flex-col gap-2">
        <p className="text-[12px] font-medium uppercase tracking-wide text-text-muted">
          Single bar (fills parent)
        </p>
        <Skeleton />
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-[12px] font-medium uppercase tracking-wide text-text-muted">
          Explicit size — 45% wide, 16px tall, pill ends
        </p>
        <Skeleton width="45%" height={16} radius={999} />
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-[12px] font-medium uppercase tracking-wide text-text-muted">
          Multi-row — 2 rows, 100% / 45%, 12px gap
        </p>
        <Skeleton rows={2} widths={['100%', '45%']} gap={12} height={12} />
      </section>
    </div>
  );
}

export const Playground: StoryObj<typeof Skeleton> = {
  render: () => <SkeletonPlayground />,
};
