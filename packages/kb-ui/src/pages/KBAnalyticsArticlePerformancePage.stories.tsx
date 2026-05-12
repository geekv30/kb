import type { Meta, StoryObj } from '@storybook/react-vite';
import '../tokens.css';
import { Feather, Settings01, BarChartSquare02, File02, InfoCircle } from '@untitledui/icons';
import { AppShell } from '../components/shell/AppShell';
import { KBBreadcrumbBar } from '../components/shell/KBBreadcrumbBar';
import { SideNavRail, type NavRailItem } from '../components/nav/SideNavRail';
import {
  FileExplorerNav,
  type NavItem,
} from '../components/nav/FileExplorerNav';
import { Avatar } from '../components/primitives/Avatar';
import { CompanyLogo } from '../components/brand/CompanyLogo';
import { AiIcon } from '../components/brand/AiIcon';
import { StatCardGrid } from '../components/content/StatCardGrid';
import { DateRangePill } from '../components/content/DateRangePill';
import { AnalyticsAreaChart } from '../components/content/AnalyticsAreaChart';
import { AnalyticsChartCard } from '../components/content/AnalyticsChartCard';
import { AnalyticsDonutChart } from '../components/content/AnalyticsDonutChart';
import { DataTable, type DataTableColumn } from '../components/content/DataTable';
import {
  HelpfulnessTag,
  type HelpfulnessVariant,
} from '../components/content/HelpfulnessTag';

/* ─────────────────────────────────────────────────────────────
 * KB Analytics — Article Performance
 * Figma `251DTRmxl2L6jmXd3FWzHe#1974:53692`.
 *
 * Page composition (top → bottom):
 *   - Page header: title + subtitle (left) | DateRangePill (right)
 *   - StatCardGrid "Support Performance" — 4 metrics
 *   - AnalyticsChartCard "Article views over time" — 2-series area chart
 *   - 2-up: AnalyticsChartCard "Views by Category" (donut) | DataTable (needs-attention)
 *   - DataTable (article performance — 5 cols)
 * ───────────────────────────────────────────────────────────── */

const railItems: NavRailItem[] = [
  { id: 'ai', icon: <AiIcon size={16} />, label: 'AI' },
  { id: 'editor', icon: <Feather size={16} />, label: 'Editor' },
  {
    id: 'analytics',
    icon: <BarChartSquare02 size={16} />,
    label: 'Analytics',
  },
  { id: 'settings', icon: <Settings01 size={16} />, label: 'Settings' },
];

const analyticsNavItems: NavItem[] = [
  { id: 'views', type: 'article', title: 'Article Views and Engagement' },
  { id: 'search', type: 'article', title: 'Search' },
  { id: 'ai', type: 'article', title: 'AI Answer Performance' },
];

/* ── Mock data ──────────────────────────────────────────────── */

const articleViewsData = [
  { x: 'mon', views: 4200, unique: 1800 },
  { x: 'tue', views: 5300, unique: 2200 },
  { x: 'wed', views: 5100, unique: 2400 },
  { x: 'fri', views: 7400, unique: 2900 },
  { x: 'sat', views: 8900, unique: 3300 },
  { x: 'sun', views: 9600, unique: 3500 },
];

const viewsByCategoryData = [
  { label: 'Category 1', value: 32 },
  { label: 'Category 2', value: 18 },
  { label: 'Category 3', value: 14 },
  { label: 'Category 4', value: 12 },
  { label: 'Category 5', value: 14 },
  { label: 'Category 6', value: 10 },
];

type AttentionRow = {
  id: string;
  title: string;
  helpfulness: string;
  variant: HelpfulnessVariant;
};

const needsAttentionRows: AttentionRow[] = [
  { id: '1', title: 'Syncing past emails while creating', helpfulness: '24%', variant: 'down' },
  { id: '2', title: 'How to Sync Previous Emails Whe...', helpfulness: '31%', variant: 'down' },
  { id: '3', title: 'Setting Up a New Shared Mailbox:', helpfulness: '91%', variant: 'up' },
  { id: '4', title: 'Creating a New Shared Mailbox? H...', helpfulness: '95%', variant: 'up' },
];

