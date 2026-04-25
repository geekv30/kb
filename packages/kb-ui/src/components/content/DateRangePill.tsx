import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  RiCalendarLine,
  RiArrowDownSLine,
} from '@remixicon/react';
import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * DateRangePill — the small "Last 7 days ▾" pill button used as
 * the global date filter on the analytics screens. Built on
 * Radix DropdownMenu so it inherits keyboard nav, focus mgmt,
 * and a11y semantics (`role="menu"` etc.) for free.
 *
 * `'custom'` is a placeholder value — the trigger renders
 * "Custom" but no real picker is wired yet.
 * ───────────────────────────────────────────────────────────── */

export type DateRange = '7d' | '30d' | '90d' | 'custom';

export type DateRangePillProps = {
  value: DateRange;
  onChange?: (next: DateRange) => void;
  /** Override the human label. Defaults to the matching DEFAULT_LABEL entry. */
  label?: string;
  className?: string;
};

const DEFAULT_LABEL: Record<DateRange, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  custom: 'Custom',
};

const PRESETS: Array<{ value: Exclude<DateRange, 'custom'>; label: string }> = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

export function DateRangePill({ value, onChange, label, className }: DateRangePillProps) {
  const displayLabel = label ?? DEFAULT_LABEL[value];

  const handleSelect = (next: DateRange) => () => {
    onChange?.(next);
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          data-kb-component="date-range-pill"
          className={cn(
            'inline-flex items-center gap-2 rounded-[8px] bg-[#f1f5f9] px-3 py-1.5',
            'text-[14px] font-normal leading-5 text-[#0f172a]',
            'hover:bg-[#e2e8f0]',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10',
            'data-[state=open]:bg-[#e2e8f0]',
            className,
          )}
        >
          <RiCalendarLine size={14} className="text-[#64748b]" aria-hidden="true" />
          <span>{displayLabel}</span>
          <RiArrowDownSLine size={14} className="text-[#64748b]" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className={cn(
            'z-50 min-w-[160px] rounded-[8px] border border-card-border bg-white p-1',
            'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.10)]',
          )}
        >
          {PRESETS.map((preset) => (
            <DropdownMenu.Item
              key={preset.value}
              onSelect={handleSelect(preset.value)}
              className={cn(
                'flex cursor-pointer items-center rounded-[6px] px-2 py-1.5',
                'text-[14px] leading-5 text-[#0f172a]',
                'data-[highlighted]:bg-[#f8fafc] focus:outline-none',
              )}
            >
              {preset.label}
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator className="my-1 h-px bg-card-border" />
          <DropdownMenu.Item
            onSelect={handleSelect('custom')}
            className={cn(
              'flex cursor-pointer items-center rounded-[6px] px-2 py-1.5',
              'text-[14px] leading-5 text-[#0f172a]',
              'data-[highlighted]:bg-[#f8fafc] focus:outline-none',
            )}
          >
            Custom…
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
