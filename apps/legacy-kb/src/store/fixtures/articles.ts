// Article fixtures.
//
// The AI-targeted articles carry their CURRENT content — the original
// side of every suggestion. Password reset, auto-reply rules, and chat
// widget derive from `apps/demo/src/routes/ai-optimise/*Regions.tsx`;
// chat routing (one replace suggestion) is local to this app:
//   - addition (s1) content is NOT in the body yet
//   - replace (s2) carries the `before` text
//   - removal (s3) content IS in the body
// Blocks that suggestions anchor to carry `data-block-id`, matching
// `anchorBlockId` in `./suggestions.ts` (and every `oldHTML` there is a
// byte-for-byte copy of the block it replaces/removes).
//
// Heading levels follow the live CKEditor heading config:
// "Heading 1" → <h2>, "Heading 2" → <h3>, "Heading 3" → <h4>.

import type { Article } from '../types';

const DAY_MS = 86_400_000;

/** ISO timestamp `n` days before app load, so relative labels stay stable. */
function daysAgo(n: number): string {
  return new Date(Date.now() - n * DAY_MS).toISOString();
}

/* ───────── AI-targeted article bodies ───────── */

export const RESET_PW_INTRO_HTML =
  '<p data-block-id="reset-pw-intro">Resetting your password in Hiver is simple and secure. You can update it from your account settings if you remember your current password, or use the password recovery flow if you’ve forgotten it.</p>';

export const RESET_PW_CTA_HTML =
  '<p data-block-id="reset-pw-cta">Navigate to the admin panel at <strong>admin.hiver.com/legacy/users</strong> and select the user whose password needs to be reset.</p>';

export const RESET_PW_TROUBLESHOOTING_HTML =
  '<section data-block-id="reset-pw-chrome"><h2>Troubleshooting</h2><h3>Resetting via Chrome Extension</h3><p>If you’re using the Hiver Chrome Extension and experiencing issues resetting your password, try clearing your browser cache, restarting Chrome, and attempting the reset flow again. If issues persist, contact support.</p></section>';

const RESET_PW_BODY = [
  RESET_PW_INTRO_HTML,
  '<h2>Resetting Password via Admin Panel</h2>',
  '<p>If you’re an administrator, you can reset passwords on behalf of other users:</p>',
  RESET_PW_CTA_HTML,
  RESET_PW_TROUBLESHOOTING_HTML,
  '<h2>Password Requirements</h2>',
  '<p>Your new password must meet the following criteria:</p>',
  '<ul><li>At least 8 characters long</li><li>Include at least one uppercase letter</li><li>Include at least one number</li><li>Include at least one special character</li></ul>',
].join('');

export const AUTO_REPLY_SCHEDULES_HTML =
  '<p data-block-id="auto-reply-schedules">Define when the rule is allowed to fire. Most teams use <strong>Business hours</strong> to limit the rule to working days; <strong>Always</strong> runs the rule 24/7 including weekends. The schedule editor previews the next 7 days so you can sanity-check the window before saving.</p>';

export const AUTO_REPLY_RECENT_HTML =
  '<p data-block-id="auto-reply-recent">The most common trigger is <em>New conversation</em> — fires once per conversation, the moment it arrives. The <em>Recent</em> trigger is ambiguous on its own; we recommend pairing it with an explicit time window to avoid accidentally re-firing on every message in an old thread.</p>';

export const AUTO_REPLY_DOMAIN_HTML =
  '<section data-block-id="auto-reply-domain"><h2>Match by sender domain only</h2><p>The legacy “Match by sender domain only” toggle flattens any conversation from a given domain into a single rule path. Most teams have moved to the more flexible “Filter group” UI, which lets you combine domain matching with tags, subject filters, and timing. This toggle is preserved for backward compatibility but new rules should not use it.</p></section>';

const AUTO_REPLY_BODY = [
  '<p>Auto-reply rules let you respond to incoming conversations automatically — useful for out-of-office coverage, after-hours acknowledgments, or routing simple FAQs to canned responses. Each rule has a <strong>trigger</strong> (the condition that fires it) and a <strong>schedule</strong> (the time window when it’s active).</p>',
  '<h2>Setting the Schedule</h2>',
  AUTO_REPLY_SCHEDULES_HTML,
  '<h2>Picking the Trigger</h2>',
  '<p>The trigger fires the rule. Hiver supports several conditions, from new conversation to time-windowed matches, and you can combine multiple triggers with AND/OR logic.</p>',
  AUTO_REPLY_RECENT_HTML,
  '<h2>Filtering by Sender</h2>',
  '<p>Filters narrow which conversations a rule applies to — by sender email, sender domain, conversation tag, or subject keyword. Combine filters into a <em>filter group</em> to express complex AND/OR conditions.</p>',
  AUTO_REPLY_DOMAIN_HTML,
  '<h2>Saving and Activating</h2>',
  '<p>Once the schedule, trigger, and filters are configured, click <strong>Save</strong> at the top right. The rule activates immediately for new incoming conversations matching its criteria. You can pause a rule at any time from the rule list — paused rules stay configured but stop firing.</p>',
].join('');

