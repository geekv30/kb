// Prototype — Welcome Tour state machine + target registry.
//
// Lives in apps/demo only. NOT part of kb-ui. This module is the
// orchestrator; visual chrome lives in `WelcomeTourOverlay`,
// `WelcomeCard`, `CompletionCard`, and `Spotlight`.
//
// Generalised over a steps[] array — the state machine has no
// hardcoded knowledge of step ids, copy, routes, or rect logic.
// Consumers pass in:
//   - `steps`: ordered list of TourStep, each with an `id` (registry
//     key), `title`, `body`, and optional route/computeRect/meta.
//   - `welcome`: intro card copy + optional feature chips.
//   - `completion`: gratification card copy + optional feature tiles.
//   - `storageKey`: app-namespaced localStorage key for "seen" tracking.
//   - `resetQueryParam`: query param that triggers a force-reset
//     (defaults to 'welcome').
//   - `autoShowDelayMs`: delay before auto-showing on first visit
//     (defaults to 700ms).
//
// State machine (now indexed by step number, not step name):
//   'closed' → 'welcome' → step 0 → step 1 → … → step N-1
//            → 'completion' → 'done'
//
// 'completion' is the gratification card — shown after the final
// step's "Got it". Skip from any step still jumps straight to 'done'
// (no completion card on skip — the user opted out, don't reward).
//
// Auto-show logic: on mount, if `localStorage.getItem(storageKey) !== 'seen'`
// (and no explicit reset via the configured query param), schedule a
// `autoShowDelayMs` timer that flips state to 'welcome'. The
// query-param reset clears the flag and forces the tour to run again.

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
import type { SpotlightRect } from './Spotlight';

/* ── Public types ─────────────────────────────────────────── */

export type TourStep = {
  /** Stable string id for this step. Used as the target registry key. */
  id: string;
  /** Card content rendered when this step is active. */
  title: string;
  body: ReactNode;
  /**
   * Optional custom rect computation. When provided, replaces the
   * default `getBoundingClientRect()` on the registered node — useful
   * for unions of header + body sub-elements, or any rect that
   * doesn't match the registered container's bounding box.
   */
  computeRect?: (node: HTMLElement) => SpotlightRect | null;
  /**
   * Optional flag — when true, the Spotlight will paint a white fill
   * behind the target while it sits above the dim. Pass-through to
   * the (currently unused) Spotlight prop — kept for future use.
   */
  targetNeedsBackgroundFill?: boolean;
  /** Optional opaque payload step cards may want (preview image, etc.). */
  meta?: Record<string, unknown>;
  /**
   * Called when this step becomes active (Provider transitions to
   * this index). Use this for app-side side effects like router
   * navigation, focus management, or analytics. Errors are swallowed
   * with a console.warn — never breaks the tour state machine.
   */
  onEnter?: () => void;
  /**
   * Called when leaving this step (next/back/skip/finish that exits
   * the step). Use for cleanup if needed. Errors are swallowed with
   * a console.warn — never breaks the tour state machine.
   */
  onLeave?: () => void;
};

export type WelcomeFeature = {
  id: string;
  title: string;
  body?: string;
  icon?: ReactNode;
};

export type WelcomeContent = {
  title: string;
  body: ReactNode;
  /** Primary CTA label. Defaults to 'Show me around'. */
  ctaLabel?: string;
  /** Skip-link label. Defaults to 'Skip'. */
  skipLabel?: string;
  /** Optional list of feature chips/highlights rendered on the welcome card. */
  features?: WelcomeFeature[];
};

export type CompletionContent = {
  title: string;
  body: ReactNode;
  /** Primary CTA label. Defaults to 'Got it'. */
  ctaLabel?: string;
  /** Optional feature list — mirrors WelcomeContent.features. */
  features?: WelcomeFeature[];
};

/* ── Internal state ───────────────────────────────────────── */

export type TourPhase = 'closed' | 'welcome' | 'step' | 'completion' | 'done';

export type TourState = {
  phase: TourPhase;
  /** 0-based step index. Only meaningful when phase === 'step'. */
  stepIndex: number;
};

/** True when the tour is currently rendered to the screen. */
export function isActiveTourState(state: TourState): boolean {
  return (
    state.phase === 'welcome' ||
    state.phase === 'step' ||
    state.phase === 'completion'
  );
}

