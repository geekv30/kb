// Hiver design system `Banner`, emphasis "light" — the same component
// as the Help Center page's live "limit of 25" warning, here in the
// "information" status (background.info.soft).
//
// From the bundle's `_BannerShell`: full width, centered, 12px gap,
// 12px × 48px padding, square corners; 20px alert icon; title
// body_md_medium, a "∙" separator, description body_md_regular, all in
// text.neutral.strong; an underlined 14/20 medium action in
// text.neutral.default (live tracking 0.2px).

import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { AdminIcon } from '../AdminIcon';
import { DS_TYPE } from './typography';

export interface DsBannerProps {
  title: ReactNode;
  description?: ReactNode;
  /** The underlined action; a link or button element styled by `dsBannerActionClass`. */
  action?: ReactNode;
  className?: string;
}

export const dsBannerActionClass =
  'm-0 cursor-pointer border-0 bg-transparent p-0 font-inter text-[14px] leading-[20px] font-medium tracking-[0.2px] whitespace-nowrap text-ds-text-default underline outline-none focus-visible:shadow-[0_0_0_1.5px_var(--color-ds-focus-royal)]';

export function DsBanner({ title, description, action, className }: DsBannerProps) {
  return (
    <div
      role="status"
      className={cn(
        'box-border flex w-full items-center justify-center gap-[12px] bg-ds-info-soft px-[48px] py-[12px]',
        className,
      )}
    >
      <AdminIcon name="bannerAlert" size={20} className="text-ds-text-strong" />
      <span className="flex min-w-0 items-center gap-[12px]">
        <span className="flex min-w-0 items-center gap-[8px]">
          <span className={cn(DS_TYPE.body_md_medium, 'text-ds-text-strong')}>{title}</span>
          {description != null ? (
            <>
              <span aria-hidden className={cn(DS_TYPE.body_md_medium, 'text-ds-text-strong')}>
                ∙
              </span>
              <span className={cn(DS_TYPE.body_md_regular, 'text-ds-text-strong')}>{description}</span>
            </>
          ) : null}
        </span>
        {action}
      </span>
    </div>
  );
}
