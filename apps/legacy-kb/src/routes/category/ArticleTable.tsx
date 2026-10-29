import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { copyIcon } from '../../assets/legacy';
import { Cell, CellText, TableRow, TableShell, TitleCell, type TableColumn } from '../../components/table/LegacyTable';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusPill } from '../../components/ui/Pill';
import { Tooltip, TooltipIconButton } from '../../components/ui/Tooltip';
import { SuggestionsTablePill } from '../../improvements/SuggestionsTablePill';
import { activityText, displayName } from '../../lib/format';
import { suggestionsReviewPath } from '../../lib/paths';
import { useStore } from '../../store/StoreContext';
import { AUTO_MODE_COPY } from '../../improvements/autoModeCopy';
import { pluralize } from '../../lib/format';
import { selectOpenSuggestionSummary, type ArticleFilter } from '../../store/selectors';
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

/** Live column geometry (chunk 854 `Se`/`ze`): 506 / 122 / 92 / 292 / auto. */
const COLUMNS = [
  { id: 'title', label: 'TITLE', width: 506 },
  { id: 'status', label: 'STATUS', width: 122 },
  { id: 'author', label: 'AUTHOR', width: 92 },
  { id: 'activity', label: 'ACTIVITY', width: 292 },
  { id: 'link', label: 'LINK' },
] as const satisfies ReadonlyArray<TableColumn>;

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
  categorySlug: string;
  publicUrl: string;
}

function ArticleRow({ article, categorySlug, publicUrl }: ArticleRowProps) {
  const { state } = useStore();
  const navigate = useNavigate();
  const author = article.authorId ? state.users[article.authorId] : undefined;
  const editHref = `/product/category/${categorySlug}/article/edit/${article.slug}`;
  const ai = selectOpenSuggestionSummary(state, article.id);
  const pill =
    ai?.stage === 'AUTO'
      ? AUTO_MODE_COPY[state.autoModeOption].pill
      : ai
        ? { label: pluralize(ai.total, 'suggestion'), tooltip: 'Review AI suggestions' }
        : undefined;

  return (
    <TableRow onOpen={() => navigate(editHref)}>
      <TitleCell
        title={article.title}
        href={editHref}
        width={COLUMNS[0].width}
        trailing={
          pill ? (
            <SuggestionsTablePill
              label={pill.label}
              tooltip={pill.tooltip}
              onOpen={() => navigate(suggestionsReviewPath(article.slug))}
            />
          ) : undefined
        }
      />
      <Cell width={COLUMNS[1].width}>
        <div className="box-border flex w-full flex-row items-center justify-start gap-[8px]">
          <StatusPill status={article.status} />
        </div>
      </Cell>
      <Cell width={COLUMNS[2].width}>
        <div className="relative z-[5] box-border flex w-full">
          <Tooltip content={displayName(state, article.authorId)}>
            <Avatar user={author} size={24} />
          </Tooltip>
        </div>
      </Cell>
      <Cell width={COLUMNS[3].width}>
        <CellText>{activityText(state, article)}</CellText>
      </Cell>
      {article.status === 'PUBLISHED' ? (
        <Cell onClick={(e) => e.stopPropagation()}>
          <div className="mr-[20px] box-border flex">
            <CopyLinkButton url={publicUrl} />
          </div>
        </Cell>
      ) : null}
    </TableRow>
  );
}

export interface ArticleTableProps {
  category: Category;
  articles: Article[];
  filter: ArticleFilter;
}

/** Category page article table; the empty state is centered in the table box. */
export function ArticleTable({ category, articles, filter }: ArticleTableProps) {
  return (
    <TableShell
      columns={COLUMNS}
      empty={articles.length === 0 ? <EmptyState title={EMPTY_TITLE[filter]} info={EMPTY_INFO[filter]} /> : undefined}
    >
      {articles.map((article) => (
        <ArticleRow
          key={article.id}
          article={article}
          categorySlug={category.slug}
          publicUrl={`https://product.hiverkb.com/${category.slug}/${article.slug}`}
        />
      ))}
    </TableShell>
  );
}
