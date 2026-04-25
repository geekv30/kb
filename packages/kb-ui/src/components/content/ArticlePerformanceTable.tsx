import { RiFile3Line, RiInformationLine } from '@remixicon/react';
import { cn } from '../../utils/cn';
import { Card } from '../primitives/Card';
import { HelpfulnessTag, type HelpfulnessVariant } from './HelpfulnessTag';

/* ─────────────────────────────────────────────────────────────
 * ArticlePerformanceTable
 *
 * Phase 7 analytics surface — wide 890×316 card on the
 * analytics-01 dashboard. 5-column table (Article Title,
 * Category, Total Views, Avg. Time Spent, Helpfulness).
 *
 * Figma source: 1974:54063 (file 251DTRmxl2L6jmXd3FWzHe).
 * Column widths from Figma: 230 / 208 / 126 / 158 / 128 (= 850).
 *
 * The Category cell is rendered as an inline grey pill (NOT
 * the Badge primitive) — the closest Badge variant ('neutral')
 * uses bg-[#fcfcfc] whereas Figma here calls for
 * background/accents/gray/faint = #f7f7f7. Inlining keeps the
 * visual delta aligned with the design without polluting the
 * Badge variant set with a one-off analytics colour.
 * ───────────────────────────────────────────────────────────── */

export type ArticlePerformanceRow = {
  id: string;
  title: string;
  category: string;
  /** Pre-formatted view count, e.g. "11,200". */
  totalViews: string;
  /** Pre-formatted duration, e.g. "02m : 45s". */
  avgTimeSpent: string;
  /** Pre-formatted percentage string, e.g. "91%". */
  helpfulness: string;
  helpfulnessVariant: HelpfulnessVariant;
};

export type ArticlePerformanceTableProps = {
  rows: ArticlePerformanceRow[];
  className?: string;
  onRowClick?: (id: string) => void;
};

export function ArticlePerformanceTable({
  rows,
  className,
  onRowClick,
}: ArticlePerformanceTableProps) {
  return (
    <Card
      padding="none"
      className={cn('p-5', className)}
      data-kb-component="article-performance-table"
    >
      {/* Header */}
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

      {/* Divider */}
      <div className="mt-4 h-px bg-[#e2e8f0]" />

      {/* Table */}
      <table className="w-full border-collapse mt-2" style={{ borderCollapse: 'collapse' }}>
        <colgroup>
          <col style={{ width: 230 }} />
          <col style={{ width: 208 }} />
          <col style={{ width: 126 }} />
          <col style={{ width: 158 }} />
          <col style={{ width: 128 }} />
        </colgroup>
        <thead>
          <tr className="h-12">
            <th
              scope="col"
              className="text-left py-3.5 align-middle text-[14px] font-medium leading-[20px] text-[#0f172a]"
            >
              Article Title
            </th>
            <th
              scope="col"
              className="text-left py-3.5 pl-6 align-middle text-[14px] font-medium leading-[20px] text-[#0f172a]"
            >
              Category
            </th>
            <th
              scope="col"
              className="text-left py-3.5 pl-6 align-middle text-[14px] font-medium leading-[20px] text-[#0f172a]"
            >
              Total Views
            </th>
            <th
              scope="col"
              className="text-left py-3.5 pl-6 align-middle text-[14px] font-medium leading-[20px] text-[#0f172a]"
            >
              Avg. Time Spent
            </th>
            <th
              scope="col"
              className="text-right py-3.5 pr-6 align-middle text-[14px] font-medium leading-[20px] text-[#0f172a]"
            >
              Helpfulness
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-3 text-[14px] text-[#94a3b8]">
                No articles
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row.id) : undefined}
                className={cn(
                  'h-12 align-middle',
                  idx < rows.length - 1 && 'border-b border-[#e5e5e5]',
                  onRowClick && 'cursor-pointer transition-colors duration-150 hover:bg-[#fafafa]',
                )}
              >
                <td className="py-3 align-middle">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <RiFile3Line
                      size={16}
                      className="shrink-0 text-[#64758b]"
                      aria-hidden="true"
                    />
                    <span className="text-[14px] font-normal leading-[20px] text-[#0f172a] truncate">
                      {row.title}
                    </span>
                  </div>
                </td>
                <td className="py-3 pl-6 align-middle">
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#f7f7f7] text-[13px] font-normal leading-[19px] text-[#0f172a]"
                  >
                    {row.category}
                  </span>
                </td>
                <td className="py-3 pl-6 align-middle text-[14px] font-normal leading-[20px] text-[#0f172a]">
                  {row.totalViews}
                </td>
                <td className="py-3 pl-6 align-middle text-[14px] font-normal leading-[20px] text-[#0f172a]">
                  {row.avgTimeSpent}
                </td>
                <td className="py-3 pr-6 align-middle text-right">
                  <HelpfulnessTag
                    value={row.helpfulness}
                    variant={row.helpfulnessVariant}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  );
}
