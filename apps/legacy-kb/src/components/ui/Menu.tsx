import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export const MenuRoot = DropdownMenu.Root;
export const MenuTrigger = DropdownMenu.Trigger;

export interface MenuContentProps {
  children: ReactNode;
  /** Live kebab menu is 166px wide; dropdown fields match their trigger. */
  width?: number | string;
  align?: 'start' | 'end';
  sideOffset?: number;
  alignOffset?: number;
  maxHeight?: number;
  className?: string;
}

/*
 * Live dropdown card (`Bu` + `O8`): white, radius 4px,
 * shadow rgb(0 0 0 / 25%) 0 0 10px; list padding 6px 0.
 */
export function MenuContent({
  children,
  width = 166,
  align = 'end',
  sideOffset = 4,
  alignOffset = 0,
  maxHeight,
  className,
}: MenuContentProps) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        align={align}
        side="bottom"
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        avoidCollisions={false}
        className={cn(
          'z-[202] box-border overflow-y-auto rounded-[4px] bg-white py-[6px] font-inter shadow-legacy-menu outline-none select-none',
          className,
        )}
        style={{ width, maxHeight }}
      >
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  );
}

export interface MenuItemProps {
  children: ReactNode;
  onSelect?: () => void;
  className?: string;
}

/* Live `E5` row: padding 8px 16px, hover #f2f6ff. */
export function MenuItem({ children, onSelect, className }: MenuItemProps) {
  return (
    <DropdownMenu.Item
      onSelect={onSelect}
      className={cn(
        'm-0 cursor-pointer px-[16px] py-[8px] outline-none data-[highlighted]:bg-legacy-wash',
        className,
      )}
    >
      {children}
    </DropdownMenu.Item>
  );
}

export const MenuLabel = DropdownMenu.Label;
