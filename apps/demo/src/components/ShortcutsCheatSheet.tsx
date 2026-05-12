// Phase 7.5.8 — Keyboard shortcut cheat sheet overlay.
//
// Spec (PRD §12.4):
//   - Press `?` (when no input is focused) to open.
//   - Esc closes it.
//   - Modal listing every shortcut, grouped by section, kbd-styled.
//
// Mounted once at app root (in `main.tsx`). Listens to the custom
// events dispatched by `useGlobalShortcuts` so the open/close lives
// outside any router subtree.

import * as Dialog from '@radix-ui/react-dialog';
import { XClose } from '@untitledui/icons';
import { useEffect, useState } from 'react';
import { cn } from '../lib/cn';

/* ─────────────────────────────────────────────────────────────
 * Custom events — bridge between `useGlobalShortcuts` and this
 * component without forcing them into the same React subtree.
 * ───────────────────────────────────────────────────────────── */

export const SHORTCUT_OPEN_EVENT = 'demo:open-shortcuts';
export const SHORTCUT_CLOSE_EVENT = 'demo:close-shortcuts';

/* ─────────────────────────────────────────────────────────────
 * Shortcut catalogue
 * ───────────────────────────────────────────────────────────── */

type Shortcut = { keys: string[]; label: string };
type ShortcutGroup = { title: string; items: Shortcut[] };

const groups: ShortcutGroup[] = [
  {
    title: 'Editor',
    items: [
      { keys: ['⌘', 'S'], label: 'Save draft' },
      { keys: ['⌘', '⏎'], label: 'Publish article' },
      { keys: ['Esc'], label: 'Close panel' },
    ],
  },
  {
    title: 'AI Gaps Review',
    items: [
      { keys: ['J'], label: 'Next suggestion' },
      { keys: ['↓'], label: 'Next suggestion' },
      { keys: ['K'], label: 'Previous suggestion' },
      { keys: ['↑'], label: 'Previous suggestion' },
      { keys: ['Y'], label: 'Accept suggestion' },
      { keys: ['⏎'], label: 'Accept suggestion' },
      { keys: ['N'], label: 'Reject suggestion' },
      { keys: ['Esc'], label: 'Close sources sheet' },
    ],
  },
  {
    title: 'Anywhere',
    items: [{ keys: ['?'], label: 'Show this cheat sheet' }],
  },
];

/* ─────────────────────────────────────────────────────────────
 * Component
 * ───────────────────────────────────────────────────────────── */

export function ShortcutsCheatSheet() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onClose = () => setOpen(false);
    document.addEventListener(SHORTCUT_OPEN_EVENT, onOpen);
    document.addEventListener(SHORTCUT_CLOSE_EVENT, onClose);
    return () => {
      document.removeEventListener(SHORTCUT_OPEN_EVENT, onOpen);
      document.removeEventListener(SHORTCUT_CLOSE_EVENT, onClose);
    };
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-[90] bg-text-primary/40',
            'animate-route-fade-in',
          )}
        />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[91] -translate-x-1/2 -translate-y-1/2',
            'w-[480px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-64px)] overflow-y-auto',
            'rounded-[8px] border border-card-border bg-white',
            'shadow-[0_24px_48px_rgba(15,23,42,0.20)]',
            'p-6 flex flex-col gap-5',
            'animate-toast-in',
            'focus:outline-none',
          )}
        >
          <header className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-[16px] font-semibold leading-6 text-text-primary">
                Keyboard shortcuts
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-[13px] leading-5 text-text-muted">
                Speed up common actions. Press{' '}
                <Kbd>?</Kbd> any time to reopen this sheet.
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Close shortcuts"
              className={cn(
                'shrink-0 rounded-[4px] p-1 text-text-muted',
                'hover:bg-surface-muted hover:text-text-primary',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
              )}
            >
              <XClose aria-hidden="true" className="h-4 w-4" />
            </Dialog.Close>
          </header>

          <div className="flex flex-col gap-5">
            {groups.map((group) => (
              <section
                key={group.title}
                aria-labelledby={`shortcut-group-${slug(group.title)}`}
              >
                <h3
                  id={`shortcut-group-${slug(group.title)}`}
                  className="text-[11px] font-semibold uppercase tracking-wide text-text-muted"
                >
                  {group.title}
                </h3>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {group.items.map((s, i) => (
                    <li
                      key={`${group.title}-${i}`}
                      className="flex items-center justify-between"
                    >
                      <span className="text-[14px] leading-5 text-text-primary">
                        {s.label}
                      </span>
                      <span className="flex items-center gap-1">
                        {s.keys.map((k, ki) => (
                          <Kbd key={ki}>{k}</Kbd>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Visual helper
 * ───────────────────────────────────────────────────────────── */

function Kbd({ children }: { children: React.ReactNode }) {
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
      )}
    >
      {children}
    </kbd>
  );
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
