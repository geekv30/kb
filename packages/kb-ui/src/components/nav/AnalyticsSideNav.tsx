// Figma: 251DTRmxl2L6jmXd3FWzHe#1974:53324 (Analytics side-nav, "option 13")
// Verified region: 1974:53328 (288 × 635, top section). Tokens & geometry
// fetched live via mcp__plugin_figma_figma__get_variable_defs and
// get_metadata + get_screenshot on 2026-04-25.
import * as React from 'react';
import { RiBarChartBoxLine } from '@remixicon/react';
import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────────────────────── */

export type AnalyticsSideNavItem = {
  id: string;
  label: string;
};

export type AnalyticsSideNavProps = {
  items: AnalyticsSideNavItem[];
  activeId?: string;
  onItemClick?: (id: string) => void;
  /** Override the header label. Default "Analytics". */
  headerLabel?: string;
  className?: string;
};

/* ─────────────────────────────────────────────────────────────
 * Internal — one row
 *
 * Geometry (measured from Figma 1974:53328):
 *   - Panel width 288, outer horizontal padding 16/16 (`scale/space/2xl`).
 *   - Each row sits inside `.menu-items` at x=2, y=12/50/88 (38px stride →
 *     36px row + 2px vertical gap). Inner row width = 256 (288 − 32).
 *   - Row padding-x 12 (`scale/space/xl`), padding-y 8 → row min-height 36.
 *   - Default text: 14/regular `#0f172a` (`body/sm/regular` × `text/neutral/default`).
 *   - Active text: 14/medium `#0f172a` (`body/sm/medium`) — weight changes,
 *     colour does not.
 *   - Active pill bg: `#f8fafc` (`background/neutral/faint`), radius 6 (`scale/radius/md`).
 *   - No leading icons on rows (text-only) — confirmed against screenshot.
 * ───────────────────────────────────────────────────────────── */

type RowProps = {
  item: AnalyticsSideNavItem;
  isActive: boolean;
  onClick: () => void;
};

function Row({ item, isActive, onClick }: RowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      data-kb-part="side-nav-row"
      data-kb-active={isActive ? 'true' : 'false'}
      className={cn(
        'flex w-full items-center rounded-[6px] px-[12px] py-[8px]',
        'text-left text-[14px] leading-[20px] text-[#0f172a]',
        'transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10',
        isActive
          ? 'bg-[#f8fafc] font-medium'
          : 'font-normal hover:bg-[#f8fafc]',
      )}
    >
      <span className="truncate">{item.label}</span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
 * AnalyticsSideNav
 *
 * 288-wide white side-nav for the Analytics surface. Header has a
 * bar-chart-in-a-box icon (RiBarChartBoxLine — confirmed against
 * screenshot of node 1974:53331; the user-prompted "RiBarChart2Line"
 * is a 2-bar glyph and does NOT match the boxed icon in Figma).
 * Below the header sits a 1px `#e2e8f0` divider and a list of
 * text-only rows with a `#f8fafc` active pill.
 * ───────────────────────────────────────────────────────────── */

export function AnalyticsSideNav({
  items,
  activeId,
  onItemClick,
  headerLabel = 'Analytics',
  className,
}: AnalyticsSideNavProps) {
  return (
    <aside
      data-kb-component="analytics-side-nav"
      aria-label="Analytics navigation"
      className={cn(
        'flex h-full w-[288px] flex-col bg-white border-r border-[#e2e8f0]',
        className,
      )}
    >
      {/* Header — 288 × 54 in Figma. 16 px outer L/R padding, items vertically
          centred. 1 px bottom border in `border/slate_blue/subtle`. */}
      <div
        data-kb-part="side-nav-header"
        className={cn(
          'flex items-center gap-[8px] px-[16px] py-[16px]',
          'border-b border-[#e2e8f0]',
        )}
      >
        <RiBarChartBoxLine
          size={16}
          className="shrink-0 text-[#0f172a]"
          aria-hidden
        />
        <span className="text-[14px] font-semibold leading-[20px] text-[#0f172a]">
          {headerLabel}
        </span>
      </div>

      {/* Body — `.menu-items` block. 16 px outer padding, 4 px top spacer
          (the .menu-items at y=54 with height=4 in the Figma frame). Rows
          stack with 2 px vertical gap. */}
      <nav
        data-kb-part="side-nav-list"
        className="flex flex-col gap-[2px] px-[16px] pt-[16px] pb-[12px]"
      >
        {items.map((item) => (
          <Row
            key={item.id}
            item={item}
            isActive={item.id === activeId}
            onClick={() => onItemClick?.(item.id)}
          />
        ))}
      </nav>
    </aside>
  );
}