const attentionColumns: DataTableColumn<AttentionRow>[] = [
  {
    id: 'title',
    header: 'Article Title',
    render: (r) => (
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <File02
          size={16}
          className="shrink-0 text-[#64748b]"
          aria-hidden="true"
        />
        <span className="truncate">{r.title}</span>
      </div>
    ),
  },
  {
    id: 'helpfulness',
    header: 'Helpfulness',
    align: 'right',
    render: (r) => <HelpfulnessTag value={r.helpfulness} variant={r.variant} />,
  },
];

type PerfRow = {
  id: string;
  title: string;
  category: string;
  totalViews: string;
  avgTimeSpent: string;
  helpfulness: string;
  helpfulnessVariant: HelpfulnessVariant;
};

const articlePerformanceRows: PerfRow[] = [
  {
    id: '1',
    title: 'Syncing past emails while cr...',
    category: 'Getting Started',
    totalViews: '11,200',
    avgTimeSpent: '02m : 45s',
    helpfulness: '91%',
    helpfulnessVariant: 'up',
  },
  {
    id: '2',
    title: 'How to Sync Previous Emails...',
    category: 'Understanding the Basics',
    totalViews: '11,200',
    avgTimeSpent: '02m : 45s',
    helpfulness: '91%',
    helpfulnessVariant: 'down',
  },
  {
    id: '3',
    title: 'Setting Up a New Shared Ma...',
    category: 'Advanced Techniques',
    totalViews: '11,200',
    avgTimeSpent: '02m : 45s',
    helpfulness: '91%',
    helpfulnessVariant: 'up',
  },
  {
    id: '4',
    title: 'Creating a New Shared Mail...',
    category: 'Best Practices',
    totalViews: '11,200',
    avgTimeSpent: '02m : 45s',
    helpfulness: '91%',
    helpfulnessVariant: 'down',
  },
];

const performanceColumns: DataTableColumn<PerfRow>[] = [
  {
    id: 'title',
    header: 'Article Title',
    width: 230,
    render: (r) => (
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <File02
          size={16}
          className="shrink-0 text-[#64748b]"
          aria-hidden="true"
        />
        <span className="truncate">{r.title}</span>
      </div>
    ),
  },
  {
    id: 'category',
    header: 'Category',
    width: 208,
    headerClassName: 'pl-6',
    className: 'pl-6',
    render: (r) => (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#f7f7f7] text-[13px] font-normal leading-[19px] text-[#0f172a]">
        {r.category}
      </span>
    ),
  },
  {
    id: 'totalViews',
    header: 'Total Views',
    width: 126,
    headerClassName: 'pl-6',
    className: 'pl-6',
    render: (r) => r.totalViews,
  },
  {
    id: 'avgTimeSpent',
    header: 'Avg. Time Spent',
    width: 158,
    headerClassName: 'pl-6',
    className: 'pl-6',
    render: (r) => r.avgTimeSpent,
  },
  {
    id: 'helpfulness',
    header: 'Helpfulness',
    width: 128,
    align: 'right',
    headerClassName: 'pr-6',
    className: 'pr-6',
    render: (r) => (
      <HelpfulnessTag value={r.helpfulness} variant={r.helpfulnessVariant} />
    ),
  },
];

/* ─────────────────────────────────────────────────────────────
 * Page composition
 * ───────────────────────────────────────────────────────────── */

