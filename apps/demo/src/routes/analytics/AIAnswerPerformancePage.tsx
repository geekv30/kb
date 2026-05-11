// Phase 7.5.7 — Analytics: AI Answer Performance.
//
// Mirrors `packages/kb-ui/src/pages/KBAnalyticsAIAnswerPerformancePage.stories.tsx` —
// uses `DataTable` + inline columns per Phase 7.5 consolidation.
// `citedColumns` is lifted verbatim from the story; only the row-click
// wiring is local (it maps a fixture id back to the real article slug
// for navigation).
//
// Page composition (top → bottom):
//   1. Custom <header>: title + subtitle | DateRangePill
//   2. StatCardGrid "AI Search Performance" — 4 metrics
//   3. AnalyticsChartCard "AI deflection rate over time" (positive area + Goal:70%)
//   4. AIConversationLogsCard with 6 anonymised entries (default chrome:
//      title + subtitle + Sort dropdown + Ticket Created toggle). Phase 15d
//      added a `header` slot (null = no chrome, ReactNode = custom) — the
//      demo keeps the default chrome for realism, matching the manager-view
//      story for this card.
//   5. DataTable "Most Cited KB Articles"
//
// Interactions (PRD §7.8):
//   - DateRangePill change → toast placeholder
//   - Sort dropdown → toast placeholder
//   - Source link inside conversation entries → toast placeholder
//     (event-delegated; the kb-ui component's built-in side sheet still
//     opens, but the placeholder log fires alongside it. v1 wiring per
//     PRD § 7.8 — the real "open contextual conversation drawer" lands
//     in a future phase.)
//   - Most Cited row → /articles/<slug>/edit

import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiFile3Line, RiInformationLine } from '@remixicon/react';
import {
  AIConversationLogEntry,
  AIConversationLogsCard,
  AnalyticsAreaChart,
  AnalyticsChartCard,
  DataTable,
  DateRangePill,
  StatCardGrid,
  type DataTableColumn,
} from '@test-kb-ui/kb-ui';
import { useMockStore } from '../../store/MockStoreContext';
import { selectArticleById } from '../../store/selectors';
import {
  ANALYTICS_X_TICKS,
  aiAnswerFixtures,
  type MostCitedRow,
} from '../../store/fixtures/analytics';
import { routes } from '../../lib/routes';
import { useToast } from '../../components/Toast';

/* ─────────────────────────────────────────────────────────────
 * Column config — lifted verbatim from
 * `KBAnalyticsAIAnswerPerformancePage.stories.tsx`.
 * ───────────────────────────────────────────────────────────── */

const citedColumns: DataTableColumn<MostCitedRow>[] = [
  {
    id: 'title',
    header: 'Article Title',
    render: (r) => (
      <span className="inline-flex items-center gap-2">
        <RiFile3Line
          size={16}
          className="shrink-0 text-text-muted"
          aria-hidden="true"
        />
        <span>{r.title}</span>
      </span>
    ),
  },
  {
    id: 'citations',
    header: 'Citations',
    align: 'right',
    render: (r) => r.citations,
  },
];

export default function AIAnswerPerformancePage() {
  const navigate = useNavigate();
  const { state } = useMockStore();
  const { showToast } = useToast();
  const {
    statCards,
    deflectionSeries,
    deflectionData,
    deflectionGoal,
    conversationLogs,
    sortOptions,
    mostCitedRows,
  } = aiAnswerFixtures;

  const goToArticle = (articleId: string) => {
    const article = selectArticleById(state, articleId);
    const slug = article?.slug ?? articleId.replace(/^art-/, '');
    navigate(routes.article(slug));
  };

  const handleDateRangeChange = () => {
    showToast('Coming soon.', 'info');
  };

  const handleSortChange = () => {
    showToast('Coming soon.', 'info');
  };

  /**
   * Event delegation: the kb-ui `AIConversationLogEntry` doesn't expose
   * an `onSourcesClick` prop — it owns its own side-sheet state. To
   * satisfy PRD §7.8 "Source link → no-op v1 (console.log)" without
   * branching the component, we capture clicks at the card boundary and
   * fire the placeholder when the source link is hit. The side sheet
   * still opens (component-owned); the log fires in addition.
   */
  const handleCardClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-kb-part="ai-conversation-log-sources-link"]')) {
      showToast('Coming soon.', 'info');
    }
  };

  return (
    <div data-route="analytics-ai-answer-performance" className="flex flex-col gap-5">
      {/* Page header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold leading-[32px] text-text-primary">
            AI Answer Performance
          </h1>
          <p className="mt-1 text-[14px] font-normal leading-[20px] text-text-meta">
            Is the AI search feature actually helping, or are people still
            needing human support?
          </p>
        </div>
        <DateRangePill value="7d" onChange={handleDateRangeChange} />
      </header>

      {/* AI Search Performance stats */}
      <StatCardGrid
        title="AI Search Performance"
        infoTooltip="AI Answer performance over the selected period"
        stats={statCards}
      />

      {/* AI deflection rate over time */}
      <AnalyticsChartCard
        title="AI deflection rate over time"
        subtitle="% of AI conversations that did not result in a support ticket"
        infoTooltip="Percentage of AI conversations that did not result in a support ticket"
      >
        <AnalyticsAreaChart
          data={deflectionData}
          xKey="x"
          series={deflectionSeries}
          yTicks={[0, 25, 50, 75, 100]}
          xTicks={ANALYTICS_X_TICKS}
          goalLine={deflectionGoal}
          showLegend={false}
        />
      </AnalyticsChartCard>

      {/* AI conversation logs (5 entries) */}
      <div onClickCapture={handleCardClickCapture}>
        <AIConversationLogsCard
          sortOptions={sortOptions}
          sortBy="most-recent"
          ticketCreatedFilter={false}
          onSortChange={handleSortChange}
        >
          {conversationLogs.map((log) => (
            <AIConversationLogEntry
              key={log.id}
              question={log.question}
              timestamp={log.timestamp}
              feedback={log.feedback}
              answer={log.answer}
              answerDisabled={log.answerDisabled}
              sourceCount={log.sourceCount}
              followUp={log.followUp}
              tail={log.tail}
            />
          ))}
        </AIConversationLogsCard>
      </div>

      {/* Most cited articles */}
      <DataTable
        dataKbComponent="most-cited-articles-table"
        rows={mostCitedRows}
        columns={citedColumns}
        emptyMessage="No cited articles"
        heading={
          <div className="flex items-center">
            <h3 className="text-[14px] font-medium leading-[20px] text-text-primary">
              Most Cited KB Articles
            </h3>
            <span className="ml-2 inline-flex" aria-hidden>
              <RiInformationLine
                size={16}
                className="text-text-meta"
                aria-hidden="true"
              />
            </span>
          </div>
        }
        onRowClick={(row) => goToArticle(row.id)}
      />
    </div>
  );
}
