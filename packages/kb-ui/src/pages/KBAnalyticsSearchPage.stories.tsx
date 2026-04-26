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
import { DateRangePill } from '../components/content/DateRangePill';
import { AnalyticsAreaChart } from '../components/content/AnalyticsAreaChart';
import { AnalyticsChartCard } from '../components/content/AnalyticsChartCard';
import {
  SearchKeywordsTable,
  type SearchKeywordRow,
} from '../components/content/SearchKeywordsTable';
import {
  ContentGapsTable,
  type ContentGapRow,
} from '../components/content/ContentGapsTable';

/* ─────────────────────────────────────────────────────────────
 * KB Analytics — Search
 * Figma `251DTRmxl2L6jmXd3FWzHe#1974:54154`.
 *
 * Page composition (top → bottom):
 *   - Page header: title + subtitle | DateRangePill
 *   - 2-up: Search vol. over time (unique-blue area) | Missed search rate
 *           (positive-green area + Goal:70% line)
 *   - SearchKeywordsTable — 5 rows
 *   - ContentGapsTable — 12 rows
 * ───────────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Patterns/KB Analytics — Search',
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'responsive' },
  },
};
export default meta;
type Story = StoryObj;

/* ── Rail (4 items, analytics active) ─────────────────────────── */

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

const analyticsNavItems: NavItem[] = [
  { id: 'views', type: 'article', title: 'Article Views and Engagement' },
  { id: 'search', type: 'article', title: 'Search' },
  { id: 'ai', type: 'article', title: 'AI Answer Performance' },
];

/* ── Mock data ──────────────────────────────────────────────── */

const searchVolumeData = [
  { x: 'mon', searches: 3200 },
  { x: 'tue', searches: 3500 },
  { x: 'wed', searches: 4100 },
  { x: 'thu', searches: 5200 },
  { x: 'fri', searches: 7800 },
  { x: 'sat', searches: 8400 },
  { x: 'sun', searches: 6200 },
];

const missedSearchData = [
  { x: 'mon', missed: 52 },
  { x: 'tue', missed: 56 },
  { x: 'wed', missed: 48 },
  { x: 'thu', missed: 62 },
  { x: 'fri', missed: 53 },
  { x: 'sat', missed: 31 },
  { x: 'sun', missed: 18 },
];

const searchKeywordsRows: SearchKeywordRow[] = [
  { id: '1', keyword: '1. password reset', count: '11200' },
  { id: '2', keyword: '2. billing duplicate charges', count: '1200' },
  { id: '3', keyword: '3. slack integration', count: '200' },
  { id: '4', keyword: '4. export data', count: '20' },
  { id: '5', keyword: '5. gmail addon install', count: '2' },
];

const CONTENT_GAP_TOPICS = [
  'Cancel Subscription / account deletion',
  'Mobile app availability',
  'Dark mode / UI customisation',
] as const;

const contentGapsRows: ContentGapRow[] = Array.from({ length: 12 }, (_, idx) => {
  const isLast = idx === 11;
  return {
    id: String(idx + 1),
    topic: CONTENT_GAP_TOPICS[idx % 3]!,
    frequency: isLast ? '852' : String(11201 + idx),
    ticketRate: idx === 0 ? '45%' : '50%',
  };
});

/* ─────────────────────────────────────────────────────────────
 * Page composition
 * ───────────────────────────────────────────────────────────── */

function SearchAnalyticsPage() {
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
          headerIcon={<RiBarChartBoxLine size={16} />}
          items={analyticsNavItems}
          activeId="search"
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
              Search
            </h1>
            <p className="mt-1 text-[14px] font-normal leading-[20px] text-[#475569]">
              Which articles are people reading, and are they finding them
              useful?
            </p>
          </div>
          <DateRangePill value="7d" />
        </header>

        {/* 2-up: Search vol over time | Missed search rate */}
        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            <AnalyticsChartCard
              title="Search vol. over time"
              infoTooltip="Total search volume over the selected period"
            >
              <AnalyticsAreaChart
                data={searchVolumeData}
                xKey="x"
                series={[
                  { name: 'Searches', dataKey: 'searches', variant: 'unique' },
                ]}
                yTicks={[0, 3000, 6000, 9000, 12000]}
                showLegend={false}
              />
            </AnalyticsChartCard>
          </div>
          <div className="flex-1 min-w-0">
            <AnalyticsChartCard
              title="Missed search rate"
              subtitle="Goal : trend line to go down"
              infoTooltip="Percentage of searches that returned no result"
            >
              <AnalyticsAreaChart
                data={missedSearchData}
                xKey="x"
                series={[
                  {
                    name: 'Missed Search Rate',
                    dataKey: 'missed',
                    variant: 'positive',
                  },
                ]}
                yTicks={[0, 25, 50, 75, 100]}
                goalLine={{ y: 70, label: 'Goal : 70%' }}
                showLegend={false}
              />
            </AnalyticsChartCard>
          </div>
        </div>

        {/* Search keywords table */}
        <SearchKeywordsTable rows={searchKeywordsRows} />

        {/* Content gaps table */}
        <ContentGapsTable rows={contentGapsRows} />
      </div>
    </AppShell>
  );
}

/** Default — Search analytics page at responsive width.
 *  Matches Figma `1974:54154`. */
export const Default: Story = {
  render: () => (
    <div className="h-screen w-full">
      <SearchAnalyticsPage />
    </div>
  ),
};
