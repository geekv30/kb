// Phase 7.5.8 — Single-instance toast notification.
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
//   - Subtle entrance: fade-in + 8px slide from above (~200ms).
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
  type ReactNode,
} from 'react';
import {
  RiCheckLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiInformationLine,
} from '@remixicon/react';
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

/* ─────────────────────────────────────────────────────────────
 * Provider
 * ───────────────────────────────────────────────────────────── */

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timerRef = useRef<number | null>(null);
  // `pausedRef` lets us skip auto-dismiss while the user is hovering;
  // the timer fires but we ignore it and re-arm a fresh one on leave.
  const pausedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const armTimer = useCallback(
    (variant: ToastVariant) => {
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        if (pausedRef.current) return;
        setToast(null);
        timerRef.current = null;
      }, AUTOHIDE_MS[variant]);
    },
    [clearTimer],
  );

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      pausedRef.current = false;
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
    [armTimer],
  );

  const dismissToast = useCallback(() => {
    clearTimer();
    setToast(null);
  }, [clearTimer]);

  const handleMouseEnter = useCallback(() => {
    pausedRef.current = true;
    clearTimer();
  }, [clearTimer]);

  const handleMouseLeave = useCallback(() => {
    pausedRef.current = false;
    if (toast) armTimer(toast.variant);
  }, [armTimer, toast]);

  // Cleanup on unmount.
  useEffect(() => clearTimer, [clearTimer]);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      {toast && (
        <ToastUI
          key={toast.id}
          toast={toast}
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
  onDismiss: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

function ToastUI({
  toast,
  onDismiss,
  onMouseEnter,
  onMouseLeave,
}: ToastUIProps) {
  // Variant-specific accent colors. We keep the surface white and use
  // the left border + icon color to communicate severity — matches the
  // production-grade toast pattern (Linear, Vercel) and avoids loud
  // color-tinted backgrounds.
  const variantClasses: Record<ToastVariant, string> = {
    success: 'border-l-[#16a34a]',
    error: 'border-l-[#dc2626]',
    info: 'border-l-[#64748b]',
  };
  const iconColor: Record<ToastVariant, string> = {
    success: 'text-[#16a34a]',
    error: 'text-[#dc2626]',
    info: 'text-[#64748b]',
  };
  const Icon =
    toast.variant === 'success'
      ? RiCheckLine
      : toast.variant === 'error'
        ? RiErrorWarningLine
        : RiInformationLine;

  return (
    <div
      role={toast.variant === 'error' ? 'alert' : 'status'}
      aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
      data-toast-variant={toast.variant}
      className={cn(
        'fixed top-4 right-4 z-[100] flex items-start gap-3',
        'min-w-[280px] max-w-[420px] rounded-[8px] border border-[#e2e8f0] border-l-[3px] bg-white',
        'px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.10)]',
        'animate-toast-in',
        variantClasses[toast.variant],
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Icon
        aria-hidden="true"
        className={cn('mt-0.5 h-4 w-4 shrink-0', iconColor[toast.variant])}
      />
      <p className="flex-1 text-[14px] leading-5 text-[#0f172a]">
        {toast.message}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className={cn(
          'shrink-0 rounded-[4px] p-0.5 text-[#64748b]',
          'hover:bg-[#f1f5f9] hover:text-[#0f172a]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
        )}
      >
        <RiCloseLine aria-hidden="true" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
