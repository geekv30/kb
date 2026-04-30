import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { AISuggestionsCard } from './AISuggestionsCard';
import { Button } from '../primitives/Button';

/* ─────────────────────────────────────────────────────────────
 * AISuggestionsCard Playground — full sidebar rail demo.
 *
 * Renders all three modes the rail actually ships in:
 *   1. `pre-review` (default title)        — 5 pending suggestions
 *   2. `terminal`   (custom terminal label) — count 0, all caught up
 *   3. `pre-review` with custom title + cta — compliance review
 *
 * Stacked in a 354px-wide rail container — the same width the
 * editor's right rail uses in production.
 * ───────────────────────────────────────────────────────────── */

const SUMMARY =
  'Refining the article with an updated instruction set, replacing the legacy mobile-app URL, and removing outdated recovery-email steps.';

const meta: Meta<typeof AISuggestionsCard> = {
  title: 'Components/AI/AI Suggestions Card',
  component: AISuggestionsCard,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

function AISuggestionsCardPlayground() {
  return (
    <div className="w-[354px] flex flex-col gap-4">
      <AISuggestionsCard
        mode="pre-review"
        count={5}
        summary={SUMMARY}
        onReview={() => {}}
        onPrev={() => {}}
        onNext={() => {}}
      />
      <AISuggestionsCard
        mode="terminal"
        count={0}
        summary={SUMMARY}
        terminalLabel="All caught up"
        onPrev={() => {}}
        onNext={() => {}}
      />
      <AISuggestionsCard
        mode="pre-review"
        count={3}
        summary={SUMMARY}
        title="Compliance Suggestions"
        cta={
          <Button variant="ghost" onClick={() => {}}>
            Open compliance review
          </Button>
        }
        onPrev={() => {}}
        onNext={() => {}}
      />
    </div>
  );
}

export const Playground: StoryObj<typeof AISuggestionsCard> = {
  render: () => <AISuggestionsCardPlayground />,
};
