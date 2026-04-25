import { RiInformationLine } from '@remixicon/react';
import { cn } from '../../utils/cn';
import { Card } from '../primitives/Card';

/* ─────────────────────────────────────────────────────────────
 * SearchKeywordsTable
 *
 * Phase 7 analytics surface — 890×368 card on the analytics-02
 * (Search) dashboard. Two-column compact table listing the top
 * search keywords by raw search count.
 *
 * Numbering ("1. password reset") is part of the keyword string
 * — the caller controls it. This keeps the component dumb and
 * lets callers re-rank without us recomputing prefixes.
 *
 * Figma source: 1974:54404 (file 251DTRmxl2L6jmXd3FWzHe).
 * Note: unlike ArticlePerformanceTable / ArticlesNeedsAttention,
 * this card has NO horizontal divider between the header row
 * and the column-header row — just ~16 px whitespace.
 * ───────────────────────────────────────────────────────────── */

export type SearchKeywordRow = {
  id: string;
  /** Keyword text — caller pre-pends the "1. " / "2. " / etc. numbering. */
  keyword: string;
  /** Pre-formatted count string ("11200", "1,200", etc.). */
  count: string;
};

export type SearchKeywordsTableProps = {
  rows: SearchKeywordRow[];
  /** Title above the table. Default "Top 5 Search Keywords". */
  title?: string;
  infoTooltip?: string;
  className?: string;
};

export function SearchKeywordsTable({
  rows,
  title = 'Top 5 Search Keywords',
  infoTooltip,
  className,
}: SearchKeywordsTableProps) {
  return (
    <Card
      padding="none"
      className={cn('p-5', className)}
      data-kb-component="search-keywords-table"
    >
      {/* Header */}
      <div className="flex items-center">
        <h3 className="text-[14px] font-medium leading-[20px] text-[#0f172a]">
          {title}
        </h3>
        <span
          className="ml-2 inline-flex"
          {...(infoTooltip ? { title: infoTooltip, 'aria-label': infoTooltip } : { 'aria-hidden': true })}
        >
          <RiInformationLine
            size={16}
            className="text-[#475569]"
            aria-hidden="true"
          />
        </span>
      </div>

      {/* Table — no header divider on this card per Figma */}
      <table
        className="w-full border-collapse mt-4"
        style={{ borderCollapse: 'collapse' }}
      >
        <thead>
          <tr className="h-12 border-b border-[#e5e5e5]">
            <th
              scope="col"
              className="text-left py-3.5 align-middle text-[14px] font-medium leading-[20px] text-[#0f172a]"
            >
              Keywords
            </th>
            <th
              scope="col"
              className="text-right py-3.5 align-middle text-[14px] font-medium leading-[20px] text-[#0f172a]"
            >
              Search Count
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={2}
                className="py-3 text-[14px] text-[#94a3b8]"
              >
                No keywords
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr
                key={row.id}
                className={cn(
                  'h-12 align-middle',
                  idx < rows.length - 1 && 'border-b border-[#e5e5e5]',
                )}
              >
                <td className="py-3 align-middle text-[14px] font-normal leading-[20px] text-[#0f172a]">
                  {row.keyword}
                </td>
                <td className="py-3 align-middle text-right text-[14px] font-normal leading-[20px] text-[#0f172a]">
                  {row.count}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  );
}
