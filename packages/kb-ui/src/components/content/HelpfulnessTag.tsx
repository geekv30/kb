import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * HelpfulnessTag — small percentage pill used across Phase 7
 * analytics tables. Caller provides the variant explicitly
 * (NOT derived from the value) because a "high looking" number
 * may still be flagged as low-helpfulness depending on the
 * dataset / threshold the parent decided.
 *
 * Figma tokens (analytics-01 page, file 251DTRmxl2L6jmXd3FWzHe):
 *   up   → background/accents/green/soft  #f2fdf6
 *          text/accent/green/default       #086e3f
 *   down → background/accents/red/faint   #fff7f5
 *          text/accent/red/default         #d52c1f
 *   shape → scale/radius/md = 6
 *           body/xxs/medium = 12 / 500 / line-height 18
 *
 * Min-width 40 keeps single-digit ("5%") and triple-digit
 * ("100%") percentages visually balanced when rendered in a
 * column of helpfulness pills.
 * ───────────────────────────────────────────────────────────── */

export type HelpfulnessVariant = 'up' | 'down';

export type HelpfulnessTagProps = {
  /** Pre-formatted percentage string (e.g. "91%", "24%"). */
  value: string;
  /** 'up' = green pill, 'down' = red pill. Caller decides — not derived from value. */
  variant: HelpfulnessVariant;
  className?: string;
};

const VARIANT_CLASS: Record<HelpfulnessVariant, string> = {
  up: 'bg-[#f2fdf6] text-[#086e3f]',
  down: 'bg-[#fff7f5] text-[#d52c1f]',
};

export function HelpfulnessTag({ value, variant, className }: HelpfulnessTagProps) {
  return (
    <span
      data-kb-component="helpfulness-tag"
      data-kb-variant={variant}
      className={cn(
        'inline-flex items-center justify-center rounded-[6px] px-2 py-0.5 text-[12px] font-medium leading-[18px] min-w-[40px]',
        VARIANT_CLASS[variant],
        className,
      )}
    >
      {value}
    </span>
  );
}
