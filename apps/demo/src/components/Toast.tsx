// Phase 7.5.8 — Single-instance toast notification.
// Phase D3 — Emil's motion pass.
//
// Spec (PRD §12.1 + TRD §8.1):
//   - One toast at a time. Calling `showToast` while one is on screen
//     replaces the previous (no stacking).
//   - Top-right, 16px from viewport edges, z-index above SourcesSideSheet
//     (the sheet sits at z-50 in kb-ui — we use z-[100]).
//   - Variants:
//       success → green left border + check icon, 3s autohide
//       error   → red    left border + ! icon,   5s autohide
//       info    → gray   left border + i icon,   3s autohide
//   - Hovering pauses the autohide timer (the toast stays until the
//     pointer leaves OR the user clicks the × button).
//
// Phase D3 motion vocabulary (Emil-flavored):
//   - Enter: 240ms strong ease-out, opacity + translateY(-12→0) + scale
//     0.97→1. Never from scale(0) — "nothing in the real world appears
//     from nothing." Top-anchored slide matches the toast's fixed
//     position so it reads as "coming in from the edge it lives at."
//   - Exit:  160ms strong ease-out, opacity + translateY(0→-8) + scale
//     1→0.98. Exit beats enter; close should feel snappy, not draggy
//     (skill checklist: "Make exit faster than enter").
//   - A countdown bar at the bottom visualizes the remaining autohide
//     time. Linear timing because it's a true progress indicator. The
//     bar's `animationPlayState` flips to `paused` on hover, perfectly
//     mirroring the timer-pause behavior we already had.
//   - prefers-reduced-motion: opacity-only enter/exit, countdown bar
//     hidden. Auto-dismiss still works; we just strip the motion sugar.
//
// Exit-motion implementation: a small `closing` flag flips the
// animation class for 160ms before the toast actually unmounts. This
// keeps the public API unchanged — callers still call `showToast` /
// `dismissToast`, and replacements ("show another toast while one is
// up") still work because each call assigns a fresh id (keying React
// to a new instance).
//
// API:
//   const { showToast, dismissToast } = useToast();
//   showToast('Saved.', 'success');
//
// Provider sits OUTSIDE the RouterProvider in `main.tsx` so every route
// (including the standalone 404) can call `useToast()`.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  AlertCircle,
  Check,
  InfoCircle,
  XClose,
} from '@untitledui/icons';
import { cn } from '../lib/cn';

/* ─────────────────────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────────────────────── */

export type ToastVariant = 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
  dismissToast: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTOHIDE_MS: Record<ToastVariant, number> = {
  success: 3000,
  info: 3000,
  error: 5000,
};

// Must match the duration of `.animate-kb-toast-exit` in tokens.css.
// Kept as a constant so the provider unmounts the toast at the moment
// the exit animation finishes — no flash, no premature snap.
const EXIT_DURATION_MS = 160;

/* ─────────────────────────────────────────────────────────────
 * Provider
 * ───────────────────────────────────────────────────────────── */

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const [closing, setClosing] = useState(false);
  const autoHideTimerRef = useRef<number | null>(null);
  const exitTimerRef = useRef<number | null>(null);
  // `pausedRef` lets us skip auto-dismiss while the user is hovering;
  // we drop the pending timer entirely on enter and re-arm it on leave.
  const pausedRef = useRef(false);

  const clearAutoHide = useCallback(() => {
    if (autoHideTimerRef.current !== null) {
      window.clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }
  }, []);

  const clearExit = useCallback(() => {
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }, []);

  // Begin the exit animation, then unmount once it finishes.
  const beginExit = useCallback(() => {
    clearAutoHide();
    setClosing(true);
    clearExit();
    exitTimerRef.current = window.setTimeout(() => {
      setToast(null);
      setClosing(false);
      exitTimerRef.current = null;
    }, EXIT_DURATION_MS);
  }, [clearAutoHide, clearExit]);

  const armTimer = useCallback(
    (variant: ToastVariant) => {
      clearAutoHide();
      autoHideTimerRef.current = window.setTimeout(() => {
        if (pausedRef.current) return;
        beginExit();
      }, AUTOHIDE_MS[variant]);
    },
    [clearAutoHide, beginExit],
  );

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      pausedRef.current = false;
      // If a previous toast is currently mid-exit, cancel it so the
      // replacement enters immediately rather than waiting 160ms.
      clearExit();
      setClosing(false);
      // Generate a fresh id every call so React remounts the toast div
      // and the entrance animation runs again, even when the variant
      // and message text happen to match the previous toast.
      const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToast({ id, message, variant });
      armTimer(variant);
    },
    [armTimer, clearExit],
  );

  const dismissToast = useCallback(() => {
    if (toast) beginExit();
  }, [toast, beginExit]);

  const handleMouseEnter = useCallback(() => {
    pausedRef.current = true;
    clearAutoHide();
  }, [clearAutoHide]);

  const handleMouseLeave = useCallback(() => {
    pausedRef.current = false;
    if (toast && !closing) armTimer(toast.variant);
  }, [armTimer, toast, closing]);

  // Cleanup on unmount.
  useEffect(
    () => () => {
      clearAutoHide();
      clearExit();
    },
    [clearAutoHide, clearExit],
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      {toast && (
        <ToastUI
          key={toast.id}
          toast={toast}
          closing={closing}
          onDismiss={dismissToast}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      )}
    </ToastContext.Provider>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Hook
 * ───────────────────────────────────────────────────────────── */

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside a <ToastProvider>');
  }
  return ctx;
}

