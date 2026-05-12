// Phase 7.5.8 — Keyboard shortcut cheat sheet overlay. Chrome (overlay,
// focus trap, animation, a11y title) is now provided by kb-ui's `Modal`
// primitive; this component owns only the catalogue + custom-event wiring
// that bridges `useGlobalShortcuts` into open/close state.

import { Modal } from '@test-kb-ui/kb-ui';
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
    <Modal
      open={open}
      onOpenChange={setOpen}
      width={480}
      title="Keyboard shortcuts"
      titleTrailing={
        <button
          type="button"
          aria-label="Close shortcuts"
          onClick={() => setOpen(false)}
          className={cn(
            'shrink-0 rounded-[4px] p-1 text-text-muted',
            'hover:bg-surface-muted hover:text-text-primary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
          )}
        >
          <XClose aria-hidden="true" className="h-4 w-4" />
        </button>
      }
    >
      <p className="text-[13px] leading-5 text-text-muted">
        Speed up common actions. Press <Kbd>?</Kbd> any time to reopen this sheet.
      </p>

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
    </Modal>
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
