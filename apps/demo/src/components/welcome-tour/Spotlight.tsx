// Spotlight cutout + anchored coach-mark card.
//
// Visual technique:
//   - 4 fixed divs form a "frame" around the cutout (top/right/bottom/left
//     slabs of dim wash). This is more reliable than animating an SVG
//     mask attribute — width/height/top/left transition smoothly via
//     CSS.
//   - A separate "cutout border" div sits exactly where the cutout is
//     and carries the pulsing magenta glow. The cutout itself is
//     transparent — the underlying app shows through.
//   - The coach-mark card is positioned to the RIGHT of the cutout
//     for all current targets (rail items + explorer panel are on the
//     left half of the screen).
//
// The cutout rect is supplied by the parent overlay after it has
// measured the target's `getBoundingClientRect()`.

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, ChevronLeft, Check } from '@untitledui/icons';
import { Button } from '@test-kb-ui/kb-ui';
import { cn } from '../../lib/cn';
import { useReducedMotion } from './useReducedMotion';

/* Cutout chrome constants. */
const CUTOUT_PADDING = 12;
const CUTOUT_RADIUS = 16;
const DIM_COLOR = 'rgba(15, 23, 42, 0.55)';
const SMOOTH_CUBIC = 'cubic-bezier(0.16, 1, 0.3, 1)';
const COACHMARK_GAP = 16;

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
  /** When true, primary action shows the "got it" sparkle-check finale. */
  primaryIsFinish: boolean;
};

export type SpotlightProps = {
  rect: SpotlightRect | null;
  coachMark: CoachMarkContent;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  /** True when the primary action's celebratory animation should play. */
  showFinishCelebration: boolean;
};

