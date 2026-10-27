import { cn } from '../../lib/cn';

export interface MaterialIconProps {
  /** Material Icons Outlined ligature, e.g. "5g". */
  name: string;
  size: number;
  className?: string;
}

/** Category glyph: Material Icons Outlined in the help center brand color. */
export function MaterialIcon({ name, size, className }: MaterialIconProps) {
  return (
    <span
      aria-hidden
      className={cn('material-icons-outlined text-legacy-brand', className)}
      style={{ fontSize: size, height: size }}
    >
      {name}
    </span>
  );
}
