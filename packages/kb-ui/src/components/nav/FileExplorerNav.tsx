import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  File02,
  SearchLg,
  Feather,
  DotsVertical,
} from '@untitledui/icons';
import { cn } from '../../utils/cn';

export type NavItem = {
  id: string;
  title: string;
  type: 'folder' | 'article';
  status?: 'published' | 'draft';
  count?: number;
  children?: NavItem[];
  /**
   * Flat-mode role. Defaults to `'item'`.
   *
   * - `item`     — clickable nav row, hover pill + active pill.
   * - `section`  — non-interactive label row that introduces a
   *                group below it. Renders without hover/active
   *                affordances and ships an inset 1-px divider
   *                immediately below.
   *
   * Tree-mode rendering is unaffected.
   */
  kind?: 'section' | 'item';
  /** Optional leading glyph rendered in flat-mode rows. */
  icon?: React.ReactNode;
};

export type FileExplorerNavProps = {
  title?: string;
  /**
   * Header glyph rendered to the left of the title. Defaults to a quill-pen
   * (Feather) for Editor. Other surfaces (e.g. Analytics) pass a
   * different glyph (e.g. BarChartSquare02).
   */
  headerIcon?: React.ReactNode;
  items: NavItem[];
  activeId?: string;
  onItemClick?: (id: string) => void;
  /**
   * Tree variant (default): renders chevron, folder/file icon, count/kebab —
   * the canonical Editor explorer.
   *
   * Flat variant: renders title-only rows, no chevron, no file icon, no
   * count/kebab. Used by Analytics where the explorer is a flat list of
   * 3 sub-routes. Same chrome (288 panel, 54-tall header, inset divider at
   * Y=54), same row geometry (36 tall, 12px top gap, 2px stride), but the
   * active pill colour is `#f8fafc` (matches Figma `1974:53328`) instead
   * of the tree-mode `rgba(230,230,230,0.44)`.
   *
   * Flat mode also disables the "search" affordance in the header — the
   * Analytics surface has nothing to search there.
   */
  variant?: 'tree' | 'flat';
  /**
   * Whether to render the trailing search icon button in the header. Defaults
   * to `true` in tree mode and `false` in flat mode (Analytics surface).
   */
  showSearch?: boolean;
  className?: string;
  renderItem?: (item: NavItem, depth: number) => React.ReactNode;
};

// Depth → content left-padding (inside the inner container)
const CONTENT_PL: Record<number, string> = {
  0: '',
  1: 'pl-[20px]',
  2: 'pl-[44px]',
  3: 'pl-[68px]',
};

// Outer padding per Figma `6:438`:
//  - depth 0 (category):          px-[12px] py-0
//  - depth > 0 (folder/article):  pl-[16px] pr-[12px] py-0
// The depth indentation itself is applied INSIDE the inner container via CONTENT_PL,
// so the hover/active bg stays insetted from the panel edges at every depth.
function outerPaddingForDepth(depth: number): string {
  if (depth === 0) return 'px-[12px] py-0';
  return 'pl-[16px] pr-[12px] py-0';
}

type RowState = 'default' | 'hover' | 'active' | 'active-sub';

function stateBg(state: RowState): string {
  if (state === 'active') return 'bg-[rgba(230,230,230,0.44)]';
  if (state === 'hover') return 'bg-[rgba(230,230,230,0.32)]';
  return '';
}

const HOVER_BG_CLASS = 'hover:bg-[rgba(230,230,230,0.32)]';

/* ---------------------------- flat row -------------------------------- */
//
// Flat mode (Analytics): full-width inset row, 36 tall, 12px horizontal pad,
// no chevron / no file icon / no count / no kebab. Active pill is #f8fafc
// (Figma `background/neutral/faint`) — matches `1974:53328`.

type FlatRowProps = {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
};

