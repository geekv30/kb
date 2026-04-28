// Phase 7.5.2 — Category fixtures.
//
// Mirrors PRD §5.1's tree exactly: 5 top-level + 14 mid-level + 4
// depth-2 = 23 categories total. Every non-root has a parentId
// that resolves; every category has a one-line subtitle so the
// PageHeader looks populated on browse.

import type { Category } from '../types';

export const categories: Category[] = [
  /* ───────── Top level (depth 0) ───────── */
  {
    id: 'cat-getting-started',
    slug: 'getting-started',
    title: 'Getting Started',
    subtitle: 'Onboarding guides for new Hiver workspaces and teammates.',
    parentId: null,
    depth: 0,
  },
  {
    id: 'cat-managing-emails',
    slug: 'managing-emails',
    title: 'Managing Emails',
    subtitle: 'Shared inboxes, templates, and routing rules for your team.',
    parentId: null,
    depth: 0,
  },
  {
    id: 'cat-live-chat-multi-channel',
    slug: 'live-chat-multi-channel',
    title: 'Live Chat & Multi-channel',
    subtitle: 'Wire up live chat, WhatsApp, SMS, and voice channels.',
    parentId: null,
    depth: 0,
  },
  {
    id: 'cat-automations-workflows',
    slug: 'automations-workflows',
    title: 'Automations & Workflows',
    subtitle: 'Rules, SLAs, and notifications that run on your behalf.',
    parentId: null,
    depth: 0,
  },
  {
    id: 'cat-reporting-analytics',
    slug: 'reporting-analytics',
    title: 'Reporting & Analytics',
    subtitle: 'Standard reports and custom dashboards for support insights.',
    parentId: null,
    depth: 0,
  },

  /* ───────── Getting Started > depth 1 ───────── */
  {
    id: 'cat-setting-up-hiver',
    slug: 'setting-up-hiver',
    title: 'Setting up Hiver',
    subtitle: 'Install the extension, connect Gmail, and verify your workspace.',
    parentId: 'cat-getting-started',
    depth: 1,
  },
  {
    id: 'cat-inviting-your-team',
    slug: 'inviting-your-team',
    title: 'Inviting your team',
    subtitle: 'Add agents, set roles, and structure permissions from day one.',
    parentId: 'cat-getting-started',
    depth: 1,
  },
  {
    id: 'cat-connecting-your-inbox',
    slug: 'connecting-your-inbox',
    title: 'Connecting your inbox',
    subtitle: 'Connect personal mailboxes and shared inboxes to Hiver.',
    parentId: 'cat-getting-started',
    depth: 1,
  },

  /* ───────── Managing Emails > depth 1 ───────── */
  {
    id: 'cat-shared-inboxes',
    slug: 'shared-inboxes',
    title: 'Shared inboxes',
    subtitle: 'Collaborate on group mailboxes like support@ or billing@.',
    parentId: 'cat-managing-emails',
    depth: 1,
  },
  {
    id: 'cat-email-templates',
    slug: 'email-templates',
    title: 'Email templates',
    subtitle: 'Save and reuse canned responses across your team.',
    parentId: 'cat-managing-emails',
    depth: 1,
  },
  {
    id: 'cat-auto-assignment-rules',
    slug: 'auto-assignment-rules',
    title: 'Auto-assignment rules',
    subtitle: 'Distribute incoming conversations to the right agent automatically.',
    parentId: 'cat-managing-emails',
    depth: 1,
  },

  /* ───── Shared inboxes > depth 2 ───── */
  {
    id: 'cat-creating-shared-inboxes',
    slug: 'creating-shared-inboxes',
    title: 'Creating shared inboxes',
    subtitle: 'Set up new shared mailboxes with the right defaults.',
    parentId: 'cat-shared-inboxes',
    depth: 2,
  },
  {
    id: 'cat-permissions-access',
    slug: 'permissions-access',
    title: 'Permissions & access',
    subtitle: 'Control who can read, reply, and admin each shared inbox.',
    parentId: 'cat-shared-inboxes',
    depth: 2,
  },

  /* ───────── Live Chat & Multi-channel > depth 1 ───────── */
  {
    id: 'cat-live-chat-setup',
    slug: 'live-chat-setup',
    title: 'Live chat setup',
    subtitle: 'Embed the chat widget and route conversations to agents.',
    parentId: 'cat-live-chat-multi-channel',
    depth: 1,
  },
  {
    id: 'cat-whatsapp-integration',
    slug: 'whatsapp-integration',
    title: 'WhatsApp integration',
    subtitle: 'Connect WhatsApp Business and reply alongside email.',
    parentId: 'cat-live-chat-multi-channel',
    depth: 1,
  },
  {
    id: 'cat-sms-voice',
    slug: 'sms-voice',
    title: 'SMS & voice',
    subtitle: 'Add inbound SMS and voice channels to your support stack.',
    parentId: 'cat-live-chat-multi-channel',
    depth: 1,
  },

  /* ───────── Automations & Workflows > depth 1 ───────── */
  {
    id: 'cat-rule-based-automations',
    slug: 'rule-based-automations',
    title: 'Rule-based automations',
    subtitle: 'Trigger replies, tags, and assignments from incoming criteria.',
    parentId: 'cat-automations-workflows',
    depth: 1,
  },
  {
    id: 'cat-slas-escalations',
    slug: 'slas-escalations',
    title: 'SLAs & escalations',
    subtitle: 'Define response targets and escalate when they slip.',
    parentId: 'cat-automations-workflows',
    depth: 1,
  },
  {
    id: 'cat-notifications',
    slug: 'notifications',
    title: 'Notifications',
    subtitle: 'Per-agent and per-team alert preferences for incoming work.',
    parentId: 'cat-automations-workflows',
    depth: 1,
  },

  /* ───── SLAs & escalations > depth 2 ───── */
  {
    id: 'cat-sla-policies',
    slug: 'sla-policies',
    title: 'SLA policies',
    subtitle: 'Build first-response and resolution targets per inbox or tag.',
    parentId: 'cat-slas-escalations',
    depth: 2,
  },
  {
    id: 'cat-escalation-triggers',
    slug: 'escalation-triggers',
    title: 'Escalation triggers',
    subtitle: 'Notify managers when a conversation crosses an SLA boundary.',
    parentId: 'cat-slas-escalations',
    depth: 2,
  },

  /* ───────── Reporting & Analytics > depth 1 ───────── */
  {
    id: 'cat-standard-reports',
    slug: 'standard-reports',
    title: 'Standard reports',
    subtitle: 'Out-of-the-box reports for volume, response time, and CSAT.',
    parentId: 'cat-reporting-analytics',
    depth: 1,
  },
  {
    id: 'cat-custom-dashboards',
    slug: 'custom-dashboards',
    title: 'Custom dashboards',
    subtitle: 'Compose your own metric panels and share them with leadership.',
    parentId: 'cat-reporting-analytics',
    depth: 1,
  },
];
