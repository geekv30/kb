// Phase 7.5.4 — Category page.
//
// Composes the kb-ui `PageHeader` + `SubCategoriesTable` + `ArticlesTable`
// per TRD §7.3. Resolves the deepest URL segment to a category, lists
// its child sub-categories and articles, and wires the "+ New" CTA to
// `editor/createNew` followed by an immediate navigation to the new
// article's editor (PRD Journey A step 13).
//
// All visual elements come from `@hiver/kb-ui`. The only bespoke UI is
// (a) the inline "category not found" state and (b) the inline empty
// state when the category has neither children nor articles. Both are
// intentionally simple — Phase 7.5.8 owns the polished empty-state pass.

import { useCallback, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { RiFile3Line } from '@remixicon/react';
import {
  ArticlesTable,
  PageHeader,
  SubCategoriesTable,
  type Article as TableArticle,
  type SubCategory as TableSubCategory,
} from '@hiver/kb-ui';
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
 * View-model helpers
 *
 * The store's domain shapes don't 1:1 match the kb-ui table props,
 * so we project them here. Keeps the JSX tidy and makes it obvious
 * which fields the tables actually consume.
 * ───────────────────────────────────────────────────────────── */

function toSubCategoryRow(
  cat: Category,
  articleCount: number,
): TableSubCategory {
  return {
    id: cat.id,
    title: cat.title,
    articleCount,
  };
}

function toArticleRow(
  article: Article,
  author: User | undefined,
): TableArticle {
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

  const subCategoryRows: TableSubCategory[] = childCategories.map((c) =>
    toSubCategoryRow(c, selectArticlesInCategory(state, c.id).length),
  );
  const articleRows: TableArticle[] = articles.map((a) =>
    toArticleRow(a, state.users[a.authorId]),
  );

  /* ── Click handlers ────────────────────────────────────────── */

  const handleSubCategoryClick = (childId: string) => {
    const child = state.categories[childId];
    if (!child) return;
    navigate(buildChildCategoryUrl(child, topLevel, mid, depth2));
  };

  const handleArticleClick = (articleId: string) => {
    const article = state.articles[articleId];
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
            <SubCategoriesTable
              items={subCategoryRows}
              onItemClick={handleSubCategoryClick}
            />
          )}
          {articleRows.length > 0 && (
            <ArticlesTable
              articles={articleRows}
              onArticleClick={handleArticleClick}
            />
          )}
        </>
      )}
    </div>
  );
}
