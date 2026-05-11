// Phase 7.5.2 — Analytics fixtures.
//
// Static JSON-shaped data for the 3 analytics pages. Article ids in
// the row tables MATCH real article ids in articles.ts so deep-links
// from analytics rows into the editor work end-to-end (PRD §13.7,
// "Article references in analytics tables point to real article IDs").
//
// Per-page exports (consumed by the analytics route components in
// Phase 7.5.7):
//   - articlePerformanceFixtures
//   - searchFixtures
//   - aiAnswerFixtures
//
// Realistic ranges per PRD §13.7: 10K–500K monthly views,
// 3–8% missed-search rate, single-digit deflection improvements.

import type {
  AnalyticsAreaSeries,
  AnalyticsAreaChartGoalLine,
  DonutDatum,
  HelpfulnessVariant,
  StatCardProps,
} from '@test-kb-ui/kb-ui';

/* ─────────────────────────────────────────────────────────────
 * Row types (Phase 7.5 migration — moved app-side).
 *
 * After kb-ui collapsed its 7 bespoke `*Table` components into a
 * single `<DataTable<T> />` primitive (commit `de1f197`), the
 * row-shape types live with the consumer. The shapes are unchanged
 * from the legacy ones — see the analytics pattern stories in
 * `packages/kb-ui/src/pages/KBAnalytics*.stories.tsx` for the
 * canonical column configs that pair with each row type.
 * ───────────────────────────────────────────────────────────── */

export type ArticleAttentionRow = {
  id: string;
  title: string;
  helpfulness: string;
  variant: HelpfulnessVariant;
};

export type ArticlePerformanceRow = {
  id: string;
  title: string;
  category: string;
  totalViews: string;
  avgTimeSpent: string;
  helpfulness: string;
  helpfulnessVariant: HelpfulnessVariant;
};

export type ContentGapRow = {
  id: string;
  topic: string;
  frequency: string;
  ticketRate: string;
};

export type MostCitedRow = {
  id: string;
  title: string;
  citations: number;
};

export type SearchKeywordRow = {
  id: string;
  keyword: string;
  count: string;
};

/* ─────────────────────────────────────────────────────────────
 * Helpers
 * ───────────────────────────────────────────────────────────── */

/**
 * Generate a 30-point area-chart series with a configurable trend.
 * Uses a deterministic PRNG so the demo renders the same chart on
 * every reload.
 */
function makeSeries(
  baseline: number,
  trendPerDay: number,
  noisePct: number,
  seed: number,
): number[] {
  // Mulberry32 — tiny deterministic PRNG.
  let s = seed >>> 0;
  function rand(): number {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const out: number[] = [];
  for (let i = 0; i < 30; i += 1) {
    const trend = baseline + i * trendPerDay;
    const noise = trend * noisePct * (rand() - 0.5);
    out.push(Math.max(0, Math.round(trend + noise)));
  }
  return out;
}

/**
 * Build the `[{ x: 'Mar 28', views: 12345, unique: 6789 }, ...]`
 * shape consumed by AnalyticsAreaChart. X labels are the last 30
 * day labels relative to a fixed reference date (matches articles.ts).
 */
const REFERENCE_DATE_MS = Date.UTC(2026, 3, 26, 12, 0, 0);

function dayLabels(): string[] {
  const labels: string[] = [];
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(REFERENCE_DATE_MS - i * 86_400_000);
    labels.push(
      d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      }),
    );
  }
  return labels;
}

function zipSeries(
  seriesByKey: Record<string, number[]>,
  xKey = 'x',
): Array<Record<string, string | number>> {
  const labels = dayLabels();
  return labels.map((label, i) => {
    const row: Record<string, string | number> = { [xKey]: label };
    for (const [key, vals] of Object.entries(seriesByKey)) {
      row[key] = vals[i];
    }
    return row;
  });
}

/**
 * Subsample the 30-label series to 6 evenly-spaced labels for the
 * x-axis. Phase 15d.B exposed `AnalyticsAreaChart.xTicks` so callers
 * with dense data series can cap the rendered tick set — without it,
 * Recharts crams 30 labels into the axis and they overlap.
 *
 * Indices: 0, 5, 10, 15, 20, 25 → ~5 days apart over the 30-day window.
 * Concrete values with REFERENCE_DATE_MS = Apr 26, 2026:
 *   ['Mar 28', 'Apr 2', 'Apr 7', 'Apr 12', 'Apr 17', 'Apr 22']
 *
 * Exported so each analytics page can pass the same axis labels.
 */
