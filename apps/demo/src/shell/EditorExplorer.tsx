// Phase 7.5.3 — Route-aware wrapper around `FileExplorerNav` for the
// Editor surface (`/kb/*` and `/articles/*`).
//
// Tree shape comes from `selectExplorerTree(state)` (built once per
// render — selector is cheap given fixture sizes). Active item is
// derived from the current route:
//   - On `/kb/.../<slug>` the deepest category in the path is active.
//   - On `/articles/<slug>/edit` the article id matching that slug is
//     active (the explorer auto-expands its category ancestors).
//
// Click behaviour:
//   - Folder click  → dispatch `tree/toggleExpanded` (store-side bookkeeping
//     so future selectors can read the persisted set; FileExplorerNav also
//     keeps its own local expansion state) AND, if the folder is a
//     category, navigate to its category page.
//   - Article click → navigate to the editor URL for that article slug.

import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FileExplorerNav, type NavItem } from '@hiver/kb-ui';
import { useMockStore } from '../store/MockStoreContext';
import {
  selectArticleBySlug,
  selectCategoryBySlug,
  selectExplorerTree,
} from '../store/selectors';
import { routes } from '../lib/routes';

/**
 * Recursively flatten the tree into a list of (node, parents-from-root)
 * pairs. Used to map a category id back to the URL segments needed to
 * navigate to it (`/kb/topLevel/mid?/depth2?`).
 */
type FlatNode = { node: NavItem; ancestors: NavItem[] };

function flattenTree(items: NavItem[], ancestors: NavItem[] = []): FlatNode[] {
  const out: FlatNode[] = [];
  for (const node of items) {
    out.push({ node, ancestors });
    if (node.children && node.children.length > 0) {
      out.push(...flattenTree(node.children, [...ancestors, node]));
    }
  }
  return out;
}

export function EditorExplorer() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // We read URL params if available — but this component renders for
  // every shell route, so params can be empty (e.g. on /ai-optimise).
  const params = useParams<{
    topLevel?: string;
    mid?: string;
    depth2?: string;
    articleSlug?: string;
  }>();
  const { state, dispatch } = useMockStore();

  const items = useMemo(() => selectExplorerTree(state), [state]);
  const flat = useMemo(() => flattenTree(items), [items]);

  /* ── Active id derivation ───────────────────────────────────── */

  const activeId = useMemo<string | undefined>(() => {
    // Editor route — find the article id by slug.
    if (pathname.startsWith('/articles/') && params.articleSlug) {
      const article = selectArticleBySlug(state, params.articleSlug);
      return article?.id;
    }
    // KB route — deepest URL segment maps to a category slug.
    const slug = params.depth2 ?? params.mid ?? params.topLevel;
    if (!slug) return undefined;
    const cat = selectCategoryBySlug(state, slug);
    return cat?.id;
  }, [pathname, params, state]);

  /* ── Click handler ──────────────────────────────────────────── */

  const handleItemClick = useCallback(
    (id: string) => {
      const hit = flat.find((f) => f.node.id === id);
      if (!hit) return;
      const { node, ancestors } = hit;

      if (node.type === 'article') {
        // Articles in our tree carry the `art-<slug>` id pattern but the
        // canonical slug source is the store. Look it up to be safe.
        const article = state.articles[id];
        if (article) navigate(routes.article(article.slug));
        return;
      }

      // Folder = category. Toggle expansion in the store (bookkeeping)
      // and navigate to the category page when one exists.
      dispatch({ type: 'tree/toggleExpanded', categoryId: id });

      const category = state.categories[id];
      if (!category) return;

      // Build the URL from the ancestor chain. Top-level categories
      // (depth 0) use /kb/<slug>; depth 1 → /kb/<root>/<mid>; depth 2 →
      // /kb/<root>/<mid>/<depth2>.
      const allCats = [...ancestors, node]
        .map((n) => state.categories[n.id])
        .filter((c): c is NonNullable<typeof c> => Boolean(c));
      const slugs = allCats.map((c) => c.slug);

      if (slugs.length === 1) navigate(routes.kb.category(slugs[0]));
      else if (slugs.length === 2) navigate(routes.kb.sub(slugs[0], slugs[1]));
      else if (slugs.length >= 3)
        navigate(routes.kb.deep(slugs[0], slugs[1], slugs[2]));
    },
    [flat, state, dispatch, navigate],
  );

  return (
    <FileExplorerNav
      title="Editor"
      items={items}
      activeId={activeId}
      onItemClick={handleItemClick}
    />
  );
}
