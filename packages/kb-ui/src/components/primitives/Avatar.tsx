import { cn } from '../../utils/cn';

export type AvatarProps = {
  initials?: string;
  showStatus?: boolean;
  className?: string;
  /** Person's name — used to derive `aria-label` when `ariaLabel` is not provided. */
  name?: string;
  /** Accessible label for the avatar. Overrides `name`-derived label. */
  ariaLabel?: string;
};

export function Avatar({
  initials = 'A',
  showStatus = false,
  className,
  name,
  ariaLabel,
}: AvatarProps) {
  const derivedLabel =
    ariaLabel ??
    (name ? (showStatus ? `${name}, online` : name) : 'User avatar');

  return (
    <div
      role="img"
      aria-label={derivedLabel}
      className={cn(
        'relative inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[#e5e5e5] text-[12px] font-medium leading-[18px] text-[#525252] select-none',
        className,
      )}
    >
      {initials}
      {showStatus && (
        <span
          aria-hidden="true"
          className="absolute -bottom-[1px] -right-[1px] flex size-[8px] items-center justify-center rounded-full bg-white"
        >
          <span className="size-[6px] rounded-full bg-[#42cd83]" />
        </span>
      )}
    </div>
  );
}
