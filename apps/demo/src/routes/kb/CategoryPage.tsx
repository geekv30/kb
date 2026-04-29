// Phase 7.5.4 — Category page.
//
// Mirrors `packages/kb-ui/src/pages/KBCategoryPage.stories.tsx` —
// uses `DataTable` + inline columns per Phase 7.5 consolidation.
// The legacy `ArticlesTable` / `SubCategoriesTable` components were
// collapsed into the single canonical `<DataTable<T> />` primitive in
// commit `de1f197`; row geometry, colours, and chrome remain identical
// (white card, slate border, 8 px radius, grey #f5f5f5 header,
// 6 px vertical cell padding, h-12 row height).
//
// All visual elements come from `@test-kb-ui/kb-ui`. The only bespoke UI is
// (a) the inline "category not found" state and (b) the inline empty
// state when the category has neither children nor articles. Both are
// intentionally simple — Phase 7.5.8 owns the polished empty-state pass.

import { useCallback, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  RiArrowRightSLine,
  RiFile3Line,
  RiFolderLine,
  RiMore2Line,
} from '@remixicon/react';
import {
  Avatar,
  Badge,
  cn,
  DataTable,
  PageHeader,
  type DataTableColumn,
} from '@test-kb-ui/kb-ui';
import { useMockStore } from '../../store/MockStoreContext';
import {
  selectArticlesInCategory,
  selectCategoryBySlug,
  selectChildCategories,
} from '../../store/selectors';
import type { Article, Category, User } from '../../store/types';
import { DEFAULT_KB_CATEGORY_SLUG, routes } from '../../lib/routes';
import { formatRelativeDate } from '../../lib/relativeDate';
import { EmptyState } from '../../components/EmptyState';

/* ─────────────────────────────────────────────────────────────
 * Row types — co-located with the page that owns them.
 *
 * These match the (now-dropped) `SubCategory` / `Article` shapes
 * from kb-ui pre-Phase-7.5. `articleCount` is kept on the row for
 * potential future use, but is not rendered (matches legacy
 * SubCategoriesTable, which never displayed it either).
 * ───────────────────────────────────────────────────────────── */

type SubCategoryRow = {
  id: string;
  title: string;
  articleCount: number;
};

type ArticleRow = {
  id: string;
  title: string;
  status: 'published' | 'draft';
  authorInitials?: string;
  lastUpdated: string;
};

/* ─────────────────────────────────────────────────────────────
 * Column configs — lifted verbatim from
 * `KBCategoryPage.stories.tsx`. Geometry is the legacy
 * ArticlesTable / SubCategoriesTable unwrapped chrome (white
 * card, slate border, 8 px radius, grey #f5f5f5 header,
 * 6-px vertical cell padding).
 * ───────────────────────────────────────────────────────────── */

const subCategoryColumns: DataTableColumn<SubCategoryRow>[] = [
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
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] text-[#64758b]',
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
  {
    id: 'chev',
    header: '',
    align: 'right',
    width: 48,
    headerClassName: 'pl-0 pr-4 py-0',
    className: 'pl-0 pr-4',
    render: () => (
      <div className="flex items-center justify-end">
        <RiArrowRightSLine
          size={16}
          className="text-[#64758b]"
          aria-hidden="true"
        />
      </div>
    ),
  },
];

const articleColumns: DataTableColumn<ArticleRow>[] = [
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
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] text-[#64758b]',
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
        {a.authorInitials ? <Avatar initials={a.authorInitials} /> : null}
      </div>
    ),
  },
  {
    id: 'updated',
    header: 'Last Updated',
    width: 251,
    headerClassName: 'px-4 py-0 text-[#475569]',
    className: 'px-4',
    render: (a) => <span className="text-[#64758b]">{a.lastUpdated}</span>,
  },
];

/* ─────────────────────────────────────────────────────────────
 * View-model helpers
 *
 * The store's domain shapes don't 1:1 match the table row shapes,
 * so we project them here. Keeps the JSX tidy and makes it obvious
 * which fields the tables actually consume.
 * ───────────────────────────────────────────────────────────── */

function toSubCategoryRow(
  cat: Category,
  articleCount: number,
): SubCategoryRow {
  return {
    id: cat.id,
    title: cat.title,
    articleCount,
  };
}

function toArticleRow(
  article: Article,
  author: User | undefined,
): ArticleRow {
  return {
    id: article.id,
    title: article.title,
    status: article.status,
    authorInitials: author?.initials,
    lastUpdated: formatRelativeDate(article.lastUpdatedAt),
  };
}

/**
 * Build the URL for a child category given the active category's URL
 * params. We don't have the child's full ancestor chain handy at the
 * call site, but we don't need it: a child sits exactly one segment
 * below the current page, so we simply append its slug.
 */
function buildChildCategoryUrl(
  child: Category,
  topLevel: string | undefined,
  mid: string | undefined,
  depth2: string | undefined,
): string {
  if (!topLevel) return routes.kb.category(child.slug);
  if (!mid) return routes.kb.sub(topLevel, child.slug);
  if (!depth2) return routes.kb.deep(topLevel, mid, child.slug);
  // We don't have a depth-3 route in this demo — fall through to a
  // best-effort URL (the explorer's deepest navigable target is
  // depth 2 per the fixture tree, so this branch is unreachable in
  // practice, but the explicit fallback keeps TS exhaustive).
  return routes.kb.deep(topLevel, mid, child.slug);
}

/**
 * Generate a unique `untitled-N` slug for a brand-new draft. Walks the
 * existing article slugs and finds the smallest N (>=1) that is not
 * already taken. O(M) over articles where M is small (~20) — fine.
 */
