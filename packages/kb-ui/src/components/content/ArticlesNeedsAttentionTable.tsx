import { RiFile3Line, RiInformationLine } from '@remixicon/react';
import { cn } from '../../utils/cn';
import { Card } from '../primitives/Card';
import { HelpfulnessTag, type HelpfulnessVariant } from './HelpfulnessTag';

/* ─────────────────────────────────────────────────────────────
 * ArticlesNeedsAttentionTable
 *
 * Phase 7 analytics surface — small 437×343 card on the
 * analytics-01 dashboard listing articles flagged for low
 * helpfulness. Two-column compact table: title + helpfulness
 * pill, right-aligned. Includes a "N Articles" count badge in
 * the header.
 *
 * Figma source: 1974:54008 (file 251DTRmxl2L6jmXd3FWzHe).
 * ───────────────────────────────────────────────────────────── */

export type ArticleAttentionRow = {
  id: string;
  title: string;
  /** Pre-formatted percentage string e.g. "24%", "91%". */
  helpfulness: string;
  variant: HelpfulnessVariant;
};

export type ArticlesNeedsAttentionTableProps = {
  rows: ArticleAttentionRow[];
  /** Override the count badge label. Default: `${rows.length} Articles`. */
  countLabel?: string;
  className?: string;
  onRowClick?: (id: string) => void;
};

export function ArticlesNeedsAttentionTable({
  rows,
  countLabel,
  className,
  onRowClick,
}: ArticlesNeedsAttentionTableProps) {
  const label = countLabel ?? `${rows.length} Articles`;

  return (
    <Card
      padding="none"
      className={cn('p-5', className)}
      data-kb-component="articles-needs-attention-table"
    >
      {/* Header */}
      <div>
        <div className="flex items-center">
          <h3 className="text-[14px] font-medium leading-[20px] text-[#0f172a]">
            Articles needs attention
          </h3>
          <RiInformationLine
            size={16}
            className="ml-2 text-[#475569]"
            aria-hidden="true"
          />
          <span className="flex-1" />
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#f7f7f7] text-[12px] font-medium leading-[18px] text-[#0f172a]"
            aria-label={label}
          >
            {label}
          </span>
        </div>
        <p className="mt-1 text-[13px] font-normal leading-[19px] text-[#475569]">
          Articles with very low helpfulness index
        </p>
      </div>

      {/* Divider */}
      <div className="mt-4 h-px bg-[#e2e8f0]" />

      {/* Table */}
      <table className="w-full border-collapse mt-2" style={{ borderCollapse: 'collapse' }}>
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
              className="text-right py-3.5 align-middle text-[14px] font-medium leading-[20px] text-[#0f172a]"
            >
              Helpfulness
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
                      className="shrink-0 text-[#64748b]"
                      aria-hidden="true"
                    />
                    <span className="text-[14px] font-normal leading-[20px] text-[#0f172a] truncate">
                      {row.title}
                    </span>
                  </div>
                </td>
                <td className="py-3 align-middle text-right">
                  <HelpfulnessTag value={row.helpfulness} variant={row.variant} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  );
}
