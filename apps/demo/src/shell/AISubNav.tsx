// Figma: 9aGp5t9fH1d0PXi4LMhOdb#74:8871 (AI sub-rail, from the AI Optimise hub 74:8928)
import * as React from 'react';
import { cn } from '../lib/cn';

/* ─────────────────────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────────────────────── */

export type AISubNavItem = {
  id: string;
  icon: React.ReactNode;
  label: string;
  /**
   * Visual role of the row.
   * - `section`: renders a 1px inset divider BELOW the row; active state
   *   (if any) has no pill bg — sections remain visually recessive.
   * - `item`: no divider; active state renders a `#f1f5f9` pill.
   *
   * Both kinds are clickable — the distinction is visual only.
   */
  kind: 'section' | 'item';
};

export type AISubNavProps = {
  items: AISubNavItem[];
  activeId?: string;
  onItemClick?: (id: string) => void;
  className?: string;
};

/* ─────────────────────────────────────────────────────────────
 * Internal — one row
 *
 * Geometry (measured from Figma 74:8871):
 *   - Panel width 288, outer horizontal padding 16/16.
 *   - Row height 44. Icon slot 20 (renders an 18-20px glyph inside).
 *   - Label: 14/medium, primary text (#0f172a) — both kinds.
 *   - Active pill: #f1f5f9 (surface-muted), radius 8, fills 256px width
 *     (288 − 16L − 16R). Only on `kind: 'item'`.
 *   - Hover pill: #f8fafc on non-active rows (both kinds).
 * ───────────────────────────────────────────────────────────── */

type RowProps = {
  item: AISubNavItem;
  isActive: boolean;
  onClick: () => void;
};

function Row({ item, isActive, onClick }: RowProps) {
  // Pill visibility rules per Figma:
  // - section + active  → no pill (section rows don't highlight)
  // - item + active     → #f1f5f9 pill
  // - default / hover   → transparent / #f8fafc hover (item only)
  const showActivePill = isActive && item.kind === 'item';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      data-kb-part="sub-nav-row"
      data-kb-kind={item.kind}
      className={cn(
        'flex h-[44px] w-full items-center gap-[8px]',
        'mx-[16px] rounded-[8px] px-[8px]',
        'transition-colors duration-150',
        'text-left text-[14px] font-medium leading-5 text-[#0f172a]',
        // Section rows aren't really click targets — sections are containers, not nav.
        // Keep them focusable for a11y but show a default cursor and skip hover bg.
        item.kind === 'section'
          ? 'cursor-default'
          : 'cursor-pointer',
        showActivePill
          ? 'bg-[#f1f5f9]'
          : item.kind === 'item'
            ? 'bg-transparent hover:bg-[#f8fafc]'
            : 'bg-transparent',
      )}
      // mx-16 + w-full would double-count; subtract manually so the row is
      // inset 16 on each side without expanding past the panel. 288 − 32 = 256.
      style={{ width: 'calc(100% - 32px)' }}
    >
      <span
        aria-hidden
        className="flex size-[20px] items-center justify-center shrink-0"
      >
        {item.icon}
      </span>
      <span className="truncate">{item.label}</span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
 * AISubNav
 *
 * 288-wide vertical panel rendered to the right of the app rail
 * (54-wide) on the AI Optimise hub. Contains two top-level entries:
 *   1. AI Centre  (kind: section — divider below, no pill on active)
 *   2. AI Optimise (kind: item — primary highlight)
 *
 * Structurally mirrors FileExplorerNav (white bg, 1px right border,
 * full viewport height when laid out inside a flex shell).
 * ───────────────────────────────────────────────────────────── */

export function AISubNav({
  items,
  activeId,
  onItemClick,
  className,
}: AISubNavProps) {
  return (
    <aside
      data-kb-component="ai-sub-nav"
      aria-label="AI navigation"
      className={cn(
        'flex flex-col w-[288px] h-full bg-white border-r border-nav-rail',
        'py-[12px]',
        className,
      )}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const isActive = item.id === activeId;
        return (
          <React.Fragment key={item.id}>
            <Row
              item={item}
              isActive={isActive}
              onClick={() => onItemClick?.(item.id)}
            />
            {item.kind === 'section' && !isLast && (
              // Asymmetric vertical margins: 4px above the divider keeps a
              // breath between the section row label and the rule, while
              // 12px below the divider matches Figma `74:8871` — the gap
              // from the divider to the next pill ("AI Optimise") is
              // `scale/space/xl` = 12px.
              <div
                aria-hidden
                data-kb-part="sub-nav-divider"
                className="h-px bg-nav-rail mx-[16px] mt-[4px] mb-[12px]"
              />
            )}
          </React.Fragment>
        );
      })}
    </aside>
  );
}
