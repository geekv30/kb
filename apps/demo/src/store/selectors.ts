// Phase 7.5.2 — pure selectors over MockStoreState.
//
// All synchronous, no memoization (the data scale is tiny — 56
// articles, 23 categories — and re-render cost is negligible).
// Memoization can be revisited if a future profiler pass shows
// hot spots; until then, KISS.

import { formatArticleTitle, type NavItem } from '@test-kb-ui/kb-ui';
import type {
  AISuggestion,
  Article,
  Category,
  ConversationSource,
  MockStoreState,
} from './types';

/* ─────────────────────────────────────────────────────────────
 * Articles
 * ───────────────────────────────────────────────────────────── */

export function selectArticleById(
  state: MockStoreState,
  id: string,
): Article | undefined {
  return state.articles[id];
}

export function selectArticleBySlug(
  state: MockStoreState,
  slug: string,
): Article | undefined {
  return Object.values(state.articles).find((a) => a.slug === slug);
}

export function selectArticlesInCategory(
  state: MockStoreState,
  categoryId: string,
): Article[] {
  return Object.values(state.articles)
    .filter((a) => a.categoryId === categoryId)
    .sort((a, b) =>
      // Newest first — matches what a real KB editor would show.
      a.lastUpdatedAt < b.lastUpdatedAt ? 1 : -1,
    );
}

export function selectArticlesByAuthor(
  state: MockStoreState,
  authorId: string,
): Article[] {
  return Object.values(state.articles).filter((a) => a.authorId === authorId);
}

/* ─────────────────────────────────────────────────────────────
 * Categories
 * ───────────────────────────────────────────────────────────── */

export function selectCategoryById(
  state: MockStoreState,
  id: string,
): Category | undefined {
  return state.categories[id];
}

export function selectCategoryBySlug(
  state: MockStoreState,
  slug: string,
): Category | undefined {
  return Object.values(state.categories).find((c) => c.slug === slug);
}

/**
 * Walks parent links from `categoryId` up to the root. Returns the
 * categories ordered root → leaf (so a breadcrumb can iterate in
 * natural reading order).
 */
export function selectCategoryAncestors(
  state: MockStoreState,
  categoryId: string,
): Category[] {
  const out: Category[] = [];
  let curr: Category | undefined = state.categories[categoryId];
  let guard = 0;
  while (curr && guard < 16) {
    out.unshift(curr);
    curr = curr.parentId ? state.categories[curr.parentId] : undefined;
    guard += 1;
  }
  return out;
}

/**
 * Direct children categories of the given parent. Pass `null` for the
 * top-level (depth 0) categories. Sorted by id so the order is stable
 * and matches the fixture authoring order.
 */
export function selectChildCategories(
  state: MockStoreState,
  parentId: string | null,
): Category[] {
  return Object.values(state.categories)
    .filter((c) => c.parentId === parentId)
    .sort((a, b) => a.id.localeCompare(b.id));
}

/* ─────────────────────────────────────────────────────────────
 * Suggestions
 * ───────────────────────────────────────────────────────────── */

