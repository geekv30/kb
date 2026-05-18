import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { CodeChip } from './CodeChip';

const meta: Meta<typeof CodeChip> = {
  title: 'Components/Primitives/CodeChip',
  component: CodeChip,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function CodeChipPlayground() {
  return (
    <div className="flex flex-col gap-6 font-sans" style={{ maxWidth: 420 }}>
      <h2 className="text-[16px] font-semibold leading-6 text-text-primary">CodeChip</h2>

      <section className="flex flex-col gap-2">
        <p className="text-[12px] font-medium uppercase tracking-wide text-text-muted">
          Inline in body text (SEO helper)
        </p>
        <p className="text-[14px] leading-5 text-text-muted">
          When enabled this article will include <CodeChip>noindex</CodeChip>{' '}
          and <CodeChip>nofollow</CodeChip> meta tags.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-[12px] font-medium uppercase tracking-wide text-text-muted">
          Standalone
        </p>
        <div className="flex gap-2">
          <CodeChip>noindex</CodeChip>
          <CodeChip>nofollow</CodeChip>
          <CodeChip>robots</CodeChip>
        </div>
      </section>
    </div>
  );
}

export const Playground: StoryObj<typeof CodeChip> = {
  render: () => <CodeChipPlayground />,
};
