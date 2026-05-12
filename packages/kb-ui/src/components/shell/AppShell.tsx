import * as React from 'react';
import { cn } from '../../utils/cn';

export type AppShellProps = {
  /** Left icon rail slot (e.g. <SideNavRail />). */
  rail?: React.ReactNode;
  /** Middle explorer panel slot (e.g. <FileExplorerNav />). */
  explorer?: React.ReactNode;
  /** Sticky breadcrumb bar above main content (e.g. <KBBreadcrumbBar />). */
  breadcrumb?: React.ReactNode;
  /** Main content — scrolls independently of the shell. */
  children: React.ReactNode;
  /**
   * When `true`, the rail + explorer are **unmounted** and the content column
   * spans the full viewport width. Used by the editor's collapsed state
   * (Figma `53:8464`). Defaults to `false` — unchanged behaviour.
   *
   * The breadcrumb slot receives this as-is; callers typically pass a
   * `KBBreadcrumbBar` with the matching `sidebarCollapsed` prop so its icon
   * swaps from a side-panel toggle to a home icon.
   */
  sidebarCollapsed?: boolean;
  /**
   * Informational callback — AppShell does not own the toggle UI itself
   * (the breadcrumb's leading icon does). Exposed so callers can wire a
   * single `onToggleSidebar` handler and thread it through both the shell
   * and the breadcrumb.
   */
  onToggleSidebar?: () => void;
  className?: string;
};

/**
 * AppShell — top-level layout container for the KB app.
 *
 * Fills the viewport (`h-screen`), clips overflow, and arranges:
 * - optional left rail
 * - optional explorer panel
 * - a content column with optional sticky breadcrumb bar + scrollable main
 *
 * Right borders between columns are owned by each component's light theme
 * (SideNavRail, FileExplorerNav) — AppShell does not add its own so we
 * don't get double-1px borders in composition.
 * Breadcrumb does NOT render a visible bottom border — the shell's Y=54
 * header line is marked by the rail and explorer dividers alone.
 *
 * Collapsed sidebar state (`sidebarCollapsed`):
 * - When collapsed, the rail + explorer wrapper widths animate to 0
 *   (200ms ease-out), the children remain mounted but `overflow-hidden`
 *   clips them and `aria-hidden`/`inert` removes them from AT + tab
 *   order. This enables a smooth slide-out without the layout jank of
 *   mount/unmount.
 * - Content column stretches the full viewport width via flex-1;
 *   breadcrumb sits on the same `#ffffff` bg.
 */
export function AppShell({
  rail,
  explorer,
  breadcrumb,
  children,
  sidebarCollapsed = false,
  onToggleSidebar: _onToggleSidebar,
  className,
}: AppShellProps) {
  // `onToggleSidebar` is accepted for API symmetry with KBBreadcrumbBar; the
  // breadcrumb slot owns the actual click surface. Underscore-prefixed so
  // the linter doesn't complain about the deliberately-unused ref.
  return (
    <div
      data-kb-component="app-shell"
      data-kb-sidebar-collapsed={sidebarCollapsed ? 'true' : 'false'}
      className={cn(
        'flex h-screen w-full overflow-hidden bg-canvas',
        className,
      )}
    >
      {rail !== undefined && (
        <div
          data-kb-part="shell-rail"
          aria-hidden={sidebarCollapsed ? 'true' : undefined}
          // React 18's typings don't include `inert` on HTMLAttributes yet;
          // spread it conditionally so we only emit the attribute when set,
          // and so TS doesn't complain about the unknown prop.
          {...(sidebarCollapsed ? { inert: '' } : {})}
          className={cn(
            'shrink-0 h-full overflow-hidden transition-[width] duration-200 ease-out',
            sidebarCollapsed ? 'w-0' : 'w-[54px]',
          )}
        >
          {rail}
        </div>
      )}

      {explorer !== undefined && (
        <div
          data-kb-part="shell-explorer"
          aria-hidden={sidebarCollapsed ? 'true' : undefined}
          {...(sidebarCollapsed ? { inert: '' } : {})}
          className={cn(
            'shrink-0 h-full overflow-hidden transition-[width] duration-200 ease-out',
            sidebarCollapsed ? 'w-0' : 'w-[288px]',
          )}
        >
          {explorer}
        </div>
      )}

      <div data-kb-part="shell-content-column" className="flex flex-col flex-1 min-w-0 h-full bg-white">
        {breadcrumb && (
          <div data-kb-part="shell-breadcrumb" className="shrink-0">
            {breadcrumb}
          </div>
        )}
        <main className="flex-1 overflow-y-auto pt-[12px] pr-6 pb-6 pl-6">{children}</main>
      </div>
    </div>
  );
}
