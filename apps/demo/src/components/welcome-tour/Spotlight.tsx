// Anchored coach-mark card with z-index lift on the target.
//
// v4 redesign:
//   - NO ring. NO halo. NO outline on the target.
//   - Uniform page-wide dim at rgba(15, 23, 42, 0.40) at z-index 50.
//   - The target element is "lifted" above the dim via z-index 60 +
//     position: relative (saved/restored on the target's inline style).
//     For rail buttons (transparent background) we temporarily apply
//     a white background-color so the lift reads cleanly.
//   - The Navattic pattern: target stays bright, everything else dims.
//   - Coach-mark card lives at z-index 8500 (above the dim).
//
// Inline-style overrides on the target node are managed via a
// useEffect cleanup that restores the original inline values when the
// step changes or the component unmounts.

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ChevronLeft, X } from '@untitledui/icons';
import { Button } from '@test-kb-ui/kb-ui';
import { cn } from '../../lib/cn';

/* Lift padding (visual breathing-room around the target — not a ring). */
const COACHMARK_GAP = 16;
const COACH_MARK_WIDTH = 360; // ~max-w-sm
const COACH_MARK_EST_HEIGHT = 180;

/* Uniform page-wide dim — bumped from 0.28 → 0.40 so the contrast
 * between target and surroundings is decisive. */
const DIM_COLOR = 'rgba(15, 23, 42, 0.40)';
const DIM_Z_INDEX = 8499; // just below coach-mark wrapper
const TARGET_LIFT_Z_INDEX = 8500; // above the dim

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
  /** The DOM node we're lifting — passed in by the overlay so we can
   *  apply inline-style overrides and restore them on cleanup. */
  targetNode: HTMLElement | null;
  /** True when the target element has a transparent background and we
   *  need to paint a white background underneath the lift so it reads
   *  against the dim (rail icon buttons). */
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

  /* ── Z-INDEX LIFT — save + restore inline style on the target ──
   *
   * This is the Navattic pattern: don't ring the target, just lift it
   * above the dim. The target stays at full brightness while the dim
   * eats the rest of the page.
   *
   * We snapshot the inline `style.position`, `style.zIndex`, and (when
   * needed) `style.backgroundColor` before mutating, and restore them
   * on cleanup. We DO NOT touch computed style — only inline. If the
   * existing inline style already sets one of these values, we
   * preserve and restore that exact string.
   */
  useEffect(() => {
    if (targetNode === null || phase !== 'in') return;

    // Snapshot prior inline-style values so we can restore precisely.
    const prevPosition = targetNode.style.position;
    const prevZIndex = targetNode.style.zIndex;
    const prevBackground = targetNode.style.backgroundColor;

    // Apply lift. If the element already has `position` set inline,
    // we leave it alone; otherwise force `relative` so z-index applies.
    // (Static-positioned elements ignore z-index.)
    if (prevPosition === '') {
      targetNode.style.position = 'relative';
    }
    targetNode.style.zIndex = String(TARGET_LIFT_Z_INDEX);

    // For transparent targets (rail icon buttons), paint white behind
    // so we don't see the dim through the button.
    if (targetNeedsBackgroundFill && prevBackground === '') {
      targetNode.style.backgroundColor = '#ffffff';
    }

    return () => {
      targetNode.style.position = prevPosition;
      targetNode.style.zIndex = prevZIndex;
      if (targetNeedsBackgroundFill) {
        targetNode.style.backgroundColor = prevBackground;
      }
    };
  }, [targetNode, targetNeedsBackgroundFill, phase, coachMark.stepIndex]);

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
