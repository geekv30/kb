// Hiver design system `Badge`, variant "subtle", tone "info" (→ the
// blue accent), size "md", shape "pill", rendered as a link.
//
// From the bundle's `_BadgeShell` / `_BadgeSubtle`: inline-flex, 4px
// gap, 24px min height, 8px side padding, full radius; 14px icon in
// currentColor; label body_sm_medium. Colors: background.accents.blue
// .subtle with text.accents.blue.intense. The badge keeps its fill on
// hover (as the shell does); focus uses the system's 1.5px royal ring.

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { DS_TYPE } from './typography';

export interface DsBadgeLinkProps {
  to: string;
  icon?: ReactNode;
  children: ReactNode;
  'aria-label'?: string;
  className?: string;
}

export function DsBadgeLink({ to, icon, children, className, ...rest }: DsBadgeLinkProps) {
  return (
    <Link
      to={to}
      aria-label={rest['aria-label']}
      className={cn(
        'box-border inline-flex min-h-[24px] shrink-0 items-center justify-center gap-[4px] rounded-full bg-ds-info-subtle px-[8px] whitespace-nowrap text-ds-blue-intense no-underline outline-none',
        'focus-visible:shadow-[0_0_0_1.5px_var(--color-ds-focus-royal)]',
        className,
      )}
    >
      {icon ? <span className="inline-flex size-[14px] shrink-0 items-center justify-center">{icon}</span> : null}
      <span className={cn(DS_TYPE.body_sm_medium, 'text-ds-blue-intense')}>{children}</span>
    </Link>
  );
}
