import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { RiQuillPenLine, RiFolderLine, RiSettings5Line } from '@remixicon/react';
import { AppShell } from './AppShell';
import { KBBreadcrumbBar } from './KBBreadcrumbBar';
import { SideNavRail } from '../nav/SideNavRail';
import { FileExplorerNav, type NavItem } from '../nav/FileExplorerNav';
import { Avatar } from '../primitives/Avatar';
import { CompanyLogo } from '../brand/CompanyLogo';
import { AiIcon } from '../brand/AiIcon';

const meta: Meta<typeof AppShell> = {
  title: 'Components/Shell/AppShell',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof AppShell>;

const railItems = [
  { id: 'ai', icon: <AiIcon size={16} />, label: 'AI' },
  { id: 'editor', icon: <RiQuillPenLine size={16} />, label: 'Editor' },
  { id: 'folders', icon: <RiFolderLine size={16} />, label: 'Folders' },
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

export const CategoryView: Story = {
  render: () => (
    <AppShell
      rail={
        <SideNavRail
          theme="dark"
          items={railItems}
          activeId="editor"
          brandLogo={<CompanyLogo size={24} />}
          bottomSlot={<Avatar initials="VK" />}
        />
      }
      explorer={
        <FileExplorerNav
          theme="light"
          title="Editor"
          items={tree}
          activeId="managing-emails"
        />
      }
      breadcrumb={
        <KBBreadcrumbBar
          variant="category"
          items={[{ id: '1', label: 'Offer Multi-channel Support' }]}
        />
      }
    >
      <div className="text-sm text-[#64758b]">Content area</div>
    </AppShell>
  ),
};

export const EditorView: Story = {
  render: () => (
    <AppShell
      rail={
        <SideNavRail
          theme="dark"
          items={railItems}
          activeId="editor"
          brandLogo={<CompanyLogo size={24} />}
          bottomSlot={<Avatar initials="VK" />}
        />
      }
      explorer={
        <FileExplorerNav
          theme="light"
          title="Editor"
          items={tree}
          activeId="email-views"
        />
      }
      breadcrumb={
        <KBBreadcrumbBar
          variant="editor"
          items={[
            { id: '1', label: 'Offer Multi-channel Support' },
            { id: '2', label: 'Managing emails' },
            { id: '3', label: 'Search, filter, and create email views' },
          ]}
        />
      }
    >
      <div className="text-sm text-[#64758b]">Editor content area</div>
    </AppShell>
  ),
};
