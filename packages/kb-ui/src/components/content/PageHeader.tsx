import * as React from 'react';
import { RiAddLine } from '@remixicon/react';
import { cn } from '../../utils/cn';
import { Button } from '../primitives/Button';

/* ─────────────────────────────────────────────────────────────
 * PageHeader
 *
 * Two visual sizes share one component:
 *
 *  size='md' (default) — Editor / Category Page header
 *    18 px / semibold title, optional 22 px square dashed icon
 *    on the left, primary "+ New" CTA on the right.
 *
 *  size='lg'           — Analytics dashboards
 *    24 px / semibold title, 14 px subtitle, no leading icon.
 *    Right slot accepts a DateRangePill or any other control.
 *    No built-in CTA.
 *
 * Why one component, two sizes — the analytics pages used to
 * each ship their own raw <h1> + <p>; consolidating here keeps
 * page composition consistent and lets us evolve the header
 * (sticky behaviour, breadcrumb integration, etc.) in one place.
 * ───────────────────────────────────────────────────────────── */

export type PageHeaderSize = 'md' | 'lg';

export type PageHeaderProps = {
  size?: PageHeaderSize;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  /** Right-aligned slot. Used by analytics pages for `DateRangePill`. */
  rightSlot?: React.ReactNode;
  /** Show the built-in primary "+ New" CTA. Default `true` for `size='md'`, `false` for `size='lg'`. */
  showCta?: boolean;
  onNewClick?: () => void;
  newButtonLabel?: string;
  className?: string;
  cta?: React.ReactNode;
};

export function PageHeader({
  size = 'md',
  icon,
  title,
  subtitle,
  rightSlot,
  showCta,
  onNewClick,
  newButtonLabel = 'New article',
  className,
  cta,
}: PageHeaderProps) {
  const isLg = size === 'lg';
  const renderCta = showCta ?? !isLg;

  if (isLg) {
    return (
      <header
        data-kb-component="page-header"
        data-kb-size="lg"
        className={cn(
          'flex items-start justify-between gap-4',
          className,
        )}
      >
        <div>
          <h1 className="text-[24px] font-semibold leading-[32px] text-text-primary">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-[14px] font-normal leading-[20px] text-text-meta">
              {subtitle}
            </p>
          )}
        </div>
        {rightSlot}
      </header>
    );
  }

  return (
    <div
      data-kb-component="page-header"
      data-kb-size="md"
      className={cn('flex items-center justify-between py-1', className)}
    >
      <div className="flex items-center gap-4">
        {icon && (
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[6.6px] border border-dashed border-border-faint bg-surface-subtle [&>svg]:h-[22px] [&>svg]:w-[22px]"
          >
            {icon}
          </span>
        )}
        <div className="flex flex-col gap-0.5">
          <h1 className="text-[18px] font-semibold leading-[28px] text-text-primary">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[14px] font-medium leading-[20px] text-text-meta">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {rightSlot ?? (
        cta !== undefined ? cta : (
          renderCta && (
            <Button
              variant="primary"
              icon={<RiAddLine size={14} />}
              onClick={onNewClick}
            >
              {newButtonLabel}
            </Button>
          )
        )
      )}
    </div>
  );
}
