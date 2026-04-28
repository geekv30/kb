// Phase 7.5.7 — Analytics: Article Performance.
//
// Mirrors `KBAnalyticsArticlePerformancePage` story composition exactly
// (per CLAUDE.md "reuse main components, never recreate"). The story is
// already pixel-tuned per Figma `1974:53692`; we just consume the same
// kb-ui components with this app's fixtures + real navigation handlers.
//
// Page composition (top → bottom):
//   1. Custom <header>: title + subtitle (left) | DateRangePill (right)
//   2. StatCardGrid "Support Performance" — 4 metrics
//   3. AnalyticsChartCard "Article views over time" wrapping 2-series area chart
//   4. 2-up: AnalyticsChartCard "Views by Category" (donut) | ArticlesNeedsAttentionTable
//   5. ArticlePerformanceTable (full width)
//
// Interactions (PRD §7.6):
//   - DateRangePill click → toast placeholder (console.log; real toast in 7.5.8)
//   - ArticlesNeedsAttentionTable row → /articles/<slug>/edit
//   - ArticlePerformanceTable row → /articles/<slug>/edit
//
// NB: kb-ui's `PageHeader` ships an opinionated "+ New article" CTA that
// the analytics design does not show, so we match the story's plain
// <header> element instead of forcing an unrelated component.

import { useNavigate } from 'react-router-dom';
import {
  AnalyticsAreaChart,
  AnalyticsChartCard,
  AnalyticsDonutChart,
  ArticlePerformanceTable,
  ArticlesNeedsAttentionTable,
  DateRangePill,
  StatCardGrid,
} from '@hiver/kb-ui';
import { useMockStore } from '../../store/MockStoreContext';
import { selectArticleById } from '../../store/selectors';
import { articlePerformanceFixtures } from '../../store/fixtures/analytics';
import { routes } from '../../lib/routes';
import { useToast } from '../../components/Toast';

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
          <ArticlesNeedsAttentionTable
            rows={needsAttentionRows}
            onRowClick={goToArticle}
          />
        </div>
      </div>

      {/* Article Performance table */}
      <ArticlePerformanceTable rows={performanceRows} onRowClick={goToArticle} />
    </div>
  );
}