export const ANALYTICS_X_TICKS: string[] = (() => {
  const labels = dayLabels();
  return [0, 5, 10, 15, 20, 25].map((i) => labels[i]);
})();

/* ─────────────────────────────────────────────────────────────
 * Article Performance fixtures (analytics tab 1)
 * ───────────────────────────────────────────────────────────── */

const articlePerformanceStatCards: StatCardProps[] = [
  {
    label: 'Total Views',
    value: '234,567',
    trendDelta: '+12.4%',
    trendDirection: 'up',
  },
  {
    label: 'Unique Visitors',
    value: '89,142',
    trendDelta: '+8.1%',
    trendDirection: 'up',
  },
  {
    label: 'Avg. Time Spent',
    value: '02m : 45s',
    trendDelta: '+0.3%',
    trendDirection: 'up',
  },
  {
    label: 'Avg. Helpfulness',
    value: '78%',
    trendDelta: '-1.2%',
    trendDirection: 'down',
  },
];

const articlePerformanceAreaSeries: [AnalyticsAreaSeries, AnalyticsAreaSeries] = [
  { name: 'Total views', dataKey: 'views', variant: 'views' },
  { name: 'Unique visitors', dataKey: 'unique', variant: 'unique' },
];

const articlePerformanceAreaData = zipSeries({
  views: makeSeries(7500, 30, 0.18, 1001),
  unique: makeSeries(2900, 12, 0.20, 2002),
});

const articlePerformanceDonutData: DonutDatum[] = [
  { label: 'Getting Started', value: 28 },
  { label: 'Managing Emails', value: 22 },
  { label: 'Live Chat & Multi-channel', value: 17 },
  { label: 'Automations & Workflows', value: 15 },
  { label: 'Reporting & Analytics', value: 12 },
  { label: 'Other', value: 6 },
];

const articlesNeedsAttentionRows: ArticleAttentionRow[] = [
  {
    id: 'art-adding-sms-as-a-support-channel',
    title: 'Adding SMS as a support channel',
    helpfulness: '24%',
    variant: 'down',
  },
  {
    id: 'art-restricting-an-inbox-to-specific-agents',
    title: 'Restricting an inbox to specific agents',
    helpfulness: '31%',
    variant: 'down',
  },
  {
    id: 'art-personal-notification-preferences',
    title: 'Personal notification preferences',
    helpfulness: '38%',
    variant: 'down',
  },
  {
    id: 'art-connecting-an-outlook-mailbox',
    title: 'Connecting an Outlook mailbox',
    helpfulness: '42%',
    variant: 'down',
  },
  {
    id: 'art-creating-a-shared-template-library',
    title: 'Creating a shared template library',
    helpfulness: '46%',
    variant: 'down',
  },
];

