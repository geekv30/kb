import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../tokens.css';
import { RiMailLine, RiQuillPenLine, RiBarChartBoxLine, RiSettings5Line } from '@remixicon/react';
import { AppShell } from '../components/shell/AppShell';
import { KBBreadcrumbBar } from '../components/shell/KBBreadcrumbBar';
import { SideNavRail } from '../components/nav/SideNavRail';
import { FileExplorerNav, type NavItem } from '../components/nav/FileExplorerNav';
import { PageHeader } from '../components/content/PageHeader';
import { SubCategoriesTable } from '../components/content/SubCategoriesTable';
import { ArticlesTable, type Article } from '../components/content/ArticlesTable';
import { Avatar } from '../components/primitives/Avatar';
import { CompanyLogo } from '../components/brand/CompanyLogo';
import { AiIcon } from '../components/brand/AiIcon';

const meta: Meta = {
  title: 'Patterns/KB Category Page',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

const PageIcon = () => (
  <RiMailLine size={22} className="text-[#6366f1]" />
);

const railItems = [
  { id: 'ai', icon: <AiIcon size={16} />, label: 'AI' },
  { id: 'editor', icon: <RiQuillPenLine size={16} />, label: 'Editor' },
  { id: 'analytics', icon: <RiBarChartBoxLine size={16} />, label: 'Analytics' },
  { id: 'settings', icon: <RiSettings5Line size={16} />, label: 'Settings' },
];

const navItems: NavItem[] = [
  { id: 'getting-started', type: 'folder', title: 'Getting Started', count: 12 },
  {
    id: 'offer-multi',
    type: 'folder',
    title: 'Offer Multi-channel Support',
    count: 9,
    children: [
      {
        id: 'manage-emails',
        type: 'folder',
        title: 'Manage emails',
        count: 2,
        children: [
          { id: 'org-email', type: 'folder', title: 'Organize email conversations', count: 1 },
          { id: 'shared-inbox', type: 'folder', title: 'Shared Inbox Management', count: 1 },
        ],
      },
      { id: 'manage-live-chat', type: 'folder', title: 'Manage live chat messages', count: 7 },
      { id: 'manage-calls', type: 'folder', title: 'Manage calls', count: 3 },
      { id: 'manage-whatsapp', type: 'folder', title: 'Manage WhatsApp messages', count: 3 },
    ],
  },
  { id: 'automate-workflows', type: 'folder', title: 'Automate Workflows', count: 8 },
  { id: 'manage-sla', type: 'folder', title: 'Manage SLA Policies', count: 8 },
  { id: 'collaborating', type: 'folder', title: 'Collaborating with your team', count: 5 },
  { id: 'hiver-ai', type: 'folder', title: 'Hiver AI', count: 3 },
  { id: 'self-service', type: 'folder', title: 'Enable self-service', count: 6 },
  { id: 'customer-rel-1', type: 'folder', title: 'Manage customer relationships', count: 12 },
  { id: 'customer-rel-2', type: 'folder', title: 'Manage customer relationships', count: 12 },
];

const breadcrumbItems = [
  { id: 'offer-multi', label: 'Offer Multi-channel Support' },
  { id: 'manage-emails', label: 'Managing emails' },
];

const subCategories = [
  { id: 'org-email', title: 'Organize email conversations' },
  { id: 'shared-inbox', title: 'Shared Inbox Management' },
];

const articles: Article[] = [
  {
    id: 'art-1',
    title: 'How to organize your email conversations',
    status: 'published',
    authorInitials: 'AK',
    lastUpdated: 'Apr 12, 2026',
  },
  {
    id: 'art-2',
    title: 'Setting up labels and filters',
    status: 'published',
    authorInitials: 'MR',
    lastUpdated: 'Apr 10, 2026',
  },
  {
    id: 'art-3',
    title: 'Email threading best practices',
    status: 'draft',
    authorInitials: 'TS',
    lastUpdated: 'Apr 8, 2026',
  },
  {
    id: 'art-4',
    title: 'Archiving and starring conversations',
    status: 'published',
    authorInitials: 'AK',
    lastUpdated: 'Apr 5, 2026',
  },
];

export const ManagingEmails: Story = {
  name: 'KB Category Page / Managing Emails',
  render: () => {
    const [activeNavId, setActiveNavId] = React.useState('manage-emails');
    return (
      <AppShell
        rail={
          <SideNavRail
            theme="light"
            items={railItems}
            activeId="editor"
            brandLogo={<CompanyLogo size={24} />}
            bottomSlot={<Avatar initials="A" />}
          />
        }
        explorer={
          <FileExplorerNav
            theme="light"
            title="Editor"
            items={navItems}
            activeId={activeNavId}
            onItemClick={(id) => {
              console.log('nav click:', id);
              setActiveNavId(id);
            }}
          />
        }
        breadcrumb={
          <KBBreadcrumbBar
            variant="category"
            items={breadcrumbItems}
            onCollapse={() => console.log('collapse')}
          />
        }
      >
        <div className="flex flex-col gap-6">
          <PageHeader
            icon={<PageIcon />}
            title="Managing emails"
            subtitle="Organize and manage email conversations"
            newButtonLabel="New"
            onNewClick={() => console.log('new article')}
          />
          <SubCategoriesTable
            items={subCategories}
            onItemClick={(id) => console.log('subcategory click:', id)}
          />
          <ArticlesTable
            articles={articles}
            onArticleClick={(id) => console.log('article click:', id)}
          />
        </div>
      </AppShell>
    );
  },
};
