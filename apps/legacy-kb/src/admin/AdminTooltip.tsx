// Admin Panel (MUI) tooltip, from the live computed style: #343c45
// bubble, white Open Sans 12/20, 4px 8px padding, 4px radius, 5px below
// its trigger, no arrow. Shown on hover and keyboard focus.

import type { ReactNode } from 'react';

export interface AdminTooltipProps {
  content: string;
  children: ReactNode;
}

export function AdminTooltip({ content, children }: AdminTooltipProps) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute top-[calc(100%+5px)] left-1/2 z-10 -translate-x-1/2 rounded-[4px] bg-admin-tooltip px-[8px] py-[4px] font-open-sans text-[12px] leading-[20px] font-normal whitespace-nowrap text-white opacity-0 transition-opacity duration-150 group-focus-within/tip:opacity-100 group-hover/tip:opacity-100"
      >
        {content}
      </span>
    </span>
  );
}
