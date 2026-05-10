import { cn } from '../../utils/cn';

export type BadgeVariant = 'published' | 'draft' | 'neutral';

export type BadgeProps = {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

const variantStyles: Record<BadgeVariant, string> = {
  // Padding equalised on both sides per Figma `tag.png` measurement
  // (~9-10 px each side at 1x render scale → `px-2`).
  published: 'bg-[#f2fdf6] text-[#086e3f] px-2',
  // Draft bg sampled from Figma `tag.png` at the pill interior =
  // #f5f5f5 (was previously #fcfcfc, which read too washed-out).
  draft: 'bg-[#f5f5f5] text-[#0f172a] px-2',
  neutral: 'bg-[#f5f5f5] text-[#0f172a] px-2',
};

export function Badge({ variant = 'neutral', icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full py-0.5 text-[12px] font-medium leading-[18px]',
        variantStyles[variant],
        className,
      )}
    >
      {variant === 'published' && !icon && (
        <span className="size-[4px] rounded-full bg-[#086e3f] shrink-0" />
      )}
      {icon && <span className="flex size-[14px] shrink-0 items-center justify-center">{icon}</span>}
      {children}
    </span>
  );
}
