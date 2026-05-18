import * as React from 'react';
import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * Skeleton — shimmer placeholder. Used by the SEO panel's
 * "Refine with AI" loading state on the description field
 * (Figma 2949:8108).
 *
 * Single-bar usage:
 *   <Skeleton />                              // fills parent
 *   <Skeleton width="45%" height={16} />      // explicit dims
 *   <Skeleton radius={999} />                 // pill ends
 *
 * Multi-row usage:
 *   <Skeleton rows={2} widths={['100%','45%']} gap={12} />
 *
 * Motion: gradient sweep left-to-right via a pseudo-element
 * `::after` overlay. The base fill is slate-100 (surface-muted)
 * with a white-via-transparent gradient that translates from
 * -100% → 100% over 1.6s linear infinite. `motion-safe:` gates
 * the overlay so reduced-motion users see a flat fill.
 *
 * Keyframe `kb-skeleton-shimmer` is defined in tokens.css and
 * the Tailwind v4 utility `animate-kb-skeleton-shimmer` is
 * auto-generated from the `--animate-*` token there.
 * ───────────────────────────────────────────────────────────── */

type Size = number | string;

export type SkeletonProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** Explicit width — defaults to fill parent. */
  width?: Size;
  /** Explicit height — defaults to 12px. */
  height?: Size;
  /** Border radius. Default 4px; pass 999 for pill ends. */
  radius?: Size;
  /** Multi-row mode — number of rows. */
  rows?: number;
  /** Width per row (used with `rows`). Last row defaults to 45% if shorter array. */
  widths?: Array<Size>;
  /** Gap between rows in px when `rows` is set. */
  gap?: number;
};

function sizeToCss(v: Size | undefined): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === 'number' ? `${v}px` : v;
}

function SkeletonBar({
  width,
  height = 12,
  radius = 999,
  className,
  style,
  ...rest
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        // Base fill — slate-100 / surface-muted. The pseudo-element
        // shimmer overlay rides on top via ::after; we mask it with
        // overflow-hidden so the gradient never bleeds past the bar.
        'relative overflow-hidden bg-surface-muted',
        // Shimmer overlay. `before:` is a wide horizontal gradient
        // that translateX(-100% → 100%). `motion-safe:` gates the
        // animation so reduced-motion gets a flat fill. The
        // `content-['']` is required for the pseudo-element to render.
        "before:content-[''] before:absolute before:inset-0 before:-translate-x-full",
        'before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
        'motion-safe:before:animate-kb-skeleton-shimmer',
        className,
      )}
      style={{
        width: sizeToCss(width) ?? '100%',
        height: sizeToCss(height),
        borderRadius: sizeToCss(radius),
        ...style,
      }}
      {...rest}
    />
  );
}

export function Skeleton({
  rows,
  widths,
  gap = 8,
  className,
  style,
  width,
  height,
  radius,
  ...rest
}: SkeletonProps) {
  if (rows && rows > 1) {
    return (
      <div
        className={cn('flex flex-col w-full', className)}
        style={{ gap: `${gap}px`, ...style }}
      >
        {Array.from({ length: rows }).map((_, i) => {
          const w = widths?.[i] ?? (i === rows - 1 ? '45%' : '100%');
          return (
            <SkeletonBar
              key={i}
              width={w}
              height={height}
              radius={radius}
            />
          );
        })}
      </div>
    );
  }
  return (
    <SkeletonBar
      width={width}
      height={height}
      radius={radius}
      className={className}
      style={style}
      {...rest}
    />
  );
}
