import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  RiFile3Line,
  RiMore2Line,
} from '@remixicon/react';
import '../../tokens.css';
import { DataTable, type DataTableColumn } from './DataTable';
import { Badge } from '../primitives/Badge';
import { Avatar } from '../primitives/Avatar';
import { FigmaCompare } from '../../_review/FigmaCompare';
import { cn } from '../../utils/cn';
import articlesTableFigma from '../../../../../design/screenshots/articles-table.png';
import { figmaNode as articlesFigma } from './DataTable.articles.figma';

/* ─────────────────────────────────────────────────────────────
 * Articles-table review canvas — Phase 15.
 *
 * Renders the canonical DataTable primitive configured to mirror
 * Figma sub-frame `1:5219` (the articles variant inside the
 * "table" page `1:5178`). 5 columns:
 *   title + kebab + status + avatar + last-updated.
 *
 * Geometry mirrors the production "unwrapped" chrome:
 *   bg-white, rounded-[8px], 1px slate border, header bg #f5f5f5,
 *   6px vertical cell padding.
 *
 * The canonical KBCategoryPage configures these same columns at
 * the page level — so any drift below traces to that page's
 * column config, not the DataTable primitive.
 * ───────────────────────────────────────────────────────────── */

const meta: Meta<typeof DataTable> = {
  title: 'Review/Tables/ArticlesTable',
  component: DataTable as React.ComponentType<unknown>,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

type Article = {
  id: string;
  title: string;
  status: 'published' | 'draft';
  authorInitials: string;
  lastUpdated: string;
};

// Figma row text: "Syncing past emails while creating a new Shared
// Mailbox" + Published badge + avatar "A" + "Created by Varun 2 days
// ago". We render 4 rows so divider/hover behavior reads correctly.
const articles: Article[] = [
  {
    id: 'art-1',
    title: 'Syncing past emails while creating a new Shared Mailbox',
    status: 'published',
    authorInitials: 'A',
    lastUpdated: 'Created by Varun 2 days ago',
  },
  {
    id: 'art-2',
    title: 'Setting up auto-reply rules for shared inboxes',
    status: 'published',
    authorInitials: 'V',
    lastUpdated: 'Created by Aanya 4 days ago',
  },
  {
    id: 'art-3',
    title: 'Migrating email templates from Gmail',
    status: 'draft',
    authorInitials: 'M',
    lastUpdated: 'Created by Mira 6 days ago',
  },
  {
    id: 'art-4',
    title: 'Connecting your shared inbox to Slack',
    status: 'published',
    authorInitials: 'T',
    lastUpdated: 'Created by Tarun 8 days ago',
  },
];

// Per-cell padding mirrors Figma exactly:
//   title   → Label 7  px-[16px] (scale/space/2xl)
//   kebab   → Label 7  px-[20px] (scale/space/3xl)
//   status  → Label 7  px-[20px] (scale/space/3xl)
//   author  → Label 7  px-[24px] (scale/space/4xl)
//   updated → Label 8  px-[24px] (scale/space/4xl), text #0f172a
//
// NOTE: the canonical KBCategoryPage uses px-4 (=16) on every cell
// AND paints "Last Updated" subtle slate (#64748b). Both diverge
// from Figma — flagged as page-level drift in the report.
const articleColumns: DataTableColumn<Article>[] = [
  {
    id: 'title',
    header: 'Articles',
    headerClassName: 'pl-4 pr-0 py-0 text-[#475569]',
    className: 'pl-4 pr-0',
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
    headerClassName: 'px-5 py-0 text-[#475569]',
    className: 'px-5',
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
    headerClassName: 'px-6 py-0 text-[#475569]',
    className: 'px-6',
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
    headerClassName: 'px-6 py-0 text-[#475569]',
    className: 'px-6',
    render: (a) => (
      // Figma colors this with the default text color (#0f172a), not
      // the subtle slate (#64748b) the canonical page uses. Wrap with
      // `block truncate` so longer strings ellipsis instead of wrapping
      // to a second line (would push the row past the canonical 48 px).
      <span className="block truncate text-[#0f172a]">{a.lastUpdated}</span>
    ),
  },
];

function ArticlesTableReview() {
  return (
    <FigmaCompare
      storyKey="tables-articles"
      figmaImage={articlesTableFigma}
      componentLabel="DataTable (Articles)"
      frameLabel="Figma · table / articles row"
      figmaNodeUrl={`https://www.figma.com/design/${articlesFigma.fileKey}/?node-id=${articlesFigma.nodeId.replace(':', '-')}`}
    >
      {/* Figma container is 938 wide with 24px horizontal inset; the
          card itself is 890 wide. We absorb the inset on the wrapper. */}
      <div
        className="font-sans"
        style={{ width: 938, paddingLeft: 24, paddingRight: 24 }}
      >
        <DataTable
          dataKbComponent="articles-table"
          rows={articles}
          columns={articleColumns}
          wrapped={false}
          headerBackground="#f5f5f5"
          cellPaddingY={6}
          emptyMessage="No articles"
          onRowClick={() => {}}
        />
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj<typeof DataTable> = {
  render: () => <ArticlesTableReview />,
};
