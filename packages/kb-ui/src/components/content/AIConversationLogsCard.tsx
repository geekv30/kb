// Figma: 251DTRmxl2L6jmXd3FWzHe#2045:9269
import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Switch from '@radix-ui/react-switch';
import { ChevronDown, InfoCircle } from '@untitledui/icons';
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
  /** Sort options for the "Sort by" dropdown. Required when default header is rendered. */
  sortOptions?: SortOption[];
  /** Currently-selected sort option. Required when default header is rendered. */
  sortBy?: string;
  onSortChange?: (id: string) => void;
  /** "Ticket Created" toggle state. Required when default header is rendered. */
  ticketCreatedFilter?: boolean;
  onTicketCreatedToggle?: (next: boolean) => void;
  /** Conversation entries — order matters. */
  children: React.ReactNode;
  className?: string;
  toolbar?: React.ReactNode;
  /**
   * Header slot.
   * - `undefined` (default) — render the canonical title + subtitle + toolbar
   *   block with the divider below it.
   * - `null` — suppress the entire chrome above the entries (no title, no
   *   toolbar, no divider). Used for surfaces where the header lives
   *   outside the card (e.g. the library-check / Figma `156:3987` frame).
   * - `ReactNode` — replace the default header with custom content. The
   *   bottom divider is still rendered to separate header from entries.
   */
  header?: React.ReactNode | null;
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
            'inline-flex items-center gap-2 rounded-[6px] bg-surface-muted px-3 py-1.5',
            'text-[14px] font-medium leading-5 text-text-primary',
            // Specific properties on the transition + strong ease-out curve.
            // Emil-style press feedback: subtle 0.97 scale on `:active`
            // confirms the click landed. `motion-safe:` gates the scale so
            // reduced-motion users only see the colour flip.
            'transition-[background-color,transform] duration-[160ms] [transition-timing-function:var(--ease-out-strong)]',
            'hover:bg-card-border motion-safe:active:scale-[0.97]',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10',
            'data-[state=open]:bg-card-border',
          )}
        >
          Sort by
          <ChevronDown
            size={14}
            aria-hidden="true"
            className="text-text-muted"
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
            // Origin-aware popover entrance — scales from the trigger.
            // Radix exposes the computed origin as a CSS var; we set it
            // via inline `transformOrigin` below. Opacity 0 → 1 + scale
            // 0.96 → 1 (never scale from 0 — nothing in the real world
            // appears from nothing). 150ms with the strong ease-out curve
            // per Emil's framework. Uses the kb-ui-internal
            // `kb-dropdown-in` keyframe (defined in tokens.css) which
            // is gated by `prefers-reduced-motion: reduce` via the global
            // `motion-safe:` mechanism at the call site.
            'motion-safe:data-[state=open]:animate-kb-dropdown-in',
          )}
          style={{
            transformOrigin: 'var(--radix-dropdown-menu-content-transform-origin)',
          }}
        >
          {options.map((opt) => (
            <DropdownMenu.Item
              key={opt.id}
              onSelect={() => onChange?.(opt.id)}
              className={cn(
                'flex cursor-pointer items-center rounded-[6px] px-2 py-1.5',
                'text-[14px] leading-5 text-text-primary',
                // Specific property on the highlight transition — never
                // `transition-colors` catch-all. Quick 120ms feel for the
                // row-by-row hover ripple as the user arrow-keys through
                // the menu.
                'transition-[background-color] duration-[120ms] [transition-timing-function:var(--ease-out-strong)]',
                'data-[highlighted]:bg-surface-subtle focus:outline-none',
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
  toolbar,
  header,
}: AIConversationLogsCardProps) {
  // Resolve which header chrome to render.
  // - `undefined` → default (title + subtitle + toolbar).
  // - `null`      → none (entries paint to the card's padded edge, used by
  //                 the library-check `156:3987` review surface).
  // - ReactNode   → caller-supplied header in place of default.
  const renderHeader = header !== null;
  const headerContent = header === undefined ? null : header; // ReactNode | null

  return (
    <Card
      padding="none"
      data-kb-component="ai-conversation-logs-card"
      // Outer border colour matches Figma library-check `156:3987` (#e2e8f0)
      // rather than the global `--color-card-border` (#e5e5e5). Per Phase 15
      // calibration: drift fixed in-place on this card only.
      className={cn('border-card-border p-5', className)}
    >
      {renderHeader ? (
        <>
          {headerContent === null ? (
            <>
              {/* Default header block */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-[14px] font-medium leading-5 text-text-primary">
                    {title}
                  </h3>
                  <span
                    className="inline-flex"
                    title={infoTooltip}
                    aria-label={infoTooltip ?? 'More info'}
                  >
                    <InfoCircle
                      size={16}
                      aria-hidden="true"
                      className="text-text-muted"
                    />
                  </span>
                </div>
                <p className="text-[13px] font-normal leading-[19px] text-text-meta">
                  {subtitle}
                </p>
              </div>

              {/* Toolbar row — Sort by dropdown + Ticket Created switch
               * (default), or caller-provided `toolbar` content. */}
              <div className="mt-3 flex items-center gap-3 pb-4">
                {toolbar === undefined ? (
                  <>
                    <SortDropdown
                      options={sortOptions ?? []}
                      value={sortBy ?? ''}
                      onChange={onSortChange}
                    />
                    <div className="flex items-center gap-2">
                      <Switch.Root
                        checked={ticketCreatedFilter ?? false}
                        onCheckedChange={onTicketCreatedToggle}
                        data-kb-part="ai-conversation-logs-ticket-toggle"
                        className={cn(
                          // Specific property on the track transition (no
                          // `transition-colors` catch-all). The strong
                          // ease-out curve makes the state flip read as
                          // intentional rather than a soft fade. 200ms
                          // is the upper end of "feels responsive" for
                          // toggles per Emil's framework.
                          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full',
                          'transition-[background-color] duration-[200ms] [transition-timing-function:var(--ease-out-strong)]',
                          'data-[state=unchecked]:bg-card-border data-[state=checked]:bg-text-primary',
                          'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
                        )}
                      >
                        <Switch.Thumb
                          className={cn(
                            'block size-4 translate-x-0.5 rounded-full bg-white shadow',
                            // Thumb slide uses the same curve as the track
                            // so the two motions land together. `motion-safe`
                            // gates the slide; reduced-motion users still
                            // see the position change instantly.
                            'motion-safe:transition-transform motion-safe:duration-[200ms] [transition-timing-function:var(--ease-out-strong)]',
                            'data-[state=checked]:translate-x-[18px]',
                          )}
                        />
                      </Switch.Root>
                      <span className="text-[14px] font-normal leading-5 text-text-meta">
                        Ticket Created
                      </span>
                    </div>
                  </>
                ) : (
                  toolbar
                )}
              </div>
            </>
          ) : (
            headerContent
          )}

          {/* Header/list divider */}
          <div className="border-t border-card-border" />
        </>
      ) : null}

      {/* Entries — caller passes a list of <AIConversationLogEntry>.
       * The wrapper applies a hairline divider between entries via
       * `[&>*]:border-b [&>*:last-child]:border-b-0`. Divider colour
       * matches Figma library-check `156:3987` (#e2e8f0). */}
      <div
        data-kb-part="ai-conversation-logs-list"
        className="flex flex-col [&>*]:border-b [&>*]:border-card-border [&>*:last-child]:border-b-0"
      >
        {children}
      </div>
    </Card>
  );
}
