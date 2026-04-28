// Phase 7.5.8 — Focus management on route change.
//
// PRD §12.2 / TRD §8.3:
//   - On every navigation, focus moves to the page's primary `<h1>`
//     (or first focusable element if none).
//   - The Editor route override (caret in Tiptap body) is owned by
//     `EditorPage` itself — this hook deliberately steps aside when an
//     existing focus is already inside the editor.
//   - Modal close → focus restoration is handled by Radix Dialog
//     natively (we don't replicate it here).
//
// Mounted in both `ShellLayout` and `CollapsedShellLayout`.

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_SELECTOR = 'main h1';
const FOCUSABLE_FALLBACK =
  'main button, main [href], main input, main [tabindex]:not([tabindex="-1"])';

export function useFocusOnRouteChange(
  targetSelector: string = DEFAULT_SELECTOR,
): void {
  const { pathname } = useLocation();

  useEffect(() => {
    // Defer one frame so the route's children have rendered + their
    // own mount effects (e.g. Tiptap autofocus) had a chance to run.
    const handle = window.setTimeout(() => {
      // If something inside the editor already grabbed focus (Tiptap
      // does this on mount), don't steal it — moving focus out of the
      // editor would defeat the route's intent.
      const current = document.activeElement as HTMLElement | null;
      if (current && current.closest('.ProseMirror')) {
        return;
      }

      const heading = document.querySelector<HTMLElement>(targetSelector);
      if (heading) {
        if (!heading.hasAttribute('tabindex')) {
          heading.setAttribute('tabindex', '-1');
        }
        heading.focus({ preventScroll: true });
        return;
      }

      // Fallback: first focusable element inside main.
      const fallback =
        document.querySelector<HTMLElement>(FOCUSABLE_FALLBACK);
      fallback?.focus({ preventScroll: true });
    }, 0);

    return () => window.clearTimeout(handle);
  }, [pathname, targetSelector]);
}