function ArticlePerformancePage() {
  return (
    <AppShell
      rail={
        <SideNavRail
          theme="light"
          items={railItems}
          activeId="analytics"
          brandLogo={<CompanyLogo size={24} />}
          bottomSlot={<Avatar initials="A" />}
        />
      }
      explorer={
        <FileExplorerNav
          variant="flat"
          theme="light"
          title="Analytics"
          headerIcon={<BarChartSquare02 size={16} />}
          items={analyticsNavItems}
          activeId="views"
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
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-semibold leading-[32px] text-[#0f172a]">
              Article performance
            </h1>
            <p className="mt-1 text-[14px] font-normal leading-[20px] text-[#475569]">
              Key metrics for your Help Centre over the selected period
            </p>
          </div>
          <DateRangePill value="7d" />
        </header>

        <StatCardGrid
          title="Support Performance"
          infoTooltip="Total support performance metrics"
          stats={[
            {
              label: 'Total Views',
              value: '112,678',
              trendDelta: '+15%',
              trendDirection: 'up',
            },
            {
              label: 'Total Searches',
              value: '321,950',
              trendDelta: '+15%',
              trendDirection: 'up',
            },
            {
              label: 'Missed Search Rate',
              value: '70.2%',
              trendDelta: '+15%',
              trendDirection: 'up',
            },
            {
              label: 'AI Deflection Rate',
              value: '19.8%',
              trendDelta: '+12%',
              trendDirection: 'down',
            },
          ]}
        />

        <AnalyticsChartCard
          title="Article views over time"
          infoTooltip="Total vs unique views over the selected period"
        >
          <AnalyticsAreaChart
            data={articleViewsData}
            xKey="x"
            series={[
              { name: 'Total Views', dataKey: 'views', variant: 'views' },
              { name: 'Unique Views', dataKey: 'unique', variant: 'unique' },
            ]}
            yTicks={[0, 3000, 6000, 9000, 12000]}
          />
        </AnalyticsChartCard>

        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            <AnalyticsChartCard
              title="Views by Category"
              infoTooltip="Article views distributed by category"
            >
              <AnalyticsDonutChart data={viewsByCategoryData} />
            </AnalyticsChartCard>
          </div>
          <div className="flex-1 min-w-0">
            <DataTable
              dataKbComponent="articles-needs-attention-table"
              rows={needsAttentionRows}
              columns={attentionColumns}
              emptyMessage="No articles"
              headingGap={8}
              heading={
                <div>
                  <div className="flex items-center">
                    <h3 className="text-[14px] font-medium leading-[20px] text-[#0f172a]">
                      Articles needs attention
                    </h3>
                    <InfoCircle
                      size={16}
                      className="ml-2 text-[#475569]"
                      aria-hidden="true"
                    />
                    <span className="flex-1" />
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#f7f7f7] text-[12px] font-medium leading-[18px] text-[#0f172a]"
                      aria-label={`${needsAttentionRows.length} Articles`}
                    >
                      {`${needsAttentionRows.length} Articles`}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] font-normal leading-[19px] text-[#475569]">
                    Articles with very low helpfulness index
                  </p>
                  <div className="mt-4 h-px bg-[#e2e8f0]" />
                </div>
              }
              headerDivider={false}
            />
          </div>
        </div>

        <DataTable
          dataKbComponent="article-performance-table"
          rows={articlePerformanceRows}
          columns={performanceColumns}
          emptyMessage="No articles"
          headingGap={8}
          heading={
            <div>
              <div className="flex items-center">
                <h3 className="text-[14px] font-medium leading-[20px] text-[#0f172a]">
                  Article Performance
                </h3>
                <InfoCircle
                  size={16}
                  className="ml-2 text-[#475569]"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-4 h-px bg-[#e2e8f0]" />
            </div>
          }
          headerDivider={false}
        />
      </div>
    </AppShell>
  );
}

const meta: Meta<typeof ArticlePerformancePage> = {
  title: 'Patterns/Analytics/Article Performance',
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'responsive' },
  },
  component: ArticlePerformancePage,
  render: () => (
    <div className="h-screen w-full">
      <ArticlePerformancePage />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof ArticlePerformancePage> = {};
