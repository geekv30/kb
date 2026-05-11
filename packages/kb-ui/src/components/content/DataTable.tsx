import * as React from 'react';
import { cn } from '../../utils/cn';
import { Card } from '../primitives/Card';

/* ─────────────────────────────────────────────────────────────
 * DataTable<T>
 *
 * Single canonical table primitive used across every
 * KB content + analytics surface. Captures the shared
 * row/header geometry that previously lived (verbatim) in
 * 7 hand-rolled `*Table.tsx` files:
 *
 *   - row + header height           h-12
 *   - row divider                   border-b border-card-border
 *   - hover state (interactive)     hover:bg-[#fafafa] + transition
 *   - card chrome                   rounded-[12px], 1px slate border, p-5
 *
 * Data shape and per-cell rendering are driven entirely by
 * `columns` — every legacy table now declares its columns
 * inline at the call site (badges, pills, avatars, helpfulness
 * tags, write buttons, chevrons all stay co-located with the
 * page that owns them).
 * ───────────────────────────────────────────────────────────── */

export type DataTableColumn<T> = {
  id: string;
  header: React.ReactNode;
  render: (row: T, index: number) => React.ReactNode;
  width?: number;
  align?: 'left' | 'right' | 'center';
  className?: string;
  /** Class applied to the matching `<th>` only. */
  headerClassName?: string;
};

export type DataTableProps<T> = {
  rows: T[];
  columns: DataTableColumn<T>[];
  /** Unique key for a row. Defaults to `(row as any).id`. */
  rowKey?: (row: T, index: number) => React.Key;
  onRowClick?: (row: T, index: number) => void;
  /**
   * Render a 1-px slate divider between the card heading area
   * and the column-header row. Default `true`. SearchKeywords
   * passes `false` (Figma `1974:54404`).
   */
  headerDivider?: boolean;
  /**
   * Wrap the table in `<Card padding="none" className="p-5" />`.
   * Default `true`. ArticlesTable + SubCategoriesTable pass
   * `false` (they ship their own light-grey header chrome).
   */
  wrapped?: boolean;
  /**
   * Header-row background. Default `transparent`. ArticlesTable
   * + SubCategoriesTable pass `'#f5f5f5'`.
   */
  headerBackground?: string;
  /**
   * Vertical cell padding (in px). Default `12` (≈ py-3).
   * ArticlesTable + SubCategoriesTable pass `6`.
   */
  cellPaddingY?: number;
  /**
   * Optional content rendered ABOVE the column-header row but
   * INSIDE the card (title, subtitle, info icon, count badge).
   * Lets every analytics-card variant compose its own heading
   * without forcing every prop into the table API.
   */
  heading?: React.ReactNode;
  /**
   * Vertical gap (in px) inserted between `heading` and the
   * table itself. Defaults to `16` (matches `mt-4`) — the
   * legacy SearchKeywords / MostCited / ContentGaps spacing.
   * The analytics tables that ship a 1-px divider INSIDE the
   * heading slot pass `8` to match `mt-2`.
   */
  headingGap?: number;
  emptyMessage?: string;
  className?: string;
  /**
   * When `wrapped=false`, the wrapper acquires the legacy
   * "ArticlesTable / SubCategoriesTable" chrome:
   * `bg-white rounded-[8px] border border-card-border overflow-hidden`.
   */
  unwrappedChrome?: boolean;
  /**
   * `data-kb-component` attribute on the outer node — handy for
   * Storybook / Playwright selectors.
   */
  dataKbComponent?: string;
};

function alignClass(align: DataTableColumn<unknown>['align']): string {
  if (align === 'right') return 'text-right';
  if (align === 'center') return 'text-center';
  return 'text-left';
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  onRowClick,
  headerDivider = true,
  wrapped = true,
  headerBackground,
  cellPaddingY = 12,
  heading,
  headingGap = 16,
  emptyMessage = 'No items',
  className,
  unwrappedChrome = true,
  dataKbComponent,
}: DataTableProps<T>) {
  const hasWidths = columns.some((c) => typeof c.width === 'number');

  // Header row class: bg + (optional) divider stride
  // Row geometry of `h-12` is preserved unconditionally to
  // hold the legacy 48-px tall column-header.
  const headerTrClass = cn(
    'h-12',
    headerDivider && 'border-b border-card-border',
  );

  const padY = `${cellPaddingY}px`;

  const tableEl = (
    <table
      className="w-full border-collapse"
      style={{
        borderCollapse: 'collapse',
        marginTop: heading ? `${headingGap}px` : undefined,
      }}
    >
      {hasWidths && (
        <colgroup>
          {columns.map((c) => (
            <col key={c.id} style={c.width ? { width: c.width } : undefined} />
          ))}
        </colgroup>
      )}
      <thead>
        <tr
          className={headerTrClass}
          style={headerBackground ? { background: headerBackground } : undefined}
        >
          {columns.map((c) => (
            <th
              key={c.id}
              scope="col"
              className={cn(
                'align-middle text-[14px] font-medium leading-[20px] text-text-primary',
                alignClass(c.align),
                // Header padding mirrors the Figma reference: legacy
                // ArticlesTable / SubCategoriesTable use `pl-4 pr-0 py-0`
                // whereas analytics tables use `py-3.5`. We keep the
                // analytics default and let callers override via
                // `headerClassName` for the chrome-style cases.
                'py-3.5',
                c.headerClassName,
              )}
              style={c.width ? { width: c.width } : undefined}
            >
              {c.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              className="py-3 text-[14px] text-text-disabled"
              style={{ paddingTop: padY, paddingBottom: padY }}
            >
              {emptyMessage}
            </td>
          </tr>
        ) : (
          rows.map((row, idx) => {
            const interactive = Boolean(onRowClick);
            const key = rowKey
              ? rowKey(row, idx)
              : (row as { id?: React.Key }).id ?? idx;
            return (
              <tr
                key={key}
                onClick={interactive ? () => onRowClick?.(row, idx) : undefined}
                className={cn(
                  'h-12 align-middle',
                  idx < rows.length - 1 && 'border-b border-card-border',
                  interactive &&
                    'cursor-pointer transition-colors duration-150 hover:bg-[#fafafa]',
                )}
              >
                {columns.map((c) => (
                  <td
                    key={c.id}
                    className={cn(
                      'align-middle text-[14px] font-normal leading-[20px] text-text-primary',
                      alignClass(c.align),
                      c.className,
                    )}
                    style={{ paddingTop: padY, paddingBottom: padY }}
                  >
                    {c.render(row, idx)}
                  </td>
                ))}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );

  if (wrapped) {
    return (
      <Card
        padding="none"
        className={cn('p-5', className)}
        data-kb-component={dataKbComponent ?? 'data-table'}
      >
        {heading}
        {tableEl}
      </Card>
    );
  }

  if (unwrappedChrome) {
    return (
      <div
        data-kb-component={dataKbComponent ?? 'data-table'}
        className={cn(
          'bg-white rounded-[8px] border border-card-border overflow-hidden',
          className,
        )}
      >
        {heading}
        {tableEl}
      </div>
    );
  }

  return (
    <div data-kb-component={dataKbComponent ?? 'data-table'} className={className}>
      {heading}
      {tableEl}
    </div>
  );
}
