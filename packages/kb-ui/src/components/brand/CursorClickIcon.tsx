import * as React from 'react';

export type CursorClickIconProps = React.SVGProps<SVGSVGElement> & {
  /** Rendered size in px. Default 14 (matches Figma's native size). */
  size?: number;
};

/**
 * Cursor-click glyph — an arrow cursor with small click-ray decorations
 * on the upper-left, used to indicate user-click events in
 * `AIConversationLogEntry` tail rows.
 *
 * Source of truth: Figma export (Frame.svg, 14x14, viewBox 0 0 14 14).
 * The original export hard-coded `stroke="#64758B"`; here we use
 * `currentColor` so callers can tint via Tailwind `text-*` classes.
 *
 * Default rendered color in the tail-row context is `#64748b` (the
 * surrounding secondary-text token).
 */
export function CursorClickIcon({
  size = 14,
  className,
  ...rest
}: CursorClickIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path
        d="M5.25008 2.04167V1.16667M2.95213 2.95206L2.33341 2.33334M2.95213 7.58334L2.33341 8.20208M7.58342 2.95206L8.20216 2.33334M2.04175 5.25H1.16675M9.25437 9.44394L7.80082 12.1433C7.63481 12.4517 7.55174 12.6058 7.45187 12.6449C7.36519 12.6787 7.26754 12.6691 7.18908 12.6191C7.09861 12.5615 7.0471 12.3941 6.94397 12.0594L4.92644 5.50973C4.84222 5.2363 4.8001 5.09958 4.83398 5.00724C4.8635 4.92681 4.92689 4.86342 5.00732 4.83391C5.09966 4.80003 5.23637 4.84214 5.50981 4.92637L12.0594 6.94389C12.3942 7.04702 12.5615 7.09859 12.6192 7.18901C12.6692 7.26752 12.6787 7.36511 12.6449 7.4518C12.6059 7.55172 12.4517 7.63473 12.1433 7.8008L9.44402 9.2543C9.39817 9.27897 9.37524 9.29128 9.35523 9.30715C9.33738 9.3212 9.32128 9.3373 9.30722 9.35515C9.29136 9.37516 9.27905 9.39809 9.25437 9.44394Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
