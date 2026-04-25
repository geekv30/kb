// Figma: 9aGp5t9fH1d0PXi4LMhOdb#74:10788 (AI Gaps review flow)
//        frames 2/3/5/6/8/10 — varying per-suggestion state
//
// Read-mode article body used by the AI Gaps review experience. Renders the
// three suggestion regions (s1 addition, s2 replace, s3 removal) wrapped in
// `SuggestionBlock` when "active"/"inactive", or inlined as plain text when
// "accepted"/"dismissed" per the flow-doc semantics.
//
// NOTE: body copy here is hardcoded per the dispatch spec — do not swap for
// the editor body in `KBEditorPage.stories.tsx`, which is a different
// article state and uses a different first paragraph and headings.
import * as React from 'react';
import { cn } from '../../utils/cn';
import { SuggestionBlock } from './SuggestionBlock';

/* ─────────────────────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────────────────────── */

export type ArticleSuggestionDecision =
  | 'inactive'
  | 'active'
  | 'accepted'
  | 'dismissed';

export type ArticleBodyDecisions = {
  /** s1 — addition block wrapping the mobile-app section. */
  s1: ArticleSuggestionDecision;
  /** s2 — replace block swapping the admin URL paragraph. */
  s2: ArticleSuggestionDecision;
  /** s3 — removal block wrapping the Troubleshooting section. */
  s3: ArticleSuggestionDecision;
};

export type ArticleBodyProps = {
  /**
   * Per-suggestion state.
   * - `inactive` — highlight block rendered, not the focused suggestion.
   * - `active`   — highlight block rendered, is the focused suggestion.
   * - `accepted` — highlight removed; content applied per suggestion type.
   * - `dismissed`— highlight removed; content reverted per suggestion type.
   *
   * For P6.5a static frames, `active` and `inactive` render identically —
   * the distinction exists so a future state machine can style the active
   * block more prominently (ring, scroll target).
   */
  decisions: ArticleBodyDecisions;
  className?: string;
};

/* ─────────────────────────────────────────────────────────────
 * Typography helpers
 *
 * Extracted from the article card in Figma `53:8464` (ContentEditor
 * reference) and tightened to match the review-mode chrome in
 * `74:10788`. Values mirror what `ContentEditor` applies via Tiptap's
 * ProseMirror element — we can't re-use that here because this body
 * is NOT a Tiptap editor; it's a static render that composes inside
 * `SuggestionBlock` regions.
 * ───────────────────────────────────────────────────────────── */

function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="mb-2 text-[24px] font-semibold leading-[32px] text-[#0f172a]">
      {children}
    </h1>
  );
}

function Subtitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-6 text-[14px] font-normal leading-[20px] text-[#64748b]">
      {children}
    </p>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-6 mb-3 text-[20px] font-semibold leading-[28px] text-[#0f172a]">
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-4 mb-2 text-[16px] font-semibold leading-[24px] text-[#0f172a]">
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-[16px] font-normal leading-[24px] text-[#334155]">
      {children}
    </p>
  );
}

function OL({ children }: { children: React.ReactNode }) {
  return (
    <ol className="mb-4 list-decimal pl-6 text-[16px] font-normal leading-[24px] text-[#334155] [&>li]:mb-2">
      {children}
    </ol>
  );
}

function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="mb-4 list-disc pl-6 text-[16px] font-normal leading-[24px] text-[#334155] [&>li]:mb-2">
      {children}
    </ul>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return (
    <strong className="font-semibold text-[#0f172a]">{children}</strong>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Suggestion region content
 *
 * Each region is authored once and rendered three different ways
 * depending on `decisions[sN]`:
 *   1. inactive/active → wrapped in <SuggestionBlock>
 *   2. accepted        → rendered plain (addition) / swapped (replace) / hidden (removal)
 *   3. dismissed       → hidden (addition) / reverted (replace) / kept plain (removal)
 *
 * The helpers below centralize the content so the three branches don't
 * duplicate markup and drift out of sync.
 * ───────────────────────────────────────────────────────────── */

function S1Content() {
  return (
    <>
      <H2>Resetting Your Password via Mobile App</H2>
      <P>
        If you&rsquo;re using the Hiver mobile app, follow these steps to reset
        your password:
      </P>
      <OL>
        <li>Open the Hiver mobile app on your device</li>
        <li>Tap on &ldquo;Forgot Password&rdquo; on the login screen</li>
        <li>Enter your registered email address</li>
        <li>Check your email for a password reset link</li>
        <li>Tap the link and follow the instructions to set a new password</li>
        <li>Log in with your new password</li>
      </OL>
    </>
  );
}

function S2OldContent() {
  return (
    <P>
      Navigate to the admin panel at{' '}
      <Strong>admin.hiver.com/legacy/users</Strong> and select the user whose
      password needs to be reset.
    </P>
  );
}

function S2NewContent() {
  return (
    <P>
      Navigate to the admin panel at{' '}
      <Strong>admin.hiver.com/settings/users</Strong> and select the user
      whose password needs to be reset. You can also use the search bar to
      quickly find users by name or email.
    </P>
  );
}

function S3Content() {
  return (
    <>
      <H2>Troubleshooting</H2>
      <H3>Resetting via Chrome Extension</H3>
      <P>
        If you&rsquo;re using the Hiver Chrome Extension and experiencing
        issues resetting your password, try clearing your browser cache,
        restarting Chrome, and attempting the reset flow again. If issues
        persist, contact support.
      </P>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Per-suggestion renderers — encode the accept/dismiss semantics
 * ───────────────────────────────────────────────────────────── */

function S1Region({ decision }: { decision: ArticleSuggestionDecision }) {
  if (decision === 'accepted') {
    // Addition accepted → content kept as plain body text.
    return <S1Content />;
  }
  if (decision === 'dismissed') {
    // Addition dismissed → content never added.
    return null;
  }
  // inactive | active → highlight block.
  return (
    <SuggestionBlock type="addition" id="s1" className="mb-4">
      <S1Content />
    </SuggestionBlock>
  );
}

function S2Region({ decision }: { decision: ArticleSuggestionDecision }) {
  if (decision === 'accepted') {
    // Replace accepted → new content remains as plain text.
    return <S2NewContent />;
  }
  if (decision === 'dismissed') {
    // Replace dismissed → old content remains.
    return <S2OldContent />;
  }
  // inactive | active → red (old) + green (new) stacked pair.
  return (
    <SuggestionBlock
      type="replace"
      id="s2"
      className="mb-4"
      oldContent={<S2OldContent />}
      newContent={<S2NewContent />}
    />
  );
}

function S3Region({ decision }: { decision: ArticleSuggestionDecision }) {
  if (decision === 'accepted') {
    // Removal accepted → content deleted.
    return null;
  }
  if (decision === 'dismissed') {
    // Removal dismissed → existing content stays as plain body.
    return <S3Content />;
  }
  // inactive | active → red wash over the existing content.
  return (
    <SuggestionBlock type="removal" id="s3" className="mb-4">
      <S3Content />
    </SuggestionBlock>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Component
 * ───────────────────────────────────────────────────────────── */

export function ArticleBody({ decisions, className }: ArticleBodyProps) {
  return (
    <article
      data-kb-component="article-body"
      data-kb-s1={decisions.s1}
      data-kb-s2={decisions.s2}
      data-kb-s3={decisions.s3}
      className={cn(
        'w-full max-w-[720px] rounded-[12px] border border-card-border bg-white',
        'shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
        'p-8',
        className,
      )}
    >
      <H1>How to Reset Your Password</H1>
      <Subtitle>Last updated 2 months ago</Subtitle>
      <P>
        Resetting your password in Hiver is simple and secure. You can update
        it from your account settings if you remember your current password,
        or use the password recovery flow if you&rsquo;ve forgotten it.
      </P>

      <S1Region decision={decisions.s1} />

      <H2>Resetting Password via Admin Panel</H2>
      <P>
        If you&rsquo;re an administrator, you can reset passwords on behalf of
        other users:
      </P>

      <S2Region decision={decisions.s2} />

      <S3Region decision={decisions.s3} />

      <H2>Password Requirements</H2>
      <P>Your new password must meet the following criteria:</P>
      <UL>
        <li>At least 8 characters long</li>
        <li>Include at least one uppercase letter</li>
        <li>Include at least one number</li>
        <li>Include at least one special character</li>
      </UL>
    </article>
  );
}
