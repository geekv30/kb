// smoothScrollTo — single-page custom scroller used by the AI Gaps review
// flow.
//
// Why a custom scroller instead of `window.scrollTo({ behavior: 'smooth' })`:
//   1. The native call has no cancellation hook — chunked, rapid card
//      activations (arrow-key spam) would interrupt one another with
//      undefined animation behaviour across browsers.
//   2. We need a deterministic duration so the rail's `transition: top`
//      (chunk 3) and the page scroll start and finish on the same beat.
//      Native `behavior: 'smooth'` runs at user-agent-tuned duration that
//      varies across Chrome/Firefox/Safari.
//   3. We respect `prefers-reduced-motion` and **also** bail when the user
//      starts scrolling manually mid-animation. The native API does
//      neither — once started it runs to completion.
//
// The function is a pure rAF loop. No deps, no React. Tested implicitly
// by the AI Gaps reducer flow's manual QA in chunk 4.

/**
 * Easing curves used by `smoothScrollTo`.
 *
 * `easeOutCubic` — default. Decelerates toward target. Feels snappy at the
 * start of the animation, settles at the end. Matches the visual rhythm of
 * the rail's `transition: top 200ms ease-out`.
 */
export const easings = {
  easeOutCubic: (t: number): number => 1 - Math.pow(1 - t, 3),
  linear: (t: number): number => t,
} as const;

export type SmoothScrollOptions = {
  /** Target Y position in document/window scroll coordinates (pixels). */
  target: number;
  /**
   * Duration in milliseconds. Default 400. Setting to 0 jumps immediately
   * without rAF.
   */
  duration?: number;
  /**
   * Easing function. Default `easings.easeOutCubic`. Takes normalized
   * time `t` in `[0, 1]`, returns a value in `[0, 1]`.
   */
  easing?: (t: number) => number;
  /**
   * Optional element to scroll instead of `window`. Defaults to scrolling
   * the document (`window.scrollTo`). When provided, `target` is the
   * `scrollTop` value to land on.
   */
  scrollElement?: HTMLElement | null;
};

export type SmoothScrollHandle = {
  /** Cancel the in-flight animation. No-op if already done. */
  cancel: () => void;
};

/**
 * Returns `true` if the user has expressed a preference for reduced motion
 * at the OS level. SSR-safe — returns `false` when `window` is undefined.
 */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Tracks the currently-running scroll animation so a new call can cancel
 * the previous one in-flight. This is process-global by design: only one
 * scroll animation should run at a time. A second `smoothScrollTo()` call
 * with a new target preempts the first.
 */
let activeHandle: SmoothScrollHandle | null = null;

/**
 * Animate a scroll from the current position to `target` via
 * `requestAnimationFrame`.
 *
 * Stops early if:
 *   - The user starts scrolling manually (wheel/touchmove detected).
 *   - A new `smoothScrollTo` call preempts this one.
 *   - The caller invokes `cancel()` on the returned handle.
 *
 * Jumps immediately (no animation) if:
 *   - `prefers-reduced-motion: reduce` is set.
 *   - `duration <= 0`.
 */
export function smoothScrollTo(opts: SmoothScrollOptions): SmoothScrollHandle {
  // Preempt any previous animation. Each call owns the scroll until it
  // ends or is cancelled — this prevents two competing rAF loops fighting
  // over scrollY.
  if (activeHandle) {
    activeHandle.cancel();
  }

  const duration = opts.duration ?? 400;
  const easing = opts.easing ?? easings.easeOutCubic;
  const scrollEl = opts.scrollElement ?? null;

  // SSR / non-browser environments — return a noop handle. The animation
  // can't run, but callers shouldn't have to null-check.
  if (typeof window === 'undefined') {
    return { cancel: () => undefined };
  }

  const startY = scrollEl ? scrollEl.scrollTop : window.scrollY;
  const target = opts.target;

  // Already at target (within 1px) — no animation needed.
  if (Math.abs(target - startY) < 1) {
    return { cancel: () => undefined };
  }

  // Reduced motion or zero-duration → immediate jump.
  if (duration <= 0 || prefersReducedMotion()) {
    if (scrollEl) scrollEl.scrollTop = target;
    else window.scrollTo({ top: target });
    return { cancel: () => undefined };
  }

  let rafId: number | null = null;
  let cancelled = false;
  let userInterrupted = false;
  let startTime: number | null = null;

  // Listen for manual scroll input. `wheel` covers desktop mouse/trackpad;
  // `touchmove` covers mobile. We don't listen for `scroll` itself
  // because our own `scrollTo` writes fire `scroll` events too.
  // `keydown` covers spacebar / arrow / pgup / pgdn / home / end navigation.
  const onUserScroll = () => {
    userInterrupted = true;
  };
  const onUserKey = (e: KeyboardEvent) => {
    // Only treat scroll-affecting keys as interrupts. Listing explicitly
    // so unrelated keypresses (e.g. AI Gaps' own j/k/y/n) don't cancel
    // a scroll the consumer just kicked off.
    if (
      e.key === ' ' ||
      e.key === 'PageDown' ||
      e.key === 'PageUp' ||
      e.key === 'Home' ||
      e.key === 'End' ||
      e.key === 'ArrowDown' ||
      e.key === 'ArrowUp'
    ) {
      // Don't cancel if focus is in an input — those keys belong to the input.
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || t?.isContentEditable) return;
      userInterrupted = true;
    }
  };
  // `passive: true` keeps the page-scroll path on the compositor thread so
  // the listener doesn't fight scroll performance.
  window.addEventListener('wheel', onUserScroll, { passive: true });
  window.addEventListener('touchmove', onUserScroll, { passive: true });
  window.addEventListener('keydown', onUserKey);

  const cleanup = () => {
    window.removeEventListener('wheel', onUserScroll);
    window.removeEventListener('touchmove', onUserScroll);
    window.removeEventListener('keydown', onUserKey);
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (activeHandle === handle) activeHandle = null;
  };

  const step = (now: number) => {
    if (cancelled || userInterrupted) {
      cleanup();
      return;
    }
    if (startTime === null) startTime = now;
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);
    const eased = easing(t);
    const y = startY + (target - startY) * eased;
    if (scrollEl) scrollEl.scrollTop = y;
    else window.scrollTo({ top: y });
    if (t < 1) {
      rafId = requestAnimationFrame(step);
    } else {
      cleanup();
    }
  };

  rafId = requestAnimationFrame(step);

  const handle: SmoothScrollHandle = {
    cancel: () => {
      cancelled = true;
      cleanup();
    },
  };
  activeHandle = handle;
  return handle;
}
