// rAF smooth scroller for the AI suggestions review view.
//
// Forked from `packages/kb-ui/src/utils/smoothScrollTo.ts` (same reason
// as `reviewState.ts`: kb-ui only resolves through its built dist).
// Behavior is identical: deterministic duration, ease-out cubic, one
// animation at a time (a new call preempts the last), instant jump under
// `prefers-reduced-motion`, and the animation yields as soon as the user
// scrolls by wheel, touch, or a scroll key.

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export interface SmoothScrollOptions {
  /** Target `scrollTop` of `scrollElement`. */
  target: number;
  /** Milliseconds. Default 400. `0` jumps immediately. */
  duration?: number;
  easing?: (t: number) => number;
  scrollElement: HTMLElement;
}

export interface SmoothScrollHandle {
  cancel: () => void;
}

const SCROLL_KEYS = new Set([' ', 'PageDown', 'PageUp', 'Home', 'End', 'ArrowDown', 'ArrowUp']);

let activeHandle: SmoothScrollHandle | null = null;

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function smoothScrollTo({
  target,
  duration = 400,
  easing = easeOutCubic,
  scrollElement,
}: SmoothScrollOptions): SmoothScrollHandle {
  activeHandle?.cancel();

  const startY = scrollElement.scrollTop;
  if (Math.abs(target - startY) < 1) return { cancel: () => undefined };

  if (duration <= 0 || prefersReducedMotion()) {
    scrollElement.scrollTop = target;
    return { cancel: () => undefined };
  }

  let rafId: number | null = null;
  let cancelled = false;
  let userInterrupted = false;
  let startTime: number | null = null;

  const onUserScroll = () => {
    userInterrupted = true;
  };
  const onUserKey = (e: KeyboardEvent) => {
    if (!SCROLL_KEYS.has(e.key)) return;
    const t = e.target as HTMLElement | null;
    if (t?.tagName === 'INPUT' || t?.tagName === 'TEXTAREA' || t?.isContentEditable) return;
    userInterrupted = true;
  };

  window.addEventListener('wheel', onUserScroll, { passive: true });
  window.addEventListener('touchmove', onUserScroll, { passive: true });
  window.addEventListener('keydown', onUserKey);

  const handle: SmoothScrollHandle = {
    cancel: () => {
      cancelled = true;
      cleanup();
    },
  };

  function cleanup() {
    window.removeEventListener('wheel', onUserScroll);
    window.removeEventListener('touchmove', onUserScroll);
    window.removeEventListener('keydown', onUserKey);
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (activeHandle === handle) activeHandle = null;
  }

  const step = (now: number) => {
    if (cancelled || userInterrupted) {
      cleanup();
      return;
    }
    if (startTime === null) startTime = now;
    const t = Math.min(1, (now - startTime) / duration);
    scrollElement.scrollTop = startY + (target - startY) * easing(t);
    if (t < 1) rafId = requestAnimationFrame(step);
    else cleanup();
  };

  rafId = requestAnimationFrame(step);
  activeHandle = handle;
  return handle;
}
