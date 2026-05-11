// Password-reset article markup for the AI Gaps Review experience.
//
// Mirrors `packages/kb-ui/src/pages/KBAIGapsExperience.stories.tsx`'s
// canonical `passwordResetRegions` — the demo cannot import private
// story symbols, so we replicate the shape locally. The article body
// is the same source-of-truth content used by every kb-ui AI Gaps
// review story.
//
// Phase 15a migrated `ArticleBody` to per-sentence `SuggestionBlock`
// highlights — `s1`/`s3` are now `SuggestionSentence[]` arrays and
// `s2` is `{ before: SuggestionSentence[]; after: SuggestionSentence[] }`.
// Each entry renders as one highlighted block with a 4px gap between
// entries (matches Figma 137:4022 / 137:4132). JSX entries preserve
// their typography (headings, list items); strings render as 16px
// body text inside a single `<SuggestionHighlight>` span.
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
 * Typography helpers — duplicated locally so the demo's article
 * markup matches the kb-ui canonical example 1:1. Values pulled
 * from Figma `9aGp5t9fH1d0PXi4LMhOdb#74:10788`.
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

function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="mb-4 list-disc pl-6 text-[16px] font-normal leading-[24px] text-text-secondary [&>li]:mb-2">
      {children}
    </ul>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return (
    <strong className="font-semibold text-text-primary">{children}</strong>
  );
}

/**
 * Numbered list item where the numeral renders OUTSIDE the highlight —
 * matches Figma 137:4022 / 137:4132. Used inside s1 entries so each
 * numbered step gets its own green block while the numeral stays on
 * the white page.
 */
function NumberedItem({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-start text-[16px] leading-[24px] text-text-primary">
      <span className="shrink-0 pr-2 tabular-nums">{index}.</span>
      <SuggestionHighlight>{children}</SuggestionHighlight>
    </span>
  );
}

export const passwordResetRegions: ArticleBodyRegions = {
  header: (
    <>
      <H1>How to Reset Your Password</H1>
      <Subtitle>Last updated 2 months ago</Subtitle>
    </>
  ),
  beforeS1: (
    <P>
      Resetting your password in Hiver is simple and secure. You can update
      it from your account settings if you remember your current password,
      or use the password recovery flow if you&rsquo;ve forgotten it.
    </P>
  ),
  /* Per-sentence sentence array. The H2 entry is JSX so it keeps its
   * 20/28 semibold typography; numbered list entries place the
   * "1. ", "2. ", … prefixes outside the highlighted span so the
   * numerals stay on the white background (Figma 137:4022). */
  s1: [
    <span
      key="h2"
      className="block text-[20px] font-semibold leading-[28px] text-text-primary"
    >
      <SuggestionHighlight>
        Resetting Your Password via Mobile App
      </SuggestionHighlight>
    </span>,
    'If you’re using the Hiver mobile app, follow these steps to reset your password:',
    <NumberedItem key="li-1" index={1}>
      Open the Hiver mobile app on your device
    </NumberedItem>,
    <NumberedItem key="li-2" index={2}>
      Tap on “Forgot Password” on the login screen
    </NumberedItem>,
    <NumberedItem key="li-3" index={3}>
      Enter your registered email address
    </NumberedItem>,
    <NumberedItem key="li-4" index={4}>
      Check your email for a password reset link
    </NumberedItem>,
    <NumberedItem key="li-5" index={5}>
      Tap the link and follow the instructions to set a new password
    </NumberedItem>,
    <NumberedItem key="li-6" index={6}>
      Log in with your new password
    </NumberedItem>,
  ],
  betweenS1AndS2: (
    <>
      <H2>Resetting Password via Admin Panel</H2>
      <P>
        If you&rsquo;re an administrator, you can reset passwords on behalf
        of other users:
      </P>
    </>
  ),
  /* Replace s2 — each half is one JSX entry containing inline emphasis
   * (the admin URL is wrapped in <Strong>). The <SuggestionHighlight>
   * wraps the whole sentence including the bolded URL inside it. */
  s2: {
    before: [
      <span
        key="s2-before"
        className="text-[16px] leading-[24px] text-text-primary"
      >
        <SuggestionHighlight>
          Navigate to the admin panel at{' '}
          <Strong>admin.hiver.com/legacy/users</Strong>
          {' '}and select the user whose password needs to be reset.
        </SuggestionHighlight>
      </span>,
    ],
    after: [
      <span
        key="s2-after"
        className="text-[16px] leading-[24px] text-text-primary"
      >
        <SuggestionHighlight>
          Navigate to the admin panel at{' '}
          <Strong>admin.hiver.com/settings/users</Strong>
          {' '}and select the user whose password needs to be reset. You
          can also use the search bar to quickly find users by name or
          email.
        </SuggestionHighlight>
      </span>,
    ],
  },
  betweenS2AndS3: null,
  /* Removal s3 — each entry is one highlighted block, separated by
   * 4px gaps so the white background reads through between entries.
   * The H2 and H3 keep their heading typography via JSX entries; the
   * body paragraph is split into two sentences (matches the natural
   * sentence breaks in the source text). */
  s3: [
    <span
      key="s3-h2"
      className="block text-[20px] font-semibold leading-[28px] text-text-primary"
    >
      <SuggestionHighlight>Troubleshooting</SuggestionHighlight>
    </span>,
    <span
      key="s3-h3"
      className="block text-[16px] font-semibold leading-[24px] text-text-primary"
    >
      <SuggestionHighlight>
        Resetting via Chrome Extension
      </SuggestionHighlight>
    </span>,
    'If you’re using the Hiver Chrome Extension and experiencing issues resetting your password, try clearing your browser cache, restarting Chrome, and attempting the reset flow again.',
    'If issues persist, contact support.',
  ],
  afterS3: (
    <>
      <H2>Password Requirements</H2>
      <P>Your new password must meet the following criteria:</P>
      <UL>
        <li>At least 8 characters long</li>
        <li>Include at least one uppercase letter</li>
        <li>Include at least one number</li>
        <li>Include at least one special character</li>
      </UL>
    </>
  ),
};
