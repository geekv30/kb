import * as React from 'react';
import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * Shared row chrome for AI conversation log entries
 *
 * Every row in an AI conversation log entry shares the same
 * left-rail layout:
 *   - Reserve a 36 px (pl-9) left rail (28 px icon column + 8 px gap).
 *   - Place an icon glyph wrapper at the top-left of the rail.
 *     When `iconPill` is set, the wrapper is a 28 × 28 `#f1f5f9`
 *     rounded pill (used for question rows per Figma library-check
 *     cells `155:1781` / `155:1793`). Otherwise a bare 16 × 16
 *     wrapper with `bg-white` so the icon punches through the
 *     dotted connector behind it.
 *   - Render the row's content to the right of the rail.
 *
 * The connector visuals on this atom are PER-ROW segments: an
 * optional dotted segment above the icon (`!hideConnectorAbove`)
 * and an optional dotted segment below the icon (`!hideConnectorBelow`).
 * Sibling rows' segments meet at the row gap to form a continuous
 * dotted line when the atom is composed standalone.
 *
 * The connector axis lives at left-[13.5px] (the 14-px center of
 * the 28-px icon column, rounded to a half-pixel for crisp dashes
 * on standard DPI). Color: `#94a3b8`.
 *
 * Note: AIConversationLogEntry currently draws ONE shared dotted
 * connector on its root that spans all rows. When that parent
 * connector is in use, callers MUST pass `hideConnectorAbove` AND
 * `hideConnectorBelow` for every row so per-row segments do not
 * double-draw.
 * ───────────────────────────────────────────────────────────── */

export type ConversationRowProps = {
  icon?: React.ReactNode;
  children: React.ReactNode;
  /** When true, hides the dotted connector segment ABOVE this row (use on the first row of an entry). */
  hideConnectorAbove?: boolean;
  /** When true, hides the dotted connector segment BELOW this row (use on the last row of an entry). */
  hideConnectorBelow?: boolean;
  /**
   * When true, the icon column is rendered as a 28 × 28 `#f1f5f9`
   * rounded pill containing a centered 16 × 16 icon. Used for
   * question rows per Figma library-check. Default `false` — bare
   * 16 × 16 icon.
   */
  iconPill?: boolean;
  className?: string;
};

export function ConversationRow({
  icon,
  children,
  hideConnectorAbove,
  hideConnectorBelow,
  iconPill,
  className,
}: ConversationRowProps): JSX.Element {
  // Icon-wrapper vertical center within the row (used to anchor
  // connector segments). Pilled rows have a 28-px wrapper at
  // top-0 → center y=14. Bare rows have a 16-px wrapper at
  // top-[2px] → center y=10.
  const iconCenter = iconPill ? 14 : 10;

  return (
    <div className={cn('relative pl-9', className)}>
      {/* Per-row connector segment ABOVE the icon center. */}
      {hideConnectorAbove ? null : (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-[13.5px] top-0 border-l border-dashed border-[#94a3b8]"
          style={{ height: `${iconCenter}px` }}
        />
      )}
      {/* Per-row connector segment BELOW the icon center. */}
      {hideConnectorBelow ? null : (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-[13.5px] bottom-0 border-l border-dashed border-[#94a3b8]"
          style={{ top: `${iconCenter}px` }}
        />
      )}
      {/* Icon column. Pilled = 28 × 28 light-grey circle with
       * centered 16 × 16 icon. Bare = 16 × 16 white-bg wrapper
       * that "punches through" the dotted connector. The bare
       * wrapper sits at left-[6px] so the icon centers within
       * the 28-px reserved rail (matching the pill's center). */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute inline-flex items-center justify-center',
          iconPill
            ? 'left-0 top-0 h-7 w-7 rounded-full bg-[#f1f5f9]'
            : 'left-[6px] top-[2px] h-4 w-4 bg-white',
        )}
      >
        {icon}
      </span>
      {children}
    </div>
  );
}