export function selectSuggestionsForArticle(
  state: MockStoreState,
  articleId: string,
): AISuggestion[] {
  return Object.values(state.suggestions)
    .filter((s) => s.articleId === articleId)
    // Sort by id — ids are `sug-<topic>-N` so lexical sort gives s1, s2, s3.
    .sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Articles that have at least one PENDING suggestion. Drives the
 * AI Optimise hub's card list (PRD §5.3 derived state).
 */
export function selectPendingSuggestionArticles(
  state: MockStoreState,
): Article[] {
  const articleIds = new Set<string>();
  for (const s of Object.values(state.suggestions)) {
    if (s.status === 'pending') articleIds.add(s.articleId);
  }
  return Array.from(articleIds)
    .map((id) => state.articles[id])
    .filter((a): a is Article => Boolean(a))
    .sort((a, b) => a.title.localeCompare(b.title));
}

/* ─────────────────────────────────────────────────────────────
 * Conversation sources
 * ───────────────────────────────────────────────────────────── */

export function selectConversationSourcesForArticle(
  state: MockStoreState,
  articleId: string,
): ConversationSource[] {
  return Object.values(state.conversationSources)
    .filter((c) => c.articleId === articleId)
    // Newest first — matches what the SourcesSideSheet shows in stories.
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}

/* ─────────────────────────────────────────────────────────────
 * Tree builders for FileExplorerNav
 * ───────────────────────────────────────────────────────────── */

/**
 * Build the hierarchical tree consumed by `FileExplorerNav` (Editor
 * sub-nav). Mirrors the kb-ui NavItem contract exactly:
 *
 *   - Categories are `type: 'folder'`, with `children` carrying both
 *     subcategories AND the articles directly inside that category.
 *   - Articles are `type: 'article'`, no `children`, `status` lifted
 *     from the article's own status.
 *
 * Note: NavItem itself does not encode "expanded" state — the
 * FileExplorerNav stores expansion locally. The `expandedCategoryIds`
 * slice on MockStoreState is consumed by a separate hook in Phase
 * 7.5.3 (defaultExpandedIds prop). We don't need to project that
 * here.
 */
export function selectExplorerTree(state: MockStoreState): NavItem[] {
  const childrenByParent = new Map<string | null, Category[]>();
  for (const cat of Object.values(state.categories)) {
    const list = childrenByParent.get(cat.parentId) ?? [];
    list.push(cat);
    childrenByParent.set(cat.parentId, list);
  }
  // Sort each bucket by id (matches fixture authoring order).
  for (const list of childrenByParent.values()) {
    list.sort((a, b) => a.id.localeCompare(b.id));
  }

  function buildNode(cat: Category): NavItem {
    const childCategories = childrenByParent.get(cat.id) ?? [];
    const articles = selectArticlesInCategory(state, cat.id);
    const children: NavItem[] = [
      ...childCategories.map(buildNode),
      ...articles.map<NavItem>((a) => ({
        id: a.id,
        title: formatArticleTitle(a.title),
        type: 'article',
        status: a.status,
      })),
    ];
    return {
      id: cat.id,
      title: cat.title,
      type: 'folder',
      count: children.length,
      children,
    };
  }

  const roots = childrenByParent.get(null) ?? [];
  return roots.map(buildNode);
}

/**
 * Slug of the first top-level folder in the explorer tree. Drives the
 * "land on first folder" routing contract — used by `RedirectToDefault`,
 * `WelcomeRedirect`, and the Editor rail icon's click target. Returns
 * `undefined` when the store has zero top-level categories (defensive;
 * the demo's mock store always has at least one).
 *
 * Derived from the SAME `selectExplorerTree` ordering the FileExplorerNav
 * renders, so "first folder" stays consistent across the redirect and
 * the explorer's visual highlight/expand state.
 */
export function selectFirstCategorySlug(
  state: MockStoreState,
): string | undefined {
  const tree = selectExplorerTree(state);
  const firstFolder = tree.find((item) => item.type === 'folder');
  if (!firstFolder) return undefined;
  return state.categories[firstFolder.id]?.slug;
}

/**
 * Flat 3-item list consumed by `FileExplorerNav variant="flat"` for
 * the Analytics sub-nav. Hard-coded ids align with the routes built
 * in Phase 7.5.3.
 */
export function selectAnalyticsExplorerItems(
  _state: MockStoreState,
): NavItem[] {
  void _state;
  return [
    { id: 'analytics-article-performance', title: 'Article Views and Engagement', type: 'folder' },
    { id: 'analytics-search', title: 'Search', type: 'folder' },
    { id: 'analytics-ai-answer-performance', title: 'AI Answer Performance', type: 'folder' },
  ];
}

/* ─────────────────────────────────────────────────────────────
 * Misc
 * ───────────────────────────────────────────────────────────── */

export function selectCurrentUser(state: MockStoreState) {
  return state.users[state.currentUserId];
}
