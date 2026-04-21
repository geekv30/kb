import { RiFolderLine, RiArrowRightSLine } from '@remixicon/react';
import { cn } from '../../utils/cn';

export type SubCategory = {
  id: string;
  title: string;
  articleCount?: number;
};

export type SubCategoriesTableProps = {
  items: SubCategory[];
  onItemClick?: (id: string) => void;
  className?: string;
  /** Heading row label. Defaults to "Sub-categories". */
  heading?: string;
  /** Accessible label override for the folder ghost button. Receives the row title. */
  iconButtonLabel?: (title: string) => string;
};

export function SubCategoriesTable({
  items,
  onItemClick,
  className,
  heading = 'Sub-categories',
  iconButtonLabel = (title) => `Open ${title}`,
}: SubCategoriesTableProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-[8px] border border-[#e5e5e5] overflow-hidden',
        className
      )}
    >
      <table
        className="w-full border-collapse"
        style={{ borderCollapse: 'collapse' }}
      >
        <thead>
          <tr className="h-12 bg-[#f5f5f5] border-b border-[#e5e5e5]">
            <th
              scope="col"
              colSpan={2}
              className="text-left pl-4 pr-0 py-0 text-[14px] font-medium leading-[20px] text-[#475569]"
            >
              {heading}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr className="h-12">
              <td
                colSpan={2}
                className="px-4 py-[6px] text-[14px] text-[#94a3b8]"
              >
                No sub-categories
              </td>
            </tr>
          ) : (
            items.map((item, idx) => (
              <tr
                key={item.id}
                onClick={() => onItemClick?.(item.id)}
                className={cn(
                  'h-12 cursor-pointer transition-colors duration-150 hover:bg-[#fafafa]',
                  idx < items.length - 1 && 'border-b border-[#e5e5e5]'
                )}
              >
                <td className="pl-4 pr-0 py-[6px] align-middle">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={iconButtonLabel(item.title)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onItemClick?.(item.id);
                      }}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] text-[#64748b] hover:bg-[#f8fafc] focus:bg-[#f8fafc] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#cbd5e1]"
                    >
                      <RiFolderLine size={16} aria-hidden="true" />
                    </button>
                    <span className="text-[14px] font-normal leading-[20px] text-[#0f172a]">
                      {item.title}
                    </span>
                  </div>
                </td>
                <td
                  className="pl-0 pr-4 py-[6px] align-middle"
                  style={{ width: 48 }}
                >
                  <div className="flex items-center justify-end">
                    <RiArrowRightSLine
                      size={16}
                      className="text-[#64748b]"
                      aria-hidden="true"
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
