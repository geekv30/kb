// Hiver design system `EmptyState`, size "medium", and the primary
// `Button` (md) it uses for its action.
//
// EmptyState (bundle): column, centered, 20px gap; content column 12px
// gap; a 16px glyph (default: search) in neutral-bold.soft inside a
// 1px border.neutral.soft circle with 12px padding; title
// body_lg_medium in text.neutral.strong and description body_md_regular
// in text.neutral.default, 4px apart, centered.
//
// Button primary md (bundle `_ButtonShell` / `_ButtonPrimary`): 36px
// min height, 16px side padding, 8px gap, 6px radius, 1.33px border in
// border.brand.strong, background.brand.default → .strong on hover →
// .intense pressed, label body_md_medium in text.on.brand, 0 tracking,
// focus ring 0 0 0 1.5px effect.focus.royal.

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { AdminIcon } from '../AdminIcon';
import { DS_TYPE } from './typography';

export interface DsEmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; to: string };
  className?: string;
}

export function DsEmptyState({ title, description, action, className }: DsEmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-[20px]', className)}>
      <div className="flex w-full flex-col items-center gap-[12px]">
        <span className="inline-flex items-center justify-center rounded-full border border-solid border-ds-border-soft p-[12px]">
          <AdminIcon name="dsSearch" size={16} className="text-ds-fg-soft" />
        </span>
        <div className="flex w-full flex-col items-center gap-[4px] text-center">
          <p className={cn(DS_TYPE.body_lg_medium, 'm-0 w-full text-ds-text-strong')}>{title}</p>
          {description ? (
            <p className={cn(DS_TYPE.body_md_regular, 'm-0 w-full text-ds-text-default')}>{description}</p>
          ) : null}
        </div>
      </div>
      {action ? (
        <div className="flex w-full items-center justify-center gap-[12px]">
          <DsPrimaryButtonLink to={action.to}>{action.label}</DsPrimaryButtonLink>
        </div>
      ) : null}
    </div>
  );
}

export function DsPrimaryButtonLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className={cn(
        'box-border inline-flex min-h-[36px] min-w-[60px] items-center justify-center gap-[8px] rounded-[6px] border-[1.33px] border-solid border-ds-brand-strong bg-ds-brand px-[16px] whitespace-nowrap no-underline outline-none',
        'transition-colors duration-150 hover:bg-ds-brand-strong active:bg-ds-brand-intense',
        'focus-visible:shadow-[0_0_0_1.5px_var(--color-ds-focus-royal)]',
      )}
    >
      <span className={cn(DS_TYPE.body_md_medium, 'tracking-normal text-ds-on-brand')}>{children}</span>
    </Link>
  );
}