export const CHAT_WIDGET_THEMES_HTML =
  '<p data-block-id="chat-widget-themes">Open <strong>Widget → Appearance</strong> to access the theme settings. Hiver ships with three preset themes (Default, Dark, High contrast) you can use as starting points, or build a custom theme from scratch.</p>';

export const CHAT_WIDGET_COLOR_HTML =
  '<p data-block-id="chat-widget-color">Use the <strong>Color picker</strong> to set the launcher and header background. The text color auto-adjusts for contrast — the widget stays legible whether you pick a deep navy or a pale cream as the base.</p>';

export const CHAT_WIDGET_IFRAME_HTML =
  '<section data-block-id="chat-widget-iframe"><h2>Embedding via iframe</h2><p>For pages where you can’t drop a script tag (legacy CMS, sandboxed environments) you can embed the widget as an iframe. Get the iframe URL from Widget → Install → iframe. Note that iframe embed disables some features — agent typing indicators, file drag-drop, and screen-share invitations all rely on the parent-page script.</p></section>';

const CHAT_WIDGET_BODY = [
  '<p>The Hiver chat widget appears on your customer-facing pages and lets visitors start conversations with your support team. You can customize its colors, position, behavior, and embed method to match your brand and product.</p>',
  '<h2>Choosing Colors and Themes</h2>',
  CHAT_WIDGET_THEMES_HTML,
  '<h2>Setting the Brand Color</h2>',
  '<p>Customizing the color is usually the first step when matching the widget to your brand. The widget propagates the brand color to the launcher, the header bar, and outgoing message bubbles.</p>',
  CHAT_WIDGET_COLOR_HTML,
  '<h2>Installing the Widget</h2>',
  '<p>Once your theme is finalized, install the widget on your site. The recommended method is a <code>&lt;script&gt;</code> tag in your page’s <code>&lt;head&gt;</code> — it loads asynchronously, supports realtime features, and updates automatically when you change widget settings.</p>',
  CHAT_WIDGET_IFRAME_HTML,
  '<h2>Testing on Staging</h2>',
  '<p>Before promoting widget changes to production, test in a staging environment. Hiver lets you toggle the staging variant from <strong>Widget → Environments</strong> — staging traffic stays isolated from production analytics and customer histories.</p>',
].join('');

export const CHAT_ROUTING_DEFAULT_HTML =
  '<p data-block-id="chat-routing-default">By default, each new chat rings every online agent at once and goes to whoever accepts it first. This works well for small teams, but busy agents can end up with most of the chats.</p>';

const CHAT_ROUTING_BODY = [
  '<p>Chat routing decides which agent gets each new chat from your website. Set it up once per chat team, and Hiver applies it to every chat that comes in while the team is online.</p>',
  '<h2>How chats are assigned</h2>',
  CHAT_ROUTING_DEFAULT_HTML,
  '<h2>Limiting chats per agent</h2>',
  '<p>Set a <strong>maximum number of active chats</strong> per agent in <strong>Chat → Routing → Capacity</strong>. When everyone is at capacity, new chats wait in the queue and visitors see their place in line.</p>',
].join('');

/* ───────── Incoming batch (auto mode) ─────────
 * Suggestions on these two arrive only when the prototype simulates new
 * conversations: to review in manual mode, applied in auto mode. */

export const ASSIGN_INTRO_HTML =
  '<p data-block-id="assign-intro">Assignment rules route each new conversation to the right teammate automatically. Rules run top to bottom, and the first rule that matches wins.</p>';

export const ASSIGN_CLASSIC_HTML =
  '<p data-block-id="assign-classic">Prefer the old layout? Switch back to the classic assignment screen from <strong>Settings → Classic view</strong>.</p>';

const ASSIGN_BODY = [
  ASSIGN_INTRO_HTML,
  '<h2>Round-robin assignment</h2>',
  '<p data-block-id="assign-round-robin">Round-robin spreads conversations evenly across everyone in a team. Teammates who are marked away are skipped until they come back.</p>',
  ASSIGN_CLASSIC_HTML,
].join('');

export const CHAT_HOURS_HOLIDAYS_HTML =
  '<p data-block-id="chat-hours-holidays">To close chat on a public holiday, turn off availability for that day by hand and turn it back on the next morning.</p>';

const CHAT_HOURS_BODY = [
  '<p data-block-id="chat-hours-intro">Availability hours control when the chat widget shows agents as online. Outside those hours, visitors can still leave a message and your team picks it up the next working day.</p>',
  '<h2>Holidays</h2>',
  CHAT_HOURS_HOLIDAYS_HTML,
].join('');

/* ───────── Fixtures (table order) ───────── */

