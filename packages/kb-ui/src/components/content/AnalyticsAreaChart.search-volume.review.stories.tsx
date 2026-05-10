import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { AnalyticsAreaChart } from './AnalyticsAreaChart';
import { AnalyticsChartCard } from './AnalyticsChartCard';
import { FigmaCompare } from '../../_review/FigmaCompare';
import searchVolumeFigma from '../../../../../design/screenshots/chart-search-vol-over-time.png';
import { figmaNode } from './AnalyticsAreaChart.search-volume.figma';

/* ─────────────────────────────────────────────────────────────
 * AnalyticsAreaChart — "Search vol. over time" review canvas.
 *
 * Figma library-check cell `155:1417` (437 × 375): single-series
 * blue area chart wrapped in AnalyticsChartCard. No legend.
 *   • Series — blue (chart-unique, #4299e1)
 * yTicks: 0, 3k, 6k, 9k, 12k. xKey labels: mon/tue/wed/fri/sat/sun
 * (Thursday is absent in Figma — preserved 1:1).
 * ───────────────────────────────────────────────────────────── */

const data = [
  { x: 'mon', volume: 3000 },
  { x: 'mon-p1', volume: 4500 },
  { x: 'mon-p2', volume: 4400 },
  { x: 'tue', volume: 4500 },
  { x: 'tue-p1', volume: 3300 },
  { x: 'tue-p2', volume: 4900 },
  { x: 'wed', volume: 3300 },
  { x: 'wed-p1', volume: 4900 },
  { x: 'wed-p2', volume: 3300 },
  { x: 'fri', volume: 4900 },
  { x: 'fri-p1', volume: 3300 },
  { x: 'fri-p2', volume: 6000 },
  { x: 'sat', volume: 8950 },
  { x: 'sat-p1', volume: 6700 },
  { x: 'sat-p2', volume: 7800 },
  { x: 'sun', volume: 6500 },
  { x: 'sun-p1', volume: 5400 },
  { x: 'sun-p2', volume: 3100 },
  { x: 'sun-p3', volume: 5100 },
];

const meta: Meta<typeof AnalyticsAreaChart> = {
  title: 'Review/Content/AnalyticsAreaChart/Search Volume Over Time',
  component: AnalyticsAreaChart,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function SearchVolumeReview() {
  return (
    <FigmaCompare
      storyKey="content-analytics-area-chart-search-volume"
      figmaImage={searchVolumeFigma}
      componentLabel="AnalyticsAreaChart (search volume)"
      frameLabel="Figma · library-check / Search vol. over time"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div className="font-sans" style={{ width: 437 }}>
        <AnalyticsChartCard
          title="Search vol. over time"
          infoTooltip="Search queries issued against the knowledge base."
        >
          <AnalyticsAreaChart
            data={data}
            xKey="x"
            series={[
              { name: 'Search Volume', dataKey: 'volume', variant: 'unique' },
            ]}
            yTicks={[0, 3000, 6000, 9000, 12000]}
            xTicks={['mon', 'tue', 'wed', 'fri', 'sat', 'sun']}
            height={262}
            showLegend={false}
          />
        </AnalyticsChartCard>
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj<typeof AnalyticsAreaChart> = {
  render: () => <SearchVolumeReview />,
};
