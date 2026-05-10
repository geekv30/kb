import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { AnalyticsAreaChart } from './AnalyticsAreaChart';
import { AnalyticsChartCard } from './AnalyticsChartCard';
import { FigmaCompare } from '../../_review/FigmaCompare';
import articleViewsFigma from '../../../../../design/screenshots/chart-article-views-over-time.png';
import { figmaNode } from './AnalyticsAreaChart.article-views.figma';

/* ─────────────────────────────────────────────────────────────
 * AnalyticsAreaChart — "Article views over time" review canvas.
 *
 * Figma library-check cell `155:1400` (890 × 390): two-series area
 * chart wrapped in AnalyticsChartCard. Series:
 *   • Total Views — red (chart-views, #f56565), strictly above
 *   • Unique Views — blue (chart-unique, #4299e1)
 * yTicks: 0, 3k, 6k, 9k, 12k. xKey labels: mon/tue/wed/fri/sat/sun
 * (Thursday is absent in Figma — preserved 1:1 here).
 * ───────────────────────────────────────────────────────────── */

const data = [
  { x: 'mon', views: 2700, unique: 1400 },
  { x: 'mon-p1', views: 4200, unique: 1900 },
  { x: 'mon-p2', views: 2700, unique: 1100 },
  { x: 'tue', views: 3700, unique: 1800 },
  { x: 'tue-p1', views: 5500, unique: 2100 },
  { x: 'tue-p2', views: 4700, unique: 1700 },
  { x: 'wed', views: 6800, unique: 2050 },
  { x: 'wed-p1', views: 6700, unique: 1700 },
  { x: 'wed-p2', views: 7100, unique: 1900 },
  { x: 'fri', views: 6700, unique: 1500 },
  { x: 'fri-p1', views: 8200, unique: 2400 },
  { x: 'fri-p2', views: 8000, unique: 3950 },
  { x: 'sat', views: 8500, unique: 4050 },
  { x: 'sat-p1', views: 8300, unique: 3000 },
  { x: 'sat-p2', views: 8800, unique: 3700 },
  { x: 'sun', views: 8300, unique: 3000 },
  { x: 'sun-p1', views: 9700, unique: 1500 },
  { x: 'sun-p2', views: 8500, unique: 1500 },
  { x: 'sun-p3', views: 10000, unique: 2300 },
];

const meta: Meta<typeof AnalyticsAreaChart> = {
  title: 'Review/Content/AnalyticsAreaChart/Article Views Over Time',
  component: AnalyticsAreaChart,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function ArticleViewsReview() {
  return (
    <FigmaCompare
      storyKey="content-analytics-area-chart-article-views"
      figmaImage={articleViewsFigma}
      componentLabel="AnalyticsAreaChart (article views)"
      frameLabel="Figma · library-check / Article views over time"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div className="font-sans" style={{ width: 890 }}>
        <AnalyticsChartCard
          title="Article views over time"
          infoTooltip="Daily article views across the published knowledge base."
        >
          <AnalyticsAreaChart
            data={data}
            xKey="x"
            series={[
              { name: 'Total Views', dataKey: 'views', variant: 'views' },
              { name: 'Unique Views', dataKey: 'unique', variant: 'unique' },
            ]}
            yTicks={[0, 3000, 6000, 9000, 12000]}
            xTicks={['mon', 'tue', 'wed', 'fri', 'sat', 'sun']}
            height={310}
            showLegend
          />
        </AnalyticsChartCard>
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj<typeof AnalyticsAreaChart> = {
  render: () => <ArticleViewsReview />,
};
