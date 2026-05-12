import type { Meta, StoryObj } from '@storybook/react-vite';
import '../tokens.css';
import { Feather, Settings01, BarChartSquare02, InfoCircle } from '@untitledui/icons';
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
import { DataTable, type DataTableColumn } from '../components/content/DataTable';
import { cn } from '../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * KB Analytics — Search
 * Figma `251DTRmxl2L6jmXd3FWzHe#1974:54154`.
 *
 * Page composition (top → bottom):
 *   - Page header
 *   - 2-up: Search vol over time (unique-blue area) | Missed search rate
 *           (positive-green area + Goal:70% line)
 *   - DataTable — top search keywords (5 rows, no header divider)
 *   - DataTable — content gaps (12 rows, with "Write Article" CTA)
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

type Keyword = { id: string; keyword: string; count: string };
const searchKeywordsRows: Keyword[] = [
  { id: '1', keyword: '1. password reset', count: '11200' },
  { id: '2', keyword: '2. billing duplicate charges', count: '1200' },
  { id: '3', keyword: '3. slack integration', count: '200' },
  { id: '4', keyword: '4. export data', count: '20' },
  { id: '5', keyword: '5. gmail addon install', count: '2' },
];

const keywordColumns: DataTableColumn<Keyword>[] = [
  { id: 'keyword', header: 'Keywords', render: (r) => r.keyword },
  {
    id: 'count',
    header: 'Search Count',
    align: 'right',
    render: (r) => r.count,
  },
];

type Gap = { id: string; topic: string; frequency: string; ticketRate: string };

const CONTENT_GAP_TOPICS = [
  'Cancel Subscription / account deletion',
  'Mobile app availability',
  'Dark mode / UI customisation',
] as const;

const contentGapsRows: Gap[] = Array.from({ length: 12 }, (_, idx) => {
  const isLast = idx === 11;
  return {
    id: String(idx + 1),
    topic: CONTENT_GAP_TOPICS[idx % 3]!,
    frequency: isLast ? '852' : String(11201 + idx),
    ticketRate: idx === 0 ? '45%' : '50%',
  };
});

function WriteArticleButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[6px] bg-[#f1f5f9] px-2 py-1',
        'text-[14px] font-medium leading-[20px] text-[#0f172a]',
        'transition-colors hover:bg-[#e2e8f0]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10',
      )}
    >
      <Feather
        size={14}
        className="text-[#475569]"
        aria-hidden="true"
      />
      Write Article
    </button>
  );
}

const gapColumns: DataTableColumn<Gap>[] = [
  { id: 'topic', header: 'Topic', render: (r) => r.topic },
  { id: 'frequency', header: 'Frequency', render: (r) => r.frequency },
  { id: 'ticketRate', header: 'Ticket Rate', render: (r) => r.ticketRate },
  {
    id: 'action',
    header: 'Action',
    render: (r) => (
      <WriteArticleButton
        onClick={() => {
          // eslint-disable-next-line no-console
          console.log('write', r.id);
        }}
      />
    ),
  },
];

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
          headerIcon={<BarChartSquare02 size={16} />}
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

        <DataTable
          dataKbComponent="search-keywords-table"
          rows={searchKeywordsRows}
          columns={keywordColumns}
          emptyMessage="No keywords"
          heading={
            <div className="flex items-center">
              <h3 className="text-[14px] font-medium leading-[20px] text-[#0f172a]">
                Top 5 Search Keywords
              </h3>
              <span className="ml-2 inline-flex" aria-hidden>
                <InfoCircle
                  size={16}
                  className="text-[#475569]"
                  aria-hidden="true"
                />
              </span>
            </div>
          }
        />

        <DataTable
          dataKbComponent="content-gaps-table"
          rows={contentGapsRows}
          columns={gapColumns}
          emptyMessage="No content gaps"
          heading={
            <div>
              <div className="flex items-center">
                <h3 className="text-[14px] font-medium leading-[20px] text-[#0f172a]">
                  Content Gaps
                </h3>
                <span className="ml-2 inline-flex" aria-hidden>
                  <InfoCircle
                    size={16}
                    className="text-[#475569]"
                    aria-hidden="true"
                  />
                </span>
              </div>
              <p className="mt-1 text-[13px] font-normal leading-[19px] text-[#475569]">
                Topics users searched for but didn&apos;t find. Write articles to
                close these gaps
              </p>
            </div>
          }
        />
      </div>
    </AppShell>
  );
}

const meta: Meta<typeof SearchAnalyticsPage> = {
  title: 'Patterns/Analytics/Search',
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'responsive' },
  },
  component: SearchAnalyticsPage,
  render: () => (
    <div className="h-screen w-full">
      <SearchAnalyticsPage />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof SearchAnalyticsPage> = {};
