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

/** Fade-out duration before we navigate + remeasure. */
const FADE_OUT_MS = 180;

/** Max retries when target isn't measurable yet (rAFs + spaced timers). */
const MEASURE_RETRY_DELAYS = [120, 280, 500, 800];

/** Total step count surfaced to the coach mark indicator. */
const TOTAL_STEPS = 3;

function isStepState(state: TourState): state is StepKey {
  return (
    state === 'step-explorer' ||
    state === 'step-ai' ||
    state === 'step-analytics'
  );
}

export function WelcomeTourOverlay() {
  const tour = useWelcomeTour();
  const navigate = useNavigate();
  const location = useLocation();

  /* The rect that the Spotlight should render against. */
  const [rect, setRect] = useState<SpotlightRect | null>(null);

  /* The DOM node we're lifting above the dim. The Spotlight applies
   * inline-style overrides to this node and restores them on cleanup. */
  const [targetNode, setTargetNode] = useState<HTMLElement | null>(null);

  /* Fade phase. 'in' = visible, 'out' = fading away. */
  const [phase, setPhase] = useState<'in' | 'out'>('in');

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
   * When tour.state changes:
   *   1. If new state is non-step (welcome / closed / done), update
   *      renderedStep immediately and clear rect.
   *   2. If new state is a step:
   *      a. If we have something currently rendered, fade out (180ms).
   *      b. Navigate to the new route.
   *      c. Wait 2x rAF so layout flushes, then measure (with retries).
   *      d. Set rect + flip phase to 'in' (fade in 240ms).
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
        const t = window.setTimeout(() => {
          if (cycle !== measureCycleRef.current) return;
          setRect(null);
          setTargetNode(null);
          setRenderedStep(nextState);
        }, 220);
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

    // Already rendering something? Fade it out first.
    const wasRenderingStep = isStepState(renderedStep);
    const fadeDelay = wasRenderingStep ? FADE_OUT_MS : 0;

    if (wasRenderingStep) {
      setPhase('out');
    }

    const timers: number[] = [];

    const tryMeasure = (): boolean => {
      if (cycle !== measureCycleRef.current) return true; // cancelled
      const node = tour.getTarget(targetId);
      if (node === null) return false;
      const r = node.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return false;
      // Force phase='out' before placing the new content. This ensures
      // the Spotlight's initial render uses opacity:0 so the next-tick
      // 'in' flip actually animates.
      setPhase('out');
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      setTargetNode(node);
      setRenderedStep(nextState);
      // Two rAFs: one to flush layout for the ring's initial transform,
      // one to flip opacity so the transition actually plays.
      requestAnimationFrame(() => {
        if (cycle !== measureCycleRef.current) return;
        requestAnimationFrame(() => {
          if (cycle !== measureCycleRef.current) return;
          setPhase('in');
        });
      });
      return true;
    };

    timers.push(
      window.setTimeout(() => {
        if (cycle !== measureCycleRef.current) return;
        // Navigate (no-op if already on the route).
        if (location.pathname !== targetPath) {
          navigate(targetPath);
        }
        // First attempt after 2 rAFs — gives React + router a chance
        // to commit the new route content.
        requestAnimationFrame(() => {
          if (cycle !== measureCycleRef.current) return;
          requestAnimationFrame(() => {
            if (cycle !== measureCycleRef.current) return;
            if (tryMeasure()) return;
            // Spaced retries for slower-mounting content.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour.state]);

  /* ── Window resize re-measure (debounced 150ms) ──────────── */

  useEffect(() => {
    if (!isStepState(renderedStep)) return;
    const targetId = STEP_TARGET[renderedStep];
    let timer: number | null = null;
    const handle = () => {
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const node = tour.getTarget(targetId);
        if (node === null) return;
        const r = node.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return;
        setRect({
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height,
        });
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
        onNext={tour.next}
        onBack={tour.back}
        onSkip={tour.skip}
      />
    );
  }

  return createPortal(content, document.body);
}
