// Phase 7.5.5 + 7.5.8 — Unsaved-changes guard for the editor.
//
// Two interception layers:
//   1. In-app navigation (rail clicks, breadcrumb segments, browser
//      back/forward inside the SPA) — `useBlocker` from React Router
//      6.26+. We render a styled `<ConfirmDialog />` when the blocker
//      enters the `'blocked'` state, then proceed/reset based on the
//      user's choice.
//   2. Tab close / refresh — `beforeunload` listener that requests the
//      browser's native "leave site?" confirmation. The browser's
//      message is non-customizable in modern browsers (per HTML spec)
//      so the message string is best-effort only.
//
// Activation toggles in lockstep with the page's dirty flag. When the
// page transitions from dirty → clean (e.g. after Save) the blocker
// returns to `'unblocked'` and `beforeunload` is detached, so a clean
// editor never prompts on navigate-away.
//
// Phase 7.5.8 swap: the previous version called `window.confirm` from
// inside an effect (synchronous, native browser dialog). The new
// version returns a React element so the page can render a focus-
// trapped, themed Radix dialog and have it inherit the kb-ui styling.

import { type ReactNode, useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { ConfirmDialog } from '../components/ConfirmDialog';

const DEFAULT_TITLE = 'Discard unsaved changes?';
const DEFAULT_MESSAGE =
  'You have unsaved changes. Leaving this page will discard them.';

export type UseUnsavedChangesGuardOptions = {
  /** When `true`, the guard is armed (will prompt on nav / unload). */
  isDirty: boolean;
  /**
   * Optional synchronous check — if supplied, the in-app blocker calls
   * this on every navigation attempt instead of reading `isDirty`.
   * Use to suppress the prompt during explicit dismiss flows where the
   * page-side handler already resolved the confirm and called
   * `navigate()` before React commits `setIsDirty(false)`.
   */
  isDirtyNow?: () => boolean;
  /** Heading shown in the confirm dialog. */
  title?: string;
  /** Body copy shown in the confirm dialog. */
  message?: string;
  /** Confirm button label. Defaults to 'Discard changes'. */
  confirmLabel?: string;
};

/**
 * Returns a React node that renders the confirm dialog when the blocker
 * is armed. The page must include this in its tree for the dialog to
 * appear — typically as `{guardElement}` immediately under the page root.
 */
export function useUnsavedChangesGuard({
  isDirty,
  isDirtyNow,
  title = DEFAULT_TITLE,
  message = DEFAULT_MESSAGE,
  confirmLabel = 'Discard changes',
}: UseUnsavedChangesGuardOptions): ReactNode {
  // ── In-app navigation blocker ──────────────────────────────────
  // Returning `true` blocks. Only block when dirty AND the path is
  // actually changing — clicking the same link should not prompt.
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    const dirty = isDirtyNow ? isDirtyNow() : isDirty;
    return dirty && currentLocation.pathname !== nextLocation.pathname;
  });

  // ── Tab close / refresh ────────────────────────────────────────
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Legacy browsers (<= Chrome 119, older Safari) require a
      // string assignment to `returnValue` for the prompt to fire.
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // Render the confirm dialog when the blocker is in `blocked` state.
  // We deliberately return ReactNode (not auto-render) so the caller
  // controls placement — important because the dialog uses Portal and
  // a missing render = no prompt.
  return (
    <ConfirmDialog
      open={blocker.state === 'blocked'}
      title={title}
      message={message}
      confirmLabel={confirmLabel}
      cancelLabel="Stay on page"
      confirmVariant="destructive"
      onConfirm={() => {
        if (blocker.state === 'blocked') blocker.proceed();
      }}
      onCancel={() => {
        if (blocker.state === 'blocked') blocker.reset();
      }}
    />
  );
}
