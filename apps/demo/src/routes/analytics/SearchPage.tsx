// Phase 7.5.7 — Analytics: Search.
//
// Mirrors `KBAnalyticsSearchPage` story composition exactly (per
// CLAUDE.md "reuse main components, never recreate"). The story is
// already pixel-tuned per Figma `1974:54154`.
//
// Page composition (top → bottom):
//   1. Custom <header>: title + subtitle | DateRangePill
//   2. 2-up:
//      - AnalyticsChartCard "Search vol. over time"  (single-series area, no legend)
//      - AnalyticsChartCard "Missed search rate"     (single-series area + Goal:70% line)
//   3. SearchKeywordsTable
//   4. ContentGapsTable
//
// Interactions (PRD §7.7):
//   - DateRangePill change → toast placeholder
//   - SearchKeywordsTable rows: no-op v1
//   - ContentGapsTable rows: no-op v1

import {
  AnalyticsAreaChart,
  AnalyticsChartCard,
  ContentGapsTable,
  DateRangePill,
  SearchKeywordsTable,
} from '@hiver/kb-ui';
import { searchFixtures } from '../../store/fixtures/analytics';
import { useToast } from '../../components/Toast';

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
              goalLine={missedSearchGoal}
              showLegend={false}
            />
          </AnalyticsChartCard>
        </div>
      </div>

      {/* Search keywords */}
      <SearchKeywordsTable rows={keywordRows} />

      {/* Content gaps */}
      <ContentGapsTable rows={contentGapRows} />
    </div>
  );
}
