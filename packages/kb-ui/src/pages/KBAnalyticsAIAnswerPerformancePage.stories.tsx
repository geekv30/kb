import type { Meta, StoryObj } from '@storybook/react-vite';
import '../tokens.css';
import {
  RiQuillPenLine,
  RiSettings5Line,
  RiBarChartBoxLine,
} from '@remixicon/react';
import { AppShell } from '../components/shell/AppShell';
import { KBBreadcrumbBar } from '../components/shell/KBBreadcrumbBar';
import { SideNavRail, type NavRailItem } from '../components/nav/SideNavRail';
import { AnalyticsSideNav } from '../components/nav/AnalyticsSideNav';
import { Avatar } from '../components/primitives/Avatar';
import { CompanyLogo } from '../components/brand/CompanyLogo';
import { AiIcon } from '../components/brand/AiIcon';
import { StatCardGrid } from '../components/content/StatCardGrid';
import { DateRangePill } from '../components/content/DateRangePill';
import { AnalyticsAreaChart } from '../components/content/AnalyticsAreaChart';
import { AnalyticsChartCard } from '../components/content/AnalyticsChartCard';
import { AIConversationLogsCard } from '../components/content/AIConversationLogsCard';
import { AIConversationLogEntry } from '../components/content/AIConversationLogEntry';
import {
  MostCitedArticlesTable,
  type MostCitedRow,
} from '../components/content/MostCitedArticlesTable';
import type { ConversationSource } from '../components/overlays/SourcesSideSheet';

/* ─────────────────────────────────────────────────────────────
 * KB Analytics — AI Answer Performance
 * Figma `251DTRmxl2L6jmXd3FWzHe#1974:53167`.
 *
 * Page composition (top → bottom):
 *   - Page header: title + subtitle | DateRangePill
 *   - StatCardGrid "AI Search Performance" — 4 metrics
 *   - AnalyticsChartCard "AI deflection rate over time" — single-series
 *     positive (green) area + Goal:70% reference line
 *   - AIConversationLogsCard — 5 entries
 *   - MostCitedArticlesTable — 5 rows
 * ───────────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Patterns/KB Analytics — AI Answer Performance',
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'responsive' },
  },
};
export default meta;
type Story = StoryObj;

/* ── Rail (dark, 4 items, analytics active) ─────────────────── */

const railItems: NavRailItem[] = [
  { id: 'ai', icon: <AiIcon size={16} />, label: 'AI' },
  { id: 'editor', icon: <RiQuillPenLine size={16} />, label: 'Editor' },
  {
    id: 'analytics',
    icon: <RiBarChartBoxLine size={16} />,
    label: 'Analytics',
  },
  { id: 'settings', icon: <RiSettings5Line size={16} />, label: 'Settings' },
];

const analyticsNavItems = [
  { id: 'views', label: 'Article Views and Engagement' },
  { id: 'search', label: 'Search' },
  { id: 'ai', label: 'AI Answer Performance' },
];

/* ── Mock data ──────────────────────────────────────────────── */

const aiDeflectionData = [
  { x: 'mon', deflection: 22 },
  { x: 'tue', deflection: 35 },
  { x: 'wed', deflection: 48 },
  { x: 'thu', deflection: 60 },
  { x: 'fri', deflection: 72 },
  { x: 'sat', deflection: 85 },
  { x: 'sun', deflection: 90 },
];

const SAMPLE_SOURCES: ConversationSource[] = [
  {
    id: '1',
    senderName: 'Ava Johnson',
    timestamp: 'Feb 4, 2:45 PM',
    subject: "I can't log into my account.",
    snippet: "I'm experiencing syncing problems on my devices....",
  },
  {
    id: '2',
    senderName: 'Sophie Lee',
    timestamp: 'Feb 4, 9:45 PM',
    subject: 'Password reset link not arriving.',
    snippet: "I'm having trouble syncing my devices. My data is...",
  },
  {
    id: '3',
    senderName: 'Emma Garcia',
    timestamp: 'Feb 4, 4:45 PM',
    subject: 'Recovery email options',
    snippet: "I'm facing syncing issues on my devices. My data i...",
  },
];

const SORT_OPTIONS = [
  { id: 'recent', label: 'Recent' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'helpful', label: 'Most helpful' },
  { id: 'unhelpful', label: 'Least helpful' },
];

const mostCitedRows: MostCitedRow[] = [
  {
    id: '1',
    title: 'Syncing past emails while creating a new Shared Mailbox',
    citations: 224,
  },
  {
    id: '2',
    title: 'Importing Previous Emails When Setting Up a New Shared Mailbox',
    citations: 128,
  },
  {
    id: '3',
    title: 'Importing Previous Emails When Setting Up a New Shared Mailbox',
    citations: 88,
  },
  {
    id: '4',
    title: 'Importing Previous Emails When Setting Up a New Shared Mailbox',
    citations: 64,
  },
  {
    id: '5',
    title: 'Importing Previous Emails When Setting Up a New Shared Mailbox',
    citations: 22,
  },
];

/* ─────────────────────────────────────────────────────────────
 * Page composition
 * ───────────────────────────────────────────────────────────── */

