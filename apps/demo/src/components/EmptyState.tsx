// Phase 7.5.8 — Reusable empty-state pattern (PRD §12.5).
//
// Centered icon (optional) + title + subtitle + optional CTA. Used by
// CategoryPage, the AI Optimise hub, and any other surface that can
// legitimately be "empty" rather than "loading" or "errored".

import type { ReactNode } from 'react';
import { Button } from '@hiver/kb-ui';
import { cn } from '../lib/cn';

export type EmptyStateProps = {
  /** Optional leading icon — Remix icon component, sized by the parent. */
  icon?: ReactNode;
  /** Headline. Short, sentence case. */
  title: string;
  /** One-line follow-up explaining what to do next or why it's empty. */
  subtitle?: string;
  /** Optional CTA. When supplied a primary kb-ui Button renders below. */
  cta?: {
    label: string;
    onClick: () => void;
  };
  /** Override container styling (rare — most callers just need defaults). */
  className?: string;
};

export function EmptyState({
  icon,
  title,
  subtitle,
  cta,
  className,
}: EmptyStateProps) {
  return (
    <div
      data-kb-part="empty-state"
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-[8px]',
        'border border-dashed border-[#e2e8f0] bg-[#fafafa]',
        'py-16 px-6 text-center',
        className,
      )}
    >
      {icon && (
        <div
          aria-hidden="true"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#64748b] [&>svg]:h-5 [&>svg]:w-5"
        >
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <p className="text-[16px] font-medium leading-6 text-[#0f172a]">
          {title}
        </p>
        {subtitle && (
          <p className="text-[14px] leading-5 text-[#64748b]">{subtitle}</p>
        )}
      </div>
      {cta && (
        <Button variant="primary" onClick={cta.onClick}>
          {cta.label}
        </Button>
      )}
    </div>
  );
}
