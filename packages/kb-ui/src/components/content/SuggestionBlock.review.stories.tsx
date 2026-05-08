import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import {
  SuggestionBlock,
  SuggestionHighlight,
} from './SuggestionBlock';
import { FigmaCompare } from '../../_review/FigmaCompare';
import additionFigmaImg from '../../../../../design/screenshots/suggestion-block-addition.png';
import removalFigmaImg from '../../../../../design/screenshots/suggestion-block-removal.png';
import { figmaNode as additionFigma } from './SuggestionBlock.figma';
import { figmaNode as removalFigma } from './SuggestionBlock.removal.figma';

/* ─────────────────────────────────────────────────────────────
 * Review canvas for the per-sentence highlight rewrite (Phase 15).
 *
 * Figma frames are 720px-wide article bodies showing the full password-reset
 * article with the addition/removal block somewhere in the middle. The story
 * mirrors that — full article surface (heading + body + the highlighted
 * region in context) so the reviewer can spot per-sentence gaps and
 * highlight tightness.
 *
 * Outer pane width matches the 446px image (Figma framework returned
 * `width: 446` for both nodes) but the article inside is 720px — the
 * compare canvas absorbs the difference via its zoom-to-fit behavior.
 * ───────────────────────────────────────────────────────────── */

const meta: Meta<typeof SuggestionBlock> = {
  title: 'Review/Content/SuggestionBlock',
  component: SuggestionBlock,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function makeFigmaUrl(node: { fileKey: string; nodeId: string }): string {
  return `https://www.figma.com/design/${node.fileKey}/?node-id=${node.nodeId.replace(':', '-')}`;
}

/* ─── Article-style typography helpers, scoped to the review canvas ─── */

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

/* ─── Surrounding article shell — shared between Addition and Removal ─── */

function ArticleShell({
  inlineSuggestion,
}: {
  inlineSuggestion: React.ReactNode;
}) {
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

      {inlineSuggestion}

      <ArticleH2>SSO Password Reset (Admin Only)</ArticleH2>
      <ArticleP>
        If your organization uses Single Sign-On (SSO), individual users
        cannot reset their passwords through Hiver. Instead, an
        administrator must initiate the reset from the identity provider
        or the Hiver admin panel.
      </ArticleP>
      <ArticleP>
        Navigate to the admin panel at{' '}
        <strong>admin.hiver.com/legacy/users</strong> and select the user
        whose password needs to be reset.
      </ArticleP>
      <ArticleP>
        Navigate to the admin panel at{' '}
        <strong>admin.hiver.com/settings/users</strong> and select the
        user whose password needs to be reset. You can also use the
        search bar to quickly find users by name or email.
      </ArticleP>

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

/* ─────────────────────────────────────────────────────────────
 * Addition — Figma 137:4022.
 *
 * Heading + intro paragraph (one sentence) + 6 numbered list items.
 * Each entry is its own highlighted block, gap = 4px between entries.
 * The numbered entries put the numeral on the white page (outside the
 * highlight) per Figma — see `<NumberedItem>` above.
 * ───────────────────────────────────────────────────────────── */

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

export const Addition: StoryObj<typeof SuggestionBlock> = {
  render: () => (
    <FigmaCompare
      storyKey="content-suggestionblock-addition"
      figmaImage={additionFigmaImg}
      componentLabel="SuggestionBlock"
      frameLabel="Figma · type=addition, per-sentence highlights"
      figmaNodeUrl={makeFigmaUrl(additionFigma)}
    >
      <ArticleShell
        inlineSuggestion={
          <div className="mb-8">
            <SuggestionBlock type="addition" sentences={ADDITION_SENTENCES} />
          </div>
        }
      />
    </FigmaCompare>
  ),
};

/* ─────────────────────────────────────────────────────────────
 * Removal — Figma 137:4132.
 *
 * Single sentence (the legacy admin URL paragraph) wraps to two text
 * lines. The highlight breaks per line via `box-decoration-break: clone`
 * — matches Figma where two 24px-tall rects stack to cover the wrapped
 * sentence.
 * ───────────────────────────────────────────────────────────── */

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

/* For removal, the article shell shows the SSO section with the legacy
 * paragraph swapped in as the highlighted removal block. We render a
 * trimmed shell here so the in-context paragraph is the only one
 * matching Figma's removed-content target. */
function RemovalArticleShell() {
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

      <ArticleH2>Resetting Your Password via Mobile App</ArticleH2>
      <ol className="mb-8 list-decimal pl-6 text-[16px] font-normal leading-[24px] text-[#0f172a] [&>li]:mb-[10px]">
        <li>Open the Hiver mobile app and tap your profile icon in the bottom-right corner.</li>
        <li>Navigate to Settings → Security → Change Password.</li>
        <li>Tap “Forgot Password?” to receive a reset link via email.</li>
        <li>Check your registered email for the reset link (arrives within 2 minutes).</li>
        <li>Tap the link from your mobile device — it will open directly in the app.</li>
        <li>Enter your new password (minimum 12 characters, must include one uppercase letter and one number).</li>
      </ol>

      <ArticleH2>SSO Password Reset (Admin Only)</ArticleH2>
      <ArticleP>
        If your organization uses Single Sign-On (SSO), individual users
        cannot reset their passwords through Hiver. Instead, an
        administrator must initiate the reset from the identity provider
        or the Hiver admin panel.
      </ArticleP>

      {/* Highlighted removal target */}
      <div className="mb-8">
        <SuggestionBlock type="removal" sentences={REMOVAL_SENTENCES} />
      </div>

      <ArticleP>
        Navigate to the admin panel at{' '}
        <strong>admin.hiver.com/settings/users</strong> and select the
        user whose password needs to be reset. You can also use the
        search bar to quickly find users by name or email.
      </ArticleP>

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

export const Removal: StoryObj<typeof SuggestionBlock> = {
  render: () => (
    <FigmaCompare
      storyKey="content-suggestionblock-removal"
      figmaImage={removalFigmaImg}
      componentLabel="SuggestionBlock"
      frameLabel="Figma · type=removal, per-sentence highlights"
      figmaNodeUrl={makeFigmaUrl(removalFigma)}
    >
      <RemovalArticleShell />
    </FigmaCompare>
  ),
};
