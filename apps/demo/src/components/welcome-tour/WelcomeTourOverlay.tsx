// Portal-rendered overlay that orchestrates the welcome tour.
//
// Responsibilities:
//   - Portals to document.body so it's not clipped by the shell.
//   - On each step-* state, navigates to the route for that step,
//     waits for the route content to settle, then resolves the
//     target rect via the provider's `getTarget(id)` lookup.
//   - Re-measures on window resize.
//   - Owns the "welcome card" (step 0) and the "spotlight" (step 1-3).
//   - Listens for Esc to skip the tour.
//   - Plays a brief sparkle-check finale animation on the last step's
//     primary CTA before transitioning to 'done'.

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useWelcomeTour,
  type TourState,
  type TourTargetId,
  isActiveTourState,
} from './WelcomeTourContext';
import { WelcomeCard } from './WelcomeCard';
import { Spotlight, type SpotlightRect, type CoachMarkContent } from './Spotlight';
import { DEFAULT_KB_CATEGORY_SLUG, routes } from '../../lib/routes';
import './welcome-tour-animations.css';

/* Step → target id mapping. */
const STEP_TARGET: Record<
  Exclude<TourState, 'closed' | 'welcome' | 'done'>,
  TourTargetId
> = {
  'step-explorer': 'sidebar-explorer',
  'step-ai': 'rail-ai',
  'step-analytics': 'rail-analytics',
};

/* Step → route path mapping. */
const STEP_ROUTE: Record<
  Exclude<TourState, 'closed' | 'welcome' | 'done'>,
  string
> = {
  'step-explorer': routes.kb.category(DEFAULT_KB_CATEGORY_SLUG),
  'step-ai': routes.aiOptimise.hub(),
  'step-analytics': routes.analytics.articlePerformance(),
};

/* Coach-mark content per step. */
const STEP_CONTENT: Record<
  Exclude<TourState, 'closed' | 'welcome' | 'done'>,
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

/** Delay (ms) after a navigation before we measure the target. */
const POST_NAV_SETTLE_MS = 250;

/** Total step count surfaced to the coach mark indicator. */
const TOTAL_STEPS = 3;

/** Delay before transitioning to 'done' so the sparkle-check can play. */
const FINISH_CELEBRATION_MS = 450;

type StepKey = Exclude<TourState, 'closed' | 'welcome' | 'done'>;

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
  const [rect, setRect] = useState<SpotlightRect | null>(null);
  const [celebratingFinish, setCelebratingFinish] = useState(false);
  const finishTimerRef = useRef<number | null>(null);

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

  /* ── Navigate to the right route when entering a step ────── */

  useEffect(() => {
    if (!isStepState(tour.state)) return;
    const targetPath = STEP_ROUTE[tour.state];
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
    // We intentionally leave `location.pathname` out of the deps —
    // we only want to fire navigation when the tour state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour.state]);

  /* ── Measure target rect ─────────────────────────────────── */

  // When we enter a step OR when the route content mounts, wait a beat
  // then resolve the target rect. Re-measure on resize.
  useEffect(() => {
    if (!isStepState(tour.state)) {
      setRect(null);
      return;
    }
    const targetId = STEP_TARGET[tour.state];

    let cancelled = false;

    const measure = () => {
      if (cancelled) return;
      const node = tour.getTarget(targetId);
      if (node === null) {
        // Target hasn't mounted yet — try again shortly.
        return;
      }
      const r = node.getBoundingClientRect();
      // Skip degenerate (collapsed) rects.
      if (r.width === 0 && r.height === 0) return;
      setRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      });
    };

    // Schedule a few retries spaced out — the route content + the
    // file explorer (which has its own internal layout) need a beat
    // to settle.
    const retries = [POST_NAV_SETTLE_MS, 500, 800, 1200];
    const timers = retries.map((delay) =>
      window.setTimeout(measure, delay),
    );

    const onResize = () => measure();
    window.addEventListener('resize', onResize);

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener('resize', onResize);
    };
  }, [tour.state, tour, location.pathname]);

  /* ── Finish celebration ──────────────────────────────────── */

  const handlePrimary = () => {
    if (tour.state === 'step-analytics') {
      // Play the sparkle-check, then call finish.
      setCelebratingFinish(true);
      if (finishTimerRef.current !== null) {
        window.clearTimeout(finishTimerRef.current);
      }
      finishTimerRef.current = window.setTimeout(() => {
        setCelebratingFinish(false);
        tour.finish();
        finishTimerRef.current = null;
      }, FINISH_CELEBRATION_MS);
    } else {
      tour.next();
    }
  };

  useEffect(() => {
    return () => {
      if (finishTimerRef.current !== null) {
        window.clearTimeout(finishTimerRef.current);
      }
    };
  }, []);

  /* ── Coach-mark content for the current step ─────────────── */

  const coachMark = useMemo<CoachMarkContent | null>(() => {
    if (!isStepState(tour.state)) return null;
    const base = STEP_CONTENT[tour.state];
    const isLast = base.stepIndex === TOTAL_STEPS - 1;
    return {
      title: base.title,
      body: base.body,
      stepIndex: base.stepIndex,
      totalSteps: TOTAL_STEPS,
      primaryLabel: isLast ? 'Got it' : 'Next',
      primaryIsFinish: isLast,
    };
  }, [tour.state]);

  /* ── Render via portal ───────────────────────────────────── */

  if (typeof document === 'undefined') return null;
  if (tour.state === 'closed' || tour.state === 'done') return null;

  let content: React.ReactNode = null;

  if (tour.state === 'welcome') {
    content = <WelcomeCard onStart={tour.next} onSkip={tour.skip} />;
  } else if (coachMark) {
    content = (
      <Spotlight
        rect={rect}
        coachMark={coachMark}
        onNext={handlePrimary}
        onBack={tour.back}
        onSkip={tour.skip}
        showFinishCelebration={celebratingFinish}
      />
    );
  }

  return createPortal(content, document.body);
}
