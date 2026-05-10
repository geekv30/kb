import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { AnalyticsAreaChart } from './AnalyticsAreaChart';
import { AnalyticsChartCard } from './AnalyticsChartCard';
import { FigmaCompare } from '../../_review/FigmaCompare';
import goalTrendFigma from '../../../../../design/screenshots/chart-goal-trend.png';
import { figmaNode } from './AnalyticsAreaChart.goal-trend.figma';

/* ─────────────────────────────────────────────────────────────
 * AnalyticsAreaChart — "Missed search rate" goal-trend review canvas.
 *
 * Figma library-check cell `155:1431` (437 × 375): single-series
 * green area chart with dashed goal line + "Goal : 70%" pill.
 * Title is "Missed search rate"; "Goal : trend line to go down"
 * is the subtitle (the metadata enumerated only the subtitle —
 * confirmed against the synced PNG). No legend.
 * ───────────────────────────────────────────────────────────── */

const data = [
  { x: 'mon', missed: 5500 },
  { x: 'mon-p1', missed: 4100 },
  { x: 'mon-p2', missed: 5200 },
  { x: 'tue', missed: 5500 },
  { x: 'tue-p1', missed: 3300 },
  { x: 'tue-p2', missed: 4900 },
  { x: 'wed', missed: 5000 },
  { x: 'wed-p1', missed: 3700 },
  { x: 'wed-p2', missed: 4900 },
  { x: 'fri', missed: 4400 },
  { x: 'fri-p1', missed: 2700 },
  { x: 'fri-p2', missed: 2400 },
  { x: 'sat', missed: 2900 },
  { x: 'sat-p1', missed: 2200 },
  { x: 'sat-p2', missed: 2700 },
  { x: 'sun', missed: 2300 },
  { x: 'sun-p1', missed: 2900 },
  { x: 'sun-p2', missed: 1500 },
  { x: 'sun-p3', missed: 0 },
];

const meta: Meta<typeof AnalyticsAreaChart> = {
  title: 'Review/Content/AnalyticsAreaChart/Goal Trend Line',
  component: AnalyticsAreaChart,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function GoalTrendReview() {
  return (
    <FigmaCompare
      storyKey="content-analytics-area-chart-goal-trend"
      figmaImage={goalTrendFigma}
      componentLabel="AnalyticsAreaChart (goal trend)"
      frameLabel="Figma · library-check / Missed search rate"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div className="font-sans" style={{ width: 437 }}>
        <AnalyticsChartCard
          title="Missed search rate"
          infoTooltip="Share of searches that returned no matching article."
          subtitle="Goal : trend line to go down"
        >
          <AnalyticsAreaChart
            data={data}
            xKey="x"
            series={[
              { name: 'Missed search rate', dataKey: 'missed', variant: 'positive' },
            ]}
            yTicks={[0, 3000, 6000, 9000, 12000]}
            xTicks={['mon', 'tue', 'wed', 'fri', 'sat', 'sun']}
            goalLine={{ y: 700, label: 'Goal : 70%' }}
            height={240}
            showLegend={false}
          />
        </AnalyticsChartCard>
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj<typeof AnalyticsAreaChart> = {
  render: () => <GoalTrendReview />,
};
