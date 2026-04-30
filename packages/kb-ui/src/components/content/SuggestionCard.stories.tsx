import type { Meta, StoryObj } from '@storybook/react-vite';
import { RiGitMergeLine, RiSparkling2Line } from '@remixicon/react';
import '../../tokens.css';
import {
  SuggestionCard,
  DEFAULT_SUGGESTION_KINDS,
} from './SuggestionCard';

/* ─────────────────────────────────────────────────────────────
 * SuggestionCard Playground — vertical column of 5 realistic
 * AI suggestions. Mixes all three default kinds (article-edit,
 * move-article, new-article) plus a custom `merge-articles`
 * kind registered via `kindRegistry`. The last card overrides
 * the title icon via the `icon` prop to demonstrate that hook.
 *
 * No outer card wrapper — the canvas-grey global background
 * is the page surface, matching how these cards stack inside
 * the Suggestions rail.
 * ───────────────────────────────────────────────────────────── */

// Mirrors the brand-pink constant in SuggestionCard.tsx so custom
// kinds register glyphs that read as part of the same visual family.
const PINK = '#D92FFF';

const meta: Meta<typeof SuggestionCard> = {
  title: 'Components/AI/Suggestion Card',
  component: SuggestionCard,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

function SuggestionCardPlayground() {
  // Extend the default kind registry with a project-specific
  // `merge-articles` kind. Spreading DEFAULT_SUGGESTION_KINDS
  // first preserves the built-ins so cards using `article-edit`
  // / `move-article` / `new-article` keep their canonical glyphs.
  const kindRegistry = {
    ...DEFAULT_SUGGESTION_KINDS,
    'merge-articles': {
      label: 'Merge Articles',
      icon: <RiGitMergeLine size={16} color={PINK} />,
    },
  };

  return (
    <div className="flex flex-col gap-3 max-w-[640px]">
      <SuggestionCard
        title="How to reset your password"
        description="Updating reset instructions, removing legacy mobile-app URL, and clarifying the recovery email step."
        kind="article-edit"
        conversationCount={12}
        impact="high"
        onClick={() => {}}
      />
      <SuggestionCard
        title='Move "Billing duplicate charges" to Reimbursements'
        description="Article currently lives under Billing but 78% of viewers reach it from a Reimbursements search."
        kind="move-article"
        pathFrom="Billing"
        pathTo="Reimbursements"
        conversationCount={8}
        impact="medium"
        onClick={() => {}}
      />
      <SuggestionCard
        title='Merge duplicate "Setting up SSO" articles'
        description="Two articles cover the same Okta SSO flow — combining them avoids content drift."
        kind="merge-articles"
        kindRegistry={kindRegistry}
        conversationCount={4}
        impact="medium"
        meta={
          <span className="text-[12px] font-medium text-[#475569]">
            Last edited 3h ago
          </span>
        }
        onClick={() => {}}
      />
      <SuggestionCard
        title='Add a new article: "Bulk-deleting old conversations"'
        description="No existing article covers this — 23 search misses in the last 14 days."
        kind="new-article"
        conversationCount={23}
        impact="high"
        onClick={() => {}}
      />
      <SuggestionCard
        title='Refresh AI-suggested rewrites for "Two-factor authentication"'
        description="Helpfulness dropped from 91% to 64% over the last 30 days."
        kind="article-edit"
        icon={<RiSparkling2Line size={18} color={PINK} />}
        conversationCount={9}
        impact="high"
        onClick={() => {}}
      />
    </div>
  );
}

export const Playground: StoryObj<typeof SuggestionCard> = {
  render: () => <SuggestionCardPlayground />,
};
