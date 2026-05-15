// Ring overlay + anchored coach-mark card.
//
// v3 redesign:
//   - Uniform page-wide dim (Sentry/Navattic style) — NO cutout, NO mask.
//     The dim is `pointer-events: auto` so it blocks clicks on the
//     underlying UI. The coach-mark card is `pointer-events: auto` and
//     stops propagation so the user can interact with it.
//   - Target gets a confident slate-900 outline ring (2px) + a soft
//     inner white halo so it lifts off the dimmed page.
//   - Coach-mark card is wider (max-w-sm), p-5, with breathing-space
//     between title / body / footer.
//   - All footer buttons use kb-ui <Button> — no local 12px buttons.
//
// Transitions are explicit opacity + transform only — no width/height/
// top/left animations. Layout is via translate3d on transform so we
// stay GPU-composited. The overlay drives a fade-out → re-place →
// fade-in cycle on step change.

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ChevronLeft, X } from '@untitledui/icons';
import { Button } from '@test-kb-ui/kb-ui';
import { cn } from '../../lib/cn';

/* Ring chrome constants. */
const RING_PADDING = 8;
const RING_RADIUS = 12;
const RING_BORDER_COLOR = 'rgb(15, 23, 42)'; // slate-900
const RING_SHADOW = [
  // Inner white halo so the ring lifts off the dimmed page.
  'inset 0 0 0 4px rgba(255, 255, 255, 0.6)',
  // Subtle outer glow.
  '0 0 0 6px rgba(15, 23, 42, 0.08)',
  '0 12px 32px rgba(15, 23, 42, 0.18)',
].join(', ');
const COACHMARK_GAP = 16;
const COACH_MARK_WIDTH = 360; // ~max-w-sm
const COACH_MARK_EST_HEIGHT = 180;

/* Uniform page-wide dim. */
const DIM_COLOR = 'rgba(15, 23, 42, 0.28)';

const FADE_IN_DUR = 240;
const FADE_IN_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

export type SpotlightRect = {
  /** Target's bounding rect (raw, no padding applied). */
  top: number;
  left: number;
  width: number;
  height: number;
};

export type CoachMarkContent = {
  title: string;
  body: string;
  stepIndex: number; // 0-based — 0 = first step
  totalSteps: number;
  primaryLabel: string;
  /** When true, primary action is the terminal "Got it" — no step count. */
  primaryIsFinish: boolean;
};

export type SpotlightProps = {
  rect: SpotlightRect | null;
  coachMark: CoachMarkContent;
  /** Fade phase driven by the parent overlay. */
  phase: 'in' | 'out';
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
};

