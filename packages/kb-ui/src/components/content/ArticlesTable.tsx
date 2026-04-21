import { RiFile3Line, RiMore2Line } from '@remixicon/react';
import { cn } from '../../utils/cn';
import { Badge } from '../primitives/Badge';
import { Avatar } from '../primitives/Avatar';

export type Article = {
  id: string;
  title: string;
  status: 'published' | 'draft';
  authorInitials?: string;
  lastUpdated?: string;
};

export type ArticlesTableProps = {
  articles: Article[];
  onArticleClick?: (id: string) => void;
  className?: string;
  /** Heading row label. Defaults to "Articles". */
  heading?: string;
  /** Accessible label override for the article ghost button. Receives the row title. */
  iconButtonLabel?: (title: string) => string;
  /** Accessible label override for the row actions (kebab) button. Receives the row title. */
  actionsButtonLabel?: (title: string) => string;
};

export function ArticlesTable({
  articles,
  onArticleClick,
  className,
  heading = 'Articles',
  iconButtonLabel = (title) => `Open ${title}`,
  actionsButtonLabel = (title) => `More actions for ${title}`,
}: ArticlesTableProps) {
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
        <colgroup>
          <col />
          <col style={{ width: 48 }} />
          <col style={{ width: 127 }} />
          <col style={{ width: 94 }} />
          <col style={{ width: 251 }} />
        </colgroup>
        <thead>
          <tr className="h-12 bg-[#f5f5f5] border-b border-[#e5e5e5]">
            <th
              scope="col"
              className="text-left pl-4 pr-0 py-0 text-[14px] font-medium leading-[20px] text-[#475569]"
            >
              {heading}
            </th>
            <th scope="col" className="px-0 py-0" aria-hidden="true" />
            <th
              scope="col"
              className="text-left px-4 py-0 text-[14px] font-medium leading-[20px] text-[#475569]"
            >
              Status
            </th>
            <th
              scope="col"
              className="text-center px-4 py-0 text-[14px] font-medium leading-[20px] text-[#475569]"
            >
              Author
            </th>
            <th
              scope="col"
              className="text-left px-4 py-0 text-[14px] font-medium leading-[20px] text-[#475569]"
            >
              Last Updated
            </th>
          </tr>
        </thead>
        <tbody>
          {articles.length === 0 ? (
            <tr className="h-12">
              <td
                colSpan={5}
                className="px-4 py-[6px] text-[14px] text-[#94a3b8]"
              >
                No articles
              </td>
            </tr>
          ) : (
            articles.map((article, idx) => (
              <tr
                key={article.id}
                onClick={() => onArticleClick?.(article.id)}
                className={cn(
                  'h-12 cursor-pointer transition-colors duration-150 hover:bg-[#fafafa]',
                  idx < articles.length - 1 && 'border-b border-[#e5e5e5]'
                )}
              >
                <td className="px-4 py-[6px] align-middle">
                  <div className="flex items-center gap-1 min-w-0">
                    <button
                      type="button"
                      aria-label={iconButtonLabel(article.title)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onArticleClick?.(article.id);
                      }}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] text-[#64748b] hover:bg-[#f8fafc] focus:bg-[#f8fafc] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#cbd5e1]"
                    >
                      <RiFile3Line size={16} aria-hidden="true" />
                    </button>
                    <span className="text-[14px] font-normal leading-[20px] text-[#0f172a] truncate">
                      {article.title}
                    </span>
                  </div>
                </td>
                <td className="px-0 py-[6px] align-middle">
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      aria-label={actionsButtonLabel(article.title)}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] text-[#94a3b8] hover:bg-[#f8fafc] focus:bg-[#f8fafc] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#cbd5e1]"
                    >
                      <RiMore2Line size={16} aria-hidden="true" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-[6px] align-middle">
                  <Badge variant={article.status}>
                    {article.status === 'published' ? 'Published' : 'Draft'}
                  </Badge>
                </td>
                <td className="px-4 py-[6px] align-middle">
                  <div className="flex items-center justify-center">
                    <Avatar initials={article.authorInitials ?? '—'} />
                  </div>
                </td>
                <td className="px-4 py-[6px] align-middle text-[14px] font-normal leading-[20px] text-[#64748b]">
                  {article.lastUpdated ?? ''}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
