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
      className={cn(
        'box-border inline-flex items-center justify-center gap-1.5 font-sans text-[14px] font-medium leading-5 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cbd5e1] focus-visible:ring-offset-1',
        {
          'h-8 px-3 rounded-[6px] bg-black text-white hover:bg-black/90 active:bg-black/80': variant === 'primary',
          'h-8 px-3 rounded-[6px] bg-[#f1f5f9] text-[#0f172a] hover:bg-[#e2e8f0] active:bg-[#cbd5e1]': variant === 'subtle',
          'h-8 px-3 rounded-[6px] bg-transparent text-[#0f172a] hover:bg-[#f8fafc] active:bg-[#f1f5f9]': variant === 'ghost',
          'h-8 w-8 rounded-[6px] bg-[#f8fafc] text-[#0f172a] hover:bg-[#e2e8f0] active:bg-[#cbd5e1]': variant === 'icon',
          'h-8 px-3 rounded-[6px] bg-transparent text-[#0f172a] border border-[#d5d5d5] hover:bg-[#f8fafc] active:bg-[#f1f5f9]': variant === 'outline',
          'h-8 px-3 rounded-[6px] bg-[#f03f33] text-white hover:bg-[#f03f33]/90 active:bg-[#f03f33]/80': variant === 'danger',
          'h-8 px-3 rounded-[6px] bg-transparent text-[#d52c1f] border border-[#f96c62] hover:bg-[#fef2f2] active:bg-[#fee2e2]': variant === 'danger-outline',
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
