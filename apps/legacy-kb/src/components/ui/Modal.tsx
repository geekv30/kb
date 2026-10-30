import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';
import { loaderGif } from '../../assets/legacy';
import { cn } from '../../lib/cn';
import { Button } from './Button';

export interface CloseGlyphProps {
  size?: number;
  /** Bar color class; live default #28476A, the toast passes #ECEFF6. */
  barClassName?: string;
}

/**
 * Live close control (main bundle module 6261, the ±45° bars): a 20px
 * box with two 14x1.5px bars crossed at its center.
 */
export function CloseGlyph({ size = 20, barClassName = 'bg-legacy-body' }: CloseGlyphProps) {
  return (
    <span aria-hidden className="relative block" style={{ width: size, height: size }}>
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className={cn('absolute -mt-[7px] h-[14px] w-[1.5px] rotate-45', barClassName)} />
        <span className={cn('absolute -mt-[7px] h-[14px] w-[1.5px] -rotate-45', barClassName)} />
      </span>
    </span>
  );
}

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  /** Optional screen-reader description of the dialog's purpose. */
  description?: string;
  /** Box width; the live category/article modals are 481px. */
  width?: number;
  /** Right-aligned footer actions (live `fe` row). */
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/*
 * Live modal (chunk 270 `ue`/`ge`/`he`/`fe`): rgba(0,0,0,.4) overlay;
 * white box, radius 5px, shadow 0 2px 4px rgba(0,0,0,.2); 60px header
 * on #f3f6f9 with 20px padding and an Inter 16/20 500 #09274a title;
 * body padding 20px 20px 0; footer padding 0 20px 25px.
 * Radix Dialog supplies focus trap, Esc, and aria wiring.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  width = 481,
  footer,
  children,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[1000000] bg-[rgba(0,0,0,0.4)]" />
        <Dialog.Content
          className={cn(
            'fixed top-1/2 left-1/2 z-[1000001] -translate-x-1/2 -translate-y-1/2 rounded-[5px] bg-white font-inter shadow-legacy-modal outline-none',
            className,
          )}
          style={{ width }}
          {...(description ? {} : { 'aria-describedby': undefined })}
        >
          <div className="box-border flex h-[60px] items-center justify-between rounded-t-[5px] bg-legacy-modal-header p-[20px]">
            <Dialog.Title className="m-0 w-full p-0 text-[16px] leading-[20px] font-medium text-legacy-ink">
              {title}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close"
              className="m-0 flex cursor-pointer border-0 bg-transparent p-0 outline-none focus-visible:shadow-[0_0_0_2px_#1473e6]"
            >
              <CloseGlyph />
            </Dialog.Close>
          </div>
          {description ? (
            <Dialog.Description className="sr-only">{description}</Dialog.Description>
          ) : null}
          <div className="px-[20px] pt-[20px]">{children}</div>
          {footer ? <div className="flex justify-end gap-[8px] px-[20px] pt-0 pb-[25px]">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Cancel style: live confirm dialogs use the white button; `secondary` is the blue outline. */
  cancelVariant?: 'ghost' | 'secondary';
  /** Live `primaryButtonColor`: "green" → primary, anything else → red. */
  tone?: 'danger' | 'primary';
  /**
   * Live `showLoader`: the confirm button is disabled and shows the
   * loader GIF. Cancel / close stay usable (as in the live dialog); the
   * caller decides what closing mid-work means, e.g. aborting it.
   */
  loading?: boolean;
  /** Screen-reader text while `loading`, e.g. "Publishing…". */
  loadingLabel?: string;
  onConfirm: () => void;
  /** Live `handleSecondaryButton`: the cancel button does something (e.g. "Discard Edits") instead of just closing. */
  onCancel?: () => void;
}

/*
 * Live confirm dialog (chunk 807 `p`): 397x192, padding 25px 16px 18px
 * 25px, radius 8px, shadow 0 5px 5px rgba(0,0,0,.2). Title 14/17 500
 * (12px bottom padding), message 13/20 #09274a, close glyph pulled up
 * with margin -40px -5px 0 0. Footer: white "Cancel" + red action.
 * 192px is a minimum here: longer messages grow the box instead of
 * pushing the footer out of it.
 */
export function ConfirmModal({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  cancelVariant = 'ghost',
  tone = 'danger',
  loading = false,
  loadingLabel = 'Working…',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[1000000] bg-[rgba(0,0,0,0.4)]" />
        <Dialog.Content
          aria-busy={loading || undefined}
          className="fixed top-1/2 left-1/2 z-[1000001] box-border flex min-h-[192px] w-[397px] -translate-x-1/2 -translate-y-1/2 flex-col content-between justify-between rounded-[8px] bg-white pt-[25px] pr-[16px] pb-[18px] pl-[25px] font-inter shadow-[0px_5px_5px_0px_rgba(0,0,0,0.2)] outline-none"
        >
          <div className="box-border flex w-full flex-col items-start">
            <div className="box-border flex w-full items-center justify-between">
              <Dialog.Title className="m-0 w-full p-0 pb-[12px] text-[14px] leading-[17px] font-medium text-black">
                {title}
              </Dialog.Title>
              <Dialog.Close
                aria-label="Close"
                className="mt-[-40px] mr-[-5px] mb-0 ml-0 flex cursor-pointer border-0 bg-transparent p-0 outline-none focus-visible:shadow-[0_0_0_2px_#1473e6]"
              >
                <CloseGlyph />
              </Dialog.Close>
            </div>
            <Dialog.Description className="m-0 p-0 pb-[12px] text-[13px] leading-[20px] font-normal text-legacy-ink">
              {message}
            </Dialog.Description>
          </div>
          <div className="box-border flex w-full flex-row justify-end">
            <Button variant={cancelVariant} className="mr-[12px]" onClick={onCancel ?? (() => onOpenChange(false))}>
              {cancelLabel}
            </Button>
            <Button
              variant={tone}
              disabled={loading}
              onClick={onConfirm}
              // The loader GIF is white, so the button keeps its fill while
              // loading; the disabled fill would wash it out.
              className={cn(
                loading && 'disabled:cursor-progress',
                loading && tone === 'primary' && 'disabled:bg-legacy-blue',
                loading && tone === 'danger' && 'disabled:bg-legacy-danger',
              )}
            >
              {loading ? (
                <>
                  {/* The label keeps the button's width; the live 49x28
                      loader sits centered on top of it. */}
                  <span aria-hidden className="invisible">
                    {confirmLabel}
                  </span>
                  <img
                    src={loaderGif}
                    alt=""
                    aria-hidden
                    width={49}
                    height={28}
                    className="absolute inset-0 m-auto h-[28px] w-[49px]"
                  />
                  <span className="sr-only">{loadingLabel}</span>
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export interface FieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

/** Live `MJ` group (padding-bottom 16px) + `modalFormLabel` label. */
export function Field({ label, htmlFor, required, error, children }: FieldProps) {
  return (
    <div className="relative m-0 flex w-full flex-col pb-[16px]">
      <label
        htmlFor={htmlFor}
        className="m-0 block p-0 pb-[8px] text-[13px] leading-[20px] font-medium text-legacy-ink"
      >
        {label}
        {required ? <span className="text-[red]">*</span> : null}
      </label>
      {children}
      {error ? (
        <span className="ml-[12px] p-0 text-[12px] leading-[28px] text-legacy-danger">{error}</span>
      ) : null}
    </div>
  );
}
