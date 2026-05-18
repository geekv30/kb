// Portal-rendered overlay that orchestrates the welcome tour.
//
// Driven entirely by the steps[] / welcome / completion config the
// consumer passed to <WelcomeTourProvider>. No hardcoded step ids,
// routes, or copy.
//
// v2 responsibilities:
//   - Portals to document.body so it's not clipped by the shell.
//   - Cross-fades between steps: when state changes, fades out the
//     current ring + coach mark (120ms), navigates (if the step has
//     a `route`), waits for the new target to be measurable (2x rAF
//     + spaced retries), then fades the new ring + card in at their
//     final positions (240ms).
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
  isActiveTourState,
  type TourState,
  type TourStep,
} from './WelcomeTourContext';
import { WelcomeCard } from './WelcomeCard';
import { CompletionCard } from './CompletionCard';
import { Spotlight, type SpotlightRect, type CoachMarkContent } from './Spotlight';
import { useReducedMotion } from './useReducedMotion';
import './welcome-tour-animations.css';

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

/**
 * Default spotlight rect computation — used when a step doesn't
 * provide its own `computeRect`. Returns the registered node's
 * bounding rect, or null if the node is detached / collapsed.
 */
function defaultComputeRect(node: HTMLElement): SpotlightRect | null {
  const r = node.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function computeRectForStep(
  step: TourStep,
  registeredNode: HTMLElement,
): SpotlightRect | null {
  if (typeof step.computeRect === 'function') {
    const rect = step.computeRect(registeredNode);
    if (rect !== null) return rect;
    // Fall through to default if the step's computeRect bailed out
    // (e.g. expected sub-elements missing) — better to show something
    // than nothing.
  }
  return defaultComputeRect(registeredNode);
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

  // Snapshot the step we're transitioning to. Hoisted out of the
  // effect so it's stable for the closure cycle below.
  const nextState = tour.state;
  const nextStep: TourStep | null =
    nextState.phase === 'step'
      ? (tour.steps[nextState.stepIndex] ?? null)
      : null;
  const stepTargetId: string | null = nextStep?.id ?? null;
  const stepRoute: string | null = nextStep?.route ?? null;

  useEffect(() => {
    const cycle = ++measureCycleRef.current;

    // Non-step states.
    if (nextState.phase !== 'step') {
      // If we were rendering a step and the user just finished/skipped
      // out (or earned the completion card), play one final fade-out
      // before unmounting. We do NOT update renderedStep yet — keeping
      // it on the prior step keeps the Spotlight mounted while
      // phase='out' drives the fade.
      const wasRenderingStep = renderedStep.phase === 'step';
      if (
        wasRenderingStep &&
        (nextState.phase === 'done' ||
          nextState.phase === 'closed' ||
          nextState.phase === 'completion')
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

    if (stepTargetId === null) {
      // Defensive — the phase says 'step' but the step is missing.
      return;
    }

    const wasRenderingStep = renderedStep.phase === 'step';
    const samePathname =
      stepRoute === null || location.pathname === stepRoute;
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
      const node = tour.getTarget(stepTargetId);
      if (node === null) return false;
      // We just confirmed the step exists (nextState.phase === 'step'),
      // so nextStep is non-null here.
      const step = nextStep as TourStep;
      const nextRect = computeRectForStep(step, node);
      if (nextRect === null) return false;
      applyMeasured(nextRect, node);
      return true;
    };

    timers.push(
      window.setTimeout(() => {
        if (cycle !== measureCycleRef.current) return;
        // Navigate (no-op if already on the route, or no route configured).
        if (stepRoute !== null && !samePathname) {
          navigate(stepRoute);
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
    // We intentionally exclude `location.pathname`, `renderedStep`, and
    // `nextStep` from deps — the cycle is driven by tour.state changes
    // only (nextState.phase + nextState.stepIndex). (reduceMotion is
    // also stable across a single tour run.)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextState.phase, nextState.stepIndex]);

  /* ── Window resize re-measure (debounced 150ms) ──────────── */

  useEffect(() => {
    if (renderedStep.phase !== 'step') return;
    const step = tour.steps[renderedStep.stepIndex];
    if (step === undefined) return;
    const stepId = step.id;
    let timer: number | null = null;
    const handle = () => {
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const node = tour.getTarget(stepId);
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

  const renderedStepData: TourStep | null =
    renderedStep.phase === 'step'
      ? (tour.steps[renderedStep.stepIndex] ?? null)
      : null;

  const coachMark: CoachMarkContent | null = renderedStepData
    ? (() => {
        const total = tour.totalSteps;
        const isLast = renderedStep.stepIndex === total - 1;
        return {
          title: renderedStepData.title,
          body: renderedStepData.body,
          stepIndex: renderedStep.stepIndex,
          totalSteps: total,
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
  if (renderedStep.phase === 'closed' || renderedStep.phase === 'done') {
    return null;
  }

  let content: React.ReactNode = null;

  if (renderedStep.phase === 'welcome') {
    content = (
      <WelcomeCard
        content={tour.welcome}
        onStart={tour.next}
        onSkip={tour.skip}
      />
    );
  } else if (renderedStep.phase === 'completion') {
    content = (
      <CompletionCard content={tour.completion} onDismiss={tour.next} />
    );
  } else if (coachMark && renderedStepData) {
    const targetNeedsBackgroundFill =
      renderedStepData.targetNeedsBackgroundFill ?? false;
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