export const articles: Article[] = [
  /* Getting started */
  {
    id: 'art-introduction-to-hiver-help-center',
    categoryId: 'cat-getting-started',
    slug: 'introduction-to-hiver-help-center',
    title: 'Introduction to Hiver Help Center',
    status: 'PUBLISHED',
    authorId: null,
    modifierId: null,
    lastActivity: 'published',
    modifiedAt: daysAgo(64),
    bodyHTML: '<p>This is the content of getting started article</p>',
  },
  {
    id: 'art-overview-for-getting-started',
    categoryId: 'cat-getting-started',
    slug: 'overview-for-getting-started',
    title: 'Overview for getting started',
    status: 'PUBLISHED',
    authorId: 'user-ashuthosh',
    modifierId: 'user-ashuthosh',
    lastActivity: 'published',
    modifiedAt: daysAgo(63),
    bodyHTML:
      '<p>Your Help Center is where customers find answers on their own. Start by creating a few categories, then add articles to each one. Published articles appear on your Help Center site right away; drafts stay private until you publish them.</p>',
  },
  {
    id: 'art-how-to-reset-your-password',
    categoryId: 'cat-getting-started',
    slug: 'how-to-reset-your-password',
    title: 'How to reset your password',
    status: 'PUBLISHED',
    authorId: 'user-ashuthosh',
    modifierId: 'user-ashuthosh',
    lastActivity: 'published',
    modifiedAt: daysAgo(61),
    bodyHTML: RESET_PW_BODY,
    aiSummary:
      'Adds mobile app reset steps, updates the admin panel link, and removes the outdated Chrome extension steps.',
  },

  /* Automation */
  {
    id: 'art-setting-up-auto-reply-rules',
    categoryId: 'cat-automation',
    slug: 'setting-up-auto-reply-rules',
    title: 'Setting up auto-reply rules',
    status: 'PUBLISHED',
    authorId: 'user-ashuthosh',
    modifierId: 'user-ashuthosh',
    lastActivity: 'published',
    modifiedAt: daysAgo(21),
    bodyHTML: AUTO_REPLY_BODY,
    aiSummary:
      'Adds timezone guidance for rule schedules, clarifies the “Recent” trigger, and removes the retired sender domain toggle.',
  },
  {
    id: 'art-routing-conversations-with-assignment-rules',
    categoryId: 'cat-automation',
    slug: 'routing-conversations-with-assignment-rules',
    title: 'Routing conversations with assignment rules',
    status: 'PUBLISHED',
    authorId: null,
    modifierId: null,
    lastActivity: 'published',
    modifiedAt: daysAgo(118),
    bodyHTML: ASSIGN_BODY,
    aiSummary:
      'Explains where unmatched conversations go, adds load-balanced assignment, and removes the retired classic view.',
  },
  {
    id: 'art-pausing-rules-during-holidays',
    categoryId: 'cat-automation',
    slug: 'pausing-rules-during-holidays',
    title: 'Pausing rules during holidays',
    status: 'DRAFT',
    authorId: 'user-varun',
    modifierId: 'user-varun',
    lastActivity: 'created',
    modifiedAt: daysAgo(5),
    bodyHTML:
      '<p>Pause any rule from the rule list to stop it from firing without losing its configuration. Paused rules show a gray status dot until you resume them.</p>',
  },

  /* Live chat */
  {
    id: 'art-customizing-the-chat-widget',
    categoryId: 'cat-live-chat',
    slug: 'customizing-the-chat-widget',
    title: 'Customizing the chat widget',
    status: 'PUBLISHED',
    authorId: 'user-varun',
    modifierId: 'user-varun',
    lastActivity: 'published',
    modifiedAt: daysAgo(34),
    bodyHTML: CHAT_WIDGET_BODY,
    aiSummary:
      'Adds accessibility guidance, renames the color picker to theme selector, and removes the legacy iframe embed steps.',
  },
  {
    id: 'art-setting-chat-availability-hours',
    categoryId: 'cat-live-chat',
    slug: 'setting-chat-availability-hours',
    title: 'Setting chat availability hours',
    status: 'PUBLISHED',
    authorId: 'user-ashuthosh',
    modifierId: 'user-ashuthosh',
    lastActivity: 'updated',
    modifiedAt: daysAgo(9),
    bodyHTML: CHAT_HOURS_BODY,
    aiSummary: 'Clarifies which time zone the hours follow and points holidays to the holiday calendar.',
  },
  {
    id: 'art-setting-up-chat-routing',
    categoryId: 'cat-live-chat',
    slug: 'setting-up-chat-routing',
    title: 'Setting up chat routing',
    status: 'PUBLISHED',
    authorId: 'user-ashuthosh',
    modifierId: 'user-ashuthosh',
    lastActivity: 'published',
    modifiedAt: daysAgo(47),
    bodyHTML: CHAT_ROUTING_BODY,
    aiSummary: 'Updates the default routing method to match the current chat settings.',
  },
];
