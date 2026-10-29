import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  lockIcon,
  settingDashboardButton,
  settingsBranding,
  settingsBrandingNone,
  sidebarLogo,
  siteSettingIcon,
  siteSettingIconSelected,
  userSiteSetting,
  userSiteSettingSelected,
} from '../assets/legacy';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { ToastProvider } from '../components/ui/Toast';
import { TooltipIconButton } from '../components/ui/Tooltip';
import { cn } from '../lib/cn';
import { ACCESS_SETTINGS_PATH, BRANDING_SETTINGS_PATH, SITE_SETTINGS_PATH } from '../lib/paths';
import { HelpCenterPicker } from '../shell/HelpCenterPicker';
import { PrototypeBar } from '../shell/PrototypeBar';
import { selectActiveHelpCenter } from '../store/selectors';
import { useStore } from '../store/StoreContext';

type SettingsSection = { path: string; label: string; crumb: string; icon: string; iconSelected: string };

/** Live settings sidebar rows, in order. `crumb` is the header's page name. */
const SECTIONS: SettingsSection[] = [
  { path: BRANDING_SETTINGS_PATH, label: 'Branding', crumb: 'Branding', icon: settingsBrandingNone, iconSelected: settingsBranding },
  { path: ACCESS_SETTINGS_PATH, label: 'Access', crumb: 'User access', icon: userSiteSetting, iconSelected: userSiteSettingSelected },
  { path: SITE_SETTINGS_PATH, label: 'Site settings', crumb: 'Site settings', icon: siteSettingIcon, iconSelected: siteSettingIconSelected },
];

/*
 * Live settings sidebar: the editor sidebar's logo + picker, then a
 * `ul` (padding 0 18px) of 42px rows (margin 2px 0, 14/17 500 #28476a).
 * Hover and selected share the #eaedf4 wash with a 5px radius; the
 * selected label darkens to #09274a. Icons are 18px at margin 0 12 0 16.
 */
function SettingsNavItem({ section, selected }: { section: SettingsSection; selected: boolean }) {
  return (
    <li className="m-0 p-0">
      <Link
        to={section.path}
        aria-current={selected ? 'page' : undefined}
        className={cn(
          'my-[2px] box-border flex h-[42px] cursor-pointer flex-row items-center rounded-[5px] font-inter text-[14px] leading-[17px] font-medium text-legacy-body no-underline outline-none hover:bg-legacy-nav-active focus-visible:shadow-[0_0_0_2px_#1473e6]',
          selected && 'bg-legacy-nav-active',
        )}
      >
        <img src={selected ? section.iconSelected : section.icon} alt="" aria-hidden className="mt-0 mr-[12px] mb-0 ml-[16px] h-[18px] w-[18px]" />
        <span className={cn('overflow-hidden', selected && 'text-legacy-ink')}>{section.label}</span>
      </Link>
    </li>
  );
}

/**
 * The live Settings view (`/product/branding`, `/users`, `/siteSettings`):
 * its own sidebar and a "Settings / <page>" header with a Dashboard button
 * back to the editor. Pages render their own body and footer.
 */
export function SettingsShell() {
  const { state } = useStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const helpCenter = selectActiveHelpCenter(state);
  const active = SECTIONS.find((s) => pathname.startsWith(s.path));

  return (
    <ToastProvider>
      <section className="flex min-w-[1024px] overflow-hidden">
        <nav
          aria-label="Settings"
          className="box-border flex h-screen max-w-[243px] min-w-[243px] grow flex-col overflow-hidden bg-legacy-sidebar select-none"
        >
          <div className="box-border mt-[32px] mr-0 mb-[28px] ml-[24px] flex h-[41px] items-center">
            <img alt="Hiver Help Center" src={sidebarLogo} className="w-auto rounded-none" style={{ height: '42.65402603149414px' }} />
          </div>
          <HelpCenterPicker
            helpCenters={Object.values(state.helpCenters)}
            activeId={state.activeHelpCenterId}
            onSelect={() => undefined}
          />
          <ul className="m-0 list-none overflow-hidden px-[18px] py-0">
            {SECTIONS.map((section) => (
              <SettingsNavItem key={section.path} section={section} selected={section === active} />
            ))}
          </ul>
        </nav>
        {helpCenter.isInternal ? (
          <div className="absolute top-[35px] left-[200px] box-border flex h-[38px] items-center">
            <TooltipIconButton label="Internal Help Center" src={lockIcon} size={22} />
          </div>
        ) : null}
        <main className="relative flex h-screen min-w-0 flex-1 flex-col overflow-hidden bg-white">
          {/* Live header: padding 25px 0; "Settings" + slash 16/19 (300, 600), page name 18/22 500. */}
          <header className="relative z-[100] box-border flex shrink-0 items-center justify-between py-[25px]">
            <div className="box-border flex items-center px-[40px] font-inter text-[16px] leading-[19px] font-light tracking-[-0.138889px]">
              <span className="text-legacy-ink">Settings</span>
              <span aria-hidden className="mx-[10px] font-semibold text-legacy-icon-hover">
                /
              </span>
              <span className="text-[18px] leading-[22px] font-medium text-legacy-ink">{active?.crumb}</span>
            </div>
            <div className="flex items-center justify-end">
              <Button
                variant="secondary"
                iconSrc={settingDashboardButton}
                onClick={() => navigate(`/${helpCenter.slug}/category/getting-started`)}
              >
                Dashboard
              </Button>
              <div className="mx-[24px] flex items-center">
                <Avatar user={state.users[state.currentUserId]} size={40} />
              </div>
            </div>
          </header>
          <Outlet />
        </main>
      </section>
      <PrototypeBar bottom={24} />
    </ToastProvider>
  );
}
