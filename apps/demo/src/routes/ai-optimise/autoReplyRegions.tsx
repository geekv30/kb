// Auto-reply rules article markup for the AI Gaps Review experience.
//
// Mirrors `./passwordResetRegions.tsx`'s shape — the demo cannot import
// private story symbols, so we replicate the typography helpers locally
// per the existing convention. Each AI-targeted article ships its own
// regions module so the article body content threads its specific
// suggestion payloads naturally.
//
// Suggestion payload alignment (`apps/demo/src/store/fixtures/suggestions.ts`):
//   - s1 (addition)  ↔ sug-autoreply-1.payload.newHTML  — timezone tip
//   - s2 (replace)   ↔ sug-autoreply-2.payload.{oldHTML,newHTML}  — Recent trigger
//   - s3 (removal)   ↔ sug-autoreply-3.payload.oldHTML  — domain toggle
//
// Slot order rendered by `ArticleBody`:
//   header → beforeS1 → s1 region → betweenS1AndS2 → s2 region
//          → betweenS2AndS3 → s3 region → afterS3

import * as React from 'react';
import {
  SuggestionHighlight,
  type ArticleBodyRegions,
} from '@test-kb-ui/kb-ui';

/* ─────────────────────────────────────────────────────────────
 * Typography helpers — duplicated locally to match
 * `passwordResetRegions.tsx` 1:1. Values pulled from Figma
 * `9aGp5t9fH1d0PXi4LMhOdb#74:10788`.
 * ───────────────────────────────────────────────────────────── */

function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="mb-2 text-[24px] font-semibold leading-[32px] text-text-primary">
      {children}
    </h1>
  );
}

function Subtitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-6 text-[14px] font-normal leading-[20px] text-text-muted">
      {children}
    </p>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-6 mb-3 text-[20px] font-semibold leading-[28px] text-text-primary">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-[16px] font-normal leading-[24px] text-text-secondary">
      {children}
    </p>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return (
    <strong className="font-semibold text-text-primary">{children}</strong>
  );
}

export const autoReplyRegions: ArticleBodyRegions = {
  header: (
    <>
      <H1>Setting Up Auto-Reply Rules</H1>
      <Subtitle>Last updated 3 weeks ago</Subtitle>
    </>
  ),
  beforeS1: (
    <>
      <P>
        Auto-reply rules let you respond to incoming conversations
        automatically — useful for out-of-office coverage, after-hours
        acknowledgments, or routing simple FAQs to canned responses. Each
        rule has a <Strong>trigger</Strong> (the condition that fires it)
        and a <Strong>schedule</Strong> (the time window when it&rsquo;s
        active).
      </P>
      <H2>Setting the Schedule</H2>
      <P>
        Define when the rule is allowed to fire. Most teams use{' '}
        <Strong>Business hours</Strong> to limit the rule to working days;{' '}
        <Strong>Always</Strong> runs the rule 24/7 including weekends. The
        schedule editor previews the next 7 days so you can sanity-check
        the window before saving.
      </P>
    </>
  ),
  /* Addition — timezone tip. Single highlighted block; inline <Strong>
   * picks up the bold "Timezone tip:" lead from the suggestion payload. */
  s1: [
    <span
      key="s1-tz"
      className="block text-[16px] leading-[24px] text-text-primary"
    >
      <SuggestionHighlight>
        <Strong>Timezone tip:</Strong> rule schedules always run in the
        workspace&rsquo;s primary timezone, not the agent&rsquo;s local
        timezone. If your team spans timezones, double-check the schedule
        preview against the inbox&rsquo;s expected coverage hours before
        saving the rule.
      </SuggestionHighlight>
    </span>,
  ],
  betweenS1AndS2: (
    <>
      <H2>Picking the Trigger</H2>
      <P>
        The trigger fires the rule. Hiver supports several conditions,
        from new conversation to time-windowed matches, and you can
        combine multiple triggers with AND/OR logic.
      </P>
    </>
  ),
  /* Replace — Recent trigger clarification. Each half is one JSX entry
   * so inline <em> emphasis renders correctly inside the highlight. */
  s2: {
    before: [
      <span
        key="s2-before"
        className="text-[16px] leading-[24px] text-text-primary"
      >
        <SuggestionHighlight>
          The most common trigger is <em>New conversation</em> — fires
          once per conversation, the moment it arrives. The{' '}
          <em>Recent</em> trigger is ambiguous on its own; we recommend
          pairing it with an explicit time window to avoid accidentally
          re-firing on every message in an old thread.
        </SuggestionHighlight>
      </span>,
    ],
    after: [
      <span
        key="s2-after"
        className="text-[16px] leading-[24px] text-text-primary"
      >
        <SuggestionHighlight>
          The most common trigger is <em>New conversation</em> — fires
          once per conversation, the moment it arrives. The{' '}
          <em>Within the last 24 hours</em> trigger (formerly labelled
          &ldquo;Recent&rdquo;) fires for any conversation whose last
          inbound message arrived in the past 24 hours, which is precise
          enough to use without an extra time window.
        </SuggestionHighlight>
      </span>,
    ],
  },
  betweenS2AndS3: (
    <>
      <H2>Filtering by Sender</H2>
      <P>
        Filters narrow which conversations a rule applies to — by sender
        email, sender domain, conversation tag, or subject keyword.
        Combine filters into a <em>filter group</em> to express complex
        AND/OR conditions.
      </P>
    </>
  ),
  /* Removal — legacy domain toggle. H2 + body each render as their own
   * highlighted entry so the heading keeps its typography. */
  s3: [
    <span
      key="s3-h2"
      className="block text-[20px] font-semibold leading-[28px] text-text-primary"
    >
      <SuggestionHighlight>
        Match by sender domain only
      </SuggestionHighlight>
    </span>,
    'The legacy “Match by sender domain only” toggle flattens any conversation from a given domain into a single rule path. Most teams have moved to the more flexible “Filter group” UI, which lets you combine domain matching with tags, subject filters, and timing. This toggle is preserved for backward compatibility but new rules should not use it.',
  ],
  afterS3: (
    <>
      <H2>Saving and Activating</H2>
      <P>
        Once the schedule, trigger, and filters are configured, click{' '}
        <Strong>Save</Strong> at the top right. The rule activates
        immediately for new incoming conversations matching its criteria.
        You can pause a rule at any time from the rule list — paused rules
        stay configured but stop firing.
      </P>
    </>
  ),
};