function FlatRow({ item, isActive, onClick }: FlatRowProps) {
  const kind = item.kind ?? 'item';
  const isSection = kind === 'section';

  return (
    <div
      data-kb-part="flat-row"
      data-kb-kind={kind}
      data-kb-active={isActive ? 'true' : 'false'}
      className="w-full px-[16px] py-0"
    >
      <button
        type="button"
        onClick={onClick}
        aria-current={isActive && !isSection ? 'page' : undefined}
        // Section rows are non-interactive labels — keep them focusable
        // for a11y, but suppress hover/active affordances.
        className={cn(
          'flex h-9 w-full items-center rounded-[6px] px-[12px]',
          item.icon && 'gap-2',
          'text-left text-[14px] leading-[20px] transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10',
          'text-text-primary',
          isSection
            ? 'cursor-default font-medium'
            : isActive
              ? 'bg-surface-subtle font-medium'
              : 'font-normal hover:bg-surface-subtle',
        )}
      >
        {item.icon && (
          <span
            aria-hidden
            className="inline-flex size-4 shrink-0 items-center justify-center text-text-meta [&>svg]:w-4 [&>svg]:h-4"
          >
            {item.icon}
          </span>
        )}
        <span className="truncate">{item.title}</span>
      </button>
    </div>
  );
}

/* ---------------------------- tree helpers ---------------------------- */

function findAncestorIds(items: NavItem[], targetId: string): string[] | null {
  for (const item of items) {
    if (item.id === targetId) return [];
    if (item.children && item.children.length > 0) {
      const sub = findAncestorIds(item.children, targetId);
      if (sub !== null) return [item.id, ...sub];
    }
  }
  return null;
}

function findNode(items: NavItem[], id: string): NavItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children && item.children.length > 0) {
      const found = findNode(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

/* ---------------------------- row components -------------------------- */

type FolderRowProps = {
  item: NavItem;
  depth: number;
  isActive: boolean;
  isActiveSub: boolean;
  isExpanded: boolean;
  onToggle: () => void;
};

function FolderRow({
  item,
  depth,
  isActive,
  isActiveSub,
  isExpanded,
  onToggle,
}: FolderRowProps) {
  const state: RowState = isActive ? 'active' : isActiveSub ? 'active-sub' : 'default';
  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;

  // Per Figma `6:438`: folder/sub-folder rows use font-normal in every state.
  // Only `type=category, state=hover` uses font-medium on the label. Keep regular
  // weight across the board and let background + size carry the emphasis.

  // Figma behavior: on ACTIVE the count stays visible (no kebab — see 6:508, 6:491).
  // On HOVER (non-active) the kebab replaces the count (see 6:493 vs 6:484).
  // We only install the `group-hover:hidden`/`group-hover:flex` swap when the row
  // is not already active.
  const showHoverSwap = state !== 'active';

  return (
    <div
      data-kb-part="folder-row"
      className={cn('w-full h-9 group', outerPaddingForDepth(depth))}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className={cn(
          'flex h-full w-full items-center gap-1 px-[4px] py-[6px] rounded-[8px] cursor-pointer transition-colors duration-150',
          state === 'default' && HOVER_BG_CLASS,
          state === 'active' && stateBg('active'),
        )}
      >
        <div
          className={cn('flex items-center gap-1 flex-1 min-w-0', CONTENT_PL[depth])}
        >
          <span className="flex size-6 items-center justify-center rounded-[6px] shrink-0 text-text-muted">
            <ChevronIcon size={16} />
          </span>
          <span className="flex size-6 items-center justify-center rounded-[6px] shrink-0 text-text-muted">
            <Folder size={16} />
          </span>
          <span className="flex-1 truncate text-left text-[14px] leading-5 font-normal text-text-primary">
            {item.title}
          </span>
          <span className="flex size-6 items-center justify-center shrink-0 relative">
            <span
              className={cn(
                'text-[14px] font-normal text-text-meta',
                showHoverSwap && 'group-hover:hidden',
              )}
            >
              {item.count ?? ''}
            </span>
            {showHoverSwap && (
              <span className="hidden group-hover:flex items-center justify-center text-text-meta">
                <DotsVertical size={16} />
              </span>
            )}
          </span>
        </div>
      </button>
    </div>
  );
}

type ArticleRowProps = {
  item: NavItem;
  depth: number;
  isActive: boolean;
  onClick: () => void;
};

function ArticleRow({ item, depth, isActive, onClick }: ArticleRowProps) {
  const state: RowState = isActive ? 'active' : 'default';

  // Spec colors: published = #42cd83, draft = #898989. 4×4 size.
  // (Status-dot spec hexes are intentionally inline — not in the token system.)
  const statusDotColor =
    item.status === 'published'
      ? 'bg-[#42cd83]'
      : item.status === 'draft'
        ? 'bg-[#898989]'
        : 'bg-transparent';

  // Match folder behavior: on ACTIVE keep the status dot; on HOVER (non-active)
  // swap dot → kebab affordance. See Figma `6:438` article states (6:574, 6:584).
  const showHoverSwap = state !== 'active';

  return (
    <div
      data-kb-part="article-row"
      className={cn('w-full h-9 group', outerPaddingForDepth(depth))}
    >
      <button
        type="button"
        onClick={onClick}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'flex h-full w-full items-center gap-1 px-[4px] py-[6px] rounded-[8px] cursor-pointer transition-colors duration-150',
          state === 'default' && HOVER_BG_CLASS,
          state === 'active' && stateBg('active'),
        )}
      >
        <div
          className={cn('flex items-center gap-1 flex-1 min-w-0', CONTENT_PL[depth])}
        >
          {/* Phantom 24×24 spacer — matches folder-row's chevron slot so the
              article glyph aligns horizontally with folder glyphs at the same
              depth (see _layout-invariants.md row geometry). */}
          <span aria-hidden className="size-6 shrink-0" />
          {/* Article icon (no leading bullet — spec is icon + label + status-dot) */}
          <span className="flex size-6 items-center justify-center rounded-[6px] shrink-0 text-text-muted">
            <File02 size={16} />
          </span>
          <span className="flex-1 truncate text-left text-[14px] font-normal leading-5 text-text-primary">
            {item.title}
          </span>
          <span className="flex size-6 items-center justify-center shrink-0 relative">
            {item.status && (
              <span
                className={cn(
                  'size-[4px] rounded-full',
                  statusDotColor,
                  showHoverSwap && 'group-hover:hidden',
                )}
              />
            )}
            {showHoverSwap && (
              <span className="hidden group-hover:flex items-center justify-center text-text-meta">
                <DotsVertical size={16} />
              </span>
            )}
          </span>
        </div>
      </button>
    </div>
  );
}

