// Phase 7.5.8 — Indeterminate progress bar used as the Suspense
// fallback for lazy-loaded route chunks (PRD §12.6).
//
// Renders a 2px bar at the very top of the content slot with a
// 30%-wide accent band that slides left → right in a loop. Replaces
// the ad-hoc `h-1 animate-pulse` placeholder used in Phase 7.5.3.

export function PageProgressBar() {
  return (
    <div
      role="progressbar"
      aria-label="Loading"
      aria-busy="true"
      data-kb-part="page-progress-bar"
      className="relative h-[2px] w-full overflow-hidden bg-[#f1f5f9]"
    >
      <div
        className="absolute top-0 h-full w-[30%] bg-[#0f172a] animate-progress-slide"
      />
    </div>
  );
}
