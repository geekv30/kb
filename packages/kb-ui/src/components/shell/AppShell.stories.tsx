import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import '../../tokens.css';
import { RiQuillPenLine, RiBarChartBoxLine, RiSettings5Line } from '@remixicon/react';
import { AppShell } from './AppShell';
import { KBBreadcrumbBar } from './KBBreadcrumbBar';
import { EditorBreadcrumbActions } from './EditorBreadcrumbActions';
import { SideNavRail } from '../nav/SideNavRail';
import { FileExplorerNav, type NavItem } from '../nav/FileExplorerNav';
import { Avatar } from '../primitives/Avatar';
import { CompanyLogo } from '../brand/CompanyLogo';
import { AiIcon } from '../brand/AiIcon';

const railItems = [
  { id: 'ai', icon: <AiIcon size={16} />, label: 'AI' },
  { id: 'editor', icon: <RiQuillPenLine size={16} />, label: 'Editor' },
  { id: 'analytics', icon: <RiBarChartBoxLine size={16} />, label: 'Analytics' },
  { id: 'settings', icon: <RiSettings5Line size={16} />, label: 'Settings' },
];

const tree: NavItem[] = [
  {
    type: 'folder',
    id: 'offer-multi',
    title: 'Offer Multi-channel Support',
    count: 3,
    children: [
      {
        type: 'folder',
        id: 'managing-emails',
        title: 'Managing emails',
        count: 2,
        children: [
          {
            type: 'article',
            id: 'email-views',
            title: 'Search, filter, and create email views',
            status: 'draft',
          },
          {
            type: 'article',
            id: 'email-rules',
            title: 'Email routing rules',
            status: 'published',
          },
        ],
      },
      {
        type: 'article',
        id: 'chat-basics',
        title: 'Live chat basics',
        status: 'published',
      },
    ],
  },
  {
    type: 'folder',
    id: 'automate',
    title: 'Automate Workflows',
    count: 2,
    children: [
      {
        type: 'article',
        id: 'auto-rules',
        title: 'Rule-based automations',
        status: 'published',
      },
      {
        type: 'article',
        id: 'auto-ai',
        title: 'AI-powered routing',
        status: 'draft',
      },
    ],
  },
];

// Walk the tree to resolve an article id to its title for breadcrumb + heading.
function findTitle(items: NavItem[], id: string): string | null {
  for (const item of items) {
    if (item.id === id) return item.title;
    if (item.children && item.children.length > 0) {
      const sub = findTitle(item.children, id);
      if (sub) return sub;
    }
  }
  return null;
}

function AppShellPlayground() {
  const [activeRailId, setActiveRailId] = React.useState<string>('editor');
  const [activeArticleId, setActiveArticleId] = React.useState<string>('email-views');
  const activeArticleTitle = findTitle(tree, activeArticleId) ?? activeArticleId;

  return (
    <AppShell
      sidebarCollapsed={false}
      rail={
        <SideNavRail
          theme="light"
          items={railItems}
          activeId={activeRailId}
          onItemClick={(id) => setActiveRailId(id)}
          brandLogo={<CompanyLogo size={24} />}
          bottomSlot={<Avatar initials="VK" />}
        />
      }
      explorer={
        <FileExplorerNav
          theme="light"
          title="Editor"
          items={tree}
          activeId={activeArticleId}
          onItemClick={(id) => setActiveArticleId(id)}
        />
      }
      breadcrumb={
        <KBBreadcrumbBar
          sidebarCollapsed={false}
          items={[
            { id: '1', label: 'Offer Multi-channel Support' },
            { id: '2', label: 'Managing emails' },
            { id: '3', label: activeArticleTitle },
          ]}
          actions={
            <EditorBreadcrumbActions
              onSaveAsDraft={() => {}}
              onPublish={() => {}}
              onClose={() => {}}
            />
          }
        />
      }
    >
      <div className="bg-white p-8 max-w-[840px] mx-auto">
        <h1 className="text-[28px] font-semibold leading-9 text-[#0f172a] mb-4">
          {activeArticleTitle}
        </h1>
        <p className="text-[14px] leading-6 text-[#475569] mb-3">
          Last edited by Varun Kelkar · 2 hours ago · Draft
        </p>
        <p className="text-[15px] leading-7 text-[#0f172a] mb-4">
          Shared inboxes let your team collaborate on a single email address — like support@ or billing@ — directly inside Gmail. Every teammate sees the same conversations, can claim ownership, and reply on behalf of the group without forwarding threads back and forth.
        </p>
        <p className="text-[15px] leading-7 text-[#0f172a] mb-4">
          To create a shared inbox, open the Hiver sidebar and click the plus icon next to "Shared Inboxes." You'll be prompted to enter the email address you want to share.
        </p>
        <p className="text-[15px] leading-7 text-[#0f172a]">
          Note: shared inboxes created before March 2024 used a legacy permissions model and may need to be migrated manually from the admin console.
        </p>
      </div>
    </AppShell>
  );
}

const meta: Meta<typeof AppShell> = {
  title: 'Components/Shell/AppShell',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

export const Playground: StoryObj<typeof AppShell> = {
  render: () => <AppShellPlayground />,
};
