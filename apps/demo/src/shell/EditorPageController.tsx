// Phase 7.5.5 — Coordination between the editor page and the
// breadcrumb's editor-variant action buttons.
//
// The breadcrumb is rendered by `CollapsedShellLayout`, not by the
// editor page itself. The page owns:
//   - the editor body + dirty flag
//   - the save / publish / close handlers (which mutate the store and
//     navigate)
//
// The breadcrumb owns the buttons that fire those handlers. We bridge
// the two with a tiny context: the page registers a handler set on
// mount; the breadcrumb reads it on render. When no editor page is
// mounted (any non-editor route) the context returns `null` and the
// breadcrumb falls back to its previous AI-Gaps / placeholder logic.

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type EditorPageControls = {
  saveDisabled: boolean;
  publishDisabled: boolean;
  onSaveAsDraft: () => void;
  onPublish: () => void;
  onClose: () => void;
};

type Ctx = {
  controls: EditorPageControls | null;
  setControls: (controls: EditorPageControls | null) => void;
};

const EditorPageControllerContext = createContext<Ctx | null>(null);

export function EditorPageControllerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [controls, setControlsState] = useState<EditorPageControls | null>(
    null,
  );
  const setControls = useCallback((next: EditorPageControls | null) => {
    setControlsState(next);
  }, []);
  const value = useMemo<Ctx>(
    () => ({ controls, setControls }),
    [controls, setControls],
  );
  return (
    <EditorPageControllerContext.Provider value={value}>
      {children}
    </EditorPageControllerContext.Provider>
  );
}

/**
 * Read the current editor controls. Returns `null` when no editor page
 * is mounted — callers should fall back to their default handlers in
 * that case.
 */
export function useEditorPageControls(): EditorPageControls | null {
  const ctx = useContext(EditorPageControllerContext);
  return ctx?.controls ?? null;
}

/**
 * Page-side hook. Registers a controls object on mount and clears it
 * on unmount so the breadcrumb's editor-variant always reflects the
 * currently mounted page (or `null` if none).
 *
 * Pass a stable controls object (e.g. memoized via `useMemo`) to avoid
 * re-registering on every render. We use `useLayoutEffect` so the
 * controls register synchronously after mount — the breadcrumb's next
 * paint already sees the page's handlers.
 */
export function useRegisterEditorPageControls(
  controls: EditorPageControls,
): void {
  const ctx = useContext(EditorPageControllerContext);
  if (!ctx) {
    throw new Error(
      'useRegisterEditorPageControls must be used inside EditorPageControllerProvider',
    );
  }
  const { setControls } = ctx;
  useLayoutEffect(() => {
    setControls(controls);
    return () => setControls(null);
  }, [controls, setControls]);
}
