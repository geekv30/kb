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

import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import * as RxDropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  BookOpen01,
  ChevronRight,
  DotsVertical,
  File02,
  Folder,
  Plus,
} from '@untitledui/icons';
import {
  Avatar,
  Badge,
  cn,
  DataTable,
  NewCategoryModal,
  PageHeader,
  type DataTableColumn,
  type NewCategoryFormValues,
  type ParentCategoryOption,
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
import { EmptyStateGallery } from '../../components/EmptyStateVariants';
import { useCreateArticle } from '../../hooks/useCreateArticle';
import {
  DropdownMenuItem,
  DROPDOWN_CONTENT_CLASSES,
} from '../../shell/DropdownMenuItem';

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
    headerClassName: 'pl-4 pr-0 py-0 text-text-meta',
    className: 'pl-4 pr-0',
    render: (item) => (
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`Open ${item.title}`}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] text-text-muted',
            'hover:bg-surface-subtle focus:bg-surface-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-border-faint',
          )}
        >
          <Folder size={16} aria-hidden="true" />
        </button>
        <span className="text-[14px] font-normal leading-[20px] text-text-primary">
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
        <ChevronRight
          size={16}
          className="text-text-muted"
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
    headerClassName: 'pl-4 pr-0 py-0 text-text-meta',
    className: 'px-4',
    render: (a) => (
      <div className="flex items-center gap-1 min-w-0">
        <button
          type="button"
          aria-label={`Open ${a.title}`}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] text-text-muted',
            'hover:bg-surface-subtle focus:bg-surface-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-border-faint',
          )}
        >
          <File02 size={16} aria-hidden="true" />
        </button>
        <span className="text-[14px] font-normal leading-[20px] text-text-primary truncate">
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
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] text-text-disabled',
            'hover:bg-surface-subtle focus:bg-surface-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-border-faint',
          )}
        >
          <DotsVertical size={16} aria-hidden="true" />
        </button>
      </div>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    width: 127,
    headerClassName: 'px-4 py-0 text-text-meta',
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
    headerClassName: 'px-4 py-0 text-text-meta',
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
    headerClassName: 'px-4 py-0 text-text-meta',
    className: 'px-4',
    render: (a) => <span className="text-text-muted">{a.lastUpdated}</span>,
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

/* ─────────────────────────────────────────────────────────────
 * "+ New" dropdown trigger
 *
 * Radix `Trigger asChild` requires a child that forwards refs so the
 * menu can compute the trigger's bounding box. The kb-ui `Button`
 * does NOT forward refs, so we use a native `<button>` styled to
 * match Button's `primary` variant (h-8, px-3, rounded-[6px], black
 * bg, 14/medium label, focus ring) — keeping the visual rhythm of
 * the existing PageHeader CTA intact.
 * ───────────────────────────────────────────────────────────── */

const NewButtonTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function NewButtonTrigger({ className, children, ...rest }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'box-border inline-flex items-center justify-center gap-1.5',
        'font-sans text-[14px] font-medium leading-5 transition-colors',
        'h-8 px-3 rounded-[6px] bg-black text-white',
        'hover:bg-black/90 active:bg-black/80',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-faint focus-visible:ring-offset-1',
        className,
      )}
      {...rest}
    >
      <span
        aria-hidden
        className="flex size-[14px] shrink-0 items-center justify-center [&>svg]:h-[14px] [&>svg]:w-[14px]"
      >
        <Plus aria-hidden="true" />
      </span>
      {children}
    </button>
  );
});

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
      <h1 className="text-[18px] font-semibold leading-[28px] text-text-primary">
        Category not found
      </h1>
      <p className="text-[14px] leading-[20px] text-text-meta">
        No category matches{' '}
        <code className="rounded bg-surface-muted px-1 py-0.5 text-[13px] text-text-primary">
          {attemptedSlug ?? '(none)'}
        </code>
        .
      </p>
      <Link
        to={routes.kb.category(DEFAULT_KB_CATEGORY_SLUG)}
        className="text-[14px] font-medium text-text-primary underline underline-offset-2 hover:no-underline"
      >
        Back to Getting Started
      </Link>
    </div>
  );
}

function EmptyCategoryState({ onCreate }: { onCreate: () => void }) {
  // Phase 7.5.8 — variant gallery prototype. Three spot-graphic
  // treatments stacked for side-by-side review. Once the user picks a
  // winner we promote it into kb-ui and restore the single <EmptyState />
  // render here. Demo-local EmptyState.tsx is intentionally left
  // untouched — other surfaces (AI Optimise hub etc.) still use it.
  return <EmptyStateGallery onCreate={onCreate} />;
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
  const { state } = useMockStore();
  const createArticle = useCreateArticle();

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
    createArticle(category.id);
  }, [category, createArticle]);

  /* ── Create-folder modal state ─────────────────────────────── */

  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Depth-0 categories drive the modal's "parent" dropdown options.
  const parentOptions = useMemo<ParentCategoryOption[]>(
    () =>
      Object.values(state.categories)
        .filter((c) => c.parentId === null)
        .map((c) => ({ id: c.id, label: c.title })),
    [state.categories],
  );

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

  /* ── PageHeader "+ New" dropdown ───────────────────────────── */
  //
  // Replaces the previous "+ New article" Button. Trigger label is
  // intentionally "+ New" — the menu items disambiguate Folder /
  // Article. Matches Figma 1958:33465 / image #7.
  //
  // Folder  → opens NewCategoryModal in create mode, parent pre-filled
  //           with the current category.
  // Article → reuses the existing useCreateArticle() flow scoped to
  //           the current category.

  const onNewFolder = () => setCreateModalOpen(true);

  const newCta = (
    <RxDropdownMenu.Root>
      <RxDropdownMenu.Trigger asChild>
        <NewButtonTrigger aria-label="Create new">New</NewButtonTrigger>
      </RxDropdownMenu.Trigger>
      <RxDropdownMenu.Portal>
        <RxDropdownMenu.Content
          align="end"
          sideOffset={4}
          className={DROPDOWN_CONTENT_CLASSES}
        >
          <DropdownMenuItem
            label="Folder"
            icon={<Folder aria-hidden="true" />}
            onSelect={onNewFolder}
          />
          <DropdownMenuItem
            label="Article"
            icon={<File02 aria-hidden="true" />}
            onSelect={handleNewArticle}
          />
        </RxDropdownMenu.Content>
      </RxDropdownMenu.Portal>
    </RxDropdownMenu.Root>
  );

  /* ── Render ────────────────────────────────────────────────── */

  const isEmpty = subCategoryRows.length === 0 && articleRows.length === 0;

  return (
    <div data-route="kb-category" className="flex flex-col gap-4">
      <PageHeader
        icon={<BookOpen01 className="size-[22px] text-blue-500" />}
        title={category.title}
        subtitle={category.subtitle}
        cta={newCta}
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

      {/* Conditional render: NewCategoryModal seeds form state on first
       *  mount, so to ensure parent pre-fill applies on every open we
       *  mount/unmount on each cycle. Mirrors the pattern in
       *  EditorExplorer for edit-mode opens.
       */}
      {createModalOpen && (
        <NewCategoryModal
          open
          onOpenChange={(next) => {
            if (!next) setCreateModalOpen(false);
          }}
          mode="create"
          parentOptions={parentOptions}
          initialValues={{ parentCategoryId: category.id }}
          onSubmit={(values: NewCategoryFormValues) => {
            // eslint-disable-next-line no-console
            console.log('TODO: create category', values);
            setCreateModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
