// Phase 7.5.2 — Article fixtures.
//
// 17 articles, one per leaf category (with two in `creating-shared-inboxes`
// so the AI-targeted article has a sibling). Enough breadth to demo a
// 3-level browse and an article open without a wall of fake content.
// Hiver vocabulary throughout (shared inboxes, agents, conversations,
// SLAs, rules, tags). Each body has at least one <h2>, two <p>, one
// <ul>/<ol> with 3+ items, and an inline <a>.
//
// The 3 AI-targeted articles (password reset, auto-reply rules, chat
// widget) have richer bodies with `data-block-id` markers on the
// paragraphs/sections that the suggestion fixtures anchor to. The
// integrity asserts in seed.ts will catch any anchor drift.

import type { Article } from '../types';

/* ─────────────────────────────────────────────────────────────
 * Helpers
 * ───────────────────────────────────────────────────────────── */

/**
 * Deterministic ISO timestamp `n` whole days before a fixed reference
 * date. We pin the reference date so the fixture set is reproducible
 * across renders / tests (using `Date.now()` would shuffle the
 * `lastUpdatedAt` ordering on every reload).
 *
 * Reference date: 2026-04-26T12:00:00Z (the day this fixture was
 * authored — see CLAUDE.md). Production demo runs read these as
 * "the recent past" relative to today.
 */
const REFERENCE_DATE_MS = Date.UTC(2026, 3, 26, 12, 0, 0); // month is 0-indexed

function daysAgo(n: number): string {
  return new Date(REFERENCE_DATE_MS - n * 86_400_000).toISOString();
}

/* ─────────────────────────────────────────────────────────────
 * Articles
 * ───────────────────────────────────────────────────────────── */

