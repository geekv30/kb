// Phase 7.5.7 — Analytics: AI Answer Performance.
//
// Mirrors `KBAnalyticsAIAnswerPerformancePage` story composition exactly
// (per CLAUDE.md "reuse main components, never recreate"). The story is
// already pixel-tuned per Figma `1974:53167`.
//
// Page composition (top → bottom):
//   1. Custom <header>: title + subtitle | DateRangePill
//   2. StatCardGrid "AI Search Performance" — 4 metrics
//   3. AnalyticsChartCard "AI deflection rate over time" (positive area + Goal:70%)
//   4. AIConversationLogsCard with 5 anonymised entries
//   5. MostCitedArticlesTable
//
// Interactions (PRD §7.8):
//   - DateRangePill change → toast placeholder
//   - Sort dropdown → toast placeholder
//   - Source link inside conversation entries → toast placeholder
//     (event-delegated; the kb-ui component's built-in side sheet still
//     opens, but the placeholder log fires alongside it. v1 wiring per
//     PRD § 7.8 — the real "open contextual conversation drawer" lands
//     in a future phase.)
//   - MostCitedArticlesTable row → /articles/<slug>/edit

import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AIConversationLogEntry,
  AIConversationLogsCard,
  AnalyticsAreaChart,
  AnalyticsChartCard,
  DateRangePill,
  MostCitedArticlesTable,
  StatCardGrid,
} from '@hiver/kb-ui';
import { useMockStore } from '../../store/MockStoreContext';
import { selectArticleById } from '../../store/selectors';
import { aiAnswerFixtures } from '../../store/fixtures/analytics';
import { routes } from '../../lib/routes';
import { useToast } from '../../components/Toast';

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
          <h1 className="text-[24px] font-semibold leading-[32px] text-[#0f172a]">
            AI Answer Performance
          </h1>
          <p className="mt-1 text-[14px] font-normal leading-[20px] text-[#475569]">
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
      <MostCitedArticlesTable rows={mostCitedRows} onRowClick={goToArticle} />
    </div>
  );
}
