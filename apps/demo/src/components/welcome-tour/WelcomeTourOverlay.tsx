// Portal-rendered overlay that orchestrates the welcome tour.
//
// v2 responsibilities:
//   - Portals to document.body so it's not clipped by the shell.
//   - Cross-fades between steps: when state changes, fades out the
//     current ring + coach mark (180ms), navigates, waits for the new
//     target to be measurable (2x rAF), then fades the new ring + card
//     in at their final positions (240ms).
//   - Re-measures on debounced window resize (150ms) — no
//     ResizeObserver.
//   - No celebration. "Got it" just transitions to 'done' which fades
//     the overlay out (handled by the parent fade) and writes 'seen'.
//   - The welcome step keeps its own modal backdrop (it's an interrupt
//     modal — different surface from the in-page tour).

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useWelcomeTour,
  type TourState,
  type TourTargetId,
  isActiveTourState,
} from './WelcomeTourContext';
import { WelcomeCard } from './WelcomeCard';
import { CompletionCard } from './CompletionCard';
import { Spotlight, type SpotlightRect, type CoachMarkContent } from './Spotlight';
import { useReducedMotion } from './useReducedMotion';
import { DEFAULT_KB_CATEGORY_SLUG, routes } from '../../lib/routes';
import './welcome-tour-animations.css';

type StepKey = 'step-explorer' | 'step-ai' | 'step-analytics';

/* Step → target id mapping. */
const STEP_TARGET: Record<StepKey, TourTargetId> = {
  'step-explorer': 'sidebar-explorer',
  'step-ai': 'rail-ai',
  'step-analytics': 'rail-analytics',
};

/* Step → route path mapping. */
const STEP_ROUTE: Record<StepKey, string> = {
  'step-explorer': routes.kb.category(DEFAULT_KB_CATEGORY_SLUG),
  'step-ai': routes.aiOptimise.hub(),
  'step-analytics': routes.analytics.articlePerformance(),
};

/* Coach-mark content per step. */
const STEP_CONTENT: Record<
  StepKey,
  { title: string; body: string; stepIndex: number }
> = {
  'step-explorer': {
    title: 'Browse like files',
    body: 'Your articles and categories now live in a tree on the left. Click to open, drag to reorganize.',
    stepIndex: 0,
  },
  'step-ai': {
    title: 'AI Gaps & Suggestions',
    body: 'We surface missing or thin content based on real customer questions. Tackle the highest-impact gaps first.',
    stepIndex: 1,
  },
  'step-analytics': {
    title: 'Analytics for every article',
    body: 'See views, helpful votes, search performance, and how AI is using your content to answer tickets.',
    stepIndex: 2,
  },
};

/** Cross-route fade-out duration before we navigate + remeasure.
 *  Compressed from the previous 180ms (out) + 240ms (in) ≥ 400ms total
 *  to stay under Emil Kowalski's 300ms ceiling for UI animations. */
const FADE_OUT_MS = 120;

/** Reduced-motion path collapses the swap to a single short transition.
 *  Per `prefers-reduced-motion: reduce` — keep enough opacity change to
 *  avoid jarring instant teleports but drop the position travel. */
const REDUCED_MOTION_SWAP_MS = 60;

/** Max retries when target isn't measurable yet (rAFs + spaced timers).
 *  Shortened from [120, 280, 500, 800] so a slow-mounting target
 *  doesn't push the total step swap beyond 300ms. The 320ms tail still
 *  catches second-render targets without dragging the happy path. */
const MEASURE_RETRY_DELAYS = [80, 180, 320];

/** Total step count surfaced to the coach mark indicator. */
const TOTAL_STEPS = 3;

function isStepState(state: TourState): state is StepKey {
  return (
    state === 'step-explorer' ||
    state === 'step-ai' ||
    state === 'step-analytics'
  );
}

/**
 * Compute the spotlight rect for a given step. Most steps use the
 * registered target's full bounding rect — but `step-explorer`
 * unions the header + tree elements inside the FileExplorerNav so
 * the ring hugs the visible UI instead of the full-height aside.
 */
