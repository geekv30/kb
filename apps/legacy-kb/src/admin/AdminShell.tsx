// Hiver Admin Panel shell (v2.hiverhq.com/app/*), pixel-matched from the
// live computed styles: 240px #f6f8fc rail, 204×32 nav rows 2px apart,
// section labels 16px above / 6px below, footer 24px off the bottom.
// Only Help Center and Knowledge Hub are built; the other rows open a
// placeholder so nothing that looks live is dead.

import { NavLink, Outlet } from 'react-router-dom';
import gmailLogo from '../assets/hiver-admin/gmailLogo.png';
import { ToastProvider } from '../components/ui/Toast';
import { cn } from '../lib/cn';
import { ADMIN_HELP_CENTER_PATH, ADMIN_KNOWLEDGE_HUB_PATH, ADMIN_PATH } from '../lib/paths';
import { AdminIcon, type AdminIconName } from './AdminIcon';

interface NavItem {
  label: string;
  to: string;
  icon: AdminIconName;
  /** Live active-state icon (yellow fill); otherwise the stroke icon stays. */
  activeIcon?: AdminIconName;
}

interface NavSection {
  label?: string;
  items: NavItem[];
}

const placeholder = (slug: string) => `${ADMIN_PATH}/${slug}`;

const NAV: NavSection[] = [
  {
    items: [
      { label: 'Home', to: placeholder('home'), icon: 'navHome' },
      { label: 'Shared Inboxes', to: placeholder('shared-inboxes'), icon: 'navSharedInboxes' },
      { label: 'Global Configuration', to: placeholder('global-configuration'), icon: 'navGlobalConfig' },
    ],
  },
  {
    label: 'AI',
    items: [
      { label: 'Hiver AI', to: placeholder('hiver-ai'), icon: 'navHiverAi' },
      {
        label: 'Knowledge Hub',
        to: ADMIN_KNOWLEDGE_HUB_PATH,
        icon: 'navKnowledgeHub',
        activeIcon: 'navKnowledgeHubActive',
      },
    ],
  },
  {
    label: 'Resources',
    items: [
      { label: 'Help Center', to: ADMIN_HELP_CENTER_PATH, icon: 'navHelpCenter', activeIcon: 'navHelpCenterActive' },
      { label: 'Web Forms', to: placeholder('web-forms'), icon: 'navWebForms' },
      { label: 'Custom Objects', to: placeholder('custom-objects'), icon: 'navCustomObjects' },
      { label: 'Shared Labels', to: placeholder('shared-labels'), icon: 'navSharedLabels' },
    ],
  },
  {
    label: 'Integrations',
    items: [
      { label: 'Apps', to: placeholder('apps'), icon: 'navApps' },
      { label: 'Developer APIs', to: placeholder('developer-apis'), icon: 'navDeveloperApis' },
    ],
  },
  {
    label: 'Organization',
    items: [
      { label: 'Users and Roles', to: placeholder('users-and-roles'), icon: 'navUsers' },
      { label: 'Settings', to: placeholder('settings'), icon: 'navSettings' },
    ],
  },
];

/** Shared type for every nav / page label: Inter 14/20, -0.07px tracking. */
const NAV_TEXT = 'font-inter text-[14px] leading-[20px] font-normal tracking-[-0.07px] text-admin-nav';

function AdminNavLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          'mx-[18px] box-border flex h-[32px] items-center gap-[8px] rounded-[8px] px-[8px] no-underline outline-none',
          'focus-visible:shadow-[0_0_0_2px_#506dff]',
          isActive && 'bg-admin-nav-active',
        )
      }
    >
      {({ isActive }) => (
        <>
          <AdminIcon
            name={isActive && item.activeIcon ? item.activeIcon : item.icon}
            size={16}
            className="text-admin-nav"
          />
          <span className={cn(NAV_TEXT, 'min-w-0 flex-1 truncate')}>{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

function AdminSidebar() {
  return (
    <nav aria-label="Admin Panel" className="relative flex h-full w-[240px] shrink-0 flex-col bg-admin-sidebar">
      <div className="box-border flex h-[82px] items-start gap-[6px] px-[16px] pt-[24px]">
        <AdminIcon name="adminLogo" size={34} className="text-admin-logo" />
        <div className="flex w-[132px] flex-col">
          <span className="font-inter text-[12px] leading-[14px] font-medium tracking-[0.08px] text-admin-nav-label">
            Hiver
          </span>
          <span className="font-inter text-[14px] leading-[20px] font-medium tracking-[-0.07px] text-admin-nav">
            Admin Panel
          </span>
        </div>
        <AdminIcon name="navClose" size={16} className="mt-[6px] ml-[6px] text-admin-nav" />
      </div>

      <div className="flex flex-col">
        {NAV.map((section, i) => (
          <div key={section.label ?? i} className="flex flex-col">
            {section.label ? (
              <div className="mt-[16px] mr-[24px] mb-[6px] ml-[28px] font-inter text-[12px] leading-[18px] font-medium tracking-[-0.06px] text-admin-nav-label">
                {section.label}
              </div>
            ) : null}
            <div className="flex flex-col gap-[2px]">
              {section.items.map((item) => (
                <AdminNavLink key={item.label} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="absolute right-[20px] bottom-[24px] left-[12px] flex h-[24px] items-center justify-between">
        <span className="flex items-center gap-[5px]">
          <span className="font-inter text-[13px] leading-[20px] font-normal tracking-[0.25px] text-admin-footer">
            Varun
          </span>
          <AdminIcon name="chevron" size={15} className="-rotate-90 text-admin-footer-chevron" />
        </span>
        <img src={gmailLogo} alt="" width={32} height={24} />
      </div>
    </nav>
  );
}

export function AdminShell() {
  return (
    <ToastProvider>
      <div className="flex h-screen w-full overflow-hidden bg-white">
        <AdminSidebar />
        <main className="min-w-0 flex-1 overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>
    </ToastProvider>
  );
}
