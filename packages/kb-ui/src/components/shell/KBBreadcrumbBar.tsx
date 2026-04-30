import * as React from 'react';
import {
  RiLayoutLeftLine,
  RiHome5Line,
  RiSendPlaneLine,
  RiCloseLine,
} from '@remixicon/react';
import { cn } from '../../utils/cn';
import { Button } from '../primitives/Button';

export type KBBreadcrumbItem = {
  id: string;
  label: string;
};

export type KBBreadcrumbBarProps = {
  /** Path items; last entry is treated as the current page. */
  items: KBBreadcrumbItem[];
  /** Layout variant. `category` shows only the current section; `editor` shows the full path and action buttons. */
  variant?: 'category' | 'editor';
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
  /** Editor variant only. */
  onSaveAsDraft?: () => void;
  /** Editor variant only. */
  onPublish?: () => void;
  /** Editor variant only. */
  onClose?: () => void;
  /**
   * Editor variant only. When `true`, the Publish button is rendered disabled
   * (muted via `Button` primitive's `opacity-50 cursor-not-allowed`) and
   * `onPublish` will not fire. Default `false` — matches existing behaviour.
   *
   * Used by the AI Gaps review flow where Publish stays disabled until the
   * user has accepted at least one suggestion (see `KBAIGapsExperience`).
   */
  publishDisabled?: boolean;
  /**
   * Editor variant only. When `true`, the Save-as-draft button is rendered
   * disabled (muted text + `cursor-not-allowed`) and `onSaveAsDraft` will not
   * fire.
   *
   * Optional — when undefined, falls back to `publishDisabled` for backwards
   * compatibility with the AI Gaps flow (which mutes Save and Publish in
   * lockstep). The KB editor route passes this independently so Save can
   * disable on a clean editor while Publish remains enabled.
   */
  saveDisabled?: boolean;
  className?: string;
  actions?: React.ReactNode;
};

/**
 * 54px-tall bar that sits above the KB content area. Two variants:
 * - `category` — collapse button + current section name (pill)
 * - `editor` — collapse button + full ancestor path + Save/Publish/Close actions
 */
export function KBBreadcrumbBar({
  items,
  variant = 'category',
  sidebarCollapsed = false,
  onCollapse,
  onToggleSidebar,
  onSaveAsDraft,
  onPublish,
  onClose,
  publishDisabled = false,
  saveDisabled,
  className,
  actions,
}: KBBreadcrumbBarProps) {
  // Save-as-draft falls back to `publishDisabled` when `saveDisabled` is
  // not supplied — preserves the AI Gaps "lockstep" behaviour where both
  // controls mute together until at least one suggestion is accepted.
  const effectiveSaveDisabled =
    saveDisabled === undefined ? publishDisabled : saveDisabled;
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

        <span aria-hidden="true" className="h-5 w-px shrink-0 bg-[#e2e8f0]" />

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

      {actions !== undefined ? (
        <div className="flex items-center gap-2 ml-auto pl-4 shrink-0">
          {actions}
        </div>
      ) : (
        variant === 'editor' && (
          <div className="flex items-center gap-2 ml-auto pl-4 shrink-0">
            {/*
              "Save as draft" mutes whenever Publish is disabled — i.e. no
              suggestions accepted yet, so there is nothing meaningful to
              persist as a draft. Default ( publishDisabled === false ) keeps
              the original Phase 5 editor styling and click behaviour.
            */}
            <button
              type="button"
              onClick={onSaveAsDraft}
              disabled={effectiveSaveDisabled}
              className={cn(
                'inline-flex items-center h-8 px-3 py-1.5 rounded-[6px] text-[14px] font-normal',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#cbd5e1]',
                effectiveSaveDisabled
                  ? 'text-[#94a3b8] cursor-not-allowed'
                  : 'text-[#475569] hover:bg-[#f8fafc]',
              )}
            >
              Save as draft
            </button>
            {/*
              Publish — Figma `53:8464` uses `bg-black` + `text-white` with a
              white send-plane icon (14 px). Match the `Button` primary variant
              (bg-black, text-white, rounded-6, px-3 py-1.5, text-14/medium).
              Icon color inherits from text via `currentColor`.
            */}
            <Button
              variant="primary"
              onClick={onPublish}
              disabled={publishDisabled}
              icon={<RiSendPlaneLine size={14} />}
            >
              Publish
            </Button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex size-8 items-center justify-center rounded-[6px] text-[#64758b] hover:bg-[#f8fafc] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#cbd5e1]"
            >
              <RiCloseLine size={16} />
            </button>
          </div>
        )
      )}
    </div>
  );
}