function computeRectForStep(
  step: StepKey,
  registeredNode: HTMLElement,
): SpotlightRect | null {
  if (step === 'step-explorer') {
    const header = registeredNode.querySelector<HTMLElement>(
      '[data-kb-part="explorer-header"]',
    );
    const body =
      registeredNode.querySelector<HTMLElement>(
        '[data-kb-part="explorer-tree"]',
      ) ??
      registeredNode.querySelector<HTMLElement>(
        '[data-kb-part="explorer-flat"]',
      );
    if (header !== null && body !== null) {
      const h = header.getBoundingClientRect();
      const b = body.getBoundingClientRect();
      const top = Math.min(h.top, b.top);
      const left = Math.min(h.left, b.left);
      const right = Math.max(h.right, b.right);
      const bottom = Math.max(h.bottom, b.bottom);
      if (right > left && bottom > top) {
        return { top, left, width: right - left, height: bottom - top };
      }
    }
    // Fall through to the registered node's full rect if either
    // sub-element is missing — better to show something than nothing.
  }
  const r = registeredNode.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export function WelcomeTourOverlay() {
  const tour = useWelcomeTour();
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  /* The rect that the Spotlight should render against. */
  const [rect, setRect] = useState<SpotlightRect | null>(null);

  /* The DOM node we're lifting above the dim. The Spotlight applies
   * inline-style overrides to this node and restores them on cleanup. */
  const [targetNode, setTargetNode] = useState<HTMLElement | null>(null);

  /* Fade phase. 'in' = visible, 'out' = fading away. */
  const [phase, setPhase] = useState<'in' | 'out'>('in');

  /* Whether the current step swap is in-place on the same pathname
   * (true → ring + beacon slide to new rect) or cross-route (false →
   * ring + beacon snap to new rect while invisible, then fade in).
   * Defaults to false because the very first step always pops in. */
  const [slideMode, setSlideMode] = useState<boolean>(false);

  /* The step we are currently rendering content for. May lag the
   * tour state by FADE_OUT_MS while we fade out then re-measure. On
   * the "Got it" → 'done' transition we hold this on the prior step
   * for ~220ms so the ring + coach mark can fade out cleanly. */
  const [renderedStep, setRenderedStep] = useState<TourState>(tour.state);

  /* Track whether a measure cycle is in flight so we can cancel
   * cleanly on rapid step changes. */
  const measureCycleRef = useRef<number>(0);

  /* ── Esc handler ─────────────────────────────────────────── */

  useEffect(() => {
    if (!isActiveTourState(tour.state)) return;
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        tour.skip();
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [tour]);

  /* ── Step change orchestration ──────────────────────────────
   *
   * Three transition modes — chosen to keep total swap ≤ 300ms per
   * Emil Kowalski's "UI animations stay under 300ms" rule:
   *
   *   1. SAME pathname → in-place slide. No opacity dip; rect + content
   *      update atomically, ring/beacon/coach-mark CSS transitions
   *      handle the position travel (250ms cubic-bezier).
   *   2. DIFFERENT pathname → cross-route fade. 120ms fade-out, then
   *      navigate + measure + content+rect commit, then 180ms fade-in.
   *      Total ≤ 300ms on the happy path. Measure retries shortened to
   *      [80, 180, 320] so slow-mounting targets don't drag past 300ms.
   *   3. REDUCED MOTION → 60ms swap, no position travel.
   *
   * Content guard: renderedStep (which drives coach-mark title/body)
   * is ONLY updated inside `applyMeasured()`, atomically with the new
   * rect. This guarantees the title/body never appears anchored to the
   * old rect — a flash the user would catch.
   */

  useEffect(() => {
    const cycle = ++measureCycleRef.current;
    const nextState = tour.state;

    // Non-step states.
    if (!isStepState(nextState)) {
      // If we were rendering a step and the user just finished/skipped
      // out (or earned the completion card), play one final fade-out
      // before unmounting. We do NOT update renderedStep yet — keeping
      // it on the prior step keeps the Spotlight mounted while
      // phase='out' drives the fade.
      const wasRenderingStep = isStepState(renderedStep);
      if (
        wasRenderingStep &&
        (nextState === 'done' ||
          nextState === 'closed' ||
          nextState === 'completion')
      ) {
        setPhase('out');
        // Tightened from 220ms to match the new compressed fade-out
        // window. Keeps the overlay teardown ≤ FADE_OUT_MS + buffer.
        const exitDelay = reduceMotion ? REDUCED_MOTION_SWAP_MS : FADE_OUT_MS + 20;
        const t = window.setTimeout(() => {
          if (cycle !== measureCycleRef.current) return;
          setRect(null);
          setTargetNode(null);
          setRenderedStep(nextState);
        }, exitDelay);
        return () => window.clearTimeout(t);
      }
      setRect(null);
      setTargetNode(null);
      setRenderedStep(nextState);
      setPhase('in');
      return;
    }

    const targetId = STEP_TARGET[nextState];
    const targetPath = STEP_ROUTE[nextState];

    const wasRenderingStep = isStepState(renderedStep);
    const samePathname = location.pathname === targetPath;
    // Same-pathname slide: skip fade-out, no opacity dip.
    // Cross-route swap: short fade-out (or 60ms in reduced-motion).
    const needsFadeOut = wasRenderingStep && !samePathname;
    const fadeDelay = needsFadeOut
      ? (reduceMotion ? REDUCED_MOTION_SWAP_MS : FADE_OUT_MS)
      : 0;

    if (needsFadeOut) {
      setPhase('out');
    }

    const timers: number[] = [];

    // Atomically commit the new rect + content. Content (renderedStep)
    // MUST update in the same React batch as the new rect so the
    // coach-mark title/body never appears anchored to the old rect.
    const applyMeasured = (
      nextRect: SpotlightRect,
      node: HTMLElement,
    ): void => {
      // slideMode is consulted by Spotlight to decide whether to
      // animate position transitions. Only true when we're swapping
      // in-place on the same pathname AND the prior step was already
      // mounted (first-mount always pops, never slides).
      setSlideMode(samePathname && wasRenderingStep);

      // Reduced-motion path — single atomic commit, no rAF dance, no
      // post-fade re-enable timer. The user has asked for less motion;
      // we honour that at the orchestration level by skipping the
      // staged opacity flip entirely. Child components already drop
      // their own transitions inside Spotlight/cards via
      // `useReducedMotion`, so the swap reads as an instant snap with
      // zero "phase out → phase in" choreography from the overlay.
      if (reduceMotion) {
        setRect(nextRect);
        setTargetNode(node);
        setRenderedStep(nextState);
        setPhase('in');
        return;
      }

      if (samePathname && wasRenderingStep) {
        // Same-pathname slide: keep phase='in' the whole way. The
        // ring/beacon's positional CSS transitions and the coach-mark's
        // transform transition do the in-place travel.
        setRect(nextRect);
        setTargetNode(node);
        setRenderedStep(nextState);
        setPhase('in');
        return;
      }
      // Cross-route swap (or first mount). Force phase='out' for the
      // initial commit so the Spotlight renders with opacity:0, then
      // flip to 'in' on the next paint to trigger the fade-in.
      setPhase('out');
      setRect(nextRect);
      setTargetNode(node);
      setRenderedStep(nextState);
      requestAnimationFrame(() => {
        if (cycle !== measureCycleRef.current) return;
        requestAnimationFrame(() => {
          if (cycle !== measureCycleRef.current) return;
          setPhase('in');
        });
      });
      // After the fade-in lands, re-enable positional transitions so
      // window resizes glide rather than snap. The fade-in is 200ms;
      // 240ms gives a small buffer past it.
      const reenableTimer = window.setTimeout(() => {
        if (cycle !== measureCycleRef.current) return;
        setSlideMode(true);
      }, 240);
      timers.push(reenableTimer);
    };

    const tryMeasure = (): boolean => {
      if (cycle !== measureCycleRef.current) return true; // cancelled
      const node = tour.getTarget(targetId);
      if (node === null) return false;
      const nextRect = computeRectForStep(nextState, node);
      if (nextRect === null) return false;
      applyMeasured(nextRect, node);
      return true;
    };

    timers.push(
      window.setTimeout(() => {
        if (cycle !== measureCycleRef.current) return;
        // Navigate (no-op if already on the route).
        if (!samePathname) {
          navigate(targetPath);
        }
        // Reduced-motion path skips the rAF dance + retry array
        // entirely. A single immediate measure attempt is enough —
        // if the target isn't ready, the next tour.state change will
        // re-trigger this whole effect. The retry array exists to
        // glide over slow-mounting React routes for users who CAN
        // see the fade-in, but those users have asked for less
        // motion, so we don't sit in a retry loop waiting for a
        // fade-in we're not going to show.
        if (reduceMotion) {
          tryMeasure();
          return;
        }
        // First attempt after 2 rAFs — gives React + router a chance
        // to commit the new route content.
        requestAnimationFrame(() => {
          if (cycle !== measureCycleRef.current) return;
          requestAnimationFrame(() => {
            if (cycle !== measureCycleRef.current) return;
            if (tryMeasure()) return;
            // Spaced retries for slower-mounting content. Shortened
            // tail keeps the worst-case swap ≤ 320ms + commit.
            MEASURE_RETRY_DELAYS.forEach((delay) => {
              timers.push(
                window.setTimeout(() => {
                  tryMeasure();
                }, delay),
              );
            });
          });
        });
      }, fadeDelay),
    );

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
    // We intentionally exclude `location.pathname` and `renderedStep`
    // from deps — the cycle is driven by tour.state changes only.
    // (reduceMotion is also stable across a single tour run.)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour.state]);

  /* ── Window resize re-measure (debounced 150ms) ──────────── */

  useEffect(() => {
    if (!isStepState(renderedStep)) return;
    const targetId = STEP_TARGET[renderedStep];
    const step = renderedStep;
    let timer: number | null = null;
    const handle = () => {
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const node = tour.getTarget(targetId);
        if (node === null) return;
        const nextRect = computeRectForStep(step, node);
        if (nextRect === null) return;
        setRect(nextRect);
      }, 150);
    };
    window.addEventListener('resize', handle);
    return () => {
      window.removeEventListener('resize', handle);
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [renderedStep, tour]);

  /* ── Build coach-mark content ────────────────────────────── */

  const coachMark: CoachMarkContent | null = isStepState(renderedStep)
    ? (() => {
        const base = STEP_CONTENT[renderedStep];
        const isLast = base.stepIndex === TOTAL_STEPS - 1;
        return {
          title: base.title,
          body: base.body,
          stepIndex: base.stepIndex,
          totalSteps: TOTAL_STEPS,
          primaryLabel: isLast ? 'Got it' : 'Next',
          primaryIsFinish: isLast,
        };
      })()
    : null;

  /* ── Render via portal ───────────────────────────────────── */

  if (typeof document === 'undefined') return null;

  // The visible state is renderedStep (which lags tour.state during
  // fade-out). This keeps the overlay mounted through the closing
  // fade after "Got it" / "Skip".
  if (renderedStep === 'closed' || renderedStep === 'done') return null;

  let content: React.ReactNode = null;

  if (renderedStep === 'welcome') {
    content = <WelcomeCard onStart={tour.next} onSkip={tour.skip} />;
  } else if (renderedStep === 'completion') {
    content = <CompletionCard onDismiss={tour.next} />;
  } else if (coachMark) {
    // Rail icon buttons (rail-ai, rail-analytics) have transparent
    // backgrounds — when we lift them above the dim, we need to paint
    // a white background underneath so they read cleanly. The sidebar
    // explorer is a full surface card and already has its own bg.
    const targetNeedsBackgroundFill =
      renderedStep === 'step-ai' || renderedStep === 'step-analytics';
    content = (
      <Spotlight
        rect={rect}
        targetNode={targetNode}
        targetNeedsBackgroundFill={targetNeedsBackgroundFill}
        coachMark={coachMark}
        phase={phase}
        slideMode={slideMode}
        onNext={tour.next}
        onBack={tour.back}
        onSkip={tour.skip}
      />
    );
  }

  return createPortal(content, document.body);
}
