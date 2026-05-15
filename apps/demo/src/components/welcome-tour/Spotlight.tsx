// Anchored coach-mark card with a visible sky-500 ring on the target.
//
// v6 redesign:
//   - Uniform page-wide dim at rgba(15, 23, 42, 0.40) covering the
//     entire viewport, including the target.
//   - A separate fixed-position ring overlay sits above the dim,
//     traced around the target's bounding rect with 8px of padding.
//     The ring uses sky-500 (#0ea5e9) — a high-contrast, recognizable
//     focus-indicator color that reads cleanly over the slate dim.
//   - No DOM mutation on the target (no z-index lift, no inline-style
//     overrides). The target stays in its natural position.
//   - Coach-mark card lives above the ring (z-index 8501) with an
//     arrow pointing at the target.
//
// Three layered cues — dim + ring + arrow — make "look here"
// unambiguous on both large and small targets.

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ChevronLeft, X } from '@untitledui/icons';
import { Button } from '@test-kb-ui/kb-ui';
import { cn } from '../../lib/cn';
import { useReducedMotion } from './useReducedMotion';

const COACHMARK_GAP = 16;
const COACH_MARK_WIDTH = 360; // ~max-w-sm
const COACH_MARK_EST_HEIGHT = 180;

/* Uniform page-wide dim. */
const DIM_COLOR = 'rgba(15, 23, 42, 0.40)';
const DIM_Z_INDEX = 8499; // just below the ring + coach-mark wrapper

/* Ring around the target — sits ABOVE the dim. */
const RING_Z_INDEX = 8500;
const RING_PADDING = 8; // px outside the target's bounding rect
const RING_COLOR = '#0ea5e9'; // sky-500
const RING_GLOW = 'rgba(14, 165, 233, 0.20)';
const RING_GLOW_OUTER = 'rgba(14, 165, 233, 0.25)';

/* Beacon — pulsing dot anchored to the target's top-right corner,
 * layered ABOVE the ring. Reads as a "badge" hovering half-on/half-off
 * the target. Two staggered pulse rings sit behind the solid core. */
const BEACON_Z_INDEX = 8502; // above ring (8500), above dim (8499)
const BEACON_DIAMETER = 14;
const BEACON_COLOR = '#0ea5e9'; // sky-500 (matches the ring)
const BEACON_PULSE_DURATION_MS = 1800;
const BEACON_PULSE_DELAY_MS = 1200;

const FADE_IN_DUR = 240;
const FADE_IN_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

export type SpotlightRect = {
  /** Target's bounding rect (raw). */
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
  /** Legacy prop — kept for call-site compatibility, no longer used
   *  now that highlight is a ring overlay (no DOM mutation). */
  targetNode: HTMLElement | null;
  /** Legacy prop — kept for call-site compatibility, no longer used. */
  targetNeedsBackgroundFill: boolean;
  coachMark: CoachMarkContent;
  /** Fade phase driven by the parent overlay. */
  phase: 'in' | 'out';
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
};

