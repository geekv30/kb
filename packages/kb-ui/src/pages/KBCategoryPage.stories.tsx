import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../tokens.css';
import {
  RiMailLine,
  RiQuillPenLine,
  RiBarChartBoxLine,
  RiSettings5Line,
  RiFolderLine,
  RiFile3Line,
  RiMore2Line,
} from '@remixicon/react';
import { AppShell } from '../components/shell/AppShell';
import { KBBreadcrumbBar } from '../components/shell/KBBreadcrumbBar';
import { SideNavRail } from '../components/nav/SideNavRail';
import { FileExplorerNav, type NavItem } from '../components/nav/FileExplorerNav';
import { PageHeader } from '../components/content/PageHeader';
import { DataTable, type DataTableColumn } from '../components/content/DataTable';
import { Avatar } from '../components/primitives/Avatar';
import { Badge } from '../components/primitives/Badge';
import { CompanyLogo } from '../components/brand/CompanyLogo';
import { AiIcon } from '../components/brand/AiIcon';
import { cn } from '../utils/cn';

const PageIcon = () => <RiMailLine size={22} className="text-[#6366f1]" />;

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

type SubCategory = { id: string; title: string };
const subCategories: SubCategory[] = [
  { id: 'org-email', title: 'Organize email conversations' },
  { id: 'shared-inbox', title: 'Shared Inbox Management' },
];

type Article = {
  id: string;
  title: string;
  status: 'published' | 'draft';
  authorInitials: string;
  lastUpdated: string;
};

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

/* ─────────────────────────────────────────────────────────────
 * Column shapes — co-located with the page that owns them.
 * Geometry is the legacy ArticlesTable / SubCategoriesTable
 * unwrapped chrome (white card, slate border, 8 px radius,
 * grey #f5f5f5 header, 6-px vertical cell padding).
 * ───────────────────────────────────────────────────────────── */

const subCategoryColumns: DataTableColumn<SubCategory>[] = [
  {
    id: 'title',
    header: 'Sub-categories',
    headerClassName: 'pl-4 pr-0 py-0 text-[#475569]',
    className: 'pl-4 pr-0',
    render: (item) => (
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`Open ${item.title}`}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] text-[#64748b]',
            'hover:bg-[#f8fafc] focus:bg-[#f8fafc] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#cbd5e1]',
          )}
        >
          <RiFolderLine size={16} aria-hidden="true" />
        </button>
        <span className="text-[14px] font-normal leading-[20px] text-[#0f172a]">
          {item.title}
        </span>
      </div>
    ),
  },
];

const articleColumns: DataTableColumn<Article>[] = [
  {
    id: 'title',
    header: 'Articles',
    headerClassName: 'pl-4 pr-0 py-0 text-[#475569]',
    className: 'px-4',
    render: (a) => (
      <div className="flex items-center gap-1 min-w-0">
        <button
          type="button"
          aria-label={`Open ${a.title}`}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] text-[#64748b]',
            'hover:bg-[#f8fafc] focus:bg-[#f8fafc] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#cbd5e1]',
          )}
        >
          <RiFile3Line size={16} aria-hidden="true" />
        </button>
        <span className="text-[14px] font-normal leading-[20px] text-[#0f172a] truncate">
          {a.title}
        </span>
      </div>
    ),
  },
  {
    id: 'kebab',
    header: '',
    align: 'center',
    width: 48,
    headerClassName: 'px-0 py-0',
    className: 'px-0',
    render: (a) => (
      <div className="flex items-center justify-center">
        <button
          type="button"
          aria-label={`More actions for ${a.title}`}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] text-[#94a3b8]',
            'hover:bg-[#f8fafc] focus:bg-[#f8fafc] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#cbd5e1]',
          )}
        >
          <RiMore2Line size={16} aria-hidden="true" />
        </button>
      </div>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    width: 127,
    headerClassName: 'px-4 py-0 text-[#475569]',
    className: 'px-4',
    render: (a) => (
      <Badge variant={a.status}>
        {a.status === 'published' ? 'Published' : 'Draft'}
      </Badge>
    ),
  },
  {
    id: 'author',
    header: 'Author',
    align: 'center',
    width: 94,
    headerClassName: 'px-4 py-0 text-[#475569]',
    className: 'px-4',
    render: (a) => (
      <div className="flex items-center justify-center">
        <Avatar initials={a.authorInitials} />
      </div>
    ),
  },
  {
    id: 'updated',
    header: 'Last Updated',
    width: 251,
    headerClassName: 'px-4 py-0 text-[#475569]',
    className: 'px-4',
    render: (a) => (
      <span className="text-[#64748b]">{a.lastUpdated}</span>
    ),
  },
];

function CategoryPage() {
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
            // eslint-disable-next-line no-console
            console.log('nav click:', id);
            setActiveNavId(id);
          }}
        />
      }
      breadcrumb={
        <KBBreadcrumbBar
          variant="category"
          items={breadcrumbItems}
          onCollapse={() => {
            // eslint-disable-next-line no-console
            console.log('collapse');
          }}
        />
      }
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          icon={<PageIcon />}
          title="Managing emails"
          subtitle="Organize and manage email conversations"
          newButtonLabel="New"
          onNewClick={() => {
            // eslint-disable-next-line no-console
            console.log('new article');
          }}
        />
        <DataTable
          dataKbComponent="sub-categories-table"
          rows={subCategories}
          columns={subCategoryColumns}
          wrapped={false}
          headerBackground="#f5f5f5"
          cellPaddingY={6}
          emptyMessage="No sub-categories"
          onRowClick={(row) => {
            // eslint-disable-next-line no-console
            console.log('subcategory click:', row.id);
          }}
        />
        <DataTable
          dataKbComponent="articles-table"
          rows={articles}
          columns={articleColumns}
          wrapped={false}
          headerBackground="#f5f5f5"
          cellPaddingY={6}
          emptyMessage="No articles"
          onRowClick={(row) => {
            // eslint-disable-next-line no-console
            console.log('article click:', row.id);
          }}
        />
      </div>
    </AppShell>
  );
}

const meta: Meta<typeof CategoryPage> = {
  title: 'Patterns/Knowledge Base/Category Page',
  parameters: { layout: 'fullscreen' },
  component: CategoryPage,
  render: () => <CategoryPage />,
};
export default meta;

export const Default: StoryObj<typeof CategoryPage> = {};
