// Figma: 251DTRmxl2L6jmXd3FWzHe#2045:9269
import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Switch from '@radix-ui/react-switch';
import { RiArrowDownSLine, RiInformationLine } from '@remixicon/react';
import { Card } from '../primitives/Card';
import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────────────────────── */

export type SortOption = { id: string; label: string };

export type AIConversationLogsCardProps = {
  /** Title above the card. Default "AI Search & Conversation logs". */
  title?: string;
  /** Subtitle — default "Anonymised AI conversations". */
  subtitle?: string;
  infoTooltip?: string;
  /** Sort options for the "Sort by" dropdown. */
  sortOptions: SortOption[];
  /** Currently-selected sort option. */
  sortBy: string;
  onSortChange?: (id: string) => void;
  /** "Ticket Created" toggle state. */
  ticketCreatedFilter: boolean;
  onTicketCreatedToggle?: (next: boolean) => void;
  /** Conversation entries — order matters. */
  children: React.ReactNode;
  className?: string;
};

/* ─────────────────────────────────────────────────────────────
 * Internal: Sort dropdown trigger
 * ───────────────────────────────────────────────────────────── */

type SortDropdownProps = {
  options: SortOption[];
  value: string;
  onChange?: (id: string) => void;
};

function SortDropdown({ options, value, onChange }: SortDropdownProps) {
  const selected = options.find((opt) => opt.id === value);
  const currentLabel = selected?.label ?? 'None';

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          data-kb-part="ai-conversation-logs-sort"
          aria-label={`Sort by, current: ${currentLabel}`}
          className={cn(
            'inline-flex items-center gap-2 rounded-[6px] bg-[#f1f5f9] px-3 py-1.5',
            'text-[14px] font-medium leading-5 text-[#0f172a]',
            'hover:bg-[#e2e8f0]',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10',
            'data-[state=open]:bg-[#e2e8f0]',
          )}
        >
          Sort by
          <RiArrowDownSLine
            size={14}
            aria-hidden="true"
            className="text-[#64758b]"
          />
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
          {options.map((opt) => (
            <DropdownMenu.Item
              key={opt.id}
              onSelect={() => onChange?.(opt.id)}
              className={cn(
                'flex cursor-pointer items-center rounded-[6px] px-2 py-1.5',
                'text-[14px] leading-5 text-[#0f172a]',
                'data-[highlighted]:bg-[#f8fafc] focus:outline-none',
              )}
            >
              {opt.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Main component
 * ───────────────────────────────────────────────────────────── */

export function AIConversationLogsCard({
  title = 'AI Search & Conversation logs',
  subtitle = 'Anonymised AI conversations',
  infoTooltip,
  sortOptions,
  sortBy,
  onSortChange,
  ticketCreatedFilter,
  onTicketCreatedToggle,
  children,
  className,
}: AIConversationLogsCardProps) {
  return (
    <Card
      padding="none"
      data-kb-component="ai-conversation-logs-card"
      className={cn('p-5', className)}
    >
      {/* Header block */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[14px] font-medium leading-5 text-[#0f172a]">
            {title}
          </h3>
          <span
            className="inline-flex"
            title={infoTooltip}
            aria-label={infoTooltip ?? 'More info'}
          >
            <RiInformationLine
              size={16}
              aria-hidden="true"
              className="text-[#64758b]"
            />
          </span>
        </div>
        <p className="text-[13px] font-normal leading-[19px] text-[#475569]">
          {subtitle}
        </p>
      </div>

      {/* Toolbar row — Sort by dropdown + Ticket Created switch */}
      <div className="mt-3 flex items-center gap-3 pb-4">
        <SortDropdown
          options={sortOptions}
          value={sortBy}
          onChange={onSortChange}
        />
        <div className="flex items-center gap-2">
          <Switch.Root
            checked={ticketCreatedFilter}
            onCheckedChange={onTicketCreatedToggle}
            data-kb-part="ai-conversation-logs-ticket-toggle"
            className={cn(
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors',
              'data-[state=unchecked]:bg-[#e2e8f0] data-[state=checked]:bg-[#0f172a]',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
            )}
          >
            <Switch.Thumb className="block size-4 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[18px]" />
          </Switch.Root>
          <span className="text-[14px] font-normal leading-5 text-[#475569]">
            Ticket Created
          </span>
        </div>
      </div>

      {/* Header/list divider */}
      <div className="border-t border-[#e2e8f0]" />

      {/* Entries — caller passes a list of <AIConversationLogEntry>.
       * The wrapper applies a hairline divider between entries via
       * `[&>*+*]:border-t [&>*]:border-[#e5e5e5]`. The very last
       * entry has no bottom border by virtue of the sibling combinator. */}
      <div
        data-kb-part="ai-conversation-logs-list"
        className="flex flex-col [&>*]:border-b [&>*]:border-[#e5e5e5] [&>*:last-child]:border-b-0"
      >
        {children}
      </div>
    </Card>
  );
}