/* ─────────────────────────────────────────────────────────────
 * Visual
 * ───────────────────────────────────────────────────────────── */

type ToastUIProps = {
  toast: Toast;
  closing: boolean;
  onDismiss: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

function ToastUI({
  toast,
  closing,
  onDismiss,
  onMouseEnter,
  onMouseLeave,
}: ToastUIProps) {
  // `hovered` flips the countdown bar's `animationPlayState` so the
  // visual pause matches the timer pause already happening in the
  // provider. We track it locally because the parent doesn't need to
  // re-render on hover.
  const [hovered, setHovered] = useState(false);

  // Variant-specific accent colors. We keep the surface white and use
  // the left border + icon color to communicate severity — matches the
  // production-grade toast pattern (Linear, Vercel) and avoids loud
  // color-tinted backgrounds.
  const variantClasses: Record<ToastVariant, string> = {
    success: 'border-l-[#16a34a]',
    error: 'border-l-[#dc2626]',
    info: 'border-l-text-muted',
  };
  const iconColor: Record<ToastVariant, string> = {
    success: 'text-[#16a34a]',
    error: 'text-[#dc2626]',
    info: 'text-text-muted',
  };
  const countdownColor: Record<ToastVariant, string> = {
    success: 'bg-[#16a34a]',
    error: 'bg-[#dc2626]',
    info: 'bg-text-muted',
  };
  const Icon =
    toast.variant === 'success'
      ? Check
      : toast.variant === 'error'
        ? AlertCircle
        : InfoCircle;

  // Inline CSS var feeds the countdown keyframes so success/info (3s)
  // and error (5s) share one rule without per-variant utility classes.
  const countdownStyle = {
    '--toast-duration': `${AUTOHIDE_MS[toast.variant]}ms`,
    animationPlayState: hovered ? 'paused' : 'running',
  } as CSSProperties;

  return (
    <div
      role={toast.variant === 'error' ? 'alert' : 'status'}
      aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
      data-toast-variant={toast.variant}
      data-state={closing ? 'closing' : 'open'}
      className={cn(
        'fixed top-4 right-4 z-[100] flex items-start gap-3 overflow-hidden',
        'min-w-[280px] max-w-[420px] rounded-[8px] border border-card-border border-l-[3px] bg-white',
        'px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.10)]',
        // Enter vs exit animation classes are mutually exclusive — both
        // keyframes use `forwards` semantics so the end state sticks
        // until React unmounts (no flicker between exit-end and unmount).
        closing ? 'animate-kb-toast-exit' : 'animate-kb-toast-enter',
        variantClasses[toast.variant],
      )}
      onMouseEnter={() => {
        setHovered(true);
        onMouseEnter();
      }}
      onMouseLeave={() => {
        setHovered(false);
        onMouseLeave();
      }}
    >
      <Icon
        aria-hidden="true"
        className={cn('mt-0.5 h-4 w-4 shrink-0', iconColor[toast.variant])}
      />
      <p className="flex-1 text-[14px] leading-5 text-text-primary">
        {toast.message}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className={cn(
          'shrink-0 rounded-[4px] p-0.5 text-text-muted',
          'transition-colors duration-150',
          'hover:bg-surface-muted hover:text-text-primary',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
          // Snappy :active scale per Emil — buttons must feel responsive.
          'active:scale-[0.94] active:transition-none',
        )}
      >
        <XClose aria-hidden="true" className="h-3.5 w-3.5" />
      </button>

      {/* Autohide countdown bar. Render only when not closing so it
       * doesn't visually compete with the exit motion. Aria-hidden
       * because the role=status announcement covers urgency cues. */}
      {!closing && (
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute bottom-0 left-0 h-[2px] w-full origin-left',
            'animate-kb-toast-countdown',
            countdownColor[toast.variant],
            'opacity-40',
          )}
          style={countdownStyle}
        />
      )}
    </div>
  );
}
