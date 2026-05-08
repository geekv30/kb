import * as React from 'react';
import { RiLayoutLeftLine, RiHome5Line } from '@remixicon/react';
import { cn } from '../../utils/cn';

export type KBBreadcrumbItem = {
  id: string;
  label: string;
};

export type KBBreadcrumbBarProps = {
  /** Path items; last entry is treated as the current page. */
  items: KBBreadcrumbItem[];
  /**
   * When `true`, the leading icon becomes a **home** glyph (`RiHome5Line`)
   * and the `aria-label` + testid become "home-icon" — matches the Figma
   * collapsed-shell state (`53:8464`) where rail + explorer are hidden.
   *
   * When `false` (default), the leading icon is the side-panel toggle
   * (`RiLayoutLeftLine`) used when the sidebar is expanded.
   *
   * The click handler (`onCollapse` / `onToggleSidebar`) fires regardless of
   * which icon is shown — callers can use the same handler for both states
   * or distinguish via the value they pass for `sidebarCollapsed`.
   */
  sidebarCollapsed?: boolean;
  onCollapse?: () => void;
  /** Alias for `onCollapse`; symmetric with `AppShell`'s `onToggleSidebar`. Either may be passed. */
  onToggleSidebar?: () => void;
  className?: string;
  /**
   * Right-aligned content slot. Render any action buttons (e.g.
   * `EditorBreadcrumbActions`) here. When undefined, the right-aligned area
   * renders nothing.
   */
  actions?: React.ReactNode;
};

/**
 * 54px-tall bar that sits above the KB content area. Renders a leading
 * sidebar-toggle icon, the breadcrumb path, and an optional `actions` slot
 * on the right.
 */
export function KBBreadcrumbBar({
  items,
  sidebarCollapsed = false,
  onCollapse,
  onToggleSidebar,
  className,
  actions,
}: KBBreadcrumbBarProps) {
  const handleLeadingClick = onToggleSidebar ?? onCollapse;
  const LeadingIcon = sidebarCollapsed ? RiHome5Line : RiLayoutLeftLine;
  const leadingLabel = sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar';
  const leadingTestId = sidebarCollapsed ? 'home-icon' : 'side-panel-icon';

  return (
    <div
      data-kb-component="breadcrumb-bar"
      data-kb-sidebar-collapsed={sidebarCollapsed ? 'true' : 'false'}
      className={cn(
        'flex items-center h-[54px] w-full bg-white pl-[22px] pr-4',
        className,
      )}
    >
      <div
        data-kb-part="breadcrumb-content"
        className="flex items-center gap-2 min-w-0 flex-1"
      >
        <button
          type="button"
          onClick={handleLeadingClick}
          aria-label={leadingLabel}
          data-testid={leadingTestId}
          className="inline-flex size-[22px] shrink-0 p-[4px] items-center justify-center rounded-[4px] text-[#64758b] hover:bg-[#f8fafc] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#cbd5e1]"
        >
          <LeadingIcon size={14} />
        </button>

        {/*
          Figma `50:8395` (sidebar-collapsed shell, home glyph) renders the
          breadcrumb path immediately after the home icon — no vertical
          divider. The divider is only present in the expanded shell where
          the side-panel toggle needs separation from the path. Suppress it
          when `sidebarCollapsed` is true to match both Figma states.
        */}
        {!sidebarCollapsed && (
          <span aria-hidden="true" className="h-5 w-px shrink-0 bg-[#e2e8f0]" />
        )}

        <nav aria-label="Breadcrumb" className="flex items-center min-w-0">
          <ol className="flex items-center min-w-0 list-none p-0 m-0">
            {items.map((item, idx) => {
              const isLast = idx === items.length - 1;
              return (
                <li
                  key={item.id}
                  className="flex items-center min-w-0"
                  {...(isLast ? { 'aria-current': 'page' as const } : {})}
                >
                  {isLast ? (
                    // Current-item pill per spec: bg #f8fafc, radius 4, padding 0/6
                    <span
                      data-kb-part="breadcrumb-current"
                      className="inline-flex items-center h-5 px-[6px] py-0 rounded-[4px] bg-[#f8fafc] text-[14px] font-medium leading-5 text-[#0f172a] truncate max-w-[320px]"
                      title={item.label}
                    >
                      {item.label}
                    </span>
                  ) : (
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="text-[14px] font-medium leading-5 text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a] rounded-[4px] px-[6px] py-0 truncate max-w-[260px]"
                      title={item.label}
                    >
                      {item.label}
                    </a>
                  )}
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className="inline-flex items-center justify-center text-[14px] leading-5 text-[#cbd5e1] px-[6px] shrink-0 select-none"
                    >
                      /
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {actions !== undefined && (
        <div className="flex items-center gap-2 ml-auto pl-4 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