function nextUntitledSlug(existingSlugs: Set<string>): string {
  let n = 1;
  while (existingSlugs.has(`untitled-${n}`)) {
    n += 1;
    if (n > 9999) {
      // Defensive cap. Should never trip; prevents a runaway loop if
      // the slug-generation invariant is ever broken.
      return `untitled-${crypto.randomUUID()}`;
    }
  }
  return `untitled-${n}`;
}

/* ─────────────────────────────────────────────────────────────
 * Inline states
 * ───────────────────────────────────────────────────────────── */

function CategoryNotFound({
  attemptedSlug,
}: {
  attemptedSlug: string | undefined;
}) {
  return (
    <div
      data-route="kb-category-not-found"
      className="flex flex-col items-start gap-3 py-8"
    >
      <h1 className="text-[18px] font-semibold leading-[28px] text-[#0f172a]">
        Category not found
      </h1>
      <p className="text-[14px] leading-[20px] text-[#475569]">
        No category matches{' '}
        <code className="rounded bg-[#f1f5f9] px-1 py-0.5 text-[13px] text-[#0f172a]">
          {attemptedSlug ?? '(none)'}
        </code>
        .
      </p>
      <Link
        to={routes.kb.category(DEFAULT_KB_CATEGORY_SLUG)}
        className="text-[14px] font-medium text-[#0f172a] underline underline-offset-2 hover:no-underline"
      >
        Back to Getting Started
      </Link>
    </div>
  );
}

function EmptyCategoryState({ onCreate }: { onCreate: () => void }) {
  // Phase 7.5.8 — switched from a one-off inline render to the shared
  // <EmptyState /> component so every "nothing here yet" surface in
  // the demo looks the same (PRD §12.5).
  return (
    <EmptyState
      icon={<RiFile3Line />}
      title="No content here yet."
      subtitle="Add the first article to start building this section of the KB."
      cta={{ label: '+ Create the first article', onClick: onCreate }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
 * CategoryPage
 * ───────────────────────────────────────────────────────────── */

export default function CategoryPage() {
  const { topLevel, mid, depth2 } = useParams<{
    topLevel?: string;
    mid?: string;
    depth2?: string;
  }>();
  const navigate = useNavigate();
  const { state, dispatch } = useMockStore();

  // Deepest URL segment is the active category slug. (`depth2` may be
  // undefined on /kb/<top> or /kb/<top>/<mid>; we fall back through
  // mid → topLevel.)
  const activeSlug = depth2 ?? mid ?? topLevel;
  const category = useMemo(
    () => (activeSlug ? selectCategoryBySlug(state, activeSlug) : undefined),
    [state, activeSlug],
  );

  /* ── + New ──────────────────────────────────────────────────── */

  const handleNewArticle = useCallback(() => {
    if (!category) return;
    const existingSlugs = new Set<string>();
    for (const a of Object.values(state.articles)) existingSlugs.add(a.slug);
    const newSlug = nextUntitledSlug(existingSlugs);
    const newArticleId = `art-${newSlug}-${crypto.randomUUID().slice(0, 8)}`;
    dispatch({
      type: 'editor/createNew',
      categoryId: category.id,
      newArticleId,
      newSlug,
      now: new Date().toISOString(),
    });
    navigate(routes.article(newSlug));
  }, [category, state.articles, dispatch, navigate]);

  /* ── 404 path ──────────────────────────────────────────────── */

  if (!category) {
    return <CategoryNotFound attemptedSlug={activeSlug} />;
  }

  /* ── Data ──────────────────────────────────────────────────── */

  const childCategories = selectChildCategories(state, category.id);
  const articles = selectArticlesInCategory(state, category.id);

  const subCategoryRows: SubCategoryRow[] = childCategories.map((c) =>
    toSubCategoryRow(c, selectArticlesInCategory(state, c.id).length),
  );
  const articleRows: ArticleRow[] = articles.map((a) =>
    toArticleRow(a, state.users[a.authorId]),
  );

  /* ── Click handlers ────────────────────────────────────────── */

  const handleSubCategoryClick = (row: SubCategoryRow) => {
    const child = state.categories[row.id];
    if (!child) return;
    navigate(buildChildCategoryUrl(child, topLevel, mid, depth2));
  };

  const handleArticleClick = (row: ArticleRow) => {
    const article = state.articles[row.id];
    if (!article) return;
    navigate(routes.article(article.slug));
  };

  /* ── Render ────────────────────────────────────────────────── */

  const isEmpty = subCategoryRows.length === 0 && articleRows.length === 0;

  return (
    <div data-route="kb-category" className="flex flex-col gap-4">
      <PageHeader
        title={category.title}
        subtitle={category.subtitle}
        newButtonLabel="New article"
        onNewClick={handleNewArticle}
      />

      {isEmpty ? (
        <EmptyCategoryState onCreate={handleNewArticle} />
      ) : (
        <>
          {subCategoryRows.length > 0 && (
            <DataTable
              dataKbComponent="sub-categories-table"
              rows={subCategoryRows}
              columns={subCategoryColumns}
              wrapped={false}
              headerBackground="#f5f5f5"
              cellPaddingY={6}
              emptyMessage="No sub-categories"
              onRowClick={handleSubCategoryClick}
            />
          )}
          {articleRows.length > 0 && (
            <DataTable
              dataKbComponent="articles-table"
              rows={articleRows}
              columns={articleColumns}
              wrapped={false}
              headerBackground="#f5f5f5"
              cellPaddingY={6}
              emptyMessage="No articles"
              onRowClick={handleArticleClick}
            />
          )}
        </>
      )}
    </div>
  );
}
