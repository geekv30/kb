import * as React from 'react';
import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * Shared row chrome for AI conversation log entries
 *
 * Every row in an AI conversation log entry shares the same
 * left-rail layout:
 *   - Reserve a 24 px (pl-6) left rail.
 *   - Place a 16 px icon glyph wrapper at the top-left of the
 *     rail. The wrapper has `bg-white` so when a continuous
 *     dotted vertical connector is drawn behind it, the icon
 *     appears to punch through the connector cleanly.
 *   - Render the row's content to the right of the rail.
 *
 * The connector visuals on this atom are PER-ROW segments: an
 * optional dotted segment above the icon (`!hideConnectorAbove`)
 * and an optional dotted segment below the icon (`!hideConnectorBelow`).
 * Sibling rows' segments meet at the row gap to form a continuous
 * dotted line when the atom is composed standalone.
 *
 * Note: AIConversationLogEntry currently draws ONE shared dotted
 * connector on its root that spans all rows (it bisects the icon
 * column at left-[7.5px]). When that parent connector is in use,
 * callers MUST pass `hideConnectorAbove` AND `hideConnectorBelow`
 * for every row so per-row segments do not double-draw. This is
 * the configuration AIConversationLogEntry uses today, and is what
 * keeps its visual output byte-identical after this extraction.
 * ───────────────────────────────────────────────────────────── */

export type ConversationRowProps = {
  icon?: React.ReactNode;
  children: React.ReactNode;
  /** When true, hides the dotted connector segment ABOVE this row (use on the first row of an entry). */
  hideConnectorAbove?: boolean;
  /** When true, hides the dotted connector segment BELOW this row (use on the last row of an entry). */
  hideConnectorBelow?: boolean;
  className?: string;
};

export function ConversationRow({
  icon,
  children,
  hideConnectorAbove,
  hideConnectorBelow,
  className,
}: ConversationRowProps): JSX.Element {
  return (
    <div className={cn('relative pl-6', className)}>
      {/* Per-row connector segment ABOVE the icon center. The icon
       * glyph wrapper sits at top-[2px] with h-4, so its vertical
       * center is at y = 2 + 8 = 10 px from the row's top edge.
       * This segment runs from the row's top (0) down to that
       * center, painted along the same x-axis (left-[7.5px]) as
       * the parent connector used by AIConversationLogEntry, with
       * the same border colour and dash style. */}
      {hideConnectorAbove ? null : (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-[7.5px] top-0 h-[10px] border-l border-dashed border-[#cbd5e1]"
        />
      )}
      {/* Per-row connector segment BELOW the icon center, mirroring
       * the above segment from the icon center to the row's bottom. */}
      {hideConnectorBelow ? null : (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-[7.5px] top-[10px] bottom-0 border-l border-dashed border-[#cbd5e1]"
        />
      )}
      {/* Icon column — absolutely positioned so it does not
       * affect the content cell's flow, and aligns with the
       * first line of text via `top-[2px]`. White bg makes the
       * icon "punch through" the dotted connector. */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-[2px] inline-flex h-4 w-4 items-center justify-center bg-white"
      >
        {icon}
      </span>
      {children}
    </div>
  );
}
