import { useState } from 'react';
import { Link } from 'react-router-dom';
import { dragHandleIcon, folderIcon, folderOpenIcon } from '../assets/legacy';
import { FixedTooltip } from '../components/ui/Tooltip';
import { cn } from '../lib/cn';
import type { Category } from '../store/types';

export interface CategoryNavItemProps {
  category: Category;
  to: string;
  selected: boolean;
}

/** Shared with the AI › Suggestions row so both rows are one geometry. */
export const NAV_LI_CLASS =
  'relative box-border grid grid-cols-1 gap-[2px] border-x-0 border-y-2 border-solid border-transparent';
export const NAV_LI_STYLE = { gridTemplateRows: '42px 0fr' } as const;

export function navLinkClass(selected: boolean): string {
  return cn(
    'relative my-[2px] flex h-[42px] min-w-0 flex-row items-center justify-start rounded-[5px] pr-[16px] pl-[14px] text-[14px] leading-[28px] text-legacy-body no-underline outline-none hover:bg-legacy-nav-active focus-visible:shadow-[inset_0_0_0_2px_#1473e6]',
    selected ? 'bg-legacy-nav-active font-medium' : 'bg-transparent font-normal',
  );
}

export function navLabelClass(selected: boolean): string {
  return cn(
    'm-0 block w-full cursor-pointer overflow-hidden p-0 text-[14px] leading-[17px] text-ellipsis whitespace-nowrap',
    selected ? 'font-medium text-legacy-ink' : 'font-normal text-legacy-body',
  );
}

/** Live module 3713 only attaches the name tooltip past 10 characters. */
const TOOLTIP_MIN_LENGTH = 10;

/*
 * Live category row (chunk 270 `w` li + `x` row):
 * li: 2px transparent top/bottom border, grid rows 42px/0fr, gap 2px.
 * row: 42px tall, 2px vertical margin, padding 0 16px 0 14px, radius 5px,
 * Inter 14/28 #28476a; hover + selected bg #eaedf4; selected weight 500.
 * Label: 14/17, 400 #28476a (selected 500 #09274A), ellipsis.
 * On hover the folder glyph becomes the 6-dot drag handle.
 */
export function CategoryNavItem({ category, to, selected }: CategoryNavItemProps) {
  const [hovered, setHovered] = useState(false);
  const label = (
    <span className={navLabelClass(selected)}>
      {category.title}
    </span>
  );

  return (
    <li className={NAV_LI_CLASS} style={NAV_LI_STYLE}>
      <Link
        to={to}
        aria-current={selected ? 'page' : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={navLinkClass(selected)}
      >
        <span className="box-border flex w-full flex-row items-center gap-[8px]">
          <span className="h-[16px] w-[16px] shrink-0">
            <img
              src={hovered ? dragHandleIcon : selected ? folderOpenIcon : folderIcon}
              alt=""
              aria-hidden
              draggable={false}
              className={cn(
                'h-[16px] w-[16px]',
                // Live folder icons are `display: block`; the drag handle
                // `img` is inline, so it sits on the 28px line box's
                // baseline (~3px lower). Kept for 1:1 placement.
                hovered ? 'relative z-20 inline cursor-grab' : 'block',
              )}
            />
          </span>
          <span className="min-w-0 flex-1 basis-0">
            {category.title.length > TOOLTIP_MIN_LENGTH ? (
              <FixedTooltip content={category.title}>{label}</FixedTooltip>
            ) : (
              <span className="relative flex">{label}</span>
            )}
          </span>
        </span>
      </Link>
    </li>
  );
}
