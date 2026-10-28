// Hiver design system `Toast` (tone "info", size "sm") inside MUI's
// Snackbar, which anchors it 24px from the bottom-left and grows it in.
//
// Body, from the bundle's `ToastBody`: inline-flex, centered, 8px gap,
// 10px × 8px padding, 44px min height, 8px radius, 1px border.
// Info tone: background.info.subtle, border.info.soft, icon + title
// foreground / text.info.default; title body_sm_medium; a 28px dismiss
// button (6px padding, 6px radius, 16px Close in neutral-bold.soft).

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';
import { AdminIcon } from '../AdminIcon';
import { DS_TYPE } from './typography';

const AUTO_HIDE_MS = 4000;
/** Matches --animate-ds-toast-out. */
const EXIT_MS = 195;

type ToastEntry = { id: number; message: string; leaving: boolean };

const ToastContext = createContext<((message: string) => void) | null>(null);

export function useAdminToast(): (message: string) => void {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useAdminToast must be used inside <AdminToastProvider>');
  return show;
}

/** One toast at a time; a new message replaces the current one. */
export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastEntry | null>(null);
  const nextId = useRef(0);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const dismiss = useCallback(() => {
    clearTimers();
    setToast((t) => (t ? { ...t, leaving: true } : t));
    timers.current.push(window.setTimeout(() => setToast(null), EXIT_MS));
  }, []);

  const show = useCallback(
    (message: string) => {
      clearTimers();
      nextId.current += 1;
      setToast({ id: nextId.current, message, leaving: false });
      timers.current.push(window.setTimeout(dismiss, AUTO_HIDE_MS));
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast
        ? createPortal(
            <div className="fixed bottom-[24px] left-[24px] z-[1400] flex">
              <div
                key={toast.id}
                role="status"
                className={cn(
                  'box-border inline-flex min-h-[44px] max-w-full origin-bottom-left items-center gap-[8px] overflow-hidden rounded-[8px] border border-solid border-ds-info-border bg-ds-info-subtle px-[10px] py-[8px]',
                  toast.leaving
                    ? 'motion-safe:animate-ds-toast-out motion-reduce:animate-lk-fade-out-reduced'
                    : 'motion-safe:animate-ds-toast-in motion-reduce:animate-lk-fade-in-reduced',
                )}
              >
                <AdminIcon name="dsInfoOutlined" size={16} className="text-ds-info-text" />
                <span className={cn(DS_TYPE.body_sm_medium, 'min-w-0 flex-1 break-words text-ds-info-text')}>
                  {toast.message}
                </span>
                <button
                  type="button"
                  aria-label="Dismiss toast"
                  onClick={dismiss}
                  className="m-0 box-border flex size-[28px] shrink-0 cursor-pointer items-center justify-center rounded-[6px] border-0 bg-transparent p-[6px] text-ds-fg-soft outline-none hover:bg-ds-icon-hover focus-visible:shadow-[0_0_0_1.5px_var(--color-ds-focus-royal)]"
                >
                  <AdminIcon name="dsClose" size={16} />
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}
