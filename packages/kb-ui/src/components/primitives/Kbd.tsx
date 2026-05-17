// Kbd — inline keyboard-glyph chip.
//
// Display primitive that renders a single key (or modifier glyph) as a
// `<kbd>` element with the canonical kb-ui keyboard chip styling.
// Reused by `ShortcutsModal` for the cheat-sheet rows, and intended
// to be usable inline anywhere a keyboard key is mentioned in copy.

import * as React from 'react';
import { cn } from '../../utils/cn';

export type KbdProps = {
  /** The key glyph or label — usually a single character or short string. */
  children: React.ReactNode;
  /** Extra classes merged into the chip. */
  className?: string;
};

export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex h-6 min-w-[24px] items-center justify-center px-1.5',
        'rounded-[4px] border border-border-faint bg-surface-subtle',
        'text-[12px] font-medium leading-none text-text-primary',
        // Use system font for kbd so the on-platform mod symbols (⌘ ⏎)
        // render with their native glyph instead of the body font.
        'font-sans',
        'shadow-[inset_0_-1px_0_rgba(15,23,42,0.08)]',
        className,
      )}
    >
      {children}
    </kbd>
  );
}
