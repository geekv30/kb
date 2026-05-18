// Phase 7.5.8 — Indeterminate progress bar used as the Suspense
// fallback for lazy-loaded route chunks (PRD §12.6).
//
// Renders a 2px bar at the very top of the content slot with a
// 30%-wide accent band that slides left → right in a loop. Replaces
// the ad-hoc `h-1 animate-pulse` placeholder used in Phase 7.5.3.
//
// Phase D3 — motion pass:
//   - Slide period eased from 1.1s → 1.4s. Reads as "working" rather
//     than "panicking" without losing the indeterminate feel. Still
//     linear (per Emil's framework: constant motion uses linear; ease
//     curves would make each cycle look like it's accelerating and
//     decelerating, which is wrong for a true loading indicator).
//   - Track + band fade in over 180ms on mount via
//     `animate-kb-progress-bar-mount` so the bar doesn't pop into
//     existence at full opacity. Suspense mounts/unmounts this on
//     every chunk load, and a sharp pop reads as a layout glitch.
//   - prefers-reduced-motion: the slide animation is killed (band
//     fills the full width at reduced opacity) but the bar remains
//     visible — loading indication is functional, not decorative.
//     Mount fade is also disabled to avoid the bar visibly fading in
//     on every transition.

export function PageProgressBar() {
  return (
    <div
      role="progressbar"
      aria-label="Loading"
      aria-busy="true"
      data-kb-part="page-progress-bar"
      className="relative h-[2px] w-full overflow-hidden bg-surface-muted animate-kb-progress-bar-mount"
    >
      <div
        className="absolute top-0 h-full w-[30%] bg-text-primary animate-progress-slide"
      />
    </div>
  );
}