/* ---------------------------- main component -------------------------- */

export function FileExplorerNav({
  title = 'Editor',
  headerIcon,
  items,
  activeId,
  onItemClick,
  variant = 'tree',
  showSearch,
  className,
  renderItem,
}: FileExplorerNavProps) {
  const isFlat = variant === 'flat';
  // Search affordance defaults: ON for tree, OFF for flat. Caller can
  // explicitly override either way.
  const renderSearch = showSearch ?? !isFlat;
  // Default header glyph: pen for Editor (tree), nothing-extra for flat
  // unless the caller passes one. Coerce undefined → pen for tree mode so
  // existing call sites (Editor) keep their glyph without breaking.
  const resolvedHeaderIcon =
    headerIcon ??
    (isFlat ? null : <Feather size={16} className="text-text-muted" />);

  const ancestorIds = useMemo(() => {
    if (!activeId) return new Set<string>();
    const chain = findAncestorIds(items, activeId);
    return new Set<string>(chain ?? []);
  }, [items, activeId]);

  const autoExpandIds = useMemo(() => {
    const set = new Set<string>(ancestorIds);
    if (activeId) {
      const node = findNode(items, activeId);
      if (node?.type === 'folder') set.add(activeId);
    }
    return set;
  }, [items, activeId, ancestorIds]);

  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set<string>(autoExpandIds),
  );

  useEffect(() => {
    if (autoExpandIds.size === 0) return;
    setExpanded((prev) => {
      const next = new Set(prev);
      let changed = false;
      autoExpandIds.forEach((id) => {
        if (!next.has(id)) {
          next.add(id);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [autoExpandIds]);

  const toggleFolder = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    onItemClick?.(id);
  };

  const renderItems = (list: NavItem[], depth: number): React.ReactNode => {
    return list.map((item) => {
      if (item.type === 'folder') {
        const isActive = item.id === activeId;
        const isActiveSub = ancestorIds.has(item.id);
        const isExpanded = expanded.has(item.id);
        return (
          <div key={item.id} className="flex flex-col gap-[2px]">
            {renderItem ? (
              renderItem(item, depth)
            ) : (
              <FolderRow
                item={item}
                depth={depth}
                isActive={isActive}
                isActiveSub={isActiveSub && !isActive}
                isExpanded={isExpanded}
                onToggle={() => toggleFolder(item.id)}
              />
            )}
            {isExpanded && item.children && item.children.length > 0 && (
              <div className="flex flex-col gap-[2px]">{renderItems(item.children, depth + 1)}</div>
            )}
          </div>
        );
      }
      if (renderItem) {
        return <React.Fragment key={item.id}>{renderItem(item, depth)}</React.Fragment>;
      }
      return (
        <ArticleRow
          key={item.id}
          item={item}
          depth={depth}
          isActive={item.id === activeId}
          onClick={() => onItemClick?.(item.id)}
        />
      );
    });
  };

  return (
    <aside
      className={cn(
        'flex flex-col w-[288px] h-full bg-white border-r border-card-border',
        className,
      )}
      aria-label="File explorer"
      data-kb-component="file-explorer-nav"
    >
      {/* Header row (54 tall) — no border-b; inset divider lives below */}
      <div
        data-kb-part="explorer-header"
        className="flex h-[54px] items-center justify-between px-4 shrink-0"
      >
        <div className="flex items-center gap-2">
          {resolvedHeaderIcon ? (
            // Wrap caller-provided icons so colour stays consistent (callers
            // pass un-coloured glyphs).
            <span
              aria-hidden
              className="inline-flex items-center justify-center text-text-primary [&>svg]:w-4 [&>svg]:h-4"
            >
              {resolvedHeaderIcon}
            </span>
          ) : null}
          <span
            data-kb-part="explorer-title"
            className="text-[14px] font-semibold text-text-primary"
          >
            {title}
          </span>
        </div>
        {renderSearch && (
          <button
            type="button"
            aria-label="Search"
            className="flex size-6 items-center justify-center rounded-[6px] cursor-pointer transition-colors duration-150 text-text-muted hover:bg-surface-subtle hover:text-text-primary"
          >
            <SearchLg size={16} />
          </button>
        )}
      </div>

      {/* Inset 1px divider at Y=54 — 16L / 16R inset (effective width 256) */}
      <div
        data-kb-part="explorer-divider"
        className="h-px mx-[16px] shrink-0 bg-card-border"
      />

      {/* Body — 12px top gap per invariants, 2px stride between rows.
          Flat variant renders a flat NavItem list (no children, no chevrons,
          no file icons); tree variant uses recursive folder/article rows. */}
      <div
        data-kb-part={isFlat ? 'explorer-flat' : 'explorer-tree'}
        className="flex-1 overflow-y-auto pt-[12px] pb-[12px] flex flex-col gap-[2px]"
      >
        {isFlat
          ? items.map((item, idx) => {
              const kind = item.kind ?? 'item';
              const isLast = idx === items.length - 1;
              const isSection = kind === 'section';
              return (
                <React.Fragment key={item.id}>
                  <FlatRow
                    item={item}
                    isActive={item.id === activeId}
                    onClick={() => onItemClick?.(item.id)}
                  />
                  {isSection && !isLast && (
                    <div
                      aria-hidden
                      data-kb-part="flat-section-divider"
                      className="h-px mx-[16px] bg-card-border"
                    />
                  )}
                </React.Fragment>
              );
            })
          : renderItems(items, 0)}
      </div>
    </aside>
  );
}
