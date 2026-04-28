// Phase 7.5.2 — AI Suggestion fixtures.
//
// 9 suggestions across 3 articles per PRD §13.4. Suggestion ids follow
// `sug-<topic>-<n>` so lexical sort gives stable s1, s2, s3 ordering.
// Each anchorBlockId MUST match a `data-block-id="..."` marker in the
// article's bodyHTML — seed.ts integrity asserts will catch any drift.
//
// Status starts 'pending' for every suggestion — the AI Gaps reducer
// transitions to accepted/dismissed/published as the user works through
// the review flow.

import type { AISuggestion } from '../types';

export const suggestions: AISuggestion[] = [
  /* ───────── art-how-to-reset-your-password (3) ───────── */
  {
    id: 'sug-resetpw-1',
    articleId: 'art-how-to-reset-your-password',
    type: 'addition',
    title: 'Add a "Step 0: Verify identity" block',
    description:
      'Customers report being phished mid-reset. Adding an explicit identity-verification step before the reset CTA reduces support tickets about hijacked accounts by ~40%.',
    anchorBlockId: 'reset-pw-intro',
    payload: {
      newHTML:
        '<section data-block-id="reset-pw-step-zero"><h2>Step 0: Verify your identity</h2><p>Before requesting a reset, double-check the URL in your address bar reads <code>app.hiverhq.com</code> exactly. Phishers commonly send fake reset prompts from look-alike domains. If you didn\'t request the reset yourself, ignore the email and report it via the in-app help menu.</p></section>',
    },
    sourceCount: 4,
    status: 'pending',
  },
  {
    id: 'sug-resetpw-2',
    articleId: 'art-how-to-reset-your-password',
    type: 'replace',
    title: 'Update the CTA — "Forgot password" was renamed in v3.2',
    description:
      'The button label changed from "Forgot password" to "Reset password" in the v3.2 sign-in redesign. The article still references the old label, which trips up customers who can\'t find the button.',
    anchorBlockId: 'reset-pw-cta',
    payload: {
      oldHTML:
        '<p data-block-id="reset-pw-cta">Open the Hiver sign-in page and click <strong>Forgot password</strong>. Enter the email address associated with your Hiver workspace and submit. We\'ll send you a one-time link valid for 30 minutes.</p>',
      newHTML:
        '<p data-block-id="reset-pw-cta">Open the Hiver sign-in page and click <strong>Reset password</strong> (renamed from "Forgot password" in v3.2). Enter the email address associated with your Hiver workspace and submit. We\'ll send you a one-time link valid for 30 minutes.</p>',
    },
    sourceCount: 4,
    status: 'pending',
  },
  {
    id: 'sug-resetpw-3',
    articleId: 'art-how-to-reset-your-password',
    type: 'removal',
    title: 'Remove the deprecated "Reset via SMS" section',
    description:
      'SMS-based reset was deprecated in February 2026 in favour of authenticator-app codes. The article still documents the old SMS path, which contradicts the in-app messaging.',
    anchorBlockId: 'reset-pw-sms',
    payload: {
      oldHTML:
        '<section data-block-id="reset-pw-sms"><h2>Resetting via SMS</h2><p>If your account has a verified phone number on file, you can also receive a six-digit code by SMS. From the sign-in page choose <strong>Use SMS instead</strong>, enter the number on file, and type the code into the verification screen. SMS codes expire after 10 minutes.</p></section>',
    },
    sourceCount: 4,
    status: 'pending',
  },

  /* ───────── art-setting-up-auto-reply-rules (3) ───────── */
  {
    id: 'sug-autoreply-1',
    articleId: 'art-setting-up-auto-reply-rules',
    type: 'addition',
    title: 'Add a note about timezone handling for rule schedules',
    description:
      'Multiple customer tickets confused workspace timezone with the agent\'s local timezone. A short clarifying paragraph after the schedule explanation prevents the misconfiguration.',
    anchorBlockId: 'auto-reply-schedules',
    payload: {
      newHTML:
        '<p data-block-id="auto-reply-tz-note"><strong>Timezone tip:</strong> rule schedules always run in the workspace\'s primary timezone, not the agent\'s local timezone. If your team spans timezones, double-check the schedule preview against the inbox\'s expected coverage hours before saving the rule.</p>',
    },
    sourceCount: 4,
    status: 'pending',
  },
  {
    id: 'sug-autoreply-2',
    articleId: 'art-setting-up-auto-reply-rules',
    type: 'replace',
    title: 'Clarify the ambiguous "Recent" trigger',
    description:
      'The "Recent" label is consistently misread as "any recent message" when it actually means "within the last 24 hours." Replacing the wording with the explicit window removes the ambiguity.',
    anchorBlockId: 'auto-reply-recent',
    payload: {
      oldHTML:
        '<p data-block-id="auto-reply-recent">The most common trigger is <em>New conversation</em> — fires once per conversation, the moment it arrives. The <em>Recent</em> trigger is ambiguous on its own; we recommend pairing it with an explicit time window to avoid accidentally re-firing on every message in an old thread.</p>',
      newHTML:
        '<p data-block-id="auto-reply-recent">The most common trigger is <em>New conversation</em> — fires once per conversation, the moment it arrives. The <em>Within the last 24 hours</em> trigger (formerly labelled "Recent") fires for any conversation whose last inbound message arrived in the past 24 hours, which is precise enough to use without an extra time window.</p>',
    },
    sourceCount: 4,
    status: 'pending',
  },
  {
    id: 'sug-autoreply-3',
    articleId: 'art-setting-up-auto-reply-rules',
    type: 'removal',
    title: 'Remove the deprecated "Match by sender domain only" toggle',
    description:
      'This legacy toggle was removed from the rule editor in March 2026. Documenting it confuses new customers who can\'t find it in the UI. Filter groups now cover the same use-case more flexibly.',
    anchorBlockId: 'auto-reply-domain',
    payload: {
      oldHTML:
        '<section data-block-id="auto-reply-domain"><h2>Match by sender domain only</h2><p>The legacy "Match by sender domain only" toggle flattens any conversation from a given domain into a single rule path. Most teams have moved to the more flexible "Filter group" UI, which lets you combine domain matching with tags, subject filters, and timing. This toggle is preserved for backward compatibility but new rules should not use it.</p></section>',
    },
    sourceCount: 4,
    status: 'pending',
  },

  /* ───────── art-customizing-the-chat-widget (3) ───────── */
  {
    id: 'sug-chatwidget-1',
    articleId: 'art-customizing-the-chat-widget',
    type: 'addition',
    title: 'Add an accessibility-best-practices subsection',
    description:
      'Customers in regulated industries (healthcare, finance, gov) need WCAG 2.1 AA guidance up front. A dedicated accessibility subsection right after the colour-customisation block surfaces the right defaults.',
    anchorBlockId: 'chat-widget-themes',
    payload: {
      newHTML:
        '<section data-block-id="chat-widget-a11y"><h2>Accessibility best practices</h2><p>The default theme already meets WCAG 2.1 AA contrast for body text and controls. When customising colours, keep contrast above 4.5:1 between launcher text and launcher background — the colour picker shows a live contrast warning when you fall below this. Other accessibility-affecting settings:</p><ul><li>Always provide a non-emoji welcome banner — screen readers treat emoji-only banners as decorative.</li><li>Keep the launcher position bottom-right unless your site\'s navigation conflicts — most users now expect that spot.</li><li>Enable keyboard-shortcut hints in <strong>Widget → Behaviour</strong> for power users on assistive tech.</li></ul></section>',
    },
    sourceCount: 4,
    status: 'pending',
  },
  {
    id: 'sug-chatwidget-2',
    articleId: 'art-customizing-the-chat-widget',
    type: 'replace',
    title: 'Update "Color picker" — renamed to "Theme selector"',
    description:
      'The colour-picker UI was upgraded in v4.1 to a full theme selector with WCAG-validated palettes. The article should reflect the new control name and call out the validation step.',
    anchorBlockId: 'chat-widget-color',
    payload: {
      oldHTML:
        '<p data-block-id="chat-widget-color">Use the <strong>Color picker</strong> to set the launcher and header background. The text colour auto-adjusts for contrast — the widget stays legible whether you pick a deep navy or a pale cream as the base.</p>',
      newHTML:
        '<p data-block-id="chat-widget-color">Use the <strong>Theme selector</strong> (now WCAG-validated) to set the launcher and header background. Hiver shows a live contrast badge as you pick — anything below WCAG 2.1 AA earns a warning so you can correct before the widget ships.</p>',
    },
    sourceCount: 4,
    status: 'pending',
  },
  {
    id: 'sug-chatwidget-3',
    articleId: 'art-customizing-the-chat-widget',
    type: 'removal',
    title: 'Remove the legacy "Embed via iframe" instructions',
    description:
      'The iframe embed path was deprecated in v4.0 — it doesn\'t support the new realtime features and is end-of-life by Q3 2026. Documenting it sends customers down a dead-end path.',
    anchorBlockId: 'chat-widget-iframe',
    payload: {
      oldHTML:
        '<section data-block-id="chat-widget-iframe"><h2>Embedding via iframe</h2><p>For pages where you can\'t drop a script tag (legacy CMS, sandboxed environments) you can embed the widget as an iframe. Get the iframe URL from <strong>Widget → Install → iframe</strong>. Note that iframe embed disables some features — agent typing indicators, file drag-drop, and screen-share invitations all rely on the parent-page script.</p></section>',
    },
    sourceCount: 4,
    status: 'pending',
  },
];
