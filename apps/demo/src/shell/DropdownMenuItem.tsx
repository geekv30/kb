// Shared dropdown menu chrome — matches Figma node 1958:34638.
//
// Used by both:
//   - `EditorExplorer` — the per-row 3-dot menu surfaced via
//     `FileExplorerNav.renderRowAction`.
//   - `CategoryPage`   — the PageHeader "+ New" dropdown with
//     "Folder" / "Article" items.
//
// Container: white bg, 1px #e2e8f0 border, 8px radius, py-2 px-1,
//            two-layer shadow per Figma `Shadows/md`.
// Item:      flex w/ 16px icon + 14px label, p-2, 6px radius, slate-100
//            hover bg, destructive variant uses ai-removal red.
//
// Composes Radix DropdownMenu primitives so we keep keyboard a11y,
// portal positioning, and focus management for free.

import * as React from 'react';
import * as RxDropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '@test-kb-ui/kb-ui';

export type DropdownItemProps = {
  label: string;
  icon: React.ReactNode;
  onSelect: () => void;
  destructive?: boolean;
};

export function DropdownMenuItem({
  label,
  icon,
  onSelect,
  destructive,
}: DropdownItemProps) {
  return (
    <RxDropdownMenu.Item
      onSelect={(e) => {
        // Default behavior closes the menu — that's what we want.
        // Just guard against the synthetic event swallowing navigation
        // by deferring to a microtask.
        e.preventDefault();
        onSelect();
      }}
      className={cn(
        'flex items-center gap-2 p-2 rounded-[6px]',
        'text-[14px] leading-5 cursor-pointer outline-none select-none',
        'data-[highlighted]:bg-[#f1f5f9] data-[disabled]:opacity-50',
        destructive ? 'text-[#d52c1f]' : 'text-text-primary',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'flex size-4 shrink-0 items-center justify-center',
          '[&>svg]:w-4 [&>svg]:h-4',
          destructive ? 'text-[#d52c1f]' : 'text-text-meta',
        )}
      >
        {icon}
      </span>
      <span className="flex-1">{label}</span>
    </RxDropdownMenu.Item>
  );
}

export const DROPDOWN_CONTENT_CLASSES = cn(
  'bg-white border border-card-border rounded-[8px] py-2 px-1',
  'shadow-[0_4px_3px_rgba(0,0,0,0.05),_0_2px_2px_rgba(0,0,0,0.1)]',
  'min-w-[160px] z-50',
);