export function Spotlight({
  rect,
  coachMark,
  onNext,
  onBack,
  onSkip,
  showFinishCelebration,
}: SpotlightProps) {
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement | null>(null);

  /* The cutout rect with padding applied. Null until first measure. */
  const padded =
    rect === null
      ? null
      : {
          top: rect.top - CUTOUT_PADDING,
          left: rect.left - CUTOUT_PADDING,
          width: rect.width + CUTOUT_PADDING * 2,
          height: rect.height + CUTOUT_PADDING * 2,
        };

  /* Viewport size — used to clamp coach-mark Y so it never overflows. */
  const [viewport, setViewport] = useState<{ w: number; h: number }>(() => ({
    w: typeof window === 'undefined' ? 1280 : window.innerWidth,
    h: typeof window === 'undefined' ? 800 : window.innerHeight,
  }));

  useEffect(() => {
    const handle = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  /* Focus trap inside the coach-mark card. Re-bind whenever the step
   * (and therefore the card identity) changes. */
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

  /* ── Frame slabs (4 fixed divs that compose the dim wash) ────── */

  const TRANSITION_DUR = reduceMotion ? 100 : 400;
  const slabTransition = `top ${TRANSITION_DUR}ms ${SMOOTH_CUBIC}, left ${TRANSITION_DUR}ms ${SMOOTH_CUBIC}, width ${TRANSITION_DUR}ms ${SMOOTH_CUBIC}, height ${TRANSITION_DUR}ms ${SMOOTH_CUBIC}`;

  const slabStyle = (style: CSSProperties): CSSProperties => ({
    position: 'fixed',
    background: DIM_COLOR,
    transition: slabTransition,
    pointerEvents: 'auto',
    ...style,
  });

  // While we don't yet have a rect, render a single full-screen dim.
  const slabs = padded ? (
    <>
      {/* Top slab: 0 → cutout-top */}
      <div
        style={slabStyle({
          top: 0,
          left: 0,
          width: '100vw',
          height: Math.max(0, padded.top),
        })}
      />
      {/* Bottom slab: cutout-bottom → viewport-bottom */}
      <div
        style={slabStyle({
          top: padded.top + padded.height,
          left: 0,
          width: '100vw',
          height: Math.max(0, viewport.h - (padded.top + padded.height)),
        })}
      />
      {/* Left slab: 0 → cutout-left, bounded vertically by cutout */}
      <div
        style={slabStyle({
          top: padded.top,
          left: 0,
          width: Math.max(0, padded.left),
          height: padded.height,
        })}
      />
      {/* Right slab: cutout-right → viewport-right, bounded vertically */}
      <div
        style={slabStyle({
          top: padded.top,
          left: padded.left + padded.width,
          width: Math.max(0, viewport.w - (padded.left + padded.width)),
          height: padded.height,
        })}
      />
    </>
  ) : (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: DIM_COLOR,
      }}
    />
  );

  /* ── Cutout glow ring (the pulsing magenta) ──────────────────── */

  const cutoutRing = padded ? (
    <div
      style={{
        position: 'fixed',
        top: padded.top,
        left: padded.left,
        width: padded.width,
        height: padded.height,
        borderRadius: CUTOUT_RADIUS,
        transition: slabTransition,
        pointerEvents: 'none',
        boxShadow: reduceMotion
          ? '0 0 0 2px rgba(217, 47, 255, 0.35)'
          : undefined,
        animation: reduceMotion ? undefined : 'welcome-pulse 2s ease-out infinite',
      }}
    />
  ) : null;

  /* ── Coach-mark card placement ───────────────────────────────── */

  // The card is anchored to the RIGHT of the cutout. We compute its
  // top + left from the cutout rect; clamp top so the card stays in
  // the viewport even when the cutout is near the top/bottom.
  const COACH_MARK_WIDTH = 320;
  const COACH_MARK_EST_HEIGHT = 200; // approximate, only used for clamp

  let coachLeft = 0;
  let coachTop = 0;
  if (padded) {
    coachLeft = padded.left + padded.width + COACHMARK_GAP;
    const naturalTop = padded.top + padded.height / 2 - COACH_MARK_EST_HEIGHT / 2;
    const minTop = 16;
    const maxTop = viewport.h - COACH_MARK_EST_HEIGHT - 16;
    coachTop = Math.min(maxTop, Math.max(minTop, naturalTop));
  }

  const coachMarkDelay = reduceMotion ? 0 : 150;
  const coachMarkDuration = reduceMotion ? 100 : 350;

  const coachMarkStyle: CSSProperties = padded
    ? {
        position: 'fixed',
        top: coachTop,
        left: coachLeft,
        width: COACH_MARK_WIDTH,
        animation: `welcome-coachmark-in ${coachMarkDuration}ms ${SMOOTH_CUBIC} ${coachMarkDelay}ms both`,
      }
    : { display: 'none' };

  /* ── Pointer arrow that visually connects card → cutout ──────── */

  // Triangle pointing LEFT (toward the cutout). The card sits to the
  // right; we anchor the pointer to the left edge of the card and
  // center it vertically against the cutout, but clamp within the card.
  const arrowTop = padded
    ? Math.max(
        16,
        Math.min(
          // Cutout center relative to card top.
          padded.top + padded.height / 2 - coachTop - 6,
          COACH_MARK_EST_HEIGHT - 32,
        ),
      )
    : 0;

  return (
    <div className="pointer-events-none fixed inset-0 z-[8500]">
      {/* Dim wash + cutout (block clicks via pointer-events:auto on slabs). */}
      {slabs}
      {cutoutRing}

      {/* Coach-mark card. */}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`spotlight-title-${coachMark.stepIndex}`}
        aria-describedby={`spotlight-body-${coachMark.stepIndex}`}
        onKeyDown={handleKeyDown}
        style={coachMarkStyle}
        className={cn(
          'pointer-events-auto rounded-xl bg-white p-4 shadow-2xl',
          'focus:outline-none',
        )}
      >
        {/* Left-pointing arrow (CSS triangle), anchored to card's left edge. */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: arrowTop,
            left: -8,
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: '8px solid #ffffff',
            filter: 'drop-shadow(-1px 0 0 rgba(15,23,42,0.04))',
          }}
        />

        <h3
          id={`spotlight-title-${coachMark.stepIndex}`}
          className="text-[15px] font-semibold leading-5 text-text-primary"
        >
          {coachMark.title}
        </h3>

        <p
          id={`spotlight-body-${coachMark.stepIndex}`}
          className="mt-1.5 text-[13px] leading-[19px] text-slate-600"
        >
          {coachMark.body}
        </p>

        {/* Step indicator dots — sit between body and action row. */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {Array.from({ length: coachMark.totalSteps }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-colors',
                  i === coachMark.stepIndex
                    ? 'bg-[#D92FFF]'
                    : 'bg-slate-300',
                )}
              />
            ))}
          </div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            {coachMark.stepIndex + 1} of {coachMark.totalSteps}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <Button variant="ghost" onClick={onSkip}>
            Skip tour
          </Button>
          <div className="flex items-center gap-2">
            {coachMark.stepIndex > 0 && (
              <Button variant="ghost" onClick={onBack}>
                <ChevronLeft className="h-[14px] w-[14px]" />
                Back
              </Button>
            )}
            <Button
              variant="primary"
              onClick={onNext}
              data-spotlight-primary="true"
            >
              {showFinishCelebration ? (
                <span
                  className="inline-flex h-[14px] w-[14px] items-center justify-center"
                  aria-hidden="true"
                >
                  <Check
                    className="h-[14px] w-[14px]"
                    style={{
                      animation: reduceMotion
                        ? undefined
                        : `welcome-check-bounce 250ms ${SMOOTH_CUBIC} both`,
                    }}
                  />
                </span>
              ) : null}
              <span>{coachMark.primaryLabel}</span>
              {!coachMark.primaryIsFinish && (
                <ArrowRight className="h-[14px] w-[14px]" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
