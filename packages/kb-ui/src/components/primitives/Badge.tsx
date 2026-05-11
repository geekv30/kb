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
  published: 'bg-[#f2fdf6] text-success-text px-2',
  // Draft bg sampled from Figma `tag.png` at the pill interior =
  // #f5f5f5 (was previously #fcfcfc, which read too washed-out).
  draft: 'bg-canvas text-text-primary px-2',
  neutral: 'bg-canvas text-text-primary px-2',
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
        <span className="size-[4px] rounded-full bg-success-text shrink-0" />
      )}
      {icon && <span className="flex size-[14px] shrink-0 items-center justify-center">{icon}</span>}
      {children}
    </span>
  );
}
