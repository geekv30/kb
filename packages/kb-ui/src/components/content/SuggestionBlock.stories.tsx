import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { SuggestionBlock, SuggestionHighlight } from './SuggestionBlock';

/* ─────────────────────────────────────────────────────────────
 * Public Components/* Playground for SuggestionBlock.
 *
 * Mirrors the per-sentence highlight pattern from the Phase 15a
 * review story (Review/Content/SuggestionBlock). The block lives
 * inline inside an article body — heading + body copy + the
 * highlighted region in context — so reviewers can see how the
 * per-sentence wash hugs each line of wrapped text rather than
 * spanning the full container.
 *
 * Single Playground per Phase 14 single-story convention; the
 * three variants (addition / removal / replace) are stacked in
 * the same article shell so the surface tells one coherent
 * "How to Reset Your Password" story.
 *
 * Article shell helpers are duplicated here (rather than shared
 * with the review story) so the public component remains free of
 * review-only coupling like FigmaCompare.
 * ───────────────────────────────────────────────────────────── */

const meta: Meta<typeof SuggestionBlock> = {
  title: 'Components/AI/Suggestion Block',
  component: SuggestionBlock,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

/* ─── Article-style typography helpers ─── */

function ArticleH1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="mb-2 text-[24px] font-semibold leading-[32px] text-[#0f172a]">
      {children}
    </h1>
  );
}

function ArticleSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-8 text-[14px] font-normal leading-[20px] text-[#475569]">
      {children}
    </p>
  );
}

function ArticleP({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-8 text-[16px] font-normal leading-[24px] text-[#0f172a]">
      {children}
    </p>
  );
}

function ArticleH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 text-[20px] font-semibold leading-[28px] text-[#0f172a]">
      {children}
    </h2>
  );
}

function ArticleH3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-5 text-[18px] font-normal leading-[24px] text-[#0f172a]">
      {children}
    </h3>
  );
}

/**
 * Numbered list item where the numeral renders on the white page
 * (outside the highlight) and only the prose text gets the wash.
 * Matches Figma 137:4022 — see SuggestionBlock.review.stories.tsx.
 */
