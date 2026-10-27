import { useState, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { articleDashIcon, copyIcon, noArticleIllustration } from '../../assets/legacy';
import { Avatar } from '../../components/ui/Avatar';
import { StatusPill } from '../../components/ui/Pill';
import { Tooltip, TooltipIconButton } from '../../components/ui/Tooltip';
import { activityText, displayName, truncate } from '../../lib/format';
import { useStore } from '../../store/StoreContext';
import type { ArticleFilter } from '../../store/selectors';
import type { Article, Category } from '../../store/types';

/** Live empty-state copy keyed by tab (chunk 854 `He`/`Me`). */
const EMPTY_TITLE: Record<ArticleFilter, string> = {
  ALL: 'There are no articles in draft or published',
  DRAFT: 'There are no articles in your draft',
  PUBLISHED: 'There are no articles published',
};
const EMPTY_INFO: Record<ArticleFilter, string> = {
  ALL: 'Go ahead and create a new article',
  DRAFT: 'Your draft articles will be shown here',
  PUBLISHED: 'All your published articles will be shown here',
};

/** Live title column truncates at 30 characters. */
const TITLE_MAX = 30;

/*
 * Column geometry (chunk 854 `Se`/`ze`): widths are content-box with the
 * browser's 1px cell padding, giving 506 / 122 / 92 / 292 / auto.
 */
const TH = 'p-[1px] text-left align-middle text-[11px] leading-[13px] font-medium tracking-[0px] text-legacy-body';

function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <span onMouseLeave={() => setCopied(false)} className="flex">
      <TooltipIconButton
        label={copied ? 'Link copied' : 'Copy link'}
        src={copyIcon}
        size={20}
        onClick={() => {
          void navigator.clipboard?.writeText(url).catch(() => undefined);
          setCopied(true);
        }}
      />
    </span>
  );
}

interface ArticleRowProps {
  article: Article;
  href: string;
  publicUrl: string;
}

function ArticleRow({ article, href, publicUrl }: ArticleRowProps) {
  const { state } = useStore();
  const navigate = useNavigate();
  const author = article.authorId ? state.users[article.authorId] : undefined;
  const open = () => navigate(href);
  const onKeyDown = (e: KeyboardEvent<HTMLTableRowElement>) => {
    if (e.key === 'Enter' && e.target === e.currentTarget) open();
  };

  return (
    <tr
      onClick={open}
      onKeyDown={onKeyDown}
      className="flex h-[50px] cursor-pointer items-center rounded-[8px] hover:bg-legacy-row-hover"
    >
      <td className="w-[496px] cursor-pointer rounded-[5px] py-0 pr-0 pl-[10px]">
        <div className="flex flex-row flex-nowrap items-center justify-start gap-[8px]">
          <img src={articleDashIcon} alt="" className="h-[16px] w-[16px]" />
          <Link
            to={href}
            onClick={(e) => e.stopPropagation()}
            title={article.title.length > TITLE_MAX ? article.title : undefined}
            className="m-0 block w-full cursor-pointer p-0 text-[14px] leading-[17px] font-medium text-legacy-body no-underline outline-none focus-visible:underline"
          >
            {truncate(article.title, TITLE_MAX)}
          </Link>
        </div>
      </td>
      <td className="w-[120px] cursor-pointer p-[1px]">
        <div className="box-border flex w-full flex-row items-center justify-start gap-[8px]">
          <StatusPill status={article.status} />
        </div>
      </td>
      <td className="w-[90px] cursor-pointer p-[1px]">
        <div className="relative z-[5] box-border flex w-full">
          <Tooltip content={displayName(state, article.authorId)}>
            <Avatar user={author} size={24} />
          </Tooltip>
        </div>
      </td>
      <td className="w-[290px] cursor-pointer p-[1px]">
        <span className="m-0 block w-full p-0 text-[13px] leading-[28px] font-normal text-legacy-meta">
          {activityText(state, article)}
        </span>
      </td>
      {article.status === 'PUBLISHED' ? (
        <td className="cursor-pointer p-[1px]" onClick={(e) => e.stopPropagation()}>
          <div className="mr-[20px] box-border flex">
            <CopyLinkButton url={publicUrl} />
          </div>
        </td>
      ) : null}
    </tr>
  );
}

export interface ArticleTableProps {
  category: Category;
  articles: Article[];
  filter: ArticleFilter;
}

/*
 * Live table (chunk 854 `Pe`/`Re`/`De`): container padding 0 30px with
 * a 1px #cedeec top border; a full-bleed rule at top 52px under the
 * 53px header; 50px flex rows with #f5f5f5 / 8px-radius hover. The empty
 * state is centered in the table box.
 */
export function ArticleTable({ category, articles, filter }: ArticleTableProps) {
  const base = `/product/category/${category.slug}`;
  return (
    <div className="relative min-h-0 grow basis-0 overflow-hidden border-0 border-t border-solid border-legacy-table-border px-[30px]">
      <div
        aria-hidden
        className="absolute top-[52px] z-[201] -ml-[30px] w-[calc(100%+60px)] border-0 border-t border-solid border-legacy-table-border"
      />
      <table className="relative block h-full w-full border-collapse overflow-y-auto">
        <thead className="sticky top-0 z-[101] block w-full bg-white">
          <tr className="z-[101] h-[53px] w-full bg-white">
            <th scope="col" className={TH} style={{ width: 486, padding: '0 10px' }}>
              TITLE
            </th>
            <th scope="col" className={TH} style={{ width: 120 }}>
              STATUS
            </th>
            <th scope="col" className={TH} style={{ width: 90 }}>
              AUTHOR
            </th>
            <th scope="col" className={TH} style={{ width: 290 }}>
              ACTIVITY
            </th>
            <th scope="col" className={TH}>
              LINK
            </th>
          </tr>
        </thead>
        <tbody className="block">
          {articles.length === 0 ? (
            <tr>
              <td className="p-0">
                <div className="absolute top-1/2 left-1/2 box-border flex w-auto -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center">
                  <img width={141} height={103} src={noArticleIllustration} alt="" />
                  <p className="mx-0 mt-[40px] mb-[8px] w-auto p-0 text-[14px] leading-[17px] font-medium text-legacy-ink">
                    {EMPTY_TITLE[filter]}
                  </p>
                  <p className="m-0 w-auto p-0 text-[13px] leading-[17px] font-medium text-legacy-meta">
                    {EMPTY_INFO[filter]}
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            articles.map((article) => (
              <ArticleRow
                key={article.id}
                article={article}
                href={`${base}/article/edit/${article.slug}`}
                publicUrl={`https://product.hiverkb.com/${category.slug}/${article.slug}`}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
