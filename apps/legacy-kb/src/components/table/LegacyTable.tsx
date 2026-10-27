import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { articleDashIcon } from '../../assets/legacy';
import { cn } from '../../lib/cn';
import { truncate } from '../../lib/format';

/*
 * The live article table (chunk 854 `Pe`/`Re`/`De`/`Se`/`ze`), split into
 * parts so the category page and the AI suggestions hub share one table.
 *
 *   container  padding 0 30px, 1px #cedeec top border, full-bleed rule at
 *              top 52px under the 53px header
 *   th         11/13 500 #28476a uppercase; the first column has 0 10px
 *              padding, the rest the browser's 1px cell padding
 *   row        50px flex row, #f5f5f5 / 8px-radius hover, click opens
 *
 * The live app has no preflight, so cells are content-box: a column's
 * `width` here is its OUTER width and padding is subtracted from it.
 */

export interface TableColumn {
  id: string;
  label: string;
  /** Outer width in px. Omit for the trailing column (takes the rest). */
  width?: number;
}

const TH = 'p-[1px] text-left align-middle text-[11px] leading-[13px] font-medium tracking-[0px] text-legacy-body';

/** First column: 0 10px padding. Others: 1px. */
function contentWidth(width: number, first: boolean): number {
  return first ? width - 20 : width - 2;
}

export interface TableShellProps {
  columns: ReadonlyArray<TableColumn>;
  /** Rendered (centered in the table box) instead of rows when set. */
  empty?: ReactNode;
  children?: ReactNode;
}

export function TableShell({ columns, empty, children }: TableShellProps) {
  return (
    <div className="relative min-h-0 grow basis-0 overflow-hidden border-0 border-t border-solid border-legacy-table-border px-[30px]">
      <div
        aria-hidden
        className="absolute top-[52px] z-[201] -ml-[30px] w-[calc(100%+60px)] border-0 border-t border-solid border-legacy-table-border"
      />
      <table className="relative block h-full w-full border-collapse overflow-y-auto">
        <thead className="sticky top-0 z-[101] block w-full bg-white">
          <tr className="z-[101] h-[53px] w-full bg-white">
            {columns.map((col, i) => (
              <th
                key={col.id}
                scope="col"
                className={TH}
                style={{
                  width: col.width === undefined ? undefined : contentWidth(col.width, i === 0),
                  padding: i === 0 ? '0 10px' : undefined,
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="block">
          {empty ? (
            <tr>
              <td className="p-0">{empty}</td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export interface TableRowProps {
  onOpen: () => void;
  children: ReactNode;
}

export function TableRow({ onOpen, children }: TableRowProps) {
  const onKeyDown = (e: KeyboardEvent<HTMLTableRowElement>) => {
    if (e.key === 'Enter' && e.target === e.currentTarget) onOpen();
  };
  return (
    <tr
      onClick={onOpen}
      onKeyDown={onKeyDown}
      className="flex h-[50px] cursor-pointer items-center rounded-[8px] hover:bg-legacy-row-hover"
    >
      {children}
    </tr>
  );
}

/** Live title column truncates at 30 characters. */
const TITLE_MAX = 30;

export interface TitleCellProps {
  title: string;
  href: string;
  /** Outer column width (must match the TITLE column). */
  width: number;
  /** Rendered 8px after the title; the title truncates before it. */
  trailing?: ReactNode;
}

/** Article icon + 14/17 500 title link (live `Se` first cell). */
export function TitleCell({ title, href, width, trailing }: TitleCellProps) {
  return (
    <td className="cursor-pointer rounded-[5px] py-0 pr-0 pl-[10px]" style={{ width: width - 10 }}>
      <div className="flex flex-row flex-nowrap items-center justify-start gap-[8px]">
        <img src={articleDashIcon} alt="" className="h-[16px] w-[16px] shrink-0" />
        <div className="flex min-w-0 flex-1 items-center">
          <Link
            to={href}
            onClick={(e) => e.stopPropagation()}
            title={title.length > TITLE_MAX ? title : undefined}
            className={cn(
              'm-0 block cursor-pointer overflow-hidden p-0 text-[14px] leading-[17px] font-medium text-ellipsis whitespace-nowrap text-legacy-body no-underline outline-none focus-visible:underline',
              trailing ? 'min-w-0' : 'w-full',
            )}
          >
            {truncate(title, TITLE_MAX)}
          </Link>
          {trailing ? <span className="ml-[8px] flex shrink-0">{trailing}</span> : null}
        </div>
      </div>
    </td>
  );
}

export interface CellProps {
  /** Outer column width; omit for the trailing column. */
  width?: number;
  className?: string;
  style?: CSSProperties;
  onClick?: (e: MouseEvent<HTMLTableCellElement>) => void;
  children: ReactNode;
}

/** Any non-title cell: 1px padding, content-box width. */
export function Cell({ width, className, style, onClick, children }: CellProps) {
  return (
    <td
      className={cn('cursor-pointer p-[1px]', className)}
      style={{ width: width === undefined ? undefined : width - 2, ...style }}
      onClick={onClick}
    >
      {children}
    </td>
  );
}

/** 13/28 400 #4e6382 cell text (live ACTIVITY column). */
export function CellText({ children }: { children: ReactNode }) {
  return (
    <span className="m-0 block w-full overflow-hidden p-0 text-[13px] leading-[28px] font-normal text-ellipsis whitespace-nowrap text-legacy-meta">
      {children}
    </span>
  );
}
