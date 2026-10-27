// AI suggestion ("improvements") fixtures — 3 per AI-targeted article.
//
// `id`, `articleId`, `type`, `anchorBlockId`, `sourceCount`, and `status`
// match `apps/demo/src/store/fixtures/suggestions.ts`. Titles and
// descriptions describe the change each payload actually makes (the
// password-reset copy follows `ai-suggestions-flow.md`), in US English.
//
// `payload` HTML is aligned to the article bodies in `./articles.ts`
// (which follow the demo's `*Regions.tsx` content, the source of truth
// for what the review UI renders): every `oldHTML` is the exact block
// string present in the body, and every `newHTML` is the `after` /
// addition side of the matching region. The review view derives its
// body from these payloads (see `improvements/reviewDocument.ts`).

import type { AISuggestion } from '../types';
import {
  AUTO_REPLY_DOMAIN_HTML,
  AUTO_REPLY_RECENT_HTML,
  CHAT_WIDGET_COLOR_HTML,
  CHAT_WIDGET_IFRAME_HTML,
  RESET_PW_CTA_HTML,
  RESET_PW_TROUBLESHOOTING_HTML,
} from './articles';

export const suggestions: AISuggestion[] = [
  /* ───────── art-how-to-reset-your-password (3) ───────── */
  {
    id: 'sug-resetpw-1',
    articleId: 'art-how-to-reset-your-password',
    type: 'addition',
    title: 'Mobile app password reset instructions',
    description: 'Add detailed mobile app password reset instructions with proper steps.',
    anchorBlockId: 'reset-pw-intro',
    payload: {
      newHTML:
        '<section data-block-id="reset-pw-mobile"><h2>Resetting Your Password via Mobile App</h2><p>If you’re using the Hiver mobile app, follow these steps to reset your password:</p><ol><li>Open the Hiver mobile app on your device</li><li>Tap on “Forgot Password” on the login screen</li><li>Enter your registered email address</li><li>Check your email for a password reset link</li><li>Tap the link and follow the instructions to set a new password</li><li>Log in with your new password</li></ol></section>',
    },
    sourceCount: 4,
    status: 'pending',
  },
  {
    id: 'sug-resetpw-2',
    articleId: 'art-how-to-reset-your-password',
    type: 'replace',
    title: 'Update outdated URL',
    description: 'Replace the old admin panel link with the current one.',
    anchorBlockId: 'reset-pw-cta',
    payload: {
      oldHTML: RESET_PW_CTA_HTML,
      newHTML:
        '<p data-block-id="reset-pw-cta">Navigate to the admin panel at <strong>admin.hiver.com/settings/users</strong> and select the user whose password needs to be reset. You can also use the search bar to quickly find users by name or email.</p>',
    },
    sourceCount: 4,
    status: 'pending',
  },
  {
    id: 'sug-resetpw-3',
    articleId: 'art-how-to-reset-your-password',
    type: 'removal',
    title: 'Legacy instructions',
    description: 'Remove the outdated Chrome extension reset steps.',
    anchorBlockId: 'reset-pw-chrome',
    payload: {
      oldHTML: RESET_PW_TROUBLESHOOTING_HTML,
    },
    sourceCount: 4,
    status: 'pending',
  },

  /* ───────── art-setting-up-auto-reply-rules (3) ───────── */
  {
    id: 'sug-autoreply-1',
    articleId: 'art-setting-up-auto-reply-rules',
    type: 'addition',
    title: 'Timezone note for rule schedules',
    description:
      'Customers mix up the company timezone and each agent’s local timezone. A note after the schedule section prevents mistakes.',
    anchorBlockId: 'auto-reply-schedules',
    payload: {
      newHTML:
        '<p data-block-id="auto-reply-tz-note"><strong>Timezone tip:</strong> rule schedules always run in the company’s primary timezone, not the agent’s local timezone. If your team spans timezones, double-check the schedule preview against the inbox’s expected coverage hours before saving the rule.</p>',
    },
    sourceCount: 4,
    status: 'pending',
  },
  {
    id: 'sug-autoreply-2',
    articleId: 'art-setting-up-auto-reply-rules',
    type: 'replace',
    title: 'Clarify the “Recent” trigger',
    description:
      '“Recent” reads as “any recent message” but means “within the last 24 hours.” Rename it to remove the ambiguity.',
    anchorBlockId: 'auto-reply-recent',
    payload: {
      oldHTML: AUTO_REPLY_RECENT_HTML,
      newHTML:
        '<p data-block-id="auto-reply-recent">The most common trigger is <em>New conversation</em> — fires once per conversation, the moment it arrives. The <em>Within the last 24 hours</em> trigger (formerly labeled “Recent”) fires for any conversation whose last inbound message arrived in the past 24 hours, which is precise enough to use without an extra time window.</p>',
    },
    sourceCount: 4,
    status: 'pending',
  },
  {
    id: 'sug-autoreply-3',
    articleId: 'art-setting-up-auto-reply-rules',
    type: 'removal',
    title: 'Retired sender domain toggle',
    description:
      'The toggle was removed from the rule editor in March 2026. Filter groups now cover the same need.',
    anchorBlockId: 'auto-reply-domain',
    payload: {
      oldHTML: AUTO_REPLY_DOMAIN_HTML,
    },
    sourceCount: 4,
    status: 'pending',
  },

  /* ───────── art-customizing-the-chat-widget (3) ───────── */
  {
    id: 'sug-chatwidget-1',
    articleId: 'art-customizing-the-chat-widget',
    type: 'addition',
    title: 'Accessibility best practices',
    description:
      'Customers in regulated industries need WCAG 2.1 AA guidance up front. Add a section after the theme settings.',
    anchorBlockId: 'chat-widget-themes',
    payload: {
      newHTML:
        '<section data-block-id="chat-widget-a11y"><h2>Accessibility best practices</h2><p>The default theme already meets WCAG 2.1 AA contrast for body text and controls. When customizing colors, keep contrast above 4.5:1 between launcher text and launcher background — the color picker shows a live contrast warning when you fall below this. Other accessibility-affecting settings:</p><ul><li>Always provide a non-emoji welcome banner — screen readers treat emoji-only banners as decorative.</li><li>Keep the launcher position bottom-right unless your site’s navigation conflicts — most users now expect that spot.</li><li>Enable keyboard-shortcut hints in <strong>Widget → Behavior</strong> for power users on assistive tech.</li></ul></section>',
    },
    sourceCount: 4,
    status: 'pending',
  },
  {
    id: 'sug-chatwidget-2',
    articleId: 'art-customizing-the-chat-widget',
    type: 'replace',
    title: 'Rename “Color picker” to “Theme selector”',
    description:
      'Version 4.1 replaced the color picker with a theme selector that checks contrast. Rename it and mention the check.',
    anchorBlockId: 'chat-widget-color',
    payload: {
      oldHTML: CHAT_WIDGET_COLOR_HTML,
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
    title: 'Legacy iframe embed steps',
    description:
      'Embedding via iframe stops working in Q3 2026 and already misses real-time features. The article still documents it.',
    anchorBlockId: 'chat-widget-iframe',
    payload: {
      oldHTML: CHAT_WIDGET_IFRAME_HTML,
    },
    sourceCount: 4,
    status: 'pending',
  },
];
