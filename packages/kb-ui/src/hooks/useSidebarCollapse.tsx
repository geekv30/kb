// Owns user-toggleable sidebar collapse state for app shells that
// expose a collapse-the-sidebar affordance.
//
// Persisted to localStorage so the choice survives reloads. The
// localStorage key is supplied by the consuming app via the
// `storageKey` prop — there is intentionally no default, since apps
// must opt into where they persist (avoids cross-consumer key
// collisions when more than one product mounts the library).
//
// `useSidebarCollapse()` returns the context value, or `null` when no
// provider is mounted above. The null fallback is intentional — some
// layouts (e.g. the demo's `CollapsedShellLayout`) deliberately omit
// the provider and force `collapsed=true` directly. Consumers must
// handle the null case explicitly.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type SidebarCollapseContextValue = {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (next: boolean) => void;
};

export type SidebarCollapseProviderProps = {
  /**
   * localStorage key used to persist the collapsed state. Pass a
   * stable, app-namespaced key like `'my-app.sidebar.collapsed'`.
   * Required — no default, since apps must opt into where they persist.
   */
  storageKey: string;
  children: ReactNode;
};

const SidebarCollapseContext =
  createContext<SidebarCollapseContextValue | null>(null);

function readInitial(storageKey: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(storageKey) === 'true';
  } catch {
    return false;
  }
}

function persist(storageKey: string, next: boolean) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey, String(next));
  } catch {
    // localStorage may be unavailable (private browsing, quota) — non-fatal.
  }
}

export function SidebarCollapseProvider({
  storageKey,
  children,
}: SidebarCollapseProviderProps) {
  const [collapsed, setCollapsedState] = useState<boolean>(() =>
    readInitial(storageKey),
  );

  const setCollapsed = useCallback(
    (next: boolean) => {
      setCollapsedState(next);
      persist(storageKey, next);
    },
    [storageKey],
  );

  const toggle = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev;
      persist(storageKey, next);
      return next;
    });
  }, [storageKey]);

  const value = useMemo<SidebarCollapseContextValue>(
    () => ({ collapsed, toggle, setCollapsed }),
    [collapsed, toggle, setCollapsed],
  );

  return (
    <SidebarCollapseContext.Provider value={value}>
      {children}
    </SidebarCollapseContext.Provider>
  );
}

/**
 * Returns the context value, or `null` if no provider is mounted above
 * (e.g. layouts that force the sidebar collapsed without exposing a
 * toggle). Consumers must handle the null case explicitly.
 */
export function useSidebarCollapse(): SidebarCollapseContextValue | null {
  return useContext(SidebarCollapseContext);
}
