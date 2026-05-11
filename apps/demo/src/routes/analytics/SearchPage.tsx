// Phase 7.5.7 — Analytics: Search.
//
// Mirrors `packages/kb-ui/src/pages/KBAnalyticsSearchPage.stories.tsx` —
// uses `DataTable` + inline columns per Phase 7.5 consolidation.
// Column configs (`keywordColumns`, `gapColumns`) are lifted verbatim
// from the story; the only adaptation is wiring "Write Article" CTAs
// (and the DateRangePill) into the demo's toast helper.
//
// Page composition (top → bottom):
//   1. Custom <header>: title + subtitle | DateRangePill
//   2. 2-up:
//      - AnalyticsChartCard "Search vol. over time"  (single-series area, no legend)
//      - AnalyticsChartCard "Missed search rate"     (single-series area + Goal:70% line)
//   3. DataTable "Top 5 Search Keywords"
//   4. DataTable "Content Gaps" (with "Write Article" action button)
//
// Interactions (PRD §7.7):
//   - DateRangePill change → toast placeholder
//   - SearchKeywordsTable rows: no-op v1
//   - ContentGapsTable rows: no-op v1
//   - "Write Article" button → toast placeholder

import { RiInformationLine, RiQuillPenLine } from '@remixicon/react';
import {
  AnalyticsAreaChart,
  AnalyticsChartCard,
  cn,
  DataTable,
  DateRangePill,
  type DataTableColumn,
} from '@test-kb-ui/kb-ui';
import {
  ANALYTICS_X_TICKS,
  searchFixtures,
  type ContentGapRow,
  type SearchKeywordRow,
} from '../../store/fixtures/analytics';
import { useToast } from '../../components/Toast';

/* ─────────────────────────────────────────────────────────────
 * Column configs — lifted verbatim from
 * `KBAnalyticsSearchPage.stories.tsx`.
 * ───────────────────────────────────────────────────────────── */

const keywordColumns: DataTableColumn<SearchKeywordRow>[] = [
  { id: 'keyword', header: 'Keywords', render: (r) => r.keyword },
  {
    id: 'count',
    header: 'Search Count',
    align: 'right',
    render: (r) => r.count,
  },
];

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
      <RiQuillPenLine
        size={14}
        className="text-[#475569]"
        aria-hidden="true"
      />
      Write Article
    </button>
  );
}

export default function SearchPage() {
  const { showToast } = useToast();
  const {
    searchVolumeSeries,
    searchVolumeData,
    missedSearchSeries,
    missedSearchData,
    missedSearchGoal,
    keywordRows,
    contentGapRows,
  } = searchFixtures;

  const handleDateRangeChange = () => {
    // PRD §7.7: DateRangePill → no-op v1.
    showToast('Coming soon.', 'info');
  };

  const handleWriteArticle = () => {
    // PRD §7.7: "Write Article" button → no-op v1.
    showToast('Coming soon.', 'info');
  };

  /* ── Content-gap columns — bound to the local toast helper. ── */
  const gapColumns: DataTableColumn<ContentGapRow>[] = [
    { id: 'topic', header: 'Topic', render: (r) => r.topic },
    { id: 'frequency', header: 'Frequency', render: (r) => r.frequency },
    { id: 'ticketRate', header: 'Ticket Rate', render: (r) => r.ticketRate },
    {
      id: 'action',
      header: 'Action',
      render: () => <WriteArticleButton onClick={handleWriteArticle} />,
    },
  ];

  return (
    <div data-route="analytics-search" className="flex flex-col gap-5">
      {/* Page header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold leading-[32px] text-[#0f172a]">
            Search
          </h1>
          <p className="mt-1 text-[14px] font-normal leading-[20px] text-[#475569]">
            See what your readers are searching for and where the gaps are.
          </p>
        </div>
        <DateRangePill value="7d" onChange={handleDateRangeChange} />
      </header>

      {/* 2-up: Search vol. over time | Missed search rate */}
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <AnalyticsChartCard
            title="Search vol. over time"
            infoTooltip="Total search volume over the selected period"
          >
            <AnalyticsAreaChart
              data={searchVolumeData}
              xKey="x"
              series={searchVolumeSeries}
              yTicks={[0, 500, 1000, 1500, 2000]}
              xTicks={ANALYTICS_X_TICKS}
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
              series={missedSearchSeries}
              yTicks={[0, 25, 50, 75, 100]}
              xTicks={ANALYTICS_X_TICKS}
              goalLine={missedSearchGoal}
              showLegend={false}
            />
          </AnalyticsChartCard>
        </div>
      </div>

      {/* Search keywords */}
      <DataTable
        dataKbComponent="search-keywords-table"
        rows={keywordRows}
        columns={keywordColumns}
        emptyMessage="No keywords"
        heading={
          <div className="flex items-center">
            <h3 className="text-[14px] font-medium leading-[20px] text-[#0f172a]">
              Top 5 Search Keywords
            </h3>
            <span className="ml-2 inline-flex" aria-hidden>
              <RiInformationLine
                size={16}
                className="text-[#475569]"
                aria-hidden="true"
              />
            </span>
          </div>
        }
      />

      {/* Content gaps */}
      <DataTable
        dataKbComponent="content-gaps-table"
        rows={contentGapRows}
        columns={gapColumns}
        emptyMessage="No content gaps"
        heading={
          <div>
            <div className="flex items-center">
              <h3 className="text-[14px] font-medium leading-[20px] text-[#0f172a]">
                Content Gaps
              </h3>
              <span className="ml-2 inline-flex" aria-hidden>
                <RiInformationLine
                  size={16}
                  className="text-[#475569]"
                  aria-hidden="true"
                />
              </span>
            </div>
            <p className="mt-1 text-[13px] font-normal leading-[19px] text-[#475569]">
              Topics users searched for but didn&apos;t find. Write articles
              to close these gaps
            </p>
          </div>
        }
      />
    </div>
  );
}
