import * as React from 'react';
import { ChevronDown } from '@untitledui/icons';
import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * Shared field atoms
 *
 * Every settings field uses a label row + 40-tall input box. The
 * input box is a div (not an <input>) because these controls are
 * demo-only for v1 — they open no real dropdown menus.
 *
 * These atoms are extracted from ArticleSettingsPanel so that
 * consumers can compose visually-correct fields outside the panel
 * without re-implementing chrome.
 * ───────────────────────────────────────────────────────────── */

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[13px] font-medium leading-[19px] text-text-primary">
      {children}
    </label>
  );
}

export type FieldBoxProps = {
  children: React.ReactNode;
  className?: string;
  /** When true, the box renders as a <button> so it is focusable. */
  as?: 'button' | 'div';
  onClick?: () => void;
  ariaLabel?: string;
};

export function FieldBox({ children, className, as = 'button', onClick, ariaLabel }: FieldBoxProps) {
  const baseClass = cn(
    'flex w-full min-h-[40px] items-center gap-2 rounded-[8px] border border-card-border bg-white px-3',
    'text-[14px] leading-[20px] font-normal text-text-primary',
    'transition-colors focus:outline-none focus:border-border-faint',
    'hover:border-border-faint',
    className,
  );

  if (as === 'button') {
    return (
      <button type="button" onClick={onClick} aria-label={ariaLabel} className={cn(baseClass, 'text-left cursor-pointer')}>
        {children}
      </button>
    );
  }
  return <div className={baseClass}>{children}</div>;
}

export function ChevronSuffix() {
  return (
    <ChevronDown
      aria-hidden="true"
      className="ml-auto h-4 w-4 shrink-0 text-text-disabled"
    />
  );
}

export function CharCounter({ count, max }: { count: number; max: number }) {
  return (
    <span className="text-[12px] font-normal leading-[18px] text-text-disabled tabular-nums">
      {count}/{max}
    </span>
  );
}
