// Phase 7.5.8 — Keyboard shortcut cheat sheet overlay.
//
// The library's `ShortcutsModal` owns the chrome (modal, header, Kbd
// rows). This wrapper holds the demo-specific bits:
//   - the shortcut catalog (Editor / AI Gaps / Anywhere)
//   - the custom-event bridge from `useGlobalShortcuts` to open/close
//   - the `?` intro line that references `<Kbd>` inline

import { Kbd, ShortcutsModal, type ShortcutGroup } from '@test-kb-ui/kb-ui';
import { useEffect, useState } from 'react';

/* ─────────────────────────────────────────────────────────────
 * Custom events — bridge between `useGlobalShortcuts` and this
 * component without forcing them into the same React subtree.
 * ───────────────────────────────────────────────────────────── */

export const SHORTCUT_OPEN_EVENT = 'demo:open-shortcuts';
export const SHORTCUT_CLOSE_EVENT = 'demo:close-shortcuts';

/* ─────────────────────────────────────────────────────────────
 * Shortcut catalog (demo-only content)
 * ───────────────────────────────────────────────────────────── */

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
    <ShortcutsModal
      open={open}
      onOpenChange={setOpen}
      groups={groups}
      intro={
        <>
          Speed up common actions. Press <Kbd>?</Kbd> any time to reopen this
          sheet.
        </>
      }
    />
  );
}
