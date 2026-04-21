import { cn } from '../../utils/cn';

export type BadgeVariant = 'published' | 'draft' | 'neutral';

export type BadgeProps = {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

const variantStyles: Record<BadgeVariant, string> = {
  published: 'bg-[#f2fdf6] text-[#086e3f] pl-1 pr-2',
  draft: 'bg-[#fcfcfc] text-[#0f172a] pl-2 pr-2',
  neutral: 'bg-[#fcfcfc] text-[#0f172a] pl-2 pr-2',
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