const articlePerformanceRows: ArticlePerformanceRow[] = [
  {
    id: 'art-installing-the-hiver-chrome-extension',
    title: 'Installing the Hiver Chrome extension',
    category: 'Setting up Hiver',
    totalViews: '34,217',
    avgTimeSpent: '03m : 12s',
    helpfulness: '91%',
    helpfulnessVariant: 'up',
  },
  {
    id: 'art-creating-your-first-shared-inbox',
    title: 'Creating your first shared inbox',
    category: 'Creating shared inboxes',
    totalViews: '28,904',
    avgTimeSpent: '04m : 02s',
    helpfulness: '88%',
    helpfulnessVariant: 'up',
  },
  {
    id: 'art-how-to-reset-your-password',
    title: 'How to reset your password',
    category: 'Creating shared inboxes',
    totalViews: '22,581',
    avgTimeSpent: '01m : 48s',
    helpfulness: '64%',
    helpfulnessVariant: 'down',
  },
  {
    id: 'art-setting-up-auto-reply-rules',
    title: 'Setting up auto-reply rules',
    category: 'Rule-based automations',
    totalViews: '19,742',
    avgTimeSpent: '03m : 51s',
    helpfulness: '72%',
    helpfulnessVariant: 'up',
  },
  {
    id: 'art-customizing-the-chat-widget',
    title: 'Customizing the chat widget',
    category: 'Live chat setup',
    totalViews: '17,830',
    avgTimeSpent: '02m : 27s',
    helpfulness: '68%',
    helpfulnessVariant: 'down',
  },
  {
    id: 'art-inviting-your-first-teammate',
    title: 'Inviting your first teammate',
    category: 'Inviting your team',
    totalViews: '15,402',
    avgTimeSpent: '02m : 58s',
    helpfulness: '85%',
    helpfulnessVariant: 'up',
  },
  {
    id: 'art-defining-first-response-targets',
    title: 'Defining first-response targets',
    category: 'SLA policies',
    totalViews: '12,981',
    avgTimeSpent: '03m : 34s',
    helpfulness: '79%',
    helpfulnessVariant: 'up',
  },
  {
    id: 'art-volume-and-response-time-reports',
    title: 'Volume and response-time reports',
    category: 'Standard reports',
    totalViews: '11,205',
    avgTimeSpent: '04m : 16s',
    helpfulness: '83%',
    helpfulnessVariant: 'up',
  },
  {
    id: 'art-connecting-whatsapp-business-to-hiver',
    title: 'Connecting WhatsApp Business to Hiver',
    category: 'WhatsApp integration',
    totalViews: '9,847',
    avgTimeSpent: '03m : 03s',
    helpfulness: '74%',
    helpfulnessVariant: 'up',
  },
  {
    id: 'art-round-robin-vs-load-balanced-assignment',
    title: 'Round-robin vs load-balanced assignment',
    category: 'Auto-assignment rules',
    totalViews: '8,612',
    avgTimeSpent: '02m : 49s',
    helpfulness: '81%',
    helpfulnessVariant: 'up',
  },
];

export const articlePerformanceFixtures = {
  statCards: articlePerformanceStatCards,
  areaSeries: articlePerformanceAreaSeries,
  areaData: articlePerformanceAreaData,
  donutData: articlePerformanceDonutData,
  needsAttentionRows: articlesNeedsAttentionRows,
  performanceRows: articlePerformanceRows,
};

/* ─────────────────────────────────────────────────────────────
 * Search fixtures (analytics tab 2)
 * ───────────────────────────────────────────────────────────── */

const searchVolumeSeries: [AnalyticsAreaSeries] = [
  { name: 'Search volume', dataKey: 'searches', variant: 'views' },
];

const searchVolumeData = zipSeries({
  searches: makeSeries(1100, 6, 0.22, 3003),
});

const missedSearchSeries: [AnalyticsAreaSeries] = [
  { name: 'Missed search rate', dataKey: 'missed', variant: 'unique' },
];

const missedSearchData = zipSeries({
  // Trend: hovering ~5.8%, slight downward drift (good news for the team)
  missed: makeSeries(62, -0.4, 0.18, 4004),
});

const missedSearchGoal: AnalyticsAreaChartGoalLine = {
  y: 70,
  label: 'Goal : 70%',
};

const searchKeywordRows: SearchKeywordRow[] = [
  { id: 'kw-1', keyword: '1. password reset', count: '11,201' },
  { id: 'kw-2', keyword: '2. auto reply not working', count: '8,429' },
  { id: 'kw-3', keyword: '3. shared inbox setup', count: '7,514' },
  { id: 'kw-4', keyword: '4. whatsapp template approval', count: '6,180' },
  { id: 'kw-5', keyword: '5. chat widget contrast', count: '5,932' },
  { id: 'kw-6', keyword: '6. sla pause weekend', count: '4,876' },
  { id: 'kw-7', keyword: '7. sso saml setup', count: '4,210' },
  { id: 'kw-8', keyword: '8. csat survey delay', count: '3,654' },
];

