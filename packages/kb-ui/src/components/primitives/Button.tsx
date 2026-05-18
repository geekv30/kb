import { cn } from '../../utils/cn';

export type ButtonVariant =
  | 'primary'
  | 'subtle'
  | 'ghost'
  | 'icon'
  | 'outline'
  | 'danger'
  | 'danger-outline';

export type ButtonProps = {
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = 'primary',
  icon,
  children,
  disabled,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      // Press feedback: 120ms transform + colors with strong ease-out
      // curve. `motion-safe` gates the scale so reduced-motion users
      // only see the color change. `active:scale-[0.97]` is the
      // Emil rule — buttons must feel responsive on press. Disabled
      // buttons skip the press effect (no scale change on click).
      style={{ transition: 'transform 120ms cubic-bezier(0.23, 1, 0.32, 1), background-color 150ms ease, color 150ms ease, border-color 150ms ease' }}
      className={cn(
        'box-border inline-flex items-center justify-center gap-1.5 font-sans text-[14px] font-medium leading-5',
        !disabled && 'motion-safe:active:scale-[0.97]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-faint focus-visible:ring-offset-1',
        {
          'h-8 px-3 rounded-[6px] bg-black text-white hover:bg-black/90 active:bg-black/80': variant === 'primary',
          'h-8 px-3 rounded-[6px] bg-surface-muted text-text-primary hover:bg-card-border active:bg-border-faint': variant === 'subtle',
          'h-8 px-3 rounded-[6px] bg-transparent text-text-primary hover:bg-surface-subtle active:bg-surface-muted': variant === 'ghost',
          'h-8 w-8 rounded-[6px] bg-surface-subtle text-text-primary hover:bg-card-border active:bg-border-faint': variant === 'icon',
          'h-8 px-3 rounded-[6px] bg-transparent text-text-primary border border-[#d5d5d5] hover:bg-surface-subtle active:bg-surface-muted': variant === 'outline',
          'h-8 px-3 rounded-[6px] bg-[#f03f33] text-white hover:bg-[#f03f33]/90 active:bg-[#f03f33]/80': variant === 'danger',
          'h-8 px-3 rounded-[6px] bg-transparent text-ai-removal border border-[#f96c62] hover:bg-[#fef2f2] active:bg-[#fee2e2]': variant === 'danger-outline',
          'opacity-50 cursor-not-allowed pointer-events-none': disabled,
        },
        className,
      )}
      {...rest}
    >
      {variant === 'icon' ? (
        <span className="flex size-[14px] items-center justify-center [&>svg]:h-[14px] [&>svg]:w-[14px]">
          {icon ?? children}
        </span>
      ) : (
        <>
          {icon && <span className="flex size-[14px] shrink-0 items-center justify-center [&>svg]:h-[14px] [&>svg]:w-[14px]">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