function NumberedItem({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-start text-[16px] leading-[24px] text-[#0f172a]">
      <span className="shrink-0 pr-2 tabular-nums">{index}.</span>
      <SuggestionHighlight>{children}</SuggestionHighlight>
    </span>
  );
}

/* ─── Sentence catalogues ─── */

const ADDITION_SENTENCES = [
  <span
    key="h2"
    className="block text-[20px] font-semibold leading-[28px] text-[#0f172a]"
  >
    <SuggestionHighlight>Resetting Your Password via Mobile App</SuggestionHighlight>
  </span>,
  <NumberedItem key="li-1" index={1}>
    Open the Hiver mobile app and tap your profile icon in the
    bottom-right corner.
  </NumberedItem>,
  <NumberedItem key="li-2" index={2}>
    Navigate to Settings → Security → Change Password.
  </NumberedItem>,
  <NumberedItem key="li-3" index={3}>
    Tap “Forgot Password?” to receive a reset link via email.
  </NumberedItem>,
  <NumberedItem key="li-4" index={4}>
    Check your registered email for the reset link (arrives within 2
    minutes).
  </NumberedItem>,
  <NumberedItem key="li-5" index={5}>
    Tap the link from your mobile device — it will open directly in the app.
  </NumberedItem>,
  <NumberedItem key="li-6" index={6}>
    Enter your new password (minimum 12 characters, must include one
    uppercase letter and one number).
  </NumberedItem>,
];

const REMOVAL_SENTENCES = [
  <span
    key="r-1"
    className="block text-[16px] leading-[24px] text-[#0f172a]"
  >
    <SuggestionHighlight>
      Navigate to the admin panel at{' '}
      <strong>admin.hiver.com/legacy/users</strong>
      {' '}and select the user whose password needs to be reset.
    </SuggestionHighlight>
  </span>,
];

const REPLACE_OLD_SENTENCES = [
  <span
    key="repl-old-1"
    className="block text-[16px] leading-[24px] text-[#0f172a]"
  >
    <SuggestionHighlight>
      Navigate to the admin panel at{' '}
      <strong>admin.hiver.com/legacy/users</strong>
      {' '}and select the user whose password needs to be reset.
    </SuggestionHighlight>
  </span>,
];

const REPLACE_NEW_SENTENCES = [
  <span
    key="repl-new-1"
    className="block text-[16px] leading-[24px] text-[#0f172a]"
  >
    <SuggestionHighlight>
      Navigate to the admin panel at{' '}
      <strong>admin.hiver.com/settings/users</strong>
      {' '}and select the user whose password needs to be reset. You
      can also use the search bar to quickly find users by name or
      email.
    </SuggestionHighlight>
  </span>,
];

/* ─── Playground ─── */

function SuggestionBlockPlayground() {
  return (
    <div
      className="border border-[#f1f5f9] bg-white p-10 rounded-[12px]"
      style={{
        width: 720,
        boxShadow:
          '0 4px 3px rgba(0,0,0,0.05), 0 2px 2px rgba(0,0,0,0.10)',
      }}
    >
      <ArticleH1>How to Reset Your Password</ArticleH1>
      <ArticleSubtitle>Last updated 9 months ago</ArticleSubtitle>

      <ArticleP>
        Your Hiver account password can be reset through several methods
        depending on how you access the platform. This guide covers all
        available reset options for both standard accounts and SSO-managed
        accounts.
      </ArticleP>

      <ArticleH2>Resetting from the Web Dashboard</ArticleH2>
      <ol className="mb-8 list-decimal pl-6 text-[16px] font-normal leading-[24px] text-[#0f172a] [&>li]:mb-[10px]">
        <li>Go to app.hiver.com and click <strong>“Sign In”</strong></li>
        <li>Click <strong>“Forgot Password?”</strong> below the sign-in form</li>
        <li>Enter the email address associated with your Hiver account</li>
        <li>Click <strong>“Send Reset Link”</strong> — you’ll receive an email within 2 minutes</li>
        <li>Click the reset link in the email and enter your new password</li>
        <li>Confirm your new password and click <strong>“Reset Password”</strong></li>
      </ol>

      {/* Addition — heading + 6 numbered items, each row its own highlight. */}
      <div className="mb-8">
        <SuggestionBlock type="addition" sentences={ADDITION_SENTENCES} />
      </div>

      <ArticleH2>SSO Password Reset (Admin Only)</ArticleH2>
      <ArticleP>
        If your organization uses Single Sign-On (SSO), individual users
        cannot reset their passwords through Hiver. Instead, an
        administrator must initiate the reset from the identity provider
        or the Hiver admin panel.
      </ArticleP>

      {/* Removal — single sentence wrapping to two lines, tight wash. */}
      <div className="mb-8">
        <SuggestionBlock type="removal" sentences={REMOVAL_SENTENCES} />
      </div>

      <ArticleP>
        Once the legacy reset has been processed, the new admin tooling
        replaces the URL above with a unified settings page. The
        replacement block below shows what an in-place edit looks like
        when an AI suggestion swaps the legacy paragraph for the new
        one.
      </ArticleP>

      {/* Replace — old (red) stacked above new (green), per-sentence. */}
      <div className="mb-8">
        <SuggestionBlock
          type="replace"
          oldSentences={REPLACE_OLD_SENTENCES}
          newSentences={REPLACE_NEW_SENTENCES}
        />
      </div>

      <ArticleH2>Password Requirements</ArticleH2>
      <ArticleP>Your new password must meet the following requirements:</ArticleP>
      <ul className="mb-8 list-disc pl-6 text-[16px] font-normal leading-[24px] text-[#0f172a] [&>li]:mb-[10px]">
        <li>Minimum 12 characters</li>
        <li>At least one uppercase letter (A-Z)</li>
        <li>At least one lowercase letter (a-z)</li>
        <li>At least one number (0-9)</li>
        <li>Cannot match any of your last 5 passwords</li>
      </ul>

      <ArticleH2>Troubleshooting</ArticleH2>
      <ArticleH3>Resetting via Chrome Extension</ArticleH3>
      <ArticleP>
        If you’re using the Hiver Chrome Extension, you can reset your
        password by clicking the gear icon → Account → Reset Password.
        This will redirect you to the web dashboard to complete the
        reset process.
      </ArticleP>
    </div>
  );
}

export const Playground: StoryObj<typeof SuggestionBlock> = {
  render: () => <SuggestionBlockPlayground />,
};

/* ─────────────────────────────────────────────────────────────
 * WithSuggestionId — DOM-only verification that `suggestionId`
 * propagates to `data-suggestion-id` on the SuggestionBlock root.
 * Visual rendering is incidental; this story exists for the
 * `useAnchorPositions` hook to target a deterministic anchor.
 * Inspect the rendered element to confirm
 * `[data-suggestion-id="suggestion-abc"]` is present on the root.
 * ───────────────────────────────────────────────────────────── */

export const WithSuggestionId: StoryObj<typeof SuggestionBlock> = {
  render: () => (
    <div style={{ width: 720, padding: 16 }}>
      <SuggestionBlock
        type="addition"
        suggestionId="suggestion-abc"
        sentences={[
          'This block carries a stable suggestion id on its root element so consumers can resolve its DOM anchor without coupling to the legacy s1/s2/s3 ids.',
        ]}
      />
    </div>
  ),
};
