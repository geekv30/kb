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
   * When `true`, the `explorer` slot's width animates to 0 (200ms ease-out),
   * clipping the panel out of view. The `rail` slot is persistent chrome
   * and is NOT affected. Defaults to `false`.
   *
   * The breadcrumb slot receives this as-is; callers typically pass a
   * `KBBreadcrumbBar` with the matching `sidebarCollapsed` prop. By default
   * its leading icon flips to a home glyph — pass `leadingIcon='sidebar-toggle'`
   * on user-toggleable surfaces to keep the LayoutLeft icon throughout.
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
 * - The `rail` slot is persistent chrome (54px) and stays visible
 *   regardless of this flag. It contains primary navigation that the
 *   user always needs reachable.
 * - The `explorer` slot (288px) animates its width to 0 over 200ms
 *   when `sidebarCollapsed=true`. The child stays mounted but is
 *   clipped by `overflow-hidden` and removed from AT + tab order
 *   via `aria-hidden` + `inert`.
 * - On surfaces that pass no `rail`/`explorer` at all (e.g. the
 *   editor's CollapsedShellLayout), this prop has no visual effect —
 *   it's still forwarded via the `data-kb-sidebar-collapsed` attribute
 *   for callers that style based on it.
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
        <div data-kb-part="shell-rail" className="shrink-0 h-full w-[54px]">
          {rail}
        </div>
      )}

      {explorer !== undefined && (
        <div
          data-kb-part="shell-explorer"
          aria-hidden={sidebarCollapsed ? 'true' : undefined}
          {...(sidebarCollapsed ? { inert: '' } : {})}
          // Sidebar collapse — 200ms width transition with the strong
          // ease-out curve (replaces Tailwind's weak built-in ease-out).
          // This is the same vocabulary used elsewhere in kb-ui for
          // entering/exiting motion. Reduced-motion users get an
          // instant snap because we gate transitions behind motion-safe.
          style={{ transition: 'width 200ms cubic-bezier(0.23, 1, 0.32, 1)' }}
          className={cn(
            'shrink-0 h-full overflow-hidden motion-reduce:transition-none',
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
