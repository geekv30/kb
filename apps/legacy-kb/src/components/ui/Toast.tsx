import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { toastIcon } from '../../assets/legacy';
import { cn } from '../../lib/cn';
import { CloseGlyph } from './Modal';

/** Live `GD`: a toast stays up for 10 seconds unless closed. */
const TOAST_DURATION_MS = 10_000;
/** Matches `--animate-lk-toast-out`, so the node unmounts after its fade. */
const TOAST_EXIT_MS = 160;

type ToastEntry = { id: number; message: string; leaving: boolean };

type ToastContextValue = { showToast: (message: string) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children: ReactNode;
}

/**
 * One toast at a time, like the live app's `showToast` context: a new
 * message replaces the current one and restarts the 10s timer.
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<ToastEntry | null>(null);
  const nextId = useRef(0);

  const showToast = useCallback((message: string) => {
    nextId.current += 1;
    setToast({ id: nextId.current, message, leaving: false });
  }, []);

  const dismiss = useCallback((id: number) => {
    setToast((current) => (current && current.id === id ? { ...current, leaving: true } : current));
  }, []);

  useEffect(() => {
    if (!toast) return;
    if (toast.leaving) {
      const t = window.setTimeout(() => setToast((c) => (c?.id === toast.id ? null : c)), TOAST_EXIT_MS);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => dismiss(toast.id), TOAST_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [toast, dismiss]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        // The live region stays mounted so screen readers announce each
        // new message; only the toast inside it comes and goes.
        <div role="status" aria-live="polite" aria-atomic="true">
          {toast ? <Toast key={toast.id} entry={toast} onClose={() => dismiss(toast.id)} /> : null}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>.');
  return ctx;
}

interface ToastProps {
  entry: ToastEntry;
  onClose: () => void;
}

/*
 * Live toast (main bundle, `showToast` portal): fixed 25px from the
 * bottom-left, padding 16px, #2a323e, radius 4px, the three-layer
 * elevation shadow, z-index 10000. Icon 20x23; message white Inter
 * 14/24 400, letter-spacing 0.23px, padding 0 16px; close bars #ECEFF6
 * with a 10px left margin.
 *
 * Motion (not in the live app, which pops): rises 8px + fades in over
 * 220ms strong ease-out, fades out in 160ms. Reduced motion: opacity only.
 */
function Toast({ entry, onClose }: ToastProps) {
  return (
    <div
      data-part="toast"
      className={cn(
        'fixed bottom-[25px] left-[25px] z-[10000] box-border flex content-center items-center justify-center rounded-[4px] bg-legacy-tooltip p-[16px] font-inter',
        'shadow-[0px_4px_5px_rgba(0,0,0,0.14),0px_1px_10px_rgba(0,0,0,0.12),0px_2px_4px_rgba(0,0,0,0.2)]',
        entry.leaving
          ? 'animate-lk-toast-out motion-reduce:animate-lk-fade-out-reduced [animation-fill-mode:forwards]'
          : 'motion-safe:animate-lk-toast-in motion-reduce:animate-lk-fade-in-reduced',
      )}
    >
      <img src={toastIcon} alt="" aria-hidden width={20} height={23} className="block h-[23px] w-[20px]" />
      <p className="m-0 flex content-center items-center justify-center px-[16px] py-0 text-left text-[14px] leading-[24px] font-normal tracking-[0.23px] text-white">
        {entry.message}
      </p>
      <button
        type="button"
        aria-label="Close notification"
        onClick={onClose}
        className="m-0 ml-[10px] flex cursor-pointer rounded-[4px] border-0 bg-transparent p-0 outline-none focus-visible:shadow-[0_0_0_2px_#ffffff]"
      >
        <CloseGlyph barClassName="bg-legacy-tooltip-text" />
      </button>
    </div>
  );
}
