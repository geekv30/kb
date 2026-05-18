import * as React from 'react';
import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * CodeChip — inline monospace pill. Used by the SEO panel's
 * "Exclude from search engines" helper text to render the
 * `noindex` / `nofollow` meta-tag names inline (Figma 2949:7970,
 * 2949:7972).
 *
 * Sizing extracted from Figma:
 *   bg:       #f7f7f7 (background/accents/gray/faint).
 *             The closest kb-ui token is --color-surface-muted
 *             (#f1f5f9) — within a 6-channel delta, basically
 *             indistinguishable on white. We use surface-muted so
 *             the chip stays in the token system; if pixel-strict
 *             matching is needed later we can promote #f7f7f7 to
 *             a named token.
 *   text:     #0f172a (text-primary) — NOT muted; the chip itself
 *             reads as a literal value, not metadata.
 *   font:     13px medium, monospace (`font-mono`).
 *   padding:  px 4px py 2px (Figma scale/space/sm + xs).
 *   radius:   4px (Figma scale/radius/sm).
 *
 * Renders inline via `inline-flex items-center` so the chip flows
 * with body text without forcing a line break. Static — no motion.
 * ───────────────────────────────────────────────────────────── */

export type CodeChipProps = React.HTMLAttributes<HTMLSpanElement>;

export const CodeChip = React.forwardRef<HTMLSpanElement, CodeChipProps>(
  ({ className, children, ...rest }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-[4px] bg-surface-muted',
          'px-1 py-0.5',
          'font-mono text-[13px] font-medium leading-[19px] text-text-primary',
          'align-baseline',
          className,
        )}
        {...rest}
      >
        {children}
      </span>
    );
  },
);
CodeChip.displayName = 'CodeChip';