type WelcomeTourContextValue = {
  state: TourState;
  /** Total number of steps (steps.length). */
  totalSteps: number;
  /** Current step — null unless `state.phase === 'step'`. */
  currentStep: TourStep | null;
  /** All steps, in order. */
  steps: ReadonlyArray<TourStep>;
  /** Intro card content. */
  welcome: WelcomeContent;
  /** Completion card content. */
  completion: CompletionContent;
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
  registerTarget: (id: string, node: HTMLElement | null) => void;
  getTarget: (id: string) => HTMLElement | null;
};

const WelcomeTourContext = createContext<WelcomeTourContextValue | null>(null);

const DEFAULT_RESET_QUERY_PARAM = 'welcome';
const DEFAULT_AUTO_SHOW_DELAY_MS = 700;

export type WelcomeTourProviderProps = {
  /** Ordered list of tour steps. Must be non-empty. */
  steps: TourStep[];
  /** Copy for the intro card. */
  welcome: WelcomeContent;
  /** Copy for the completion card. */
  completion: CompletionContent;
  /** localStorage key for "seen" tracking. Required — app-namespaced. */
  storageKey: string;
  /** Query param that triggers a reset of the seen flag. Defaults to 'welcome'. */
  resetQueryParam?: string;
  /** Delay before auto-showing the welcome card on first visit. Defaults to 700ms. */
  autoShowDelayMs?: number;
  children: ReactNode;
};

