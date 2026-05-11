import * as React from 'react';
import { RiArrowDownSLine, RiCloseLine } from '@remixicon/react';
import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * Shared field atoms
 *
 * Every settings field uses a label row + 40-tall input box. The
 * input box is a div (not an <input>) because these controls are
 * demo-only for v1 — they open no real dropdown menus. See design
 * doc.
 *
 * These atoms are extracted from ArticleSettingsPanel so that
 * consumers can compose visually-correct fields outside the panel
 * without re-implementing chrome. Render output is byte-identical
 * to the previous private declarations.
 * ───────────────────────────────────────────────────────────── */

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[14px] font-medium leading-[20px] text-text-primary">
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
    <RiArrowDownSLine
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

export function Placeholder({ children }: { children: React.ReactNode }) {
  return <span className="text-text-disabled">{children}</span>;
}

/* ─────────────────────────────────────────────────────────────
 * Tag chip (custom — Badge primitive is not quite right:
 * Badge is pill-y but doesn't have the × close affordance and
 * has specific variant colors. Panel tags match spec better
 * with a dedicated chip).
 * ───────────────────────────────────────────────────────────── */

export type TagChipProps = {
  label: string;
  onRemove?: () => void;
};

export function TagChip({ label, onRemove }: TagChipProps) {
  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center gap-1.5 rounded-full bg-surface-muted pl-2 pr-1',
        'text-[12px] font-medium leading-[18px] text-text-primary',
      )}
    >
      <span>{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className={cn(
            'inline-flex h-[16px] w-[16px] items-center justify-center rounded-full',
            'text-text-muted hover:bg-card-border hover:text-text-primary',
            'focus:outline-none focus:ring-2 focus:ring-black/10',
          )}
        >
          <RiCloseLine className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

export function AddChipButton({ onClick, label = '+ Add' }: { onClick?: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-[22px] items-center rounded-full border border-dashed border-border-faint bg-white px-2',
        'text-[12px] font-medium leading-[18px] text-text-meta',
        'hover:bg-surface-subtle focus:outline-none focus:ring-2 focus:ring-black/10',
      )}
    >
      {label}
    </button>
  );
}
