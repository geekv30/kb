import { RiInformationLine, RiQuillPenLine } from '@remixicon/react';
import { cn } from '../../utils/cn';
import { Card } from '../primitives/Card';

/* ─────────────────────────────────────────────────────────────
 * ContentGapsTable
 *
 * Phase 7 analytics surface — 890×719 card on the analytics-02
 * (Search) dashboard. 4-column table surfacing topics users
 * searched for but couldn't find an article on, with a per-row
 * "Write Article" CTA.
 *
 * Figma source: 1974:54485 (file 251DTRmxl2L6jmXd3FWzHe).
 *
 * Why a custom inline `WriteArticleButton` instead of the
 * shared `Button` primitive: the existing `subtle` variant uses
 * bg-[#f8fafc] + border + px-3 — Figma here calls for
 * background/neutral/subtle = #f1f5f9, no border, px-2 py-1.
 * Adding another global variant for one analytics CTA would
 * pollute Button's API; an inline button keeps the surface
 * focused without bending the design-system primitive.
 * ───────────────────────────────────────────────────────────── */

export type ContentGapRow = {
  id: string;
  topic: string;
  /** Pre-formatted frequency string ("11201", "852", etc.). */
  frequency: string;
  /** Pre-formatted percentage string ("45%", "50%", etc.). */
  ticketRate: string;
};

export type ContentGapsTableProps = {
  rows: ContentGapRow[];
  /** Caller wires per-row "Write Article" click. */
  onWriteArticle?: (id: string) => void;
  title?: string;
  subtitle?: string;
  infoTooltip?: string;
  className?: string;
};

type WriteArticleButtonProps = {
  onClick?: () => void;
  className?: string;
};

function WriteArticleButton({ onClick, className }: WriteArticleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[6px] bg-[#f1f5f9] px-2 py-1',
        'text-[14px] font-medium leading-[20px] text-[#0f172a]',
        'transition-colors hover:bg-[#e2e8f0]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10',
        className,
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

export function ContentGapsTable({
  rows,
  onWriteArticle,
  title = 'Content Gaps',
  subtitle = "Topics users searched for but didn't find. Write articles to close these gaps",
  infoTooltip,
  className,
}: ContentGapsTableProps) {
  return (
    <Card
      padding="none"
      className={cn('p-5', className)}
      data-kb-component="content-gaps-table"
    >
      {/* Header */}
      <div>
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
        <p className="mt-1 text-[13px] font-normal leading-[19px] text-[#475569]">
          {subtitle}
        </p>
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
              Topic
            </th>
            <th
              scope="col"
              className="text-left py-3.5 align-middle text-[14px] font-medium leading-[20px] text-[#0f172a]"
            >
              Frequency
            </th>
            <th
              scope="col"
              className="text-left py-3.5 align-middle text-[14px] font-medium leading-[20px] text-[#0f172a]"
            >
              Ticket Rate
            </th>
            <th
              scope="col"
              className="text-left py-3.5 align-middle text-[14px] font-medium leading-[20px] text-[#0f172a]"
            >
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="py-3 text-[14px] text-[#94a3b8]"
              >
                No content gaps
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
                  {row.topic}
                </td>
                <td className="py-3 align-middle text-[14px] font-normal leading-[20px] text-[#0f172a]">
                  {row.frequency}
                </td>
                <td className="py-3 align-middle text-[14px] font-normal leading-[20px] text-[#0f172a]">
                  {row.ticketRate}
                </td>
                <td className="py-3 align-middle">
                  <WriteArticleButton
                    onClick={
                      onWriteArticle ? () => onWriteArticle(row.id) : undefined
                    }
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
