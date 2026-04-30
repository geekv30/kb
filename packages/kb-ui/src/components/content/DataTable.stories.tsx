import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { RiFile3Line } from '@remixicon/react';
import { DataTable, type DataTableColumn } from './DataTable';
import { Badge } from '../primitives/Badge';
import { Avatar } from '../primitives/Avatar';
import { Card } from '../primitives/Card';

/* ─────────────────────────────────────────────────────────────
 * DataTable Playground — full article-management table.
 *
 * Renders the canonical "All articles" table with 12 realistic
 * Hiver KB rows, all four columns (title + file icon, status
 * badge, author avatar, last-updated date), and a clickable row
 * handler so the hover pill + cursor surface naturally.
 *
 * Wrapped in a real `<Card padding="none">` so the chrome is the
 * production card chrome, not a hand-rolled bg-white sandbox.
 * ───────────────────────────────────────────────────────────── */

type Article = {
  id: string;
  title: string;
  status: 'published' | 'draft';
  authorInitials: string;
  lastUpdated: string;
};

const ARTICLES: Article[] = [
  { id: 'a1',  title: 'How to reset your password',                              status: 'published', authorInitials: 'VK', lastUpdated: 'Apr 28, 2026' },
  { id: 'a2',  title: 'Setting up SSO with Okta or Google Workspace',            status: 'published', authorInitials: 'AK', lastUpdated: 'Apr 26, 2026' },
  { id: 'a3',  title: 'Migrating from Confluence to Hiver KB',                   status: 'draft',     authorInitials: 'MR', lastUpdated: 'Apr 25, 2026' },
  { id: 'a4',  title: 'Enabling two-factor authentication for your team',        status: 'published', authorInitials: 'TS', lastUpdated: 'Apr 22, 2026' },
  { id: 'a5',  title: 'Bulk-importing contacts via CSV',                         status: 'published', authorInitials: 'VK', lastUpdated: 'Apr 21, 2026' },
  { id: 'a6',  title: 'Configuring shared inbox routing rules',                  status: 'draft',     authorInitials: 'AK', lastUpdated: 'Apr 19, 2026' },
  { id: 'a7',  title: 'Managing user permissions and roles',                     status: 'published', authorInitials: 'MR', lastUpdated: 'Apr 17, 2026' },
  { id: 'a8',  title: 'Connecting Hiver to Slack',                               status: 'published', authorInitials: 'TS', lastUpdated: 'Apr 15, 2026' },
  { id: 'a9',  title: 'Legacy API removal — migration guide',                    status: 'draft',     authorInitials: 'VK', lastUpdated: 'Apr 14, 2026' },
  { id: 'a10', title: 'Understanding billing and usage',                         status: 'published', authorInitials: 'AK', lastUpdated: 'Apr 11, 2026' },
  { id: 'a11', title: 'Customising notification preferences',                    status: 'published', authorInitials: 'MR', lastUpdated: 'Apr 09, 2026' },
  { id: 'a12', title: 'Exporting analytics reports as CSV or PDF',               status: 'draft',     authorInitials: 'TS', lastUpdated: 'Apr 07, 2026' },
];

const articleColumns: DataTableColumn<Article>[] = [
  {
    id: 'title',
    header: 'Article Title',
    render: (a) => (
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <RiFile3Line size={16} className="shrink-0 text-[#64758b]" aria-hidden="true" />
        <span className="truncate">{a.title}</span>
      </div>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    width: 127,
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
    render: (a) => (
      <span className="text-[#64758b]">{a.lastUpdated}</span>
    ),
  },
];

const meta: Meta<typeof DataTable> = {
  title: 'Components/Tables/DataTable',
  component: DataTable as React.ComponentType<unknown>,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

function DataTablePlayground() {
  return (
    <Card padding="none" style={{ width: 920 }}>
      <h3 className="text-[14px] font-medium leading-[20px] text-[#0f172a] px-6 pt-5">
        All articles
      </h3>
      <DataTable
        rows={ARTICLES}
        columns={articleColumns}
        wrapped={false}
        unwrappedChrome={false}
        onRowClick={() => {}}
      />
    </Card>
  );
}

export const Playground: StoryObj<typeof DataTable> = {
  render: () => <DataTablePlayground />,
};