export function WelcomeTourProvider({
  steps,
  welcome,
  completion,
  storageKey,
  resetQueryParam = DEFAULT_RESET_QUERY_PARAM,
  autoShowDelayMs = DEFAULT_AUTO_SHOW_DELAY_MS,
  children,
}: WelcomeTourProviderProps) {
  if (steps.length === 0) {
    throw new Error('<WelcomeTourProvider> requires at least one step');
  }

  const [state, setState] = useState<TourState>({
    phase: 'closed',
    stepIndex: 0,
  });
  const targetsRef = useRef<Map<string, HTMLElement>>(new Map());
  const autoShowTimerRef = useRef<number | null>(null);

  // Keep the latest `steps` accessible inside callbacks without
  // adding it to every dep array (steps.length is what we read).
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  /* ── Target registry ──────────────────────────────────────── */

  const registerTarget = useCallback(
    (id: string, node: HTMLElement | null) => {
      const map = targetsRef.current;
      if (node === null) {
        map.delete(id);
      } else {
        map.set(id, node);
      }
    },
    [],
  );

  const getTarget = useCallback((id: string): HTMLElement | null => {
    return targetsRef.current.get(id) ?? null;
  }, []);

  /* ── Auto-show on mount ───────────────────────────────────── */

  useEffect(() => {
    // Check URL for `?<resetQueryParam>=1` reset flag.
    const searchParams = new URLSearchParams(window.location.search);
    const wantsReset = searchParams.get(resetQueryParam) === '1';

    if (wantsReset) {
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        // Storage may be unavailable (private mode); fall through.
      }
    }

    let seen = false;
    try {
      seen = window.localStorage.getItem(storageKey) === 'seen';
    } catch {
      // If storage is unavailable, treat as not-seen so the tour still
      // runs in private browsing — better UX than silently doing nothing.
    }

    if (seen) return;

    autoShowTimerRef.current = window.setTimeout(() => {
      setState((prev) =>
        prev.phase === 'closed'
          ? { phase: 'welcome', stepIndex: 0 }
          : prev,
      );
    }, autoShowDelayMs);

    return () => {
      if (autoShowTimerRef.current !== null) {
        window.clearTimeout(autoShowTimerRef.current);
        autoShowTimerRef.current = null;
      }
    };
  }, [storageKey, resetQueryParam, autoShowDelayMs]);

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

  /* ── Step lifecycle callbacks (onEnter / onLeave) ─────────── */
  //
  // Fires app-side effects when the active step changes. The previous
  // step's onLeave is invoked BEFORE the next step's onEnter so apps
  // can cleanly tear down focus traps, listeners, etc. before the next
  // setup runs. Errors thrown inside user callbacks are swallowed with
  // a console.warn — the tour state machine must never break because
  // of an unrelated app-side handler.
  //
  // The previous step ref tracks (phase, stepIndex) so we can detect
  // transitions OUT of a step (e.g. step→completion, step→done,
  // step→welcome via back-from-step-0) and still fire its onLeave.

  const prevStepRef = useRef<{ phase: TourPhase; stepIndex: number }>({
    phase: 'closed',
    stepIndex: 0,
  });

  useEffect(() => {
    const prev = prevStepRef.current;
    const cur = state;
    const stepsList = stepsRef.current;

    const safeCall = (label: string, fn: (() => void) | undefined) => {
      if (typeof fn !== 'function') return;
      try {
        fn();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(`[WelcomeTour] ${label} threw`, err);
      }
    };

    const wasOnStep = prev.phase === 'step';
    const isOnStep = cur.phase === 'step';
    const stepChanged = prev.stepIndex !== cur.stepIndex;

    // OUT-of-step transitions: leaving the previous step.
    // Covers: step→step (different index), step→welcome (back from 0),
    // step→completion, step→done (skip/finish), step→closed.
    if (wasOnStep && (!isOnStep || stepChanged)) {
      const leavingStep = stepsList[prev.stepIndex];
      safeCall(`step[${prev.stepIndex}].onLeave`, leavingStep?.onLeave);
    }

    // INTO-step transitions: entering a (new) step.
    // Covers: welcome→step 0, step→step (different index),
    // completion→step (back from completion), closed→step (start mid-flow).
    if (isOnStep && (!wasOnStep || stepChanged)) {
      const enteringStep = stepsList[cur.stepIndex];
      safeCall(`step[${cur.stepIndex}].onEnter`, enteringStep?.onEnter);
    }

    prevStepRef.current = { phase: cur.phase, stepIndex: cur.stepIndex };
  }, [state]);

  /* ── Transition helpers ───────────────────────────────────── */

  const markSeen = useCallback(() => {
    try {
      window.localStorage.setItem(storageKey, 'seen');
    } catch {
      // Ignore — see auto-show note above.
    }
  }, [storageKey]);

  const start = useCallback(() => {
    setState({ phase: 'welcome', stepIndex: 0 });
  }, []);

  const next = useCallback(() => {
    setState((prev) => {
      const total = stepsRef.current.length;
      switch (prev.phase) {
        case 'welcome':
          return { phase: 'step', stepIndex: 0 };
        case 'step': {
          const nextIndex = prev.stepIndex + 1;
          if (nextIndex < total) {
            return { phase: 'step', stepIndex: nextIndex };
          }
          return { phase: 'completion', stepIndex: prev.stepIndex };
        }
        case 'completion':
          markSeen();
          return { phase: 'done', stepIndex: prev.stepIndex };
        case 'closed':
        case 'done':
        default:
          return prev;
      }
    });
  }, [markSeen]);

  const back = useCallback(() => {
    setState((prev) => {
      const total = stepsRef.current.length;
      switch (prev.phase) {
        case 'step':
          if (prev.stepIndex === 0) {
            return { phase: 'welcome', stepIndex: 0 };
          }
          return { phase: 'step', stepIndex: prev.stepIndex - 1 };
        case 'completion':
          return { phase: 'step', stepIndex: total - 1 };
        // 'welcome' has no previous; 'closed'/'done' are terminal.
        case 'welcome':
        case 'closed':
        case 'done':
        default:
          return prev;
      }
    });
  }, []);

  const skip = useCallback(() => {
    markSeen();
    setState((prev) => ({ phase: 'done', stepIndex: prev.stepIndex }));
  }, [markSeen]);

  const finish = useCallback(() => {
    markSeen();
    setState((prev) => ({ phase: 'done', stepIndex: prev.stepIndex }));
  }, [markSeen]);

  const currentStep: TourStep | null =
    state.phase === 'step' ? (steps[state.stepIndex] ?? null) : null;

  const value = useMemo<WelcomeTourContextValue>(
    () => ({
      state,
      totalSteps: steps.length,
      currentStep,
      steps,
      welcome,
      completion,
      start,
      next,
      back,
      skip,
      finish,
      registerTarget,
      getTarget,
    }),
    [
      state,
      steps,
      currentStep,
      welcome,
      completion,
      start,
      next,
      back,
      skip,
      finish,
      registerTarget,
      getTarget,
    ],
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
  id: string,
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
