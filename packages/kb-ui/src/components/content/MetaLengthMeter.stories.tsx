import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { MetaLengthMeter, type MetaLengthVerdict } from './MetaLengthMeter';

/* MetaLengthMeter Playground — iterates every verdict state at the
 * thresholds that flip the verdict (per the locked algorithm in
 * MetaLengthMeter.tsx). Meta title (max 70) on the left, description
 * (max 160) on the right. */

const meta: Meta<typeof MetaLengthMeter> = {
  title: 'Components/Article/Meta Length Meter',
  component: MetaLengthMeter,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

type Row = { count: number; verdict: MetaLengthVerdict };

const TITLE_ROWS: Row[] = [
  { count: 12, verdict: 'short' },
  { count: 42, verdict: 'acceptable' },
  { count: 55, verdict: 'optimal' },
  { count: 64, verdict: 'long' },
  { count: 78, verdict: 'hard-cap' },
];

const DESC_ROWS: Row[] = [
  { count: 40, verdict: 'short' },
  { count: 112, verdict: 'acceptable' },
  { count: 142, verdict: 'optimal' },
  { count: 158, verdict: 'long' },
  { count: 188, verdict: 'hard-cap' },
];

function MetaLengthMeterPlayground() {
  return (
    <div className="flex flex-col gap-6 font-sans" style={{ maxWidth: 480 }}>
      <section className="flex flex-col gap-2">
        <h3 className="text-[13px] font-semibold leading-[19px] text-text-primary">
          Meta title (max 70)
        </h3>
        {TITLE_ROWS.map((r) => (
          <div key={r.verdict} className="flex items-center justify-between gap-3">
            <span className="text-[12px] font-medium leading-[18px] text-text-muted">
              {r.verdict}
            </span>
            <MetaLengthMeter count={r.count} max={70} verdict={r.verdict} />
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-[13px] font-semibold leading-[19px] text-text-primary">
          Description (max 160)
        </h3>
        {DESC_ROWS.map((r) => (
          <div key={r.verdict} className="flex items-center justify-between gap-3">
            <span className="text-[12px] font-medium leading-[18px] text-text-muted">
              {r.verdict}
            </span>
            <MetaLengthMeter count={r.count} max={160} verdict={r.verdict} />
          </div>
        ))}
      </section>
    </div>
  );
}

export const Playground: StoryObj<typeof MetaLengthMeter> = {
  render: () => <MetaLengthMeterPlayground />,
};
