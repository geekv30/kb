// Password-reset article markup for the AI Gaps Review experience.
//
// Duplicated from kb-ui's `KBAIGapsExperience.stories.tsx` (the canonical
// example) — we cannot import internal kb-ui stories from the demo, and
// the regions are deliberately not part of kb-ui's public API (consumers
// own their article HTML; ArticleBody just owns the SuggestionBlock
// wrapping per `decisions`).
//
// The slot semantics match `ArticleBodyRegions` exactly:
//   - header           → article title + byline
//   - beforeS1         → intro paragraph
//   - s1               → addition: mobile-app instructions section
//   - betweenS1AndS2   → "Resetting via Admin Panel" heading + intro
//   - s2.before/.after → admin panel URL paragraph (legacy → new)
//   - betweenS2AndS3   → null (s3 follows directly)
//   - s3               → removal: Troubleshooting section
//   - afterS3          → password requirements section
//
// Pre-existing behaviour: this is the only article body the demo's review
// route ships in v1. The other two AI-targeted articles (auto-reply rules,
// chat widget) reuse this same content because the mock store doesn't
// model per-article body HTML — see `ReviewPage.tsx`'s notes on the slot
// mapping for the rationale.

import * as React from 'react';
import type { ArticleBodyRegions } from '@test-kb-ui/kb-ui';

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
  s1: (
    <>
      <H2>Resetting Your Password via Mobile App</H2>
      <P>
        If you&rsquo;re using the Hiver mobile app, follow these steps to
        reset your password:
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
  ),
  betweenS1AndS2: (
    <>
      <H2>Resetting Password via Admin Panel</H2>
      <P>
        If you&rsquo;re an administrator, you can reset passwords on behalf
        of other users:
      </P>
    </>
  ),
  s2: {
    before: (
      <P>
        Navigate to the admin panel at{' '}
        <Strong>admin.hiver.com/legacy/users</Strong> and select the user
        whose password needs to be reset.
      </P>
    ),
    after: (
      <P>
        Navigate to the admin panel at{' '}
        <Strong>admin.hiver.com/settings/users</Strong> and select the user
        whose password needs to be reset. You can also use the search bar
        to quickly find users by name or email.
      </P>
    ),
  },
  betweenS2AndS3: null,
  s3: (
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
  ),
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