function AIAnswerPerformancePage() {
  return (
    <AppShell
      rail={
        <SideNavRail
          theme="dark"
          items={railItems}
          activeId="analytics"
          brandLogo={
            <div className="flex size-[40px] items-center justify-center rounded-[8px] bg-[#2d2d2d]">
              <CompanyLogo size={24} />
            </div>
          }
          bottomSlot={<Avatar initials="A" />}
        />
      }
      explorer={
        <AnalyticsSideNav
          items={analyticsNavItems}
          activeId="ai"
          onItemClick={() => {}}
        />
      }
      breadcrumb={
        <KBBreadcrumbBar
          variant="category"
          items={[{ id: 'analytics', label: 'Analytics' }]}
          onCollapse={() => {}}
        />
      }
    >
      <div className="flex flex-col gap-5">
        {/* Page header */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-semibold leading-[32px] text-[#0f172a]">
              AI Answer Performance
            </h1>
            <p className="mt-1 text-[14px] font-normal leading-[20px] text-[#475569]">
              Is the AI search feature actually helping, or are people still
              needing human support?
            </p>
          </div>
          <DateRangePill value="7d" />
        </header>

        {/* AI Search Performance stats */}
        <StatCardGrid
          title="AI Search Performance"
          stats={[
            {
              label: 'Total AI Queries',
              value: '112,678',
              trendDelta: '+15%',
              trendDirection: 'up',
            },
            {
              label: 'Answer Rate',
              value: '321,950',
              trendDelta: '+15%',
              trendDirection: 'up',
            },
            {
              label: 'Helpfulness Rate',
              value: '70.2%',
              trendDelta: '+15%',
              trendDirection: 'up',
            },
            {
              label: 'Deflection Rate',
              value: '19.8%',
              trendDelta: '+12%',
              trendDirection: 'down',
            },
          ]}
        />

        {/* AI deflection rate over time + goal line */}
        <AnalyticsChartCard
          title="AI deflection rate over time"
          subtitle="% of AI conversations that did not result in a support ticket"
          infoTooltip="Percentage of AI conversations that did not result in a support ticket"
        >
          <AnalyticsAreaChart
            data={aiDeflectionData}
            xKey="x"
            series={[
              {
                name: 'AI Deflection Rate',
                dataKey: 'deflection',
                variant: 'positive',
              },
            ]}
            yTicks={[0, 25, 50, 75, 100]}
            goalLine={{ y: 70, label: 'Goal : 70%' }}
            showLegend={false}
          />
        </AnalyticsChartCard>

        {/* AI conversation logs (5 entries — verbatim from Step 6 Default) */}
        <AIConversationLogsCard
          sortOptions={SORT_OPTIONS}
          sortBy="recent"
          ticketCreatedFilter={false}
        >
          <AIConversationLogEntry
            question="How do I reset my password if I can't access my recovery email?"
            timestamp="Mar 31, 2:23 PM"
            feedback="positive"
            answer="Outlined the 3-step account recovery process via billing info and support contact."
            sourceCount={3}
            sources={SAMPLE_SOURCES}
          />
          <AIConversationLogEntry
            question="How do I reset my password if I can't access my recovery email?"
            timestamp="Mar 31, 2:23 PM"
            feedback="positive"
            answer="Outlined the 3-step account recovery process via billing info and support contact."
            sourceCount={3}
            sources={SAMPLE_SOURCES}
          />
          <AIConversationLogEntry
            question="Why was I charged twice this month?"
            timestamp="Mar 30, 1:23 PM"
            feedback={null}
            answer="Explained duplicate charge scenarios and how to report via the billing dashboard. Included 5–7 day refund timeline as well as an apology for the duplicate charge."
            sourceCount={3}
            sources={SAMPLE_SOURCES}
            tail={{ kind: 'ticket-created' }}
          />
          <AIConversationLogEntry
            question="How do I set up Slack notifications for my team?"
            timestamp="Mar 28, 2:23 PM"
            feedback={null}
            answer="Walked through the Slack integration setup, notification scope settings, and OAuth re-authorization steps"
            sourceCount={3}
            sources={SAMPLE_SOURCES}
            followUp={{
              question: 'How do i do this and that?',
              answer: 'Explained about the OAuth setup',
              sourceCount: 3,
              sources: SAMPLE_SOURCES,
              tail: { kind: 'source-clicked' },
            }}
            showViewAll
          />
          <AIConversationLogEntry
            question="Does Hiver have HIPAA compliance?"
            timestamp="Mar 27, 2:23 PM"
            feedback="negative"
            answer="AI could not provide an answer"
            answerDisabled
            sourceCount={0}
            tail={{ kind: 'source-clicked', actor: 'the user' }}
          />
        </AIConversationLogsCard>

        {/* Most cited articles table */}
        <MostCitedArticlesTable rows={mostCitedRows} />
      </div>
    </AppShell>
  );
}

/** Default — AI Answer Performance page at responsive width.
 *  Matches Figma `1974:53167`. */
export const Default: Story = {
  render: () => (
    <div className="h-screen w-full">
      <AIAnswerPerformancePage />
    </div>
  ),
};