export function Spotlight({
  rect,
  coachMark,
  phase,
  onNext,
  onBack,
  onSkip,
}: SpotlightProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  /* The ring rect with padding applied. Null until first measure. */
  const padded =
    rect === null
      ? null
      : {
          top: rect.top - RING_PADDING,
          left: rect.left - RING_PADDING,
          width: rect.width + RING_PADDING * 2,
          height: rect.height + RING_PADDING * 2,
        };

  /* Viewport size — clamps coach-mark Y so it never overflows. */
  const [viewport, setViewport] = useState<{ w: number; h: number }>(() => ({
    w: typeof window === 'undefined' ? 1280 : window.innerWidth,
    h: typeof window === 'undefined' ? 800 : window.innerHeight,
  }));

  useEffect(() => {
    let timer: number | null = null;
    const handle = () => {
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setViewport({ w: window.innerWidth, h: window.innerHeight });
      }, 150);
    };
    window.addEventListener('resize', handle);
    return () => {
      window.removeEventListener('resize', handle);
      if (timer !== null) window.clearTimeout(timer);
    };
  }, []);

  /* Focus the primary CTA when the step (= card identity) changes. */
  useEffect(() => {
    const root = cardRef.current;
    if (root === null) return;
    const primary = root.querySelector<HTMLElement>(
      '[data-spotlight-primary="true"]',
    );
    primary?.focus();
  }, [coachMark.stepIndex]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;
    const root = cardRef.current;
    if (root === null) return;
    const focusables = root.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  /* ── Uniform page-wide dim (modal-style backdrop) ─────────────── */

  const dimOpacity = phase === 'in' && padded !== null ? 1 : 0;
  const dim = (
    <div
      aria-hidden="true"
      onClick={onSkip}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: DIM_COLOR,
        opacity: dimOpacity,
        transition: `opacity ${FADE_IN_DUR}ms ease-out`,
        pointerEvents: 'auto',
      }}
    />
  );

  /* ── Ring (single fixed div, sits over the target) ───────────── */

  // Use translate3d to stay GPU-composited. position: fixed at (0,0)
  // then transform to the actual location.
  const ringTranslate =
    padded === null
      ? null
      : `translate3d(${padded.left}px, ${padded.top}px, 0)`;

  const ringOpacity = phase === 'in' ? 1 : 0;
  const ringTransform =
    ringTranslate === null
      ? 'translate3d(0,0,0)'
      : `${ringTranslate} translateY(${phase === 'in' ? 0 : 4}px)`;

  const ring = padded ? (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: padded.width,
        height: padded.height,
        borderRadius: RING_RADIUS,
        border: `2px solid ${RING_BORDER_COLOR}`,
        boxShadow: RING_SHADOW,
        backgroundColor: 'transparent',
        pointerEvents: 'none',
        willChange: 'transform, opacity',
        transform: ringTransform,
        opacity: ringOpacity,
        transition: `opacity ${FADE_IN_DUR}ms ease-out, transform ${FADE_IN_DUR}ms ${FADE_IN_EASE}`,
      }}
    />
  ) : null;

  /* ── Coach-mark card placement ───────────────────────────────── */

  // Anchored to the right of the ring. Clamp top so it stays in the
  // viewport even when the ring is near the top/bottom edges.
  let coachLeft = 0;
  let coachTop = 0;
  if (padded) {
    coachLeft = padded.left + padded.width + COACHMARK_GAP;
    const naturalTop =
      padded.top + padded.height / 2 - COACH_MARK_EST_HEIGHT / 2;
    const minTop = 16;
    const maxTop = viewport.h - COACH_MARK_EST_HEIGHT - 16;
    coachTop = Math.min(maxTop, Math.max(minTop, naturalTop));
    // If we'd overflow the right edge, flip to the left of the ring.
    if (coachLeft + COACH_MARK_WIDTH > viewport.w - 16) {
      coachLeft = padded.left - COACH_MARK_WIDTH - COACHMARK_GAP;
    }
  }

  const coachOpacity = phase === 'in' ? 1 : 0;
  const coachTransform = `translate3d(${coachLeft}px, ${coachTop + (phase === 'in' ? 0 : 4)}px, 0)`;

  const coachMarkStyle: CSSProperties = padded
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: COACH_MARK_WIDTH,
        transform: coachTransform,
        opacity: coachOpacity,
        willChange: 'transform, opacity',
        transition: `opacity ${FADE_IN_DUR}ms ease-out, transform ${FADE_IN_DUR}ms ${FADE_IN_EASE}`,
      }
    : { display: 'none' };

  /* ── Pointer arrow — anchored to the side facing the ring ────── */

  // If the card is to the right of the ring, arrow points left from
  // the card's left edge. Otherwise (flipped), arrow points right from
  // the card's right edge.
  const cardIsRightOfTarget = padded
    ? coachLeft > padded.left
    : true;
  const arrowVerticalCenter = padded
    ? padded.top + padded.height / 2 - coachTop - 6
    : 0;
  // Clamp away from the rounded corners (12px radius — keep 12px+).
  const arrowTop = padded
    ? Math.max(12, Math.min(arrowVerticalCenter, COACH_MARK_EST_HEIGHT - 24))
    : 0;

  const arrowStyle: CSSProperties = cardIsRightOfTarget
    ? {
        position: 'absolute',
        top: arrowTop,
        left: -7,
        width: 0,
        height: 0,
        borderTop: '7px solid transparent',
        borderBottom: '7px solid transparent',
        borderRight: '7px solid #ffffff',
        filter: 'drop-shadow(-1px 0 0 rgba(15,23,42,0.06))',
      }
    : {
        position: 'absolute',
        top: arrowTop,
        right: -7,
        width: 0,
        height: 0,
        borderTop: '7px solid transparent',
        borderBottom: '7px solid transparent',
        borderLeft: '7px solid #ffffff',
        filter: 'drop-shadow(1px 0 0 rgba(15,23,42,0.06))',
      };

  /* ── Footer button labels ────────────────────────────────────── */

  const stepCountLabel = `${coachMark.stepIndex + 1}/${coachMark.totalSteps}`;
  const showBack = coachMark.stepIndex > 0;

  return (
    // Wrapper is pointer-events:none so the dim child can opt-in to
    // pointer-events:auto and we don't fight z-index on the rest of the page.
    <div className="pointer-events-none fixed inset-0 z-[8500]">
      {dim}
      {ring}

      {/* Coach-mark card. */}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby={`spotlight-title-${coachMark.stepIndex}`}
        aria-describedby={`spotlight-body-${coachMark.stepIndex}`}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        style={coachMarkStyle}
        className={cn(
          'pointer-events-auto max-w-sm rounded-xl border border-slate-200 bg-white p-5',
          'shadow-[0_20px_48px_-12px_rgba(15,23,42,0.18)]',
          'focus:outline-none',
        )}
      >
        {/* Pointer arrow toward the target. */}
        <div aria-hidden="true" style={arrowStyle} />

        {/* X close — top-right, acts as "Skip tour". */}
        <button
          type="button"
          aria-label="Skip tour"
          onClick={onSkip}
          className={cn(
            'absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-md',
            'text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300',
          )}
        >
          <X className="h-[18px] w-[18px]" />
        </button>

        <h3
          id={`spotlight-title-${coachMark.stepIndex}`}
          className="pr-7 text-[15px] font-semibold leading-5 text-slate-900"
        >
          {coachMark.title}
        </h3>

        <p
          id={`spotlight-body-${coachMark.stepIndex}`}
          className="mt-2 text-[13px] leading-[1.55] text-slate-600"
        >
          {coachMark.body}
        </p>

        {/* Single-row footer: Skip | Back · Next 1/3 */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={onSkip}>
            Skip
          </Button>
          <div className="flex items-center gap-2">
            {showBack && (
              <Button
                variant="ghost"
                onClick={onBack}
                icon={<ChevronLeft />}
              >
                Back
              </Button>
            )}
            <Button
              variant="primary"
              onClick={onNext}
              data-spotlight-primary="true"
            >
              {coachMark.primaryLabel}
              {!coachMark.primaryIsFinish && (
                <span className="ml-1.5 text-[12px] opacity-70">
                  {stepCountLabel}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
