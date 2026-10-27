import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

/*
 * Live `pd` input: 13px/28 400 #09274a, transparent bg, 1px #d1e0f1
 * border, radius 4px, focus border #1473e6, error border #cd3746,
 * placeholder #4e6382. No font-family is set (the live input renders
 * in the browser's form-control font), so none is set here either.
 * Default padding is the live `6px 50px 6px 12px`; override via className.
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { invalid, className, type = 'text', ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      autoComplete="off"
      className={cn(
        'relative z-[1] m-0 rounded-[4px] border border-solid border-legacy-input-border bg-transparent py-[6px] pr-[50px] pl-[12px] text-[13px] leading-[28px] font-normal text-legacy-ink outline-none placeholder:text-legacy-meta focus:border-legacy-blue',
        invalid && 'border-legacy-danger focus:border-legacy-danger',
        className,
      )}
      {...rest}
    />
  );
});
