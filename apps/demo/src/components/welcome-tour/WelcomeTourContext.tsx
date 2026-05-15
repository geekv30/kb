// Prototype — Welcome Tour state machine + target registry.
//
// Lives in apps/demo only. NOT part of kb-ui. This module is the
// orchestrator; visual chrome lives in `WelcomeTourOverlay`,
// `WelcomeCard`, and `Spotlight`.
//
// State machine:
//   'closed' → 'welcome' → 'step-explorer' → 'step-ai' → 'step-analytics'
//            → 'completion' → 'done'
//
// 'completion' is the gratification card — shown after step-analytics's
// "Got it". Skip from any step still jumps straight to 'done' (no
// completion card on skip — the user opted out, don't reward).
//
// Auto-show logic: on mount, if `localStorage.getItem(STORAGE_KEY) !== 'seen'`
// (and no explicit reset via `?welcome=1`), schedule a 700ms timer that
// flips state to 'welcome'. The query-param reset clears the flag and
// forces the tour to run again.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { WelcomeTourOverlay } from './WelcomeTourOverlay';

export const STORAGE_KEY = 'hiver-kb-welcome-tour-v1';
export const RESET_QUERY_PARAM = 'welcome';

export type TourState =
  | 'closed'
  | 'welcome'
  | 'step-explorer'
  | 'step-ai'
  | 'step-analytics'
  | 'completion'
  | 'done';

export type TourTargetId =
  | 'sidebar-explorer'
  | 'rail-ai'
  | 'rail-analytics';

type WelcomeTourContextValue = {
  state: TourState;
  start: () => void;
  next: () => void;
  back: () => void;
  skip: () => void;
  finish: () => void;
  /**
   * Subscribed nodes — each step reads from this map to compute its
   * spotlight rect. Stored as Map<id, HTMLElement> in a ref so updates
   * don't trigger re-renders of every consumer; the overlay calls
   * `getTarget(id)` on demand inside its own effect.
   */
  registerTarget: (id: TourTargetId, node: HTMLElement | null) => void;
  getTarget: (id: TourTargetId) => HTMLElement | null;
};

const WelcomeTourContext = createContext<WelcomeTourContextValue | null>(null);

/** Next-step map for the linear flow. */
const NEXT_STATE: Record<TourState, TourState> = {
  closed: 'closed',
  welcome: 'step-explorer',
  'step-explorer': 'step-ai',
  'step-ai': 'step-analytics',
  'step-analytics': 'completion',
  completion: 'done',
  done: 'done',
};

/** Previous-step map. `welcome` has no previous; `completion`/`done` are terminal. */
const PREV_STATE: Record<TourState, TourState> = {
  closed: 'closed',
  welcome: 'welcome',
  'step-explorer': 'welcome',
  'step-ai': 'step-explorer',
  'step-analytics': 'step-ai',
  completion: 'completion',
  done: 'done',
};

/** Stable list of state values we treat as "tour is on screen". */
const ACTIVE_STATES: ReadonlySet<TourState> = new Set<TourState>([
  'welcome',
  'step-explorer',
  'step-ai',
  'step-analytics',
  'completion',
]);

export function isActiveTourState(state: TourState): boolean {
  return ACTIVE_STATES.has(state);
}

type ProviderProps = {
  children: ReactNode;
};

export function WelcomeTourProvider({ children }: ProviderProps) {
  const [state, setState] = useState<TourState>('closed');
  const targetsRef = useRef<Map<TourTargetId, HTMLElement>>(new Map());
  const autoShowTimerRef = useRef<number | null>(null);

  /* ── Target registry ──────────────────────────────────────── */

  const registerTarget = useCallback(
    (id: TourTargetId, node: HTMLElement | null) => {
      const map = targetsRef.current;
      if (node === null) {
        map.delete(id);
      } else {
        map.set(id, node);
      }
    },
    [],
  );

  const getTarget = useCallback((id: TourTargetId): HTMLElement | null => {
    return targetsRef.current.get(id) ?? null;
  }, []);

  /* ── Auto-show on mount ───────────────────────────────────── */

  useEffect(() => {
    // Check URL for ?welcome=1 reset flag.
    const searchParams = new URLSearchParams(window.location.search);
    const wantsReset = searchParams.get(RESET_QUERY_PARAM) === '1';

    if (wantsReset) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Storage may be unavailable (private mode); fall through.
      }
    }

    let seen = false;
    try {
      seen = window.localStorage.getItem(STORAGE_KEY) === 'seen';
    } catch {
      // If storage is unavailable, treat as not-seen so the tour still
      // runs in private browsing — better UX than silently doing nothing.
    }

    if (seen) return;

    autoShowTimerRef.current = window.setTimeout(() => {
      setState((prev) => (prev === 'closed' ? 'welcome' : prev));
    }, 700);

    return () => {
      if (autoShowTimerRef.current !== null) {
        window.clearTimeout(autoShowTimerRef.current);
        autoShowTimerRef.current = null;
      }
    };
  }, []);

  /* ── Body scroll lock while tour is on screen ─────────────── */

  useEffect(() => {
    const isOpen = isActiveTourState(state);
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [state]);

  /* ── Transition helpers ───────────────────────────────────── */

  const markSeen = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'seen');
    } catch {
      // Ignore — see auto-show note above.
    }
  }, []);

  const start = useCallback(() => {
    setState('welcome');
  }, []);

  const next = useCallback(() => {
    setState((prev) => {
      const target = NEXT_STATE[prev];
      if (target === 'done') {
        markSeen();
      }
      return target;
    });
  }, [markSeen]);

  const back = useCallback(() => {
    setState((prev) => PREV_STATE[prev]);
  }, []);

  const skip = useCallback(() => {
    markSeen();
    setState('done');
  }, [markSeen]);

  const finish = useCallback(() => {
    markSeen();
    setState('done');
  }, [markSeen]);

  const value = useMemo<WelcomeTourContextValue>(
    () => ({
      state,
      start,
      next,
      back,
      skip,
      finish,
      registerTarget,
      getTarget,
    }),
    [state, start, next, back, skip, finish, registerTarget, getTarget],
  );

  return (
    <WelcomeTourContext.Provider value={value}>
      {children}
      <WelcomeTourOverlay />
    </WelcomeTourContext.Provider>
  );
}

export function useWelcomeTour(): WelcomeTourContextValue {
  const ctx = useContext(WelcomeTourContext);
  if (ctx === null) {
    throw new Error(
      'useWelcomeTour must be used within a <WelcomeTourProvider>',
    );
  }
  return ctx;
}

/**
 * Ref-callback helper that registers a DOM node as a tour target.
 *
 * Usage:
 *   <div ref={useTourTarget('sidebar-explorer')}>...</div>
 *
 * Returns a `(node: HTMLElement | null) => void` ref callback.
 */
export function useTourTarget(
  id: TourTargetId,
): (node: HTMLElement | null) => void {
  const ctx = useContext(WelcomeTourContext);
  // Stable callback (ctx is stable too — registerTarget is memoized).
  return useCallback(
    (node: HTMLElement | null) => {
      ctx?.registerTarget(id, node);
    },
    [ctx, id],
  );
}
