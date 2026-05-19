// PublishingIndicator — small "Publishing..." card centered over a dim
// backdrop, used during the simulated publish-latency window on the
// article editor. Mirrors the Modal centering pattern (grid wrapper +
// scale-only animation, no translate) to avoid the centering-drift the
// Modal recently fixed.
//
// Why a plain portal (not Radix Dialog):
//   The indicator has no interactive content — no buttons, no inputs,
//   no Esc-to-close behavior the user should reach. Wrapping it in
//   Dialog would add a focus trap with nothing to focus, plus an
//   aria-modal announcement that doesn't fit "transient progress."
//   `createPortal(node, document.body)` is enough.
//
// Motion (emil-design-eng skill validated):
//   - Reuses the existing `kb-modal-in/out` + `kb-backdrop-in/out`
//     keyframes so this indicator harmonizes with Modal (same easing,
//     same durations, same scale 0.96→1 + opacity).
//   - `motion-reduce` swaps to the `-reduced` keyframes (opacity-only,
//     100/80ms) so reduced-motion users still see a perceptible fade
//     instead of a hard pop (per Emil: "suppress movement, not all
//     motion").
//   - Spinner uses Tailwind's standard `animate-spin` (linear). It's an
//     indeterminate progress glyph — linear matches a continuous loop.

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';

export type PublishingIndicatorProps = {
  open: boolean;
  /** Label text. Defaults to 'Publishing...' */
  label?: string;
  /**
   * When true, render WITH a centered dim backdrop (portal mode).
   * When false, render the card only (no portal/backdrop) — useful
   * for Storybook decorators or embedded contexts.
   * Defaults to true.
   */
  withBackdrop?: boolean;
  className?: string;
};

/* ─────────────────────────────────────────────────────────────
 * Spinner — 14×14, 3/4-arc on a faint background ring.
 *
 * `currentColor` lets the parent control hue via Tailwind. We pin
 * it to text-primary at the card level so the spinner reads as a
 * UI glyph, not a brand element.
 * ───────────────────────────────────────────────────────────── */

function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className="animate-spin shrink-0"
    >
      <circle
        cx="7"
        cy="7"
        r="5.5"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="1.5"
      />
      <path
        d="M12.5 7a5.5 5.5 0 0 0-5.5-5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Card chrome — shared between portal + standalone modes so the
 * visual stays in lock-step.
 *
 * The card itself runs the modal-in/out animation when mounted via
 * the portal path (data-state driven by the open prop). In
 * standalone (withBackdrop=false) mode, we render the card without
 * the data-state attribute — the consumer owns presence.
 * ───────────────────────────────────────────────────────────── */

const cardBaseClass =
  // Visual chrome — white card, 8px radius, shadow-md, padded 16px,
  // horizontal flex with 8px gap and centered content.
  'inline-flex items-center justify-center gap-2 rounded-lg bg-white p-4 ' +
  'shadow-[var(--shadow-md)] text-text-primary origin-center';

const labelClass =
  'text-[14px] font-medium leading-5 text-text-primary whitespace-nowrap';

function IndicatorCard({
  label,
  className,
  animated,
}: {
  label: string;
  className?: string;
  animated: boolean;
}) {
  return (
    <div
      data-kb-component="publishing-indicator-card"
      role="status"
      aria-live="polite"
      className={cn(
        cardBaseClass,
        // Only attach the motion classes in portal mode — standalone
        // mode (no backdrop) is host-controlled and shouldn't auto-fire
        // the enter animation on every render.
        animated && [
          'motion-safe:animate-kb-modal-in',
          'motion-reduce:animate-kb-modal-in-reduced',
        ],
        className,
      )}
    >
      <Spinner />
      <span className={labelClass}>{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Main component.
 * ───────────────────────────────────────────────────────────── */

export function PublishingIndicator({
  open,
  label = 'Publishing...',
  withBackdrop = true,
  className,
}: PublishingIndicatorProps) {
  /* Standalone mode — card only, no portal, no backdrop. Consumer
   * controls presence; host decides where to mount it. */
  if (!withBackdrop) {
    if (!open) return null;
    return <IndicatorCard label={label} className={className} animated={false} />;
  }

  /* Portal mode — backdrop + centered card via document.body portal.
   * We mount/unmount on `open` directly (no exit animation) because
   * the indicator's job is "show while work is in flight, vanish
   * when work completes." A 140ms exit fade between vanish and toast
   * would visually compete with the success toast that fires the
   * same frame. */
  if (!open) return null;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* Backdrop — same wash + enter keyframe as Modal. */}
      <div
        data-kb-part="publishing-backdrop"
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-[90] bg-text-primary/40',
          'motion-safe:animate-kb-backdrop-in',
          'motion-reduce:animate-kb-backdrop-in-reduced',
        )}
      />

      {/* Centering wrapper — grid place-items-center handles centering
       * robustly across viewport changes. `pointer-events-none` on
       * both wrapper and card matches the transient-progress role
       * (no interactive content, no clicks to intercept). */}
      <div
        className="fixed inset-0 z-[91] grid place-items-center p-4 pointer-events-none"
      >
        <IndicatorCard label={label} className={className} animated />
      </div>
    </>,
    document.body,
  );
}
