import type { ReactNode } from 'react';
import { optionIcon } from '../../assets/legacy';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '../../components/ui/Menu';
import { capitalize } from '../../lib/format';
import type { Category } from '../../store/types';

export interface CategoryHeaderProps {
  category: Category;
}

/*
 * Live category header (chunk 854 `j`/`w`/`A`): min-height 75px,
 * padding 15px 40px 10px; 30px brand-color Material glyph; title
 * Inter 14/17 500 #09274a (5px bottom padding), description 13/20 400
 * #28476a; 32px kebab with #f5f5f5 round hover; 166px menu.
 */
export interface PageHeaderProps {
  /** Material Icons Outlined ligature, rendered 30px in the brand color. */
  icon: string;
  title: string;
  description?: string;
  /** Trailing control (the category kebab). */
  actions?: ReactNode;
}

/** The category header block, shared with the AI suggestions hub. */
export function PageHeader({ icon, title, description, actions }: PageHeaderProps) {
  return (
    <div className="box-border flex min-h-[75px] flex-row items-center justify-between px-[40px] pt-[15px] pb-[10px]">
      <div className="box-border flex w-full flex-row items-center">
        <div className="box-border flex flex-col items-center justify-center">
          <MaterialIcon name={icon} size={30} />
        </div>
        <div className="box-border flex flex-col justify-between px-[14px]">
          <h1 className="m-0 block w-full pt-0 pr-0 pb-[5px] pl-0 text-[14px] leading-[17px] font-medium text-legacy-ink">
            {title}
          </h1>
          {description ? (
            <p className="m-0 block w-full p-0 text-[13px] leading-[20px] font-normal text-legacy-body">{description}</p>
          ) : null}
        </div>
      </div>
      {actions}
    </div>
  );
}

export function CategoryHeader({ category }: CategoryHeaderProps) {
  return (
    <PageHeader
      icon={category.icon}
      title={category.title}
      description={category.description ? capitalize(category.description) : undefined}
      actions={
        <MenuRoot modal={false}>
          <MenuTrigger
            aria-label="Category options"
            className="relative m-0 flex h-[32px] w-[32px] shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 outline-none hover:bg-legacy-row-hover focus-visible:shadow-[0_0_0_2px_#1473e6] data-[state=open]:bg-legacy-row-hover"
          >
            <img src={optionIcon} alt="" width={20} height={20} className="cursor-pointer" />
          </MenuTrigger>
          <MenuContent width={166} align="end" sideOffset={4}>
            <MenuItem>
              <span className="m-0 p-0 text-[13px] leading-[20px] font-medium text-legacy-body">Edit category</span>
            </MenuItem>
            <MenuItem>
              <span className="m-0 p-0 text-[13px] leading-[20px] font-medium text-legacy-body">Delete category</span>
            </MenuItem>
          </MenuContent>
        </MenuRoot>
      }
    />
  );
}