const contentGapRows: ContentGapRow[] = [
  { id: 'gap-1', topic: 'How to bulk-archive conversations', frequency: '11,201', ticketRate: '52%' },
  { id: 'gap-2', topic: 'Migrating from Front to Hiver', frequency: '9,840', ticketRate: '48%' },
  { id: 'gap-3', topic: 'Custom reporting via SQL export', frequency: '8,217', ticketRate: '45%' },
  { id: 'gap-4', topic: 'Two-factor authentication setup', frequency: '7,902', ticketRate: '50%' },
  { id: 'gap-5', topic: 'CSV export of CSAT comments', frequency: '6,485', ticketRate: '41%' },
  { id: 'gap-6', topic: 'Webhooks for conversation events', frequency: '5,991', ticketRate: '38%' },
  { id: 'gap-7', topic: 'Public API rate limits', frequency: '5,520', ticketRate: '36%' },
  { id: 'gap-8', topic: 'Restoring a deleted conversation', frequency: '4,876', ticketRate: '47%' },
  { id: 'gap-9', topic: 'Importing customer profiles in bulk', frequency: '4,201', ticketRate: '40%' },
  { id: 'gap-10', topic: 'IP-allowlist for SSO sign-in', frequency: '3,754', ticketRate: '34%' },
  { id: 'gap-11', topic: 'Scheduled message sending', frequency: '3,402', ticketRate: '32%' },
  { id: 'gap-12', topic: 'Dark mode for the agent dashboard', frequency: '3,108', ticketRate: '28%' },
];

const searchStatCards: StatCardProps[] = [
  {
    label: 'Total Searches',
    value: '142,308',
    trendDelta: '+9.6%',
    trendDirection: 'up',
  },
  {
    label: 'Missed Search Rate',
    value: '5.8%',
    trendDelta: '-0.7%',
    trendDirection: 'down',
  },
  {
    label: 'Avg. Result Click Rate',
    value: '64.2%',
    trendDelta: '+2.1%',
    trendDirection: 'up',
  },
  {
    label: 'Refined Searches',
    value: '12.4%',
    trendDelta: '-1.3%',
    trendDirection: 'down',
  },
];

export const searchFixtures = {
  statCards: searchStatCards,
  searchVolumeSeries,
  searchVolumeData,
  missedSearchSeries,
  missedSearchData,
  missedSearchGoal,
  keywordRows: searchKeywordRows,
  contentGapRows,
};

/* ─────────────────────────────────────────────────────────────
 * AI Answer Performance fixtures (analytics tab 3)
 * ───────────────────────────────────────────────────────────── */

const aiAnswerStatCards: StatCardProps[] = [
  {
    label: 'AI Answers Served',
    value: '47,329',
    trendDelta: '+18.2%',
    trendDirection: 'up',
  },
  {
    label: 'Deflection Rate',
    value: '67.4%',
    trendDelta: '+4.5%',
    trendDirection: 'up',
  },
  {
    label: 'Positive Feedback',
    value: '74.1%',
    trendDelta: '+1.8%',
    trendDirection: 'up',
  },
  {
    label: 'Tickets Created',
    value: '15,432',
    trendDelta: '-8.3%',
    trendDirection: 'down',
  },
];

const deflectionSeries: [AnalyticsAreaSeries] = [
  { name: 'Deflection rate', dataKey: 'rate', variant: 'positive' },
];

const deflectionData = zipSeries({
  rate: makeSeries(63, 0.18, 0.08, 5005),
});

const deflectionGoal: AnalyticsAreaChartGoalLine = {
  y: 70,
  label: 'Goal : 70%',
};

/* ── Conversation log entries — 6 anonymised AI Q&A items ──
 *
 * `tail` variants supported (kb-ui `AIConversationTail`):
 *   - 'ticket-created'         — escalation; appended after answer or follow-up
 *   - 'source-clicked'         — user opened one of the cited sources
 *   - 'search-result-clicked'  — user fell back to a search result instead
 *                                (Phase 15d.C variant — shown when the AI
 *                                answer did not satisfy and the user clicked
 *                                a non-cited article from the search panel)
 */
type ConversationTail =
  | { kind: 'ticket-created'; actor?: string }
  | { kind: 'source-clicked'; actor?: string }
  | { kind: 'search-result-clicked'; actor?: string };

type AnonymisedQA = {
  id: string;
  question: string;
  timestamp: string;
  feedback: 'positive' | 'negative' | null;
  answer: string | null;
  answerDisabled?: boolean;
  sourceCount: number;
  followUp?: {
    question: string;
    answer: string;
    sourceCount: number;
    tail?: ConversationTail;
  };
  tail?: ConversationTail;
};