export function Spotlight({
  rect,
  targetNode,
  targetNeedsBackgroundFill,
  coachMark,
  phase,
  onNext,
  onBack,
  onSkip,
}: SpotlightProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

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

  /* No DOM mutation on the target — the ring sits above the dim
   * via a separate fixed-position overlay, positioned against the
   * target's bounding rect. targetNode + targetNeedsBackgroundFill
   * are intentionally unused now but kept in the prop type to avoid
   * churn in the parent overlay's call site.
   */
  void targetNode;
  void targetNeedsBackgroundFill;

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

  /* ── Uniform page-wide dim ─────────────────────────────────── */

  const dimOpacity = phase === 'in' && rect !== null ? 1 : 0;
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
        zIndex: DIM_Z_INDEX,
      }}
    />
  );

  /* ── Ring overlay — sits ABOVE the dim, pointed at the target ── */

  const ringOpacity = phase === 'in' && rect !== null ? 1 : 0;
  const ringStyle: CSSProperties = rect
    ? {
        position: 'fixed',
        top: rect.top - RING_PADDING,
        left: rect.left - RING_PADDING,
        width: rect.width + RING_PADDING * 2,
        height: rect.height + RING_PADDING * 2,
        border: `2px solid ${RING_COLOR}`,
        borderRadius: 12,
        boxShadow: `0 0 0 4px ${RING_GLOW}, 0 0 24px 4px ${RING_GLOW_OUTER}`,
        pointerEvents: 'none',
        zIndex: RING_Z_INDEX,
        opacity: ringOpacity,
        transition: `opacity 200ms ease-out`,
      }
    : { display: 'none' };

  const ring = <div aria-hidden="true" style={ringStyle} />;

  /* ── Beacon — pulsing dot anchored to the target's top-right ──── */

  // Anchor at the target's top-right corner. Offset by HALF the
  // beacon diameter so the dot straddles the corner (half outside,
  // half overlapping) — gives it the "badge" feel called for in the
  // brief, and the same anchor works equally well for tall columns
  // and small rail icons because it tracks the corner, not the centre.
  const beaconOpacity = phase === 'in' && rect !== null ? 1 : 0;
  const beaconCx = rect ? rect.left + rect.width : 0;
  const beaconCy = rect ? rect.top : 0;

  const beaconWrapperStyle: CSSProperties = rect
    ? {
        position: 'fixed',
        top: beaconCy,
        left: beaconCx,
        width: 0,
        height: 0,
        pointerEvents: 'none',
        zIndex: BEACON_Z_INDEX,
        opacity: beaconOpacity,
        transition: `opacity 200ms ease-out`,
      }
    : { display: 'none' };

  // Solid core dot — centered on the wrapper's (0,0) anchor via
  // translate(-50%, -50%). Stays at scale 1, fully visible.
  const beaconCoreStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: BEACON_DIAMETER,
    height: BEACON_DIAMETER,
    borderRadius: '50%',
    backgroundColor: BEACON_COLOR,
    border: '2px solid #ffffff',
    transform: 'translate(-50%, -50%)',
    boxSizing: 'border-box',
  };

  // Pulse rings — same anchor as core. Animate scale + opacity only.
  // The translate(-50%, -50%) is included inside the keyframe's
  // transform so we don't lose centering when the scale changes.
  const beaconPulseBase: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: BEACON_DIAMETER,
    height: BEACON_DIAMETER,
    borderRadius: '50%',
    backgroundColor: BEACON_COLOR,
    transform: 'translate(-50%, -50%)',
    transformOrigin: 'center',
    opacity: 0, // animation drives opacity 0.6 → 0
  };

  const beaconPulse1Style: CSSProperties = prefersReducedMotion
    ? { display: 'none' }
    : {
        ...beaconPulseBase,
        animation: `welcome-beacon-pulse ${BEACON_PULSE_DURATION_MS}ms ease-out infinite`,
      };

  const beaconPulse2Style: CSSProperties = prefersReducedMotion
    ? { display: 'none' }
    : {
        ...beaconPulseBase,
        animation: `welcome-beacon-pulse ${BEACON_PULSE_DURATION_MS}ms ease-out infinite`,
        animationDelay: `${BEACON_PULSE_DELAY_MS}ms`,
      };

  const beacon = (
    <div aria-hidden="true" style={beaconWrapperStyle}>
      <div style={beaconPulse1Style} />
      <div style={beaconPulse2Style} />
      <div style={beaconCoreStyle} />
    </div>
  );

  /* ── Coach-mark card placement ───────────────────────────────── */

  // Anchored to the right of the target. Clamp top so it stays in the
  // viewport even when the target is near the top/bottom edges.
  let coachLeft = 0;
  let coachTop = 0;
  if (rect) {
    coachLeft = rect.left + rect.width + COACHMARK_GAP;
    const naturalTop =
      rect.top + rect.height / 2 - COACH_MARK_EST_HEIGHT / 2;
    const minTop = 16;
    const maxTop = viewport.h - COACH_MARK_EST_HEIGHT - 16;
    coachTop = Math.min(maxTop, Math.max(minTop, naturalTop));
    // If we'd overflow the right edge, flip to the left of the target.
    if (coachLeft + COACH_MARK_WIDTH > viewport.w - 16) {
      coachLeft = rect.left - COACH_MARK_WIDTH - COACHMARK_GAP;
    }
  }

  const coachOpacity = phase === 'in' ? 1 : 0;
  const coachTransform = `translate3d(${coachLeft}px, ${coachTop + (phase === 'in' ? 0 : 4)}px, 0)`;

  const coachMarkStyle: CSSProperties = rect
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: COACH_MARK_WIDTH,
        transform: coachTransform,
        opacity: coachOpacity,
        // Explicitly above the dim (8499) AND above the lifted target
        // (8500) so the user can always click footer buttons.
        zIndex: 8501,
        willChange: 'transform, opacity',
        transition: `opacity ${FADE_IN_DUR}ms ease-out, transform ${FADE_IN_DUR}ms ${FADE_IN_EASE}`,
      }
    : { display: 'none' };

  /* ── Pointer arrow — anchored to the side facing the target ────── */

  const cardIsRightOfTarget = rect ? coachLeft > rect.left : true;
  const arrowVerticalCenter = rect
    ? rect.top + rect.height / 2 - coachTop - 6
    : 0;
  // Clamp away from the rounded corners (12px radius — keep 12px+).
  const arrowTop = rect
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
      {beacon}

      {/* Coach-mark card — sits above the dim. */}
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
