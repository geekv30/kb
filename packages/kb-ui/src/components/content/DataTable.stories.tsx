import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { RiFile3Line, RiArrowRightSLine } from '@remixicon/react';
import { DataTable, type DataTableColumn } from './DataTable';
import { Badge } from '../primitives/Badge';
import { Avatar } from '../primitives/Avatar';
import { HelpfulnessTag } from './HelpfulnessTag';

/* ─────────────────────────────────────────────────────────────
 * DataTable canonical stories — covers every layout shape that
 * the 7 legacy tables previously rendered:
 *
 *   Default                 wrapped + header-divider, h-12 rows,
 *                           default `cellPaddingY={12}`.
 *   No card wrapper         `wrapped={false}` + chrome — matches
 *                           the legacy ArticlesTable / SubCategoriesTable
 *                           rendering used inside the editor.
 *   No header divider       `headerDivider={false}` — matches
 *                           SearchKeywordsTable (Figma `1974:54404`).
 *   With row click          `onRowClick` — surfaces the hover
 *                           pill + cursor.
 * ───────────────────────────────────────────────────────────── */

type Article = {
  id: string;
  title: string;
  status: 'published' | 'draft';
  authorInitials: string;
  lastUpdated: string;
};

const ARTICLES: Article[] = [
  {
    id: 'a1',
    title: 'How to set up your first workspace',
    status: 'published',
    authorInitials: 'RM',
    lastUpdated: 'Apr 12, 2026',
  },
  {
    id: 'a2',
    title: 'Invite teammates and assign roles',
    status: 'draft',
    authorInitials: 'SK',
    lastUpdated: 'Apr 10, 2026',
  },
  {
    id: 'a3',
    title: 'Understanding your billing cycle',
    status: 'published',
    authorInitials: 'JL',
    lastUpdated: 'Apr 08, 2026',
  },
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

type AttentionRow = {
  id: string;
  title: string;
  helpfulness: string;
  variant: 'up' | 'down';
};

const ATTENTION_ROWS: AttentionRow[] = [
  { id: '1', title: 'Syncing past emails while creating', helpfulness: '24%', variant: 'down' },
  { id: '2', title: 'How to Sync Previous Emails Whe...', helpfulness: '31%', variant: 'down' },
  { id: '3', title: 'Setting Up a New Shared Mailbox:', helpfulness: '91%', variant: 'up' },
  { id: '4', title: 'Creating a New Shared Mailbox? H...', helpfulness: '95%', variant: 'up' },
];

const attentionColumns: DataTableColumn<AttentionRow>[] = [
  {
    id: 'title',
    header: 'Article Title',
    render: (r) => (
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <RiFile3Line size={16} className="shrink-0 text-[#64758b]" aria-hidden="true" />
        <span className="truncate">{r.title}</span>
      </div>
    ),
  },
  {
    id: 'helpfulness',
    header: 'Helpfulness',
    align: 'right',
    render: (r) => <HelpfulnessTag value={r.helpfulness} variant={r.variant} />,
  },
];

type Keyword = { id: string; keyword: string; count: string };
const KEYWORDS: Keyword[] = [
  { id: '1', keyword: '1. password reset', count: '11200' },
  { id: '2', keyword: '2. billing duplicate charges', count: '1200' },
  { id: '3', keyword: '3. slack integration', count: '200' },
];

const keywordColumns: DataTableColumn<Keyword>[] = [
  { id: 'keyword', header: 'Keywords', render: (r) => r.keyword },
  { id: 'count', header: 'Search Count', align: 'right', render: (r) => r.count },
];

type Cat = { id: string; title: string };
const CATS: Cat[] = [
  { id: 'c1', title: 'Organize email conversations' },
  { id: 'c2', title: 'Shared Inbox Management' },
];

const meta: Meta<typeof DataTable> = {
  title: 'Components/Tables/DataTable',
  component: DataTable as React.ComponentType<unknown>,
  parameters: { layout: 'padded', backgrounds: { default: 'canvas' } },
  argTypes: {
    headerDivider: { control: 'boolean' },
    wrapped: { control: 'boolean' },
    cellPaddingY: { control: 'number' },
  },
};
export default meta;

type Story = StoryObj<typeof DataTable>;

export const Default: Story = {
  render: () => (
    <div style={{ background: '#ffffff', padding: 24, minHeight: 360 }}>
      <div style={{ width: 890 }}>
        <DataTable
          rows={ATTENTION_ROWS}
          columns={attentionColumns}
          heading={
            <h3 className="text-[14px] font-medium leading-[20px] text-[#0f172a]">
              Articles needs attention
            </h3>
          }
        />
      </div>
    </div>
  ),
};

/** Unwrapped chrome — legacy ArticlesTable / SubCategoriesTable rendering. */
export const NoCardWrapper: Story = {
  render: () => (
    <div style={{ background: '#ffffff', padding: 24, minHeight: 360 }}>
      <div style={{ width: 880 }}>
        <DataTable
          rows={ARTICLES}
          columns={articleColumns}
          wrapped={false}
          headerBackground="#f5f5f5"
          cellPaddingY={6}
          onRowClick={() => {
            // eslint-disable-next-line no-console
            console.log('row click');
          }}
        />
      </div>
    </div>
  ),
};

/** SearchKeywordsTable — no header divider (just whitespace). */
export const NoHeaderDivider: Story = {
  render: () => (
    <div style={{ background: '#ffffff', padding: 24, minHeight: 360 }}>
      <div style={{ width: 890 }}>
        <DataTable
          rows={KEYWORDS}
          columns={keywordColumns}
          headerDivider={false}
          heading={
            <h3 className="text-[14px] font-medium leading-[20px] text-[#0f172a]">
              Top 5 Search Keywords
            </h3>
          }
        />
      </div>
    </div>
  ),
};

/** Hover + cursor — active row-click handler. */
export const WithRowClick: Story = {
  render: () => (
    <div style={{ background: '#ffffff', padding: 24, minHeight: 360 }}>
      <div style={{ width: 880 }}>
        <DataTable
          rows={CATS}
          columns={[
            {
              id: 'title',
              header: 'Sub-categories',
              render: (c) => c.title,
            },
            {
              id: 'chev',
              header: '',
              align: 'right',
              width: 48,
              render: () => (
                <RiArrowRightSLine
                  size={16}
                  className="text-[#64758b]"
                  aria-hidden="true"
                />
              ),
            },
          ]}
          wrapped={false}
          headerBackground="#f5f5f5"
          cellPaddingY={6}
          onRowClick={(c) => {
            // eslint-disable-next-line no-console
            console.log('clicked', c.id);
          }}
        />
      </div>
    </div>
  ),
};
