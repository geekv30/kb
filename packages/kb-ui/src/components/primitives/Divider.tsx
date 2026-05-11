import { cn } from '../../utils/cn';

export type DividerProps = { subtle?: boolean; className?: string };

export function Divider({ subtle = false, className }: DividerProps) {
  return (
    <hr
      className={cn(
        'w-full border-0 border-t',
        subtle ? 'border-t-surface-muted' : 'border-t-[#e5e5e5]',
        className,
      )}
    />
  );
}
