// Phase 7.5.7 — Analytics: Article Performance.
//
// Mirrors `packages/kb-ui/src/pages/KBAnalyticsArticlePerformancePage.stories.tsx` —
// uses `DataTable` + inline columns per Phase 7.5 consolidation.
// Column configs (`attentionColumns`, `performanceColumns`) are
// lifted verbatim from the story; only the row-click wiring is local
// (it maps a fixture id back to the real article slug for navigation).
//
// Page composition (top → bottom):
//   1. Custom <header>: title + subtitle (left) | DateRangePill (right)
//   2. StatCardGrid "Support Performance" — 4 metrics
//   3. AnalyticsChartCard "Article views over time" wrapping 2-series area chart
//   4. 2-up: AnalyticsChartCard "Views by Category" (donut) | DataTable needs-attention
//   5. DataTable "Article Performance" (full width)
//
// Interactions (PRD §7.6):
//   - DateRangePill click → toast placeholder
//   - Articles needing attention row → /articles/<slug>/edit
//   - Article Performance row → /articles/<slug>/edit
//
// NB: kb-ui's `PageHeader` ships an opinionated "+ New article" CTA that
// the analytics design does not show, so we match the story's plain
// <header> element instead of forcing an unrelated component.

import { useNavigate } from 'react-router-dom';
import { RiFile3Line, RiInformationLine } from '@remixicon/react';
import {
  AnalyticsAreaChart,
  AnalyticsChartCard,
  AnalyticsDonutChart,
  DataTable,
  DateRangePill,
  HelpfulnessTag,
  StatCardGrid,
  type DataTableColumn,
} from '@test-kb-ui/kb-ui';
import { useMockStore } from '../../store/MockStoreContext';
import { selectArticleById } from '../../store/selectors';
import {
  ANALYTICS_X_TICKS,
  articlePerformanceFixtures,
  type ArticleAttentionRow,
  type ArticlePerformanceRow,
} from '../../store/fixtures/analytics';
import { routes } from '../../lib/routes';
import { useToast } from '../../components/Toast';

/* ─────────────────────────────────────────────────────────────
 * Column configs — lifted verbatim from
 * `KBAnalyticsArticlePerformancePage.stories.tsx`.
 * ───────────────────────────────────────────────────────────── */

const attentionColumns: DataTableColumn<ArticleAttentionRow>[] = [
  {
    id: 'title',
    header: 'Article Title',
    render: (r) => (
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <RiFile3Line
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

const performanceColumns: DataTableColumn<ArticlePerformanceRow>[] = [
  {
    id: 'title',
    header: 'Article Title',
    width: 230,
    render: (r) => (
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <RiFile3Line
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

export default function ArticlePerformancePage() {
  const navigate = useNavigate();
  const { state } = useMockStore();
  const { showToast } = useToast();
  const {
    statCards,
    areaSeries,
    areaData,
    donutData,
    needsAttentionRows,
    performanceRows,
  } = articlePerformanceFixtures;

  /**
   * Resolve an analytics-row article id (`art-<slug>`) to its real slug
   * via the store, then navigate to the editor. Falls back to stripping
   * the `art-` prefix if the article is missing — keeps the row clickable
   * even with a stale fixture id.
   */
  const goToArticle = (articleId: string) => {
    const article = selectArticleById(state, articleId);
    const slug = article?.slug ?? articleId.replace(/^art-/, '');
    navigate(routes.article(slug));
  };

  const handleDateRangeChange = () => {
    // PRD §7.6: DateRangePill click → no-op v1.
    showToast('Coming soon.', 'info');
  };

  return (
    <div data-route="analytics-article-performance" className="flex flex-col gap-5">
      {/* Page header — title + subtitle | DateRangePill */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold leading-[32px] text-[#0f172a]">
            Article performance
          </h1>
          <p className="mt-1 text-[14px] font-normal leading-[20px] text-[#475569]">
            How readers find and engage with your content.
          </p>
        </div>
        <DateRangePill value="7d" onChange={handleDateRangeChange} />
      </header>

      {/* Stats — Support Performance */}
      <StatCardGrid
        title="Support Performance"
        infoTooltip="Total support performance metrics"
        stats={statCards}
      />

      {/* Article views over time */}
      <AnalyticsChartCard
        title="Article views over time"
        infoTooltip="Total vs unique views over the selected period"
      >
        <AnalyticsAreaChart
          data={areaData}
          xKey="x"
          series={areaSeries}
          yTicks={[0, 3000, 6000, 9000, 12000]}
          xTicks={ANALYTICS_X_TICKS}
        />
      </AnalyticsChartCard>

      {/* 2-up: Views by Category | Articles needing attention */}
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <AnalyticsChartCard
            title="Views by Category"
            infoTooltip="Article views distributed by category"
          >
            <AnalyticsDonutChart data={donutData} />
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
                  <RiInformationLine
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
            onRowClick={(row) => goToArticle(row.id)}
          />
        </div>
      </div>

      {/* Article Performance table */}
      <DataTable
        dataKbComponent="article-performance-table"
        rows={performanceRows}
        columns={performanceColumns}
        emptyMessage="No articles"
        headingGap={8}
        heading={
          <div>
            <div className="flex items-center">
              <h3 className="text-[14px] font-medium leading-[20px] text-[#0f172a]">
                Article Performance
              </h3>
              <RiInformationLine
                size={16}
                className="ml-2 text-[#475569]"
                aria-hidden="true"
              />
            </div>
            <div className="mt-4 h-px bg-[#e2e8f0]" />
          </div>
        }
        headerDivider={false}
        onRowClick={(row) => goToArticle(row.id)}
      />
    </div>
  );
}