export const articles: Article[] = [
  {
    id: 'art-installing-the-hiver-chrome-extension',
    slug: 'installing-the-hiver-chrome-extension',
    categoryId: 'cat-setting-up-hiver',
    title: 'Installing the Hiver Chrome extension',
    status: 'published',
    authorId: 'user-aanya',
    lastUpdatedAt: daysAgo(2),
    bodyHTML: `<p>The Hiver Chrome extension lets every agent on your team work shared inboxes, automations, and SLA timers without ever leaving Gmail. Installation takes under two minutes per agent and is a one-time step.</p>
<h2>Before you begin</h2>
<p>Make sure each agent has Chrome 110 or later signed in to the same Google account they use for email. The extension is also available for Microsoft Edge — see the <a href="#">Edge installation guide</a> for that path.</p>
<ol>
<li>Open the Hiver listing on the Chrome Web Store.</li>
<li>Click <strong>Add to Chrome</strong> and confirm the permissions prompt.</li>
<li>Reload Gmail — Hiver's left rail will appear inside your inbox view.</li>
<li>Sign in with the email address that received your team invitation.</li>
</ol>
<h2>Verifying the install</h2>
<p>Once Hiver is loaded, you'll see the shared-inbox list under your personal labels. If the rail is missing, disable and re-enable the extension from <code>chrome://extensions</code>, then refresh Gmail. Most install issues come from a stale Gmail tab — closing every Gmail tab and re-opening one fresh resolves them.</p>`,
    settings: {
      slug: 'installing-the-hiver-chrome-extension',
      seoTitle: 'How to install the Hiver Chrome extension',
    },
  },
  {
    id: 'art-inviting-your-first-teammate',
    slug: 'inviting-your-first-teammate',
    categoryId: 'cat-setting-up-hiver',
    title: 'Inviting your first teammate',
    status: 'draft',
    authorId: 'user-tarun',
    lastUpdatedAt: daysAgo(14),
    bodyHTML: `<p>Hiver shines once a second agent joins your shared inbox — assignment, internal notes, and collision detection only matter when more than one person is reading the same conversation.</p>
<h2>Sending the invite</h2>
<p>Open <strong>Settings → Team</strong> and click <strong>Invite agent</strong>. Enter their work email and choose a role. We recommend <em>Agent</em> for everyone except the workspace owner, who keeps <em>Admin</em>.</p>
<ul>
<li>Use a verified work email — invites to free addresses are blocked on paid plans.</li>
<li>Pick a role at invite time; you can change it later under each user's profile.</li>
<li>Optionally pre-assign the agent to specific shared inboxes.</li>
</ul>
<h2>What the new agent sees</h2>
<p>The invitee receives an email with a one-click link that drops them straight into the Hiver onboarding flow. Once they accept, they'll appear in the agent list with a green "Online" dot the next time they open Gmail. For tips on a smooth first day, read <a href="#">Onboarding new agents</a>.</p>`,
    settings: {
      slug: 'inviting-your-first-teammate',
      seoTitle: 'How to invite your first teammate to Hiver',
    },
  },
  {
    id: 'art-connecting-an-outlook-mailbox',
    slug: 'connecting-an-outlook-mailbox',
    categoryId: 'cat-connecting-your-inbox',
    title: 'Connecting an Outlook mailbox',
    status: 'published',
    authorId: 'user-tarun',
    lastUpdatedAt: daysAgo(3),
    bodyHTML: `<p>Hiver supports Microsoft 365 mailboxes alongside Google Workspace. The connection flow looks similar but the consent screen is run by your Microsoft tenant administrator.</p>
<h2>Required Microsoft permissions</h2>
<p>Your Microsoft 365 admin needs the <em>Application Administrator</em> or <em>Global Administrator</em> role to grant Hiver consent on the tenant's behalf. Once consented, individual agents do not need to re-consent.</p>
<ul>
<li><code>Mail.Read</code> — read conversations on the connected mailbox.</li>
<li><code>Mail.Send</code> — reply on behalf of the mailbox.</li>
<li><code>User.Read</code> — basic profile to render avatars.</li>
</ul>
<h2>Common gotchas</h2>
<p>If the connection appears successful but no conversations sync, check your tenant's conditional access rules — Hiver's IP range needs to be allowlisted on tenants that block "third-party connectors." See <a href="#">Microsoft 365 conditional access</a> for the IP list.</p>`,
    settings: {
      slug: 'connecting-an-outlook-mailbox',
      seoTitle: 'Connect an Outlook mailbox to Hiver',
    },
  },
  {
    id: 'art-creating-your-first-shared-inbox',
    slug: 'creating-your-first-shared-inbox',
    categoryId: 'cat-creating-shared-inboxes',
    title: 'Creating your first shared inbox',
    status: 'published',
    authorId: 'user-aanya',
    lastUpdatedAt: daysAgo(1),
    bodyHTML: `<p>Shared inboxes are how Hiver turns a single email address into a team workspace. Create one for every channel your team owns — <code>support@</code>, <code>billing@</code>, <code>sales@</code> — and assign agents per inbox.</p>
<h2>Creating the inbox</h2>
<p>From the dashboard click <strong>+ New Inbox</strong> and walk through the four-step wizard. The wizard pulls available aliases from your connected mail account so you don't have to retype them.</p>
<ol>
<li>Pick the email address from the dropdown of available aliases.</li>
<li>Name the inbox — agents see this name in their sidebar.</li>
<li>Choose default agents who get every new conversation auto-assigned.</li>
<li>Pick an SLA policy or accept the workspace default.</li>
</ol>
<h2>What happens next</h2>
<p>The first new email to that address shows up as a Hiver conversation within 30 seconds. If you don't see one within five minutes, double-check the alias is forwarding correctly. See <a href="#">Diagnosing a quiet inbox</a>.</p>`,
    settings: {
      slug: 'creating-your-first-shared-inbox',
      seoTitle: 'Create your first shared inbox in Hiver',
    },
  },
  {
    // ───── AI-TARGETED ARTICLE #1: password reset ─────
    id: 'art-how-to-reset-your-password',
    slug: 'how-to-reset-your-password',
    categoryId: 'cat-creating-shared-inboxes',
    title: 'How to reset your password',
    status: 'published',
    authorId: 'user-tarun',
    lastUpdatedAt: daysAgo(5),
    bodyHTML: `<p data-block-id="reset-pw-intro">Lost your password? You can reset it from the Hiver sign-in page in under a minute. Most resets land in your inbox in under 30 seconds; if you don't see the mail, check spam or your team's quarantine.</p>
<h2>Resetting via email</h2>
<p data-block-id="reset-pw-cta">Open the Hiver sign-in page and click <strong>Forgot password</strong>. Enter the email address associated with your Hiver workspace and submit. We'll send you a one-time link valid for 30 minutes.</p>
<ol>
<li>Click <strong>Forgot password</strong> on the sign-in page.</li>
<li>Enter the email tied to your workspace.</li>
<li>Open the reset email and click the link.</li>
<li>Choose a new password that meets the strength meter's "Strong" rating.</li>
</ol>
<section data-block-id="reset-pw-sms"><h2>Resetting via SMS</h2><p>If your account has a verified phone number on file, you can also receive a six-digit code by SMS. From the sign-in page choose <strong>Use SMS instead</strong>, enter the number on file, and type the code into the verification screen. SMS codes expire after 10 minutes.</p></section>
<h2>Common issues</h2>
<p>If you don't receive the email within five minutes, the most likely cause is that your team's mail server is quarantining no-reply addresses. Ask your IT admin to allowlist <code>noreply@hiverhq.com</code>. For more help, see <a href="#">Login troubleshooting</a>.</p>`,
    settings: {
      slug: 'how-to-reset-your-password',
      seoTitle: 'How to reset your Hiver password',
    },
    aiGapsSummary:
      'Refining the article with updated instruction set, updating link and by removing legacy instructions',
  },
  {
    id: 'art-restricting-an-inbox-to-specific-agents',
    slug: 'restricting-an-inbox-to-specific-agents',
    categoryId: 'cat-permissions-access',
    title: 'Restricting an inbox to specific agents',
    status: 'published',
    authorId: 'user-sana',
    lastUpdatedAt: daysAgo(6),
    bodyHTML: `<p>Some inboxes — billing, legal, security — should only be visible to a small subset of your team. Hiver supports per-inbox access lists so you don't have to spin up a separate workspace for every sensitive queue.</p>
<h2>Setting the access list</h2>
<p>Open the inbox settings and switch <strong>Visibility</strong> to <em>Restricted</em>. The agent picker appears — type names or email addresses to add agents. Removing an agent from the list immediately revokes their access.</p>
<ul>
<li>Admins always have access regardless of the restriction list.</li>
<li>Auto-assignment rules respect the restriction — they won't route to excluded agents.</li>
<li>Restricted inboxes are excluded from the workspace-wide search index for non-members.</li>
</ul>
<h2>Auditing access changes</h2>
<p>Every add/remove on a restricted inbox writes an entry to the audit log under <strong>Settings → Audit log</strong>. Filter by inbox ID to review the full access history. See <a href="#">Audit log filters</a> for advanced queries.</p>`,
    settings: {
      slug: 'restricting-an-inbox-to-specific-agents',
      seoTitle: 'Restrict a Hiver inbox to specific agents',
    },
  },
  {
    id: 'art-creating-a-shared-template-library',
    slug: 'creating-a-shared-template-library',
    categoryId: 'cat-email-templates',
    title: 'Creating a shared template library',
    status: 'published',
    authorId: 'user-aanya',
    lastUpdatedAt: daysAgo(2),
    bodyHTML: `<p>A well-organised template library cuts response time in half for repetitive questions. Hiver's templates support variables, attachments, and per-inbox scoping so the right template surfaces in the right context.</p>
<h2>Creating a template</h2>
<p>Open <strong>Templates → + New template</strong>, write the template body, and pick a folder. Use <code>{{customer.first_name}}</code> placeholders to personalise responses without retyping the customer's details.</p>
<ol>
<li>Name the template — agents search by name in the composer.</li>
<li>Pick a folder so it surfaces only in the right inbox.</li>
<li>Use the variable picker to insert <code>{{customer.first_name}}</code> and similar placeholders.</li>
</ol>
<h2>Sharing across inboxes</h2>
<p>By default templates are scoped to the inbox they were created in. Move a template to the workspace-level <em>Shared</em> folder to make it available everywhere. See <a href="#">Template variables reference</a> for the full placeholder list.</p>`,
    settings: {
      slug: 'creating-a-shared-template-library',
      seoTitle: 'Build a shared template library in Hiver',
    },
  },
  {
    id: 'art-round-robin-vs-load-balanced-assignment',
    slug: 'round-robin-vs-load-balanced-assignment',
    categoryId: 'cat-auto-assignment-rules',
    title: 'Round-robin vs load-balanced assignment',
    status: 'published',
    authorId: 'user-sana',
    lastUpdatedAt: daysAgo(3),
    bodyHTML: `<p>Hiver offers two algorithms for distributing incoming conversations across a team: round-robin and load-balanced. Picking the right one depends on whether your team's average handle time is consistent.</p>
<h2>How each algorithm works</h2>
<p>Round-robin assigns conversations in strict rotation — agent A gets one, then B, then C, then back to A. Load-balanced looks at each agent's open-conversation count and routes to whoever has the lowest backlog.</p>
<ul>
<li><strong>Round-robin</strong> — simple, fair-by-count, ignores complexity.</li>
<li><strong>Load-balanced</strong> — fair-by-workload, accounts for slow conversations.</li>
<li><strong>Skill-based</strong> — overlay on either, restricts to agents with matching skills.</li>
</ul>
<h2>When each works best</h2>
<p>Round-robin works for teams where every conversation takes roughly the same time — high-volume tier-1 support is the canonical fit. Load-balanced is better when complexity varies wildly — billing or technical support tend to need it. See <a href="#">Skill-based assignment</a> to layer skills on top.</p>`,
    settings: {
      slug: 'round-robin-vs-load-balanced-assignment',
      seoTitle: 'Round-robin vs load-balanced auto-assignment',
    },
  },
  {
    // ───── AI-TARGETED ARTICLE #3: chat widget ─────
    id: 'art-customizing-the-chat-widget',
    slug: 'customizing-the-chat-widget',
    categoryId: 'cat-live-chat-setup',
    title: 'Customizing the chat widget',
    status: 'published',
    authorId: 'user-mira',
    lastUpdatedAt: daysAgo(4),
    bodyHTML: `<p>The chat widget is the most visible piece of Hiver on your customers' screens. Customising the colour, position, welcome message, and behaviour aligns it with your brand and your team's working hours.</p>
<h2>Branding the widget</h2>
<p data-block-id="chat-widget-themes">Open <strong>Live Chat → Widget → Appearance</strong>. The most-customised settings are the launcher colour, the welcome banner text, and the agent avatar set. Changes preview live in the right-hand panel as you edit, so you can iterate without saving every step.</p>
<p data-block-id="chat-widget-color">Use the <strong>Color picker</strong> to set the launcher and header background. The text colour auto-adjusts for contrast — the widget stays legible whether you pick a deep navy or a pale cream as the base.</p>
<ol>
<li>Pick a launcher colour that contrasts with your site background.</li>
<li>Write a welcome banner — first impression copy that customers see before any agent replies.</li>
<li>Upload an agent avatar set or use the built-in initials avatars.</li>
<li>Choose launcher position — bottom-right is default, bottom-left is common for RTL sites.</li>
</ol>
<section data-block-id="chat-widget-iframe"><h2>Embedding via iframe</h2><p>For pages where you can't drop a script tag (legacy CMS, sandboxed environments) you can embed the widget as an iframe. Get the iframe URL from <strong>Widget → Install → iframe</strong>. Note that iframe embed disables some features — agent typing indicators, file drag-drop, and screen-share invitations all rely on the parent-page script.</p></section>
<h2>Behavioural settings</h2>
<p>Beyond visual customisation, the widget has behavioural toggles for proactive messages, quiet hours, and offline-mode forms. Most teams start with all toggles off and enable them as they observe their chat traffic patterns. See <a href="#">Proactive chat playbook</a> for what to try first.</p>`,
    settings: {
      slug: 'customizing-the-chat-widget',
      seoTitle: 'Customize the Hiver chat widget',
    },
    aiGapsSummary:
      'Adding accessibility best-practices guidance, renaming the color picker to theme selector and removing legacy iframe embed instructions',
  },
  {
    id: 'art-connecting-whatsapp-business-to-hiver',
    slug: 'connecting-whatsapp-business-to-hiver',
    categoryId: 'cat-whatsapp-integration',
    title: 'Connecting WhatsApp Business to Hiver',
    status: 'published',
    authorId: 'user-aanya',
    lastUpdatedAt: daysAgo(5),
    bodyHTML: `<p>Customers reach out on WhatsApp more every quarter — often as the first message, before they ever try email. Connecting your WhatsApp Business account to Hiver lets the same agents handle both channels from one inbox.</p>
<h2>Prerequisites</h2>
<p>You'll need a verified WhatsApp Business account, a Meta Business Manager profile, and a phone number you've already verified with Meta. Hiver doesn't take ownership of your number — we connect to it via Meta's official Cloud API.</p>
<ol>
<li>Verify your Meta Business Manager profile.</li>
<li>Get your number approved as a WhatsApp Business number.</li>
<li>From Hiver, click <strong>Add Channel → WhatsApp</strong>.</li>
<li>Walk through Meta's embedded sign-up flow.</li>
</ol>
<h2>Once connected</h2>
<p>Inbound WhatsApp messages appear as conversations in the inbox you map them to. Agents can reply through the same composer they use for email. Outbound proactive messages need a pre-approved template per Meta's policy. See <a href="#">WhatsApp message templates</a>.</p>`,
    settings: {
      slug: 'connecting-whatsapp-business-to-hiver',
      seoTitle: 'Connect WhatsApp Business to Hiver',
    },
  },
  {
    id: 'art-adding-sms-as-a-support-channel',
    slug: 'adding-sms-as-a-support-channel',
    categoryId: 'cat-sms-voice',
    title: 'Adding SMS as a support channel',
    status: 'published',
    authorId: 'user-rohan',
    lastUpdatedAt: daysAgo(7),
    bodyHTML: `<p>SMS is still the highest-engagement channel for transactional messages — order updates, appointment reminders, account alerts. Hiver supports inbound SMS as conversations and outbound SMS via templates.</p>
<h2>Provisioning a number</h2>
<p>From <strong>Channels → SMS</strong>, pick a country and a number type (toll-free, long code, short code). Hiver provisions through our underlying carrier partner — the number is yours within a business day for most countries.</p>
<ul>
<li>Toll-free numbers carry the highest deliverability in the US/CA.</li>
<li>Short codes are best for high-volume one-way messaging.</li>
<li>Long codes are cheapest and best for two-way conversational support.</li>
</ul>
<h2>Once provisioned</h2>
<p>Inbound SMS to the number appears as conversations in the inbox you map. Outbound SMS uses message templates with character-aware previews — Hiver tells you when a message will split into multiple SMS segments. See <a href="#">SMS character limits</a>.</p>`,
    settings: {
      slug: 'adding-sms-as-a-support-channel',
      seoTitle: 'Add SMS support to Hiver',
    },
  },
  {
    // ───── AI-TARGETED ARTICLE #2: auto-reply rules ─────
    id: 'art-setting-up-auto-reply-rules',
    slug: 'setting-up-auto-reply-rules',
    categoryId: 'cat-rule-based-automations',
    title: 'Setting up auto-reply rules',
    status: 'published',
    authorId: 'user-aanya',
    lastUpdatedAt: daysAgo(6),
    bodyHTML: `<p>Auto-reply rules acknowledge incoming conversations the moment they arrive — useful for setting expectations during high-volume periods, holidays, or off-hours.</p>
<h2>Building your first rule</h2>
<p>Open <strong>Automations → + New rule</strong>. Pick the <em>Auto-reply</em> template, set the trigger (when the rule should fire), and write the reply body. Variables like <code>{{customer.first_name}}</code> work in the body — same syntax as email templates.</p>
<p data-block-id="auto-reply-schedules">Rules can be scheduled — run only on weekends, only during set hours, or only on specific dates. Use the <strong>Schedule</strong> section in the rule editor to constrain when the rule fires. The schedule UI uses your workspace's primary timezone for display.</p>
<ol>
<li>Pick the trigger inbox (or "any inbox").</li>
<li>Add a filter — by tag, sender domain, subject keyword, or conversation age.</li>
<li>Write the reply body using template variables.</li>
<li>Set a schedule, or leave blank for "always on."</li>
</ol>
<h2>Triggers and timing</h2>
<p data-block-id="auto-reply-recent">The most common trigger is <em>New conversation</em> — fires once per conversation, the moment it arrives. The <em>Recent</em> trigger is ambiguous on its own; we recommend pairing it with an explicit time window to avoid accidentally re-firing on every message in an old thread.</p>
<section data-block-id="auto-reply-domain"><h2>Match by sender domain only</h2><p>The legacy "Match by sender domain only" toggle flattens any conversation from a given domain into a single rule path. Most teams have moved to the more flexible "Filter group" UI, which lets you combine domain matching with tags, subject filters, and timing. This toggle is preserved for backward compatibility but new rules should not use it.</p></section>
<h2>Testing the rule</h2>
<p>Once saved, send a test email from outside your team to the trigger inbox. The auto-reply should arrive within a few seconds. If it doesn't, check the rule's run log — every rule has a per-run history showing why it did or didn't fire. See <a href="#">Rule run logs</a>.</p>`,
    settings: {
      slug: 'setting-up-auto-reply-rules',
      seoTitle: 'Set up auto-reply rules in Hiver',
    },
    aiGapsSummary:
      'Adding timezone guidance for rule schedules, clarifying the ambiguous Recent trigger and removing the deprecated sender-domain toggle',
  },
  {
    id: 'art-defining-first-response-targets',
    slug: 'defining-first-response-targets',
    categoryId: 'cat-sla-policies',
    title: 'Defining first-response targets',
    status: 'published',
    authorId: 'user-aanya',
    lastUpdatedAt: daysAgo(2),
    bodyHTML: `<p>First-response time is the most-tracked SLA metric for support teams — and the easiest to set targets for. Define it once per inbox, let Hiver track every conversation against it.</p>
<h2>Setting the target</h2>
<p>Open <strong>SLAs → + New policy</strong>. Pick which inboxes the policy applies to and set a numeric target (e.g., 4 hours during business hours). Hiver starts the timer the moment a conversation arrives and stops it on the first agent reply.</p>
<ol>
<li>Name the policy ("Standard support — 4h FRT").</li>
<li>Pick inboxes and (optional) tags it applies to.</li>
<li>Set the target — value + unit + business-hours-only toggle.</li>
<li>Pick what counts as "first response" — agent reply only, or any agent action.</li>
</ol>
<h2>What gets measured</h2>
<p>Hiver measures from conversation arrival to first outbound agent reply. Internal notes don't count by default; flip the toggle if you want notes to stop the clock. See <a href="#">SLA measurement details</a>.</p>`,
    settings: {
      slug: 'defining-first-response-targets',
      seoTitle: 'Define first-response SLA targets in Hiver',
    },
  },
  {
    id: 'art-escalating-to-a-manager-on-sla-breach',
    slug: 'escalating-to-a-manager-on-sla-breach',
    categoryId: 'cat-escalation-triggers',
    title: 'Escalating to a manager on SLA breach',
    status: 'published',
    authorId: 'user-sana',
    lastUpdatedAt: daysAgo(4),
    bodyHTML: `<p>The most common escalation pattern: when a conversation breaches its SLA, ping a manager so they can step in or escalate to engineering. Hiver wires this in two clicks.</p>
<h2>Setting up the trigger</h2>
<p>Open <strong>Escalations → + New escalation</strong>. Pick the SLA policy that, when breached, should trigger the escalation. Choose the action — assign to a specific agent, post to Slack, send an email, or all three.</p>
<ol>
<li>Pick the parent SLA policy.</li>
<li>Pick "On breach" as the trigger condition.</li>
<li>Choose one or more actions.</li>
<li>(Optional) Add a delay before re-escalating if no one acks.</li>
</ol>
<h2>Re-escalation chains</h2>
<p>For severe breaches you can chain escalations — escalate to manager at breach, then to director if still unanswered after another hour. See <a href="#">Escalation chains</a> for the full pattern.</p>`,
    settings: {
      slug: 'escalating-to-a-manager-on-sla-breach',
      seoTitle: 'Escalate to a manager on SLA breach',
    },
  },
  {
    id: 'art-personal-notification-preferences',
    slug: 'personal-notification-preferences',
    categoryId: 'cat-notifications',
    title: 'Personal notification preferences',
    status: 'published',
    authorId: 'user-devika',
    lastUpdatedAt: daysAgo(3),
    bodyHTML: `<p>Every agent decides for themselves how loud Hiver gets. Email digests, browser pings, Slack DMs — toggle each independently.</p>
<h2>Where to set them</h2>
<p>Open your avatar menu and pick <strong>Notification preferences</strong>. Each event type (assigned to me, mentioned in a note, SLA at risk) has independent toggles per channel.</p>
<ul>
<li>Browser push — instant, requires permission grant.</li>
<li>Email — immediate, hourly digest, or daily digest.</li>
<li>Slack DM — instant, requires Slack connection on your account.</li>
</ul>
<h2>Sensible defaults</h2>
<p>The default profile is "Browser push for assigned-to-me, hourly email digest for everything else, Slack off." Most agents leave the defaults; power users tune them aggressively. See <a href="#">Notification profiles</a> for preset bundles.</p>`,
    settings: {
      slug: 'personal-notification-preferences',
      seoTitle: 'Personal notification preferences in Hiver',
    },
  },
  {
    id: 'art-volume-and-response-time-reports',
    slug: 'volume-and-response-time-reports',
    categoryId: 'cat-standard-reports',
    title: 'Volume and response-time reports',
    status: 'published',
    authorId: 'user-aanya',
    lastUpdatedAt: daysAgo(1),
    bodyHTML: `<p>The bread-and-butter of every support report: how many conversations did we get, how fast did we reply. Hiver's volume + response-time report packages both with the dimensions teams care about most.</p>
<h2>Reading the report</h2>
<p>Open <strong>Reports → Volume & response time</strong>. The default view is the last 30 days, all inboxes, all agents. Use the filter pills above the chart to slice — by inbox, agent, tag, or channel.</p>
<ul>
<li>Conversations created — total inbound volume.</li>
<li>Conversations resolved — closed in the period.</li>
<li>First-response time — median, p90, p99.</li>
<li>Resolution time — median, p90, p99.</li>
</ul>
<h2>Scheduling the report</h2>
<p>Email the report to yourself or your manager on a recurring schedule — daily, weekly, monthly. PDF and CSV both supported. See <a href="#">Report scheduling</a>.</p>`,
    settings: {
      slug: 'volume-and-response-time-reports',
      seoTitle: 'Volume and response-time reports in Hiver',
    },
  },
  {
    id: 'art-building-your-first-custom-dashboard',
    slug: 'building-your-first-custom-dashboard',
    categoryId: 'cat-custom-dashboards',
    title: 'Building your first custom dashboard',
    status: 'published',
    authorId: 'user-devika',
    lastUpdatedAt: daysAgo(6),
    bodyHTML: `<p>The pre-built reports cover the basics. Custom dashboards let you compose any metric Hiver tracks into a layout you can pin, share, or pipe into a TV in your team room.</p>
<h2>Starting from scratch</h2>
<p>Open <strong>Reports → Custom dashboards → + New</strong>. Name the dashboard and pick a layout — single-column for narrow screens, three-column for monitors. Drag widgets from the right palette onto the grid.</p>
<ol>
<li>Name the dashboard and pick a layout.</li>
<li>Drag widgets in — stat cards, line charts, tables, donut charts.</li>
<li>Configure each widget's metric, dimension, and filter.</li>
<li>Save and share with your team.</li>
</ol>
<h2>Sharing</h2>
<p>Custom dashboards can be private (just you), team-scoped (specific roles or agents), or public to the workspace. See <a href="#">Sharing custom dashboards</a>.</p>`,
    settings: {
      slug: 'building-your-first-custom-dashboard',
      seoTitle: 'Build your first custom dashboard in Hiver',
    },
  },
  {
    // Overview article living directly on the top-level "Automations & Workflows"
    // category — sibling to the 3 sub-folders (Rule-based / SLAs / Notifications).
    // Demonstrates that articles can sit at any depth, not only on leaf categories.
    id: 'art-choosing-the-right-automation-type',
    slug: 'choosing-the-right-automation-type',
    categoryId: 'cat-automations-workflows',
    title: 'Choosing the right automation type',
    status: 'published',
    authorId: 'user-rohan',
    lastUpdatedAt: daysAgo(3),
    bodyHTML: `<p>Most teams reach for the same kind of automation regardless of the problem in front of them — a rule, every time. That works for triage, but it leaves SLAs and notifications on the table when they would have been a better fit. This overview maps the three automation primitives Hiver supports to the cases each one is genuinely good at, so your team picks the right tool the first time.</p>
<h2>Rule-based automations</h2>
<p>Rules are stateless event-to-action mappings — when an inbound conversation matches a filter, run an action. A canonical example: <em>if the inbound subject contains "refund", apply the billing tag and assign to the billing inbox</em>. Rules don't track time, don't escalate, and don't notify anyone outside the action list. They're the right choice for high-volume, deterministic triage on shared inboxes — tagging, routing, auto-replies, and template insertion. See <a href="#">Rule-based automations →</a> for the full trigger and action catalogue.</p>
<h2>SLAs &amp; escalations</h2>
<p>SLAs add time to the picture. Where a rule fires once on arrival, an SLA tracks a conversation against a deadline and can fire follow-up actions when that deadline is at risk or breached. Pair an SLA with an escalation chain when the cost of a slow response is high — paying customers, security tickets, anything with a contractual response window. Good fits include:</p>
<ul>
<li>First-response deadlines per shared inbox, with different targets for billing vs general support.</li>
<li>Tier-2 escalation on customer-blocker tickets — auto-assign to a manager when the SLA passes 75% elapsed.</li>
<li>Weekend coverage notifications — page the on-call agent if a tagged conversation arrives outside business hours.</li>
</ul>
<p>See <a href="#">SLAs &amp; escalations →</a> for policy authoring and the breach-action catalogue.</p>
<h2>Notifications</h2>
<p>Notifications are the lightweight third primitive — no triggers, no deadlines, just per-agent preferences for what events should ping them and through which channel. Most agents tune their own notifications; managers tune team-wide defaults. Use notifications when you want awareness without action — "tell me when I'm mentioned in a note" rather than "auto-assign this to me." The three primitives compose: a rule routes a conversation, an SLA times it, and a notification pings the right agent the moment either fires.</p>`,
    settings: {
      slug: 'choosing-the-right-automation-type',
      seoTitle: 'When to use rules, SLAs, and notifications in Hiver',
    },
  },
];
