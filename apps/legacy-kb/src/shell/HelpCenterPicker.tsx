import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useState } from 'react';
import { cn } from '../lib/cn';
import type { HelpCenter } from '../store/types';

/* Inline SVGs copied from the live picker (chunk 616). */
function DocGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <path
        d="M8 1.5H3.5C2.94772 1.5 2.5 1.94772 2.5 2.5V11.5C2.5 12.0523 2.94772 12.5 3.5 12.5H10.5C11.0523 12.5 11.5 12.0523 11.5 11.5V5L8 1.5Z"
        stroke="#0f172a"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 1.5V5H11.5" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface HelpCenterPickerProps {
  helpCenters: HelpCenter[];
  activeId: string;
  onSelect: (id: string) => void;
}

/**
 * Sidebar help-center switcher. Geometry from the live `k`/`C`/`L`/`$`/`N`
 * styled components: 40px button, 1px #d5d5d5 border, radius 6px,
 * Inter 14/20 500 #0f172a label; menu radius 8px with 4px padding.
 */
export function HelpCenterPicker({ helpCenters, activeId, onSelect }: HelpCenterPickerProps) {
  const [open, setOpen] = useState(false);
  const active = helpCenters.find((hc) => hc.id === activeId);
  return (
    <div className="relative mx-[14px] mt-0 mb-[16px]">
      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger
          className="m-0 box-border flex h-[40px] w-full cursor-pointer items-center gap-[8px] overflow-hidden rounded-[6px] border border-solid border-legacy-picker-border bg-white px-[12px] py-[6px] transition-[border-color] duration-150 ease-[ease] outline-none hover:border-legacy-picker-border-hover focus-visible:border-legacy-blue"
          aria-label={`Help Center: ${active?.title ?? ''}`}
        >
          <DocGlyph />
          <span className="overflow-hidden text-left font-inter text-[14px] leading-[20px] font-medium text-ellipsis whitespace-nowrap text-legacy-picker">
            {active?.title}
          </span>
          <span
            className="ml-auto flex shrink-0 items-center transition-transform duration-150 ease-[ease]"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
          >
            <ChevronGlyph />
          </span>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="start"
            sideOffset={4}
            avoidCollisions={false}
            className="z-[100] box-border max-h-[240px] w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto rounded-[8px] border border-solid border-legacy-picker-menu-border bg-white p-[4px] shadow-legacy-picker-menu outline-none"
          >
            {helpCenters.map((hc) => {
              const isActive = hc.id === activeId;
              return (
                <DropdownMenu.Item
                  key={hc.id}
                  onSelect={() => onSelect(hc.id)}
                  className={cn(
                    'flex cursor-pointer items-center gap-[8px] rounded-[6px] px-[12px] py-[8px] font-inter text-[14px] leading-[20px] text-legacy-picker outline-none data-[highlighted]:bg-legacy-picker-menu-hover',
                    isActive ? 'bg-legacy-picker-menu-hover font-medium' : 'font-normal',
                  )}
                >
                  <DocGlyph />
                  {hc.title}
                </DropdownMenu.Item>
              );
            })}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
