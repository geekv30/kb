// Owns user-toggleable sidebar collapse state for ShellLayout routes.
// Persisted to localStorage so the choice survives reloads.
//
// Editor + AI Gaps routes use CollapsedShellLayout, which does NOT
// provide this context — that layout forces `sidebarCollapsed=true`
// on AppShell directly.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'kb-demo.sidebar.collapsed';

type SidebarCollapseContextValue = {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (next: boolean) => void;
};

const SidebarCollapseContext = createContext<SidebarCollapseContextValue | null>(null);

function readInitial(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function persist(next: boolean) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // localStorage may be unavailable (private browsing, quota) — non-fatal.
  }
}

export function SidebarCollapseProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsedState] = useState<boolean>(readInitial);

  const setCollapsed = useCallback((next: boolean) => {
    setCollapsedState(next);
    persist(next);
  }, []);

  const toggle = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev;
      persist(next);
      return next;
    });
  }, []);

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

/** Returns the context value, or `null` if no provider is mounted above (e.g. CollapsedShellLayout). */
export function useSidebarCollapse(): SidebarCollapseContextValue | null {
  return useContext(SidebarCollapseContext);
}
