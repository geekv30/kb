import { cn } from '../../utils/cn';

export type TextInputProps = {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  charCount?: { current: number; max: number };
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  /** Override classes applied to the inner <input> — use to swap placeholder
   *  color or text tone when the default `text-[#0f172a]` /
   *  `placeholder:text-[#94a3b8]` doesn't match the spec. */
  inputClassName?: string;
};

export function TextInput({
  value,
  onChange,
  placeholder,
  prefix,
  suffix,
  charCount,
  disabled,
  id,
  name,
  className,
  inputClassName,
}: TextInputProps) {
  return (
    <div
      className={cn(
        'flex h-10 items-center gap-1.5 overflow-hidden rounded-lg border border-[#e5e5e5] bg-white px-3 py-2',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {prefix && <span className="flex shrink-0 items-center">{prefix}</span>}
      <input
        id={id}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] font-normal leading-5 text-text-primary outline-none placeholder:text-text-disabled disabled:cursor-not-allowed',
          inputClassName,
        )}
      />
      {charCount && (
        <span className="shrink-0 text-[12px] font-normal leading-[18px] text-text-muted tabular-nums">
          {charCount.current}/{charCount.max}
        </span>
      )}
      {suffix && <span className="flex shrink-0 items-center">{suffix}</span>}
    </div>
  );
}
