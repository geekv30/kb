// Anchored coach-mark card with a clean sky-500 ring + pulsing beacon
// on the target. No page dim — the rest of the UI reads at full opacity.
// The ring is a single 2px solid border (no glow halo) traced around
// the target's bounding rect with 8px of padding. The beacon sits on
// the target's top-right corner to draw peripheral attention.
// The coach-mark card lives above the ring with an arrow pointing at
// the target. The page underneath is interactive — users dismiss via
// X / Skip in the card.
//
// Positional morph (ring + beacon + coach-mark sliding between steps)
// is driven by Framer Motion springs — interruptible, physics-based,
// and snappier than CSS cubic-bezier under load. The beacon's pulse
// keyframes + button press feedback stay on CSS (per emil-design-eng:
// CSS animations run off main thread, ideal for predetermined motion).

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, useReducedMotion as useFramerReducedMotion } from 'framer-motion';
import { ChevronLeft, X } from '@untitledui/icons';
import { Button } from '../../primitives/Button';
import { cn } from '../../../utils/cn';
import { useReducedMotion } from './useReducedMotion';

const COACHMARK_GAP = 16;
const COACH_MARK_WIDTH = 360; // ~max-w-sm
const COACH_MARK_EST_HEIGHT = 180;

/* Ring around the target. */
const RING_Z_INDEX = 8500;
const RING_PADDING = 8; // px outside the target's bounding rect
const RING_COLOR = '#0ea5e9'; // sky-500

/* Beacon — pulsing dot anchored to the target's top-right corner,
 * layered ABOVE the ring. Reads as a "badge" hovering half-on/half-off
 * the target. Two staggered pulse rings sit behind the solid core. */
const BEACON_Z_INDEX = 8502; // above ring (8500)
const BEACON_DIAMETER = 14;
const BEACON_COLOR = '#0ea5e9'; // sky-500 (matches the ring)
const BEACON_PULSE_DURATION_MS = 1800;
/* Half the duration so the two rings interlock perfectly (one
 * starting just as the other reaches the half-way fade-out point).
 * Previously 1200ms left a visible ~600ms gap each cycle where
 * neither ring was expanding — the rhythm felt staggered then
 * paused, instead of continuous. */
const BEACON_PULSE_DELAY_MS = 900;
/* Floor for the beacon's Y anchor — keeps the 14px dot fully visible
 * when the target extends to / above the viewport top (e.g. file
 * explorer column). 20px gives ~13px of headroom above the dot's
 * top edge (dot is centred via translate(-50%, -50%)). */
const BEACON_SAFE_TOP = 20;

/* Spring config for the step-to-step position morph (ring + beacon +
 * coach-mark). Apple-style { duration, bounce } per the skill:
 *   - duration 0.32 keeps total swap well under the 300ms UI ceiling
 *     while still letting the spring "land" naturally.
 *   - bounce 0.15 — barely perceptible; this is a wayfinding overlay,
 *     not a playful demo. The morph should feel decisive, not springy.
 * Springs (vs cubic-bezier) win here because welcome-tour swaps can be
 * interrupted by rapid Next clicks — springs maintain velocity through
 * retargets, cubic-bezier restarts. */
const SPRING_MORPH = { type: 'spring' as const, duration: 0.32, bounce: 0.15 };

/* Opacity fades are duration-based (springs on opacity look weird —
 * they overshoot 1.0). Asymmetric in/out per the skill's "exits
 * faster than entrances" rule. */
const FADE_IN_DUR_S = 0.2;
const FADE_OUT_DUR_S = 0.12;
/* Strong ease-out from easings.dev — replaces bare `ease-out` for
 * opacity transitions. Bare ease-out lacks the punch that makes
 * fades feel intentional; this curve front-loads the animation so
 * the ring registers immediately on mount. */
const STRONG_EASE_OUT = [0.23, 1, 0.32, 1] as const;

/* Coach-mark slide-in offset (X axis, since the card is anchored
 * left/right of the target). 8px nudges from the side OPPOSITE the
 * card's anchor — "this card is attaching to that target". */
const COACH_SLIDE_OFFSET = 8;

export type SpotlightRect = {
  /** Target's bounding rect (raw). */
  top: number;
  left: number;
  width: number;
  height: number;
};

