// Phase 7.5.8 — App-wide keyboard shortcuts (TRD §8.5).
//
// Currently registers two global bindings — additional shortcuts (Cmd+S,
// Cmd+Enter) live closer to the routes that own them, so they don't
// fire on the wrong page:
//
//   `?`    → open the keyboard cheat sheet (when no input is focused)
//   `Esc`  → close the cheat sheet (when it is open)
//
// The bridge to `<ShortcutsCheatSheet />` is custom DOM events; that
// keeps the hook independent of any router subtree and the cheat
// sheet free to mount once at app root.

import { useEffect } from 'react';
import {
  SHORTCUT_CLOSE_EVENT,
  SHORTCUT_OPEN_EVENT,
} from '../components/ShortcutsCheatSheet';

function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return true;
  if (el.isContentEditable) return true;
  return false;
}

export function useGlobalShortcuts(): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore modifier-prefixed presses — those belong to Cmd+S etc.
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // `?` opens the cheat sheet (Shift+/ on US layouts). Skip when an
      // input is focused so users typing a literal `?` aren't hijacked.
      if (e.key === '?' && !isEditableTarget(e.target)) {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent(SHORTCUT_OPEN_EVENT));
        return;
      }

      // Esc dismisses the cheat sheet. We dispatch unconditionally —
      // the listener inside `ShortcutsCheatSheet` is a no-op when the
      // sheet is already closed. Other Esc handlers (Radix dialogs,
      // sources sheet) still get the event since we don't preventDefault.
      if (e.key === 'Escape') {
        document.dispatchEvent(new CustomEvent(SHORTCUT_CLOSE_EVENT));
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
