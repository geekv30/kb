import { RiInformationLine, RiFile3Line } from '@remixicon/react';
import { cn } from '../../utils/cn';
import { Card } from '../primitives/Card';

/* ─────────────────────────────────────────────────────────────
 * MostCitedArticlesTable
 *
 * Phase 7 analytics surface — 890×368 card on the analytics-03
 * (AI Answer Performance) dashboard. Two-column compact table
 * listing the KB articles most-cited by AI answers, with an
 * absolute citation count.
 *
 * Mirrors `SearchKeywordsTable` (Step 5) but:
 *   - no numbering prefix on titles (caller passes plain text)
 *   - small `RiFile3Line` 16-px icon precedes each title
 *
 * Figma source: 1974:53634 (file 251DTRmxl2L6jmXd3FWzHe).
 * Variable defs are identical to `SearchKeywordsTable`:
 *   text/neutral/default      #0f172a — title + body
 *   body/sm/medium            14/500/20 — header + col headers
 *   body/sm/regular           14/400/20 — body cells
 *   border/slate_blue/subtle  #e2e8f0 — header bottom divider
 *   border/neutral/subtle     #e5e5e5 — row dividers
 *   scale/radius/xl           12 — card radius (Card)
 *   scale/space/3xl           20 — card padding
 * ───────────────────────────────────────────────────────────── */

export type MostCitedRow = {
  id: string;
  title: string;
  /** Pre-formatted citation count — number or string. */
  citations: number | string;
};

export type MostCitedArticlesTableProps = {
  rows: MostCitedRow[];
  /** Title above the table. Default "Most Cited KB Articles". */
  title?: string;
  infoTooltip?: string;
  onRowClick?: (id: string) => void;
  className?: string;
};

export function MostCitedArticlesTable({
  rows,
  title = 'Most Cited KB Articles',
  infoTooltip,
  onRowClick,
  className,
}: MostCitedArticlesTableProps) {
  return (
    <Card
      padding="none"
      className={cn('p-5', className)}
      data-kb-component="most-cited-articles-table"
    >
      {/* Header — 14/medium title + ⓘ icon. No subtitle. */}
      <div className="flex items-center">
        <h3 className="text-[14px] font-medium leading-[20px] text-[#0f172a]">
          {title}
        </h3>
        <span
          className="ml-2 inline-flex"
          {...(infoTooltip
            ? { title: infoTooltip, 'aria-label': infoTooltip }
            : { 'aria-hidden': true })}
        >
          <RiInformationLine
            size={16}
            className="text-[#475569]"
            aria-hidden="true"
          />
        </span>
      </div>

      {/* Table */}
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
              Article Title
            </th>
            <th
              scope="col"
              className="text-right py-3.5 align-middle text-[14px] font-medium leading-[20px] text-[#0f172a]"
            >
              Citations
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
                No cited articles
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr
                key={row.id}
                {...(onRowClick
                  ? {
                      onClick: () => onRowClick(row.id),
                      role: 'button',
                      tabIndex: 0,
                      style: { cursor: 'pointer' },
                    }
                  : {})}
                className={cn(
                  'h-12 align-middle',
                  idx < rows.length - 1 && 'border-b border-[#e5e5e5]',
                )}
              >
                <td className="py-3 align-middle text-[14px] font-normal leading-[20px] text-[#0f172a]">
                  <span className="inline-flex items-center gap-2">
                    <RiFile3Line
                      size={16}
                      className="shrink-0 text-[#64748b]"
                      aria-hidden="true"
                    />
                    <span>{row.title}</span>
                  </span>
                </td>
                <td className="py-3 align-middle text-right text-[14px] font-normal leading-[20px] text-[#0f172a]">
                  {row.citations}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  );
}
