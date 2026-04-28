// Phase 7.5.2 — ConversationSource fixtures.
//
// 12 conversation sources per PRD §13.5 — 4 per AI-targeted article.
// Each has a realistic sender (real-sounding name + business-domain
// email), a subject that reads like a real support ticket about the
// article's topic, a 1–2 sentence customer-voiced snippet, and a
// timestamp within the last 30 days.
//
// These feed the SourcesSideSheet on the AI Gaps review page. The
// kb-ui ConversationSource type uses flat `senderName` / `senderEmail`
// fields; the demo's store uses a nested `sender` object so we can
// associate richer metadata if a future component needs it. The
// adapter that maps store-shape → kb-ui-shape lives in the page
// component (Phase 7.5.6).

import type { ConversationSource } from '../types';

const REFERENCE_DATE_MS = Date.UTC(2026, 3, 26, 12, 0, 0);

function daysAgo(n: number, hour = 14, minute = 0): string {
  const base = REFERENCE_DATE_MS - n * 86_400_000;
  const d = new Date(base);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const conversationSources: ConversationSource[] = [
  /* ───────── art-how-to-reset-your-password (4) ───────── */
  {
    id: 'cs-resetpw-1',
    articleId: 'art-how-to-reset-your-password',
    sender: {
      name: 'Marcus Reilly',
      email: 'marcus.reilly@northridge.io',
    },
    timestamp: daysAgo(2, 9, 14),
    subject: 'Cannot log in after password reset',
    snippet:
      "I followed the reset instructions but the link in the email never arrived — checked spam twice. Now I'm locked out and our team's morning queue is piling up.",
  },
  {
    id: 'cs-resetpw-2',
    articleId: 'art-how-to-reset-your-password',
    sender: {
      name: 'Priya Subramaniam',
      email: 'priya.s@brightlane.co',
    },
    timestamp: daysAgo(5, 16, 30),
    subject: 'SMS code not coming through',
    snippet:
      'Tried to reset via SMS three separate times — no code on my number, which is verified and definitely correct. Phone signal is fine. What now?',
  },
  {
    id: 'cs-resetpw-3',
    articleId: 'art-how-to-reset-your-password',
    sender: {
      name: 'Daniel Okafor',
      email: 'daniel@waypoint-supply.com',
    },
    timestamp: daysAgo(9, 10, 5),
    subject: 'Reset email going to spam folder',
    snippet:
      'Several agents on our team reported the password reset email lands in the Promotions tab in Gmail, not the inbox. Most never see it. Can you flag it as transactional?',
  },
  {
    id: 'cs-resetpw-4',
    articleId: 'art-how-to-reset-your-password',
    sender: {
      name: 'Yuki Tanaka',
      email: 'yuki.tanaka@meridian-labs.com',
    },
    timestamp: daysAgo(14, 11, 45),
    subject: 'Account locked after multiple resets',
    snippet:
      "Got locked out after trying to reset twice in five minutes. The screen says 'Too many attempts, contact support' — there's no clear way to recover from this state on my own.",
  },

  /* ───────── art-setting-up-auto-reply-rules (4) ───────── */
  {
    id: 'cs-autoreply-1',
    articleId: 'art-setting-up-auto-reply-rules',
    sender: {
      name: 'Rebecca Holm',
      email: 'rebecca@cobaltforge.com',
    },
    timestamp: daysAgo(3, 8, 22),
    subject: 'Auto-reply not firing on weekends',
    snippet:
      "Set up our weekend auto-reply two weeks ago. Customers report they aren't getting acknowledgments on Saturday mornings. Confirmed the schedule shows Sat/Sun ticked.",
  },
  {
    id: 'cs-autoreply-2',
    articleId: 'art-setting-up-auto-reply-rules',
    sender: {
      name: 'James Whitfield',
      email: 'jwhitfield@pinegrove.studio',
    },
    timestamp: daysAgo(6, 13, 50),
    subject: 'Rule schedule using wrong timezone',
    snippet:
      "Our team is in Sydney but the auto-reply schedule appears to run on UTC — replies go out three hours earlier than they should every morning. Where do I change the rule's timezone?",
  },
  {
    id: 'cs-autoreply-3',
    articleId: 'art-setting-up-auto-reply-rules',
    sender: {
      name: 'Hannah Castelli',
      email: 'hannah.c@silvercrest-co.com',
    },
    timestamp: daysAgo(10, 15, 10),
    subject: '"Recent" trigger fires for ancient threads',
    snippet:
      "I picked the Recent trigger for our after-hours auto-reply. It's now sending acknowledgements on conversations from three months ago every time the customer replies. Is this expected?",
  },
  {
    id: 'cs-autoreply-4',
    articleId: 'art-setting-up-auto-reply-rules',
    sender: {
      name: 'Thiago Almeida',
      email: 'thiago@levelten-ops.io',
    },
    timestamp: daysAgo(15, 9, 33),
    subject: 'Domain-only filter no longer in UI',
    snippet:
      "The 'match by sender domain only' toggle the docs reference is missing from the rule editor in our workspace. Did it move? We need to filter by domain alone for an enterprise customer carve-out.",
  },

  /* ───────── art-customizing-the-chat-widget (4) ───────── */
  {
    id: 'cs-chatwidget-1',
    articleId: 'art-customizing-the-chat-widget',
    sender: {
      name: 'Ingrid Solberg',
      email: 'ingrid@harbourlight-design.com',
    },
    timestamp: daysAgo(4, 14, 18),
    subject: 'Chat widget invisible on mobile Safari',
    snippet:
      "Customers on iOS Safari can't see the chat launcher at all — confirmed on iPhone 14 and 15. Works fine on desktop and on Android. Started after we updated the theme last week.",
  },
  {
    id: 'cs-chatwidget-2',
    articleId: 'art-customizing-the-chat-widget',
    sender: {
      name: 'Kwame Asante',
      email: 'kwame@oakridge-health.com',
    },
    timestamp: daysAgo(7, 10, 47),
    subject: 'Need WCAG AA contrast on launcher',
    snippet:
      "Our compliance team flagged the chat launcher contrast as below 4.5:1 against our header. We need to hit WCAG 2.1 AA. Is there a way to validate the colour choice inside the widget editor?",
  },
  {
    id: 'cs-chatwidget-3',
    articleId: 'art-customizing-the-chat-widget',
    sender: {
      name: 'Sofia Marchetti',
      email: 'sofia@archway-press.com',
    },
    timestamp: daysAgo(11, 16, 5),
    subject: "Color picker doesn't preview correctly",
    snippet:
      "When I pick a colour in the widget editor the preview pane shows one shade and the live site shows a darker one. Cleared cache, confirmed in two browsers. Is there a delay before the change propagates?",
  },
  {
    id: 'cs-chatwidget-4',
    articleId: 'art-customizing-the-chat-widget',
    sender: {
      name: 'Ahmed Bouzidi',
      email: 'ahmed.b@vantage-cloud.io',
    },
    timestamp: daysAgo(18, 12, 28),
    subject: 'Iframe embed missing typing indicator',
    snippet:
      "We have to embed the widget via iframe (sandboxed CMS). Customers don't see the agent typing indicator and it makes the experience feel broken. Is there a workaround or are we stuck?",
  },
];
