import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useState, type ReactNode } from 'react';
import { downArrow, infoIcon } from '../../assets/legacy';
import { Avatar } from '../../components/ui/Avatar';
import { TextInput } from '../../components/ui/TextInput';
import { TooltipIconButton } from '../../components/ui/Tooltip';
import { cn } from '../../lib/cn';
import { truncate } from '../../lib/format';
import type { Category, User } from '../../store/types';

const SLUG_MAX = 200;

/*
 * Live dropdown field (chunk 864 `C`/`B` on the `c_` hover block):
 * padding 4px 8px 10px 8px, hover #e4edfa radius 4px; header 13/20
 * #4e6382 (5px gap); value 14/17 500 #09274a with a 20px chevron.
 * Menu: live `Bu` card, 260px max height, starts 69px below the block top.
 */
interface DropdownFieldProps {
  label: string;
  value: ReactNode;
  leading?: ReactNode;
  className?: string;
  children: ReactNode;
}

function DropdownField({ label, value, leading, className, children }: DropdownFieldProps) {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenu.Trigger
        className={cn(
          'relative m-0 box-border flex w-full cursor-pointer flex-col items-stretch rounded-[4px] border-0 bg-transparent px-[8px] pt-[4px] pb-[10px] text-left font-inter outline-none hover:bg-legacy-icon-hover focus-visible:shadow-[inset_0_0_0_2px_#1473e6]',
          className,
        )}
      >
        <span className="m-0 mb-[5px] block w-full p-0 text-[13px] leading-[20px] font-normal text-legacy-meta">
          {label}
        </span>
        <span className="box-border flex w-full cursor-pointer items-center">
          {leading}
          <span className="m-0 block w-full cursor-pointer overflow-hidden p-0 text-[14px] leading-[17px] font-medium text-ellipsis whitespace-nowrap text-legacy-ink">
            {value}
          </span>
          <img src={downArrow} alt="" width={20} height={20} className={cn(open && 'rotate-180')} />
        </span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          avoidCollisions={false}
          className="z-[100] box-border max-h-[260px] w-[var(--radix-dropdown-menu-trigger-width)] overflow-hidden overflow-y-auto rounded-[4px] bg-white font-inter shadow-legacy-menu outline-none select-none"
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function OptionLabel({ selected, children }: { selected: boolean; children: ReactNode }) {
  return (
    <span
      className={cn(
        'block cursor-pointer overflow-hidden p-0 text-[13px] leading-[20px] text-ellipsis whitespace-nowrap',
        selected ? 'font-medium text-legacy-ink' : 'font-normal text-legacy-body',
      )}
    >
      {children}
    </span>
  );
}

const OPTION = 'm-0 cursor-pointer px-[16px] py-[8px] outline-none data-[highlighted]:bg-legacy-wash';

export interface ArticleMetaPanelProps {
  users: User[];
  authorId: string | null;
  onAuthorChange: (userId: string) => void;
  categories: Category[];
  categoryId: string;
  onCategoryChange: (categoryId: string) => void;
  slug: string;
  onSlugChange: (slug: string) => void;
  slugError?: string;
}

export function ArticleMetaPanel({
  users,
  authorId,
  onAuthorChange,
  categories,
  categoryId,
  onCategoryChange,
  slug,
  onSlugChange,
  slugError,
}: ArticleMetaPanelProps) {
  const author = authorId ? users.find((u) => u.id === authorId) : undefined;
  const category = categories.find((c) => c.id === categoryId);
  const counterError = slug.length === 0 || slug.length > SLUG_MAX;

  return (
    <aside aria-label="Article settings" className="m-0 box-border flex w-[218px] shrink-0 flex-col">
      <DropdownField
        label="Author"
        value={author?.name ?? 'Unassigned'}
        leading={<Avatar user={author} size={24} className="mr-[8px]" />}
      >
        <ul className="m-0 w-full list-none px-0 py-[6px]">
          {users.map((user) => (
            <DropdownMenu.Item key={user.id} asChild onSelect={() => onAuthorChange(user.id)}>
              <li className={OPTION}>
                <div className="box-border flex w-full items-center">
                  <Avatar user={user} size={24} className="mr-[8px]" />
                  <div className="box-border flex w-full cursor-pointer overflow-hidden">
                    <OptionLabel selected={user.id === authorId}>{user.name}</OptionLabel>
                  </div>
                </div>
              </li>
            </DropdownMenu.Item>
          ))}
        </ul>
      </DropdownField>

      <DropdownField label="Category" value={truncate(category?.title ?? '', 30)} className="my-[15px]">
        <div className="box-border flex w-full flex-row items-start px-[16px] pt-[12px] pb-0">
          <span className="m-0 p-0 text-[13px] leading-[28px] font-normal text-legacy-meta">All Categories</span>
        </div>
        <ul className="m-0 w-full list-none px-0 py-[6px]">
          {categories.map((c) => (
            <DropdownMenu.Item key={c.id} asChild onSelect={() => onCategoryChange(c.id)}>
              <li className={OPTION}>
                <OptionLabel selected={c.id === categoryId}>{truncate(c.title, 30)}</OptionLabel>
              </li>
            </DropdownMenu.Item>
          ))}
        </ul>
      </DropdownField>

      <div className="relative m-0 box-border flex w-full flex-col pt-0 pr-0 pb-[30px] pl-0">
        <div className="box-border flex w-full flex-row items-center px-[8px] py-[4px]">
          <label htmlFor="slug" className="mt-0 mr-[10px] mb-0 ml-0 p-0 text-[13px] leading-[20px] font-normal text-legacy-meta">
            Article slug
          </label>
          <TooltipIconButton
            label="About article slugs"
            content="This will be the end of the URL in your address bar"
            src={infoIcon}
            size={16}
            placement="top-right"
          />
        </div>
        <div className="relative box-border flex w-full flex-col pt-0 pr-0 pb-0 pl-[8px]">
          {slug.length > 0 || slugError ? (
            <span
              aria-live="polite"
              className={cn(
                'absolute top-[8px] right-[8px] ml-[12px] w-auto p-0 text-[12px] leading-[28px] font-normal',
                counterError ? 'text-legacy-danger' : 'text-legacy-meta',
              )}
            >
              {slug.length}/{SLUG_MAX}
            </span>
          ) : null}
          <TextInput
            id="slug"
            value={slug}
            invalid={Boolean(slugError)}
            placeholder="Enter a slug"
            className="w-auto py-[6px] pr-[60px] pl-[12px]"
            onChange={(e) => onSlugChange(e.target.value.toLowerCase())}
            aria-invalid={Boolean(slugError)}
            aria-describedby={slugError ? 'slug-error' : undefined}
          />
          {slugError ? (
            <span id="slug-error" className="ml-[12px] p-0 text-[12px] leading-[28px] font-normal text-legacy-danger">
              {slugError}
            </span>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
