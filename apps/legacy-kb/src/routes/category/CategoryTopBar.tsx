import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  dashboardExternalLink,
  dashboardExternalLinkHover,
  dashboardSettingLink,
  dashboardSettingLinkHover,
  plusIcon,
} from '../../assets/legacy';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { TooltipIconButton } from '../../components/ui/Tooltip';
import type { User } from '../../store/types';
import { ArticleSearch } from './ArticleSearch';

export interface CategoryTopBarProps {
  currentUser: User | undefined;
  onNewArticle: () => void;
}

/*
 * Live top bar (chunk 854 `q`): padding 34px 40px 10px, two equal
 * halves (search | actions). Action wrappers carry the live paddings:
 * New Article 0 6px, Preview 0 4px, Settings 0 6px, avatar 0 6px.
 */
export function CategoryTopBar({ currentUser, onNewArticle }: CategoryTopBarProps) {
  return (
    <div className="box-border flex w-full flex-row items-start justify-between px-[40px] pt-[34px] pb-[10px]">
      <ArticleSearch />
      <div className="box-border flex w-full flex-row items-center justify-end p-0">
        <div className="box-border flex px-[6px]">
          <Button variant="primary" iconSrc={plusIcon} onClick={onNewArticle}>
            New Article
          </Button>
        </div>
        <div className="box-border flex px-[4px]">
          <TooltipIconButton
            label="Preview"
            src={dashboardExternalLink}
            hoverSrc={dashboardExternalLinkHover}
            size={32}
            onClick={() => window.open('https://product.hiverkb.com', '_blank', 'noopener')}
          />
        </div>
        <div className="box-border flex px-[6px]">
          <TooltipIconButton label="Settings" src={dashboardSettingLink} hoverSrc={dashboardSettingLinkHover} size={32} />
        </div>
        <div className="box-border flex px-[6px]">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              aria-label={`Account: ${currentUser?.name ?? ''}`}
              className="relative m-0 inline-flex cursor-pointer items-center rounded-full border-0 bg-transparent p-0 outline-none focus-visible:shadow-[0_0_0_2px_#1473e6]"
            >
              <Avatar user={currentUser} size={32} />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={6}
                className="z-[200] min-w-[140px] overflow-hidden rounded-[6px] bg-white shadow-legacy-avatar-menu outline-none"
              >
                <DropdownMenu.Item className="flex w-full cursor-pointer items-center px-[16px] py-[10px] font-[sans-serif] text-[14px] font-normal text-[#1a1a1a] outline-none data-[highlighted]:bg-legacy-wash">
                  Logout
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </div>
  );
}
