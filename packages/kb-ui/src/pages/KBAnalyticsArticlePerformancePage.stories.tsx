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
import {
  ArticlesNeedsAttentionTable,
  type ArticleAttentionRow,
} from '../components/content/ArticlesNeedsAttentionTable';
import {
  ArticlePerformanceTable,
  type ArticlePerformanceRow,
} from '../components/content/ArticlePerformanceTable';

/* ─────────────────────────────────────────────────────────────
 * KB Analytics — Article Performance
 * Figma `251DTRmxl2L6jmXd3FWzHe#1974:53692`.
 *
 * Page composition (top → bottom):
 *   - Page header: title + subtitle (left) | DateRangePill (right)
 *   - StatCardGrid "Support Performance" — 4 metrics
 *   - AnalyticsChartCard "Article views over time" — 2-series area chart
 *   - 2-up: AnalyticsChartCard "Views by Category" (donut) | ArticlesNeedsAttentionTable
 *   - ArticlePerformanceTable
 *
 * Side-nav:
 *   - Rail (dark, 54): AI / Editor / Analytics (active) / Settings
 *   - Explorer: FileExplorerNav variant="flat" with `views` active
 *   - Breadcrumb: category variant with single item "Analytics"
 * ───────────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Patterns/KB Analytics — Article Performance',
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

/* ── Analytics explorer items (3 sections, flat list) ──────── */

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

const needsAttentionRows: ArticleAttentionRow[] = [
  { id: '1', title: 'Syncing past emails while creating', helpfulness: '24%', variant: 'down' },
  { id: '2', title: 'How to Sync Previous Emails Whe...', helpfulness: '31%', variant: 'down' },
  { id: '3', title: 'Setting Up a New Shared Mailbox:', helpfulness: '91%', variant: 'up' },
  { id: '4', title: 'Creating a New Shared Mailbox? H...', helpfulness: '95%', variant: 'up' },
];

const articlePerformanceRows: ArticlePerformanceRow[] = [
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
          brandLogo={
            <div className="flex size-[40px] items-center justify-center rounded-[8px] bg-[#2d2d2d]">
              <CompanyLogo size={24} />
            </div>
          }
          bottomSlot={<Avatar initials="A" />}
        />
      }
      explorer={
        <FileExplorerNav
          variant="flat"
          theme="light"
          title="Analytics"
          headerIcon={<RiBarChartBoxLine size={16} />}
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
        {/* Page header */}
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

        {/* Stats — Support Performance */}
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

        {/* Article views over time */}
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

        {/* 2-up: Views by Category | Articles needs attention */}
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
            <ArticlesNeedsAttentionTable rows={needsAttentionRows} />
          </div>
        </div>

        {/* Article Performance table */}
        <ArticlePerformanceTable rows={articlePerformanceRows} />
      </div>
    </AppShell>
  );
}

/** Default — Article Performance page composed at responsive width.
 *  Matches Figma `1974:53692`. */
export const Default: Story = {
  render: () => (
    <div className="h-screen w-full">
      <ArticlePerformancePage />
    </div>
  ),
};
