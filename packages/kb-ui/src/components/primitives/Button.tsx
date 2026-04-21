import { cn } from '../../utils/cn';

export type ButtonVariant = 'primary' | 'subtle' | 'ghost' | 'icon';

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
        'inline-flex items-center justify-center gap-1.5 font-sans text-[14px] font-medium leading-5 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
        {
          'bg-black text-white hover:bg-black/90 px-3 py-1.5 rounded-[6px]': variant === 'primary',
          'bg-[#f8fafc] text-[#0f172a] hover:bg-[#f1f5f9] px-3 py-1.5 rounded-[6px] border border-[#cbd5e1]': variant === 'subtle',
          'bg-transparent text-[#0f172a] hover:bg-[#f8fafc] px-3 py-1.5 rounded-[6px]': variant === 'ghost',
          'bg-[#f8fafc] text-[#0f172a] hover:bg-[#e2e8f0] p-2 rounded-[6px]': variant === 'icon',
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
