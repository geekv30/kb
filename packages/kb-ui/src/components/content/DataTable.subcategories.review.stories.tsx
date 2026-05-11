import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { RiFolderLine } from '@remixicon/react';
import '../../tokens.css';
import { DataTable, type DataTableColumn } from './DataTable';
import { FigmaCompare } from '../../_review/FigmaCompare';
import { cn } from '../../utils/cn';
import subCategoriesTableFigma from '../../../../../design/screenshots/sub-categories-table.png';
import { figmaNode as subCategoriesFigma } from './DataTable.subcategories.figma';

/* ─────────────────────────────────────────────────────────────
 * Sub-categories-table review canvas — Phase 15.
 *
 * Renders the canonical DataTable primitive configured to mirror
 * Figma sub-frame `1:5202` (the folder-listing variant inside the
 * "table" page `1:5178`). 1 column only:
 *   folder + title (full-width).
 *
 * Geometry mirrors the production "unwrapped" chrome:
 *   bg-white, rounded-[8px], 1px slate border, header bg #f5f5f5,
 *   6px vertical cell padding.
 *
 * NOTE: Figma has NO chevron column. The canonical KBCategoryPage
 * adds a 48-px right-aligned chevron; we deliberately omit it here
 * to mirror Figma. That page-level drift is flagged in the report
 * but NOT fixed in this dispatch (out-of-scope per brief).
 * ───────────────────────────────────────────────────────────── */

const meta: Meta<typeof DataTable> = {
  title: 'Review/Tables/SubCategoriesTable',
  component: DataTable as React.ComponentType<unknown>,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

type SubCategory = { id: string; title: string };

// Figma rows: "Setting up Hiver in Gmail", "First steps", "Hiver settings".
const subCategories: SubCategory[] = [
  { id: 'sc-1', title: 'Setting up Hiver in Gmail' },
  { id: 'sc-2', title: 'First steps' },
  { id: 'sc-3', title: 'Hiver settings' },
];

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

function SubCategoriesTableReview() {
  return (
    <FigmaCompare
      storyKey="tables-sub-categories"
      figmaImage={subCategoriesTableFigma}
      componentLabel="DataTable (Sub-categories)"
      frameLabel="Figma · table / sub-categories"
      figmaNodeUrl={`https://www.figma.com/design/${subCategoriesFigma.fileKey}/?node-id=${subCategoriesFigma.nodeId.replace(':', '-')}`}
    >
      {/* Figma container is 938 wide with 24px horizontal inset; the
          card itself is 890 wide. */}
      <div
        className="font-sans"
        style={{ width: 938, paddingLeft: 24, paddingRight: 24 }}
      >
        <DataTable
          dataKbComponent="sub-categories-table"
          rows={subCategories}
          columns={subCategoryColumns}
          wrapped={false}
          headerBackground="#f5f5f5"
          cellPaddingY={6}
          emptyMessage="No sub-categories"
          onRowClick={() => {}}
        />
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj<typeof DataTable> = {
  render: () => <SubCategoriesTableReview />,
};
