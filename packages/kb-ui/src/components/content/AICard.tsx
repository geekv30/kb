import * as React from 'react';
import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * AICard
 *
 * Shared shell for the AI suggestion review surface. Captures
 * the common chrome that previously lived (verbatim) inside
 * both `AIGapSuggestionCard` and `AISuggestionsCard`:
 *
 *   active        → 12-px radius, slate hairline border,
 *                   `p-4`, white bg, vertical flex column
 *                   with `header / body / footer` slots.
 *
 *   collapsed     → terminal/chip mode — caller passes the
 *                   chip content (count pill, decision label,
 *                   undo affordance, etc.). Geometry mirrors
 *                   the active card chrome but uses `px-3 py-2`
 *                   to match the legacy `DecisionChip`.
 *
 * Anything per-suggestion (icon coloring, type chip, decision
 * pills, CTAs) stays at the call site — this component owns
 * geometry only.
 * ───────────────────────────────────────────────────────────── */

export type AICardMode = 'active' | 'collapsed';

type AICardOwnProps = {
  mode?: AICardMode;
  /** Top-of-card row — typically a TypeChip or icon + title pair. */
  header?: React.ReactNode;
  /** Free-form body. Active mode only. */
  body?: React.ReactNode;
  /** Bottom-of-card row — typically arrows + CTAs. Active mode only. */
  footer?: React.ReactNode;
  /**
   * Render a 1-px slate hairline between body and footer (active
   * mode only). Default `false` — only `AIGapSuggestionCard`
   * needs it; `AISuggestionsCard` does not.
   */
  showFooterDivider?: boolean;
  /**
   * Vertical gap (in px) inserted ABOVE the footer row. Default
   * `12` (= `mt-3`) matches `AIGapSuggestionCard`.
   * `AISuggestionsCard` passes `16` (= `mt-4`).
   */
  footerGap?: number;
  /**
   * Collapsed-mode content — the entire chip body (type chip,
   * label, undo button, etc.).
   */
  children?: React.ReactNode;
  className?: string;
  /** Override the outer landmark element. Defaults to `section`. */
  as?: 'section' | 'div';
};

export type AICardProps = AICardOwnProps & React.HTMLAttributes<HTMLElement>;

export function AICard({
  mode = 'active',
  header,
  body,
  footer,
  showFooterDivider = false,
  footerGap = 12,
  children,
  className,
  as: Tag = 'section',
  ...rest
}: AICardProps) {
  if (mode === 'collapsed') {
    return (
      <Tag
        className={cn(
          'flex w-full items-center rounded-[12px] border border-card-border bg-white',
          'px-3 py-2',
          className,
        )}
        {...rest}
      >
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      className={cn(
        'flex w-full flex-col rounded-[12px] border border-card-border bg-white',
        'p-4',
        className,
      )}
      {...rest}
    >
      {header}
      {body}
      {showFooterDivider && (
        <div
          aria-hidden="true"
          data-kb-part="ai-card-divider"
          className="mt-3 h-px w-full bg-card-divider"
        />
      )}
      {footer && (
        <div
          className="flex items-center justify-between gap-2"
          style={{ marginTop: `${footerGap}px` }}
        >
          {footer}
        </div>
      )}
    </Tag>
  );
}