export type CoachMarkContent = {
  title: string;
  body: React.ReactNode;
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
  /** When true, the ring + beacon use the spring-driven position
   *  morph so changing `rect` glides them across the page (used for
   *  same-pathname step swaps). When false, they snap to new
   *  positions instantly (cross-route swaps) so the fade-in pops at
   *  the new location instead of smearing from the old one. */
  slideMode: boolean;
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
  slideMode,
  onNext,
  onBack,
  onSkip,
}: SpotlightProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  /* Pulse-keyframe gate (CSS animation) uses the hand-rolled hook —
   * keeping CSS and JS reduce-motion logic on the same boolean. */
  const prefersReducedMotion = useReducedMotion();
  /* Framer's hook drives transform-vs-opacity branching for the
   * position morph. Same media query, just framer-aware so any
   * future Framer features (e.g. layout animations) auto-suppress. */
  const framerReduceMotion = useFramerReducedMotion() ?? false;

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

  /* No DOM mutation on the target — the ring is a separate
   * fixed-position overlay positioned against the target's bounding
   * rect. targetNode + targetNeedsBackgroundFill are intentionally
   * unused now but kept in the prop type to avoid churn in the
   * parent overlay's call site.
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

  /* ── Position-morph transition selector ──────────────────────
   * Three transition modes feed the same animate target:
   *   - same-pathname slide → spring morph
   *   - cross-route swap (slideMode === false) → instant snap
   *     (duration 0). The overlay's measure-then-fade-in pattern
   *     handles the perceived continuity at the orchestration
   *     level; the ring/beacon must NOT animate position while
   *     they're invisible — otherwise the next visible frame
   *     shows them mid-travel.
   *   - reduced motion → instant snap, even for same-pathname.
   *     The opacity transition still plays so the surface doesn't
   *     teleport silently — per the skill's "suppress movement,
   *     not all motion" guidance.
   */
  const positionTransition =
    framerReduceMotion || !slideMode ? { duration: 0 } : SPRING_MORPH;

  /* Opacity uses the same asymmetric in/out timing the prior CSS
   * implementation used: slower in (deliberate landing), faster
   * out (snappy dismiss). Framer's `transition` objects support
   * per-key overrides via the property name. */
  const opacityTransition = {
    duration: phase === 'in' ? FADE_IN_DUR_S : FADE_OUT_DUR_S,
    ease: STRONG_EASE_OUT,
  };

  /* ── Ring overlay — anchored to the target's bounding rect ──── */

  const ringVisible = phase === 'in' && rect !== null;

  /* Static style (non-animated props). Position values flow through
   * `animate` so Framer can spring them. */
  const ringStaticStyle: CSSProperties = {
    position: 'fixed',
    border: `2px solid ${RING_COLOR}`,
    borderRadius: 12,
    pointerEvents: 'none',
    zIndex: RING_Z_INDEX,
    // Pre-allocate transform layer so the spring lands on a
    // compositor-promoted element from the very first frame. Per the
    // skill's hardware-acceleration caveat — even though we're not
    // using motion.div's `x`/`y` shortcuts, hinting the layer helps
    // when the route change is loading simultaneously.
    willChange: 'top, left, width, height, opacity',
  };

  const ring = rect ? (
    <motion.div
      aria-hidden="true"
      style={ringStaticStyle}
      // animate target reads the live rect every render — Framer
      // springs the delta on each commit. Position + size morph
      // together (size in lockstep so the ring "wraps" the new
      // target with the same single motion).
      animate={{
        top: rect.top - RING_PADDING,
        left: rect.left - RING_PADDING,
        width: rect.width + RING_PADDING * 2,
        height: rect.height + RING_PADDING * 2,
        opacity: ringVisible ? 1 : 0,
      }}
      transition={{
        top: positionTransition,
        left: positionTransition,
        width: positionTransition,
        height: positionTransition,
        opacity: opacityTransition,
      }}
    />
  ) : null;

  /* ── Beacon — pulsing dot anchored to the target's top-right ──── */

  // Anchor at the target's top-right corner. Offset by HALF the
  // beacon diameter so the dot straddles the corner (half outside,
  // half overlapping) — gives it the "badge" feel called for in the
  // brief, and the same anchor works equally well for tall columns
  // and small rail icons because it tracks the corner, not the centre.
  const beaconVisible = phase === 'in' && rect !== null;
  const beaconCx = rect ? rect.left + rect.width : 0;
  // Y anchoring rules:
  //   - Short targets (rail icons ~24-36px tall) — sit at the corner
  //     so the beacon reads as a "badge" hovering on the icon.
  //   - Tall targets (file explorer column, ~viewport height) —
  //     slip the beacon DOWN into the visible "head" area where the
  //     eye naturally lands while reading the column. Sitting at
  //     `rect.top` for a viewport-height column anchors the dot at
  //     the very top edge, far from where the user's attention is.
  // The new Y = `rect.top + min(rect.height / 2, 40)`, then clamped
  // to BEACON_SAFE_TOP so it never escapes the viewport when the
  // target starts above it. Short targets (≤80px) end up at
  // height/2 (close to the visual centre, still corner-like); tall
  // targets cap at +40px below the top edge (a comfortable
  // peripheral-vision distance from the column header).
  const beaconCy = rect
    ? Math.max(BEACON_SAFE_TOP, rect.top + Math.min(rect.height / 2, 40))
    : 0;

  const beaconWrapperStaticStyle: CSSProperties = {
    position: 'fixed',
    width: 0,
    height: 0,
    pointerEvents: 'none',
    zIndex: BEACON_Z_INDEX,
    willChange: 'top, left, opacity',
  };

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
  // These stay on CSS keyframes (predetermined infinite animation —
  // skill says CSS wins for off-main-thread animations like this).
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
        // Negative delay starts the second ring 900ms INTO its cycle
        // on the very first frame — instead of waiting 900ms before
        // the first emission. Combined with the 900ms = duration/2
        // interlock from finding #3, the two rings present a continuous
        // pulse rhythm from t=0 with no "leading silence".
        animationDelay: `-${BEACON_PULSE_DELAY_MS}ms`,
      };

  const beacon = rect ? (
    <motion.div
      aria-hidden="true"
      style={beaconWrapperStaticStyle}
      animate={{
        top: beaconCy,
        left: beaconCx,
        opacity: beaconVisible ? 1 : 0,
      }}
      transition={{
        top: positionTransition,
        left: positionTransition,
        opacity: opacityTransition,
      }}
    >
      <div style={beaconPulse1Style} />
      <div style={beaconPulse2Style} />
      <div style={beaconCoreStyle} />
    </motion.div>
  ) : null;

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

  // Whether the card sits to the right of the target — used by both
  // the slide-in direction (below) and the pointer arrow placement
  // (further down). Hoisted here so the coach-mark style can read it.
  const cardIsRightOfTarget = rect ? coachLeft > rect.left : true;

  /* Slide-in direction depends on coach-mark placement relative to
   * the target. The 8px lead-in nudges the card from the side
   * OPPOSITE its anchor, so the motion implies "this content is
   * attaching to that target" rather than a generic Y-axis slide.
   * Under reduced motion, drop the X offset entirely — opacity-only
   * fade per the skill's "suppress movement, not all motion" rule.
   */
  const slideOffset =
    framerReduceMotion || phase === 'in'
      ? 0
      : cardIsRightOfTarget
        ? -COACH_SLIDE_OFFSET
        : COACH_SLIDE_OFFSET;

  /* Build the transform string explicitly (per skill's hardware
   * acceleration caveat — full `transform` string is compositor-
   * promoted; Framer's `x`/`y` shortcuts run on rAF main thread
   * and can drop frames during a route change). */
  const coachTransform = `translate3d(${coachLeft + slideOffset}px, ${coachTop}px, 0)`;

  const coachMarkStaticStyle: CSSProperties = rect
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: COACH_MARK_WIDTH,
        // Above the ring (8500) so the user can always click footer
        // buttons even when the card overlaps the ring's bounds.
        zIndex: 8501,
        willChange: 'transform, opacity',
      }
    : { display: 'none' };

  /* ── Pointer arrow — anchored to the side facing the target ────── */

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
    // Wrapper is pointer-events:none so the page underneath stays
    // interactive by default. Only the coach-mark card opts back in
    // via pointer-events-auto. No dim — ring + beacon are the only cues.
    <div className="pointer-events-none fixed inset-0 z-[8500]">
      {ring}
      {beacon}

      {/* Coach-mark card — floats next to the target. */}
      {rect && (
        <motion.div
          ref={cardRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby={`spotlight-title-${coachMark.stepIndex}`}
          aria-describedby={`spotlight-body-${coachMark.stepIndex}`}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          style={coachMarkStaticStyle}
          // Full `transform` string per skill's hardware-acceleration
          // caveat — `x`/`y` shortcuts run on rAF main thread and
          // drop frames when the browser is busy (welcome tour
          // routes change mid-animation, so this matters).
          animate={{
            transform: coachTransform,
            opacity: phase === 'in' ? 1 : 0,
          }}
          transition={{
            transform: positionTransition,
            opacity: opacityTransition,
          }}
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
            // `transition` (not `transition-colors`) so the press-scale
            // transform animates too. 160ms strong ease-out matches Emil
            // Kowalski's button-feedback rule. active:scale-[0.97] gives
            // the instant "the UI heard me" feedback the raw <button>
            // was missing.
            style={{ transition: 'background-color 160ms ease, color 160ms ease, transform 160ms cubic-bezier(0.23, 1, 0.32, 1)' }}
            className={cn(
              'absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-md',
              'text-slate-400 hover:bg-slate-100 hover:text-slate-700',
              'active:scale-[0.97]',
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
        </motion.div>
      )}
    </div>
  );
}
