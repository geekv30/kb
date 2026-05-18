import { cn } from '../../utils/cn';

export type TextareaProps = {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  charCount?: { current: number; max: number };
  disabled?: boolean;
  /** When true the textarea border flips to red. Same pattern as
   *  TextInput.error (Honey-DS 6322:25311 — #dc2626). */
  error?: boolean;
  id?: string;
  name?: string;
  /** Initial height in pixels. Default 80. */
  initialHeight?: number;
  /** Resize behavior. Default 'vertical'. */
  resize?: 'vertical' | 'horizontal' | 'both' | 'none';
  className?: string;
  /** Override classes applied to the inner <textarea>. */
  textareaClassName?: string;
  /** Optional slot rendered at the bottom-right inside the textarea
   *  shell (e.g. the SEO panel's "✦ Refine with AI" affordance). */
  footerEnd?: React.ReactNode;
};

const resizeClassMap: Record<NonNullable<TextareaProps['resize']>, string> = {
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize',
  none: 'resize-none',
};

export function Textarea({
  value,
  onChange,
  placeholder,
  charCount,
  disabled,
  error,
  id,
  name,
  initialHeight = 80,
  resize = 'vertical',
  className,
  textareaClassName,
  footerEnd,
}: TextareaProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 overflow-hidden rounded-lg border bg-white px-3 py-2',
        error ? 'border-[#dc2626]' : 'border-[#e2e8f0]',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error || undefined}
        style={{ minHeight: `${initialHeight}px` }}
        className={cn(
          'min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] font-normal leading-5 text-text-primary outline-none placeholder:text-text-muted disabled:cursor-not-allowed',
          resizeClassMap[resize],
          textareaClassName,
        )}
      />
      {(charCount || footerEnd) && (
        <div className="flex items-center justify-end gap-2">
          {charCount && (
            <span className="shrink-0 text-[12px] font-normal leading-[18px] text-text-muted tabular-nums">
              {charCount.current}/{charCount.max}
            </span>
          )}
          {footerEnd}
        </div>
      )}
    </div>
  );
}