const aiConversationLogs: AnonymisedQA[] = [
  {
    id: 'log-1',
    question: 'How do I reset my Hiver password if I never get the email?',
    timestamp: 'Apr 24, 2:23 PM',
    feedback: 'positive',
    answer:
      'If the password reset email never arrives, ask your IT admin to allowlist noreply@hiverhq.com. Most missed reset emails are quarantined by the company mail filter, not lost.',
    sourceCount: 4,
    tail: { kind: 'source-clicked', actor: 'the user' },
  },
  {
    id: 'log-2',
    question: 'My weekend auto-reply rule is not firing. What should I check?',
    timestamp: 'Apr 23, 11:08 AM',
    feedback: 'negative',
    answer:
      'Auto-reply rules use the workspace timezone, not the agent\'s local timezone. If your team is in Sydney but the workspace is set to UTC, "Saturday" in the schedule means UTC Saturday — verify the schedule preview matches your intended local hours.',
    sourceCount: 4,
    followUp: {
      question: 'Where do I change the workspace timezone?',
      answer:
        'Open Settings → Workspace → General. The Workspace timezone field at the top controls the timezone every rule and report uses by default. Changing it does not retroactively shift existing rule schedules.',
      sourceCount: 2,
      tail: { kind: 'ticket-created', actor: 'an admin' },
    },
  },
  {
    id: 'log-3',
    question: 'Can the chat widget meet WCAG 2.1 AA contrast?',
    timestamp: 'Apr 22, 4:51 PM',
    feedback: 'positive',
    answer:
      'Yes. The default theme already meets WCAG 2.1 AA. When customising colours, the theme selector shows a live contrast badge — anything below the AA threshold earns a warning before you save.',
    sourceCount: 3,
  },
  {
    id: 'log-4',
    question: 'Why does the SMS reset code never arrive on my number?',
    timestamp: 'Apr 21, 9:32 AM',
    feedback: 'negative',
    answer: null,
    answerDisabled: true,
    sourceCount: 0,
    tail: { kind: 'ticket-created', actor: 'the user' },
  },
  {
    id: 'log-5',
    question: 'How do I bulk-archive old conversations?',
    timestamp: 'Apr 20, 1:17 PM',
    feedback: null,
    answer:
      'There is no built-in bulk-archive UI yet. The supported workaround is to filter by status + date in the conversations list, select all, and use the Archive bulk action from the table toolbar. We are tracking native bulk-archive as an upcoming feature.',
    sourceCount: 2,
  },
  {
    // Phase 15d.C: new 'search-result-clicked' tail variant.
    // Realistic narrative — the AI couldn't confidently answer a niche
    // routing question; the user fell back to a search result rather
    // than opening a cited source. PRD §13.4 source pattern: auto-reply
    // rules sit on the AI-targeted articles list, so the timezone /
    // schedule scenarios from §13.4 inspire the question shape here.
    id: 'log-6',
    question:
      'Can I pause SLA timers automatically during company-wide holidays?',
    timestamp: 'Apr 19, 10:48 AM',
    feedback: 'negative',
    answer:
      "I'm not able to confirm whether SLA timers can be auto-paused on workspace holiday calendars. The closest configurable option I found is per-rule schedule exclusions, but that does not propagate to SLA policies.",
    sourceCount: 1,
    tail: { kind: 'search-result-clicked', actor: 'the user' },
  },
];

const aiSortOptions = [
  { id: 'most-recent', label: 'Most recent' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'most-feedback', label: 'Most feedback' },
];

const mostCitedRows: MostCitedRow[] = [
  {
    id: 'art-how-to-reset-your-password',
    title: 'How to reset your password',
    citations: 1842,
  },
  {
    id: 'art-setting-up-auto-reply-rules',
    title: 'Setting up auto-reply rules',
    citations: 1437,
  },
  {
    id: 'art-customizing-the-chat-widget',
    title: 'Customizing the chat widget',
    citations: 1203,
  },
  {
    id: 'art-creating-your-first-shared-inbox',
    title: 'Creating your first shared inbox',
    citations: 982,
  },
  {
    id: 'art-installing-the-hiver-chrome-extension',
    title: 'Installing the Hiver Chrome extension',
    citations: 871,
  },
];

export const aiAnswerFixtures = {
  statCards: aiAnswerStatCards,
  deflectionSeries,
  deflectionData,
  deflectionGoal,
  conversationLogs: aiConversationLogs,
  sortOptions: aiSortOptions,
  mostCitedRows,
};
