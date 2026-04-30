import type * as React from 'react';
import { RiLayoutLeftLine } from '@remixicon/react';
import { cn } from '../../utils/cn';

export type BreadcrumbItem = {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
};

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
  homeIcon?: React.ReactNode;
  separator?: React.ReactNode;
};

export function Breadcrumb({ items, className, homeIcon, separator }: BreadcrumbProps) {
  if (items.length === 0) return null;

  const home = items[0];
  const rest = items.slice(1);
  const lastIdx = rest.length - 1;

  return (
    <nav className={cn('inline-flex items-center gap-1', className)} aria-label="Breadcrumb">
      <button
        type="button"
        onClick={home.onClick}
        className={cn(
          'inline-flex items-center justify-center',
          home.onClick ? 'cursor-pointer' : 'cursor-default',
        )}
        aria-label={home.label}
      >
        {homeIcon ?? <RiLayoutLeftLine size={14} className="text-[#94a3b8]" />}
      </button>
      {rest.map((item, idx) => {
        const isCurrent = idx === lastIdx;
        const clickable = !isCurrent && !!item.onClick;
        return (
          <span key={item.id} className="inline-flex items-center gap-1">
            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center text-[14px] leading-5 text-[#cbd5e1] px-[2px] shrink-0 select-none"
            >
              {separator ?? '/'}
            </span>
            {isCurrent ? (
              <span
                aria-current="page"
                className="text-[14px] font-medium text-[#0f172a] bg-[#f8fafc] rounded-[4px] px-2 py-0.5"
              >
                {item.label}
              </span>
            ) : clickable ? (
              <button
                type="button"
                onClick={item.onClick}
                className="text-[14px] font-normal text-[#475569] hover:text-[#0f172a] cursor-pointer bg-transparent p-0 border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded-[4px]"
              >
                {item.label}
              </button>
            ) : (
              <span className="text-[14px] font-normal text-[#475569]">
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
