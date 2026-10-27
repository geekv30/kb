import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Live `OV` flags: `primary` (filled blue), `secondary` (blue outline),
   * `delete` (filled red), none (white, body text) → `ghost`.
   */
  variant?: ButtonVariant;
  /** 18px leading icon (live `a2`/`Z` img, 10px gap). */
  iconSrc?: string;
}

/*
 * Every value comes from the live `OV` styled button:
 * Inter 14/28 500, padding 6px 16px, radius 4px, 1px solid border.
 * Disabled colors follow the live `.disable, :disabled` rule.
 */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-legacy-blue border-white text-white hover:bg-legacy-blue-hover disabled:bg-legacy-disabled disabled:border-white disabled:text-white',
  secondary:
    'bg-white border-legacy-blue text-legacy-blue hover:bg-legacy-wash disabled:bg-white disabled:border-legacy-disabled disabled:text-legacy-disabled',
  danger:
    'bg-legacy-danger border-white text-white hover:bg-legacy-danger-hover disabled:bg-white disabled:border-white disabled:text-legacy-disabled',
  ghost:
    'bg-white border-white text-legacy-body hover:bg-legacy-wash disabled:bg-white disabled:border-white disabled:text-legacy-disabled',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'ghost', iconSrc, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'relative m-0 box-border flex cursor-pointer content-center items-center justify-center rounded-[4px] border border-solid px-[16px] py-[6px] font-inter text-[14px] leading-[28px] font-medium outline-none disabled:cursor-not-allowed',
        'focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#1473e6]',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...rest}
    >
      {iconSrc ? <img src={iconSrc} alt="" aria-hidden className="mr-[10px] h-[18px] w-[18px]" /> : null}
      {children}
    </button>
  );
});
