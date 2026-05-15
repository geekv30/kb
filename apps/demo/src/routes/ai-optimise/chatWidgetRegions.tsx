// Chat widget article markup for the AI Gaps Review experience.
//
// Mirrors `./passwordResetRegions.tsx`'s shape — the demo cannot import
// private story symbols, so we replicate the typography helpers locally
// per the existing convention.
//
// Suggestion payload alignment (`apps/demo/src/store/fixtures/suggestions.ts`):
//   - s1 (addition)  ↔ sug-chatwidget-1.payload.newHTML  — a11y subsection
//   - s2 (replace)   ↔ sug-chatwidget-2.payload.{oldHTML,newHTML}  — color picker → theme selector
//   - s3 (removal)   ↔ sug-chatwidget-3.payload.oldHTML  — iframe embed
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
 * `passwordResetRegions.tsx` 1:1.
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

export const chatWidgetRegions: ArticleBodyRegions = {
  header: (
    <>
      <H1>Customizing the Chat Widget</H1>
      <Subtitle>Last updated 1 month ago</Subtitle>
    </>
  ),
  beforeS1: (
    <>
      <P>
        The Hiver chat widget appears on your customer-facing pages and
        lets visitors start conversations with your support team. You can
        customize its colors, position, behavior, and embed method to
        match your brand and product.
      </P>
      <H2>Choosing Colors and Themes</H2>
      <P>
        Open <Strong>Widget → Appearance</Strong> to access the theme
        settings. Hiver ships with three preset themes (Default, Dark,
        High contrast) you can use as starting points, or build a custom
        theme from scratch.
      </P>
    </>
  ),
  /* Addition — accessibility subsection. H2 + intro + bullet list each
   * render as their own highlighted entry so the heading keeps its
   * typography and the list keeps its disc bullets + indentation. */
  s1: [
    <span
      key="s1-h2"
      className="block text-[20px] font-semibold leading-[28px] text-text-primary"
    >
      <SuggestionHighlight>
        Accessibility best practices
      </SuggestionHighlight>
    </span>,
    'The default theme already meets WCAG 2.1 AA contrast for body text and controls. When customising colours, keep contrast above 4.5:1 between launcher text and launcher background — the colour picker shows a live contrast warning when you fall below this. Other accessibility-affecting settings:',
    <span
      key="s1-list-1"
      className="block text-[16px] leading-[24px] text-text-primary"
    >
      <SuggestionHighlight>
        <span className="flex items-start">
          <span className="shrink-0 pr-2">•</span>
          <span>
            Always provide a non-emoji welcome banner — screen readers
            treat emoji-only banners as decorative.
          </span>
        </span>
      </SuggestionHighlight>
    </span>,
    <span
      key="s1-list-2"
      className="block text-[16px] leading-[24px] text-text-primary"
    >
      <SuggestionHighlight>
        <span className="flex items-start">
          <span className="shrink-0 pr-2">•</span>
          <span>
            Keep the launcher position bottom-right unless your site&rsquo;s
            navigation conflicts — most users now expect that spot.
          </span>
        </span>
      </SuggestionHighlight>
    </span>,
    <span
      key="s1-list-3"
      className="block text-[16px] leading-[24px] text-text-primary"
    >
      <SuggestionHighlight>
        <span className="flex items-start">
          <span className="shrink-0 pr-2">•</span>
          <span>
            Enable keyboard-shortcut hints in{' '}
            <Strong>Widget → Behaviour</Strong> for power users on
            assistive tech.
          </span>
        </span>
      </SuggestionHighlight>
    </span>,
  ],
  betweenS1AndS2: (
    <>
      <H2>Setting the Brand Color</H2>
      <P>
        Customizing the colour is usually the first step when matching
        the widget to your brand. The widget propagates the brand colour
        to the launcher, the header bar, and outgoing message bubbles.
      </P>
    </>
  ),
  /* Replace — Color picker → Theme selector. Inline <Strong> picks up
   * the bolded component names from the suggestion payload. */
  s2: {
    before: [
      <span
        key="s2-before"
        className="text-[16px] leading-[24px] text-text-primary"
      >
        <SuggestionHighlight>
          Use the <Strong>Color picker</Strong> to set the launcher and
          header background. The text colour auto-adjusts for contrast —
          the widget stays legible whether you pick a deep navy or a pale
          cream as the base.
        </SuggestionHighlight>
      </span>,
    ],
    after: [
      <span
        key="s2-after"
        className="text-[16px] leading-[24px] text-text-primary"
      >
        <SuggestionHighlight>
          Use the <Strong>Theme selector</Strong> (now WCAG-validated) to
          set the launcher and header background. Hiver shows a live
          contrast badge as you pick — anything below WCAG 2.1 AA earns a
          warning so you can correct before the widget ships.
        </SuggestionHighlight>
      </span>,
    ],
  },
  betweenS2AndS3: (
    <>
      <H2>Installing the Widget</H2>
      <P>
        Once your theme is finalised, install the widget on your site.
        The recommended method is a <code>&lt;script&gt;</code> tag in
        your page&rsquo;s <code>&lt;head&gt;</code> — it loads
        asynchronously, supports realtime features, and updates
        automatically when you change widget settings.
      </P>
    </>
  ),
  /* Removal — legacy iframe embed. H2 + body each render as their own
   * highlighted entry so the heading keeps its typography. */
  s3: [
    <span
      key="s3-h2"
      className="block text-[20px] font-semibold leading-[28px] text-text-primary"
    >
      <SuggestionHighlight>Embedding via iframe</SuggestionHighlight>
    </span>,
    'For pages where you can’t drop a script tag (legacy CMS, sandboxed environments) you can embed the widget as an iframe. Get the iframe URL from Widget → Install → iframe. Note that iframe embed disables some features — agent typing indicators, file drag-drop, and screen-share invitations all rely on the parent-page script.',
  ],
  afterS3: (
    <>
      <H2>Testing on Staging</H2>
      <P>
        Before promoting widget changes to production, test in a staging
        environment. Hiver lets you toggle the staging variant from{' '}
        <Strong>Widget → Environments</Strong> — staging traffic stays
        isolated from production analytics and customer histories.
      </P>
    </>
  ),
};
