// Shared `+ New article` creation logic.
//
// Lives in a hook so both `CategoryPage` (via PageHeader's `onNewClick`) and
// `EditorExplorer` (via the "+ New" header dropdown) can fire the same
// flow: pick a unique `untitled-N` slug, dispatch `editor/createNew`, and
// navigate to the new draft's editor URL.

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockStore } from '../store/MockStoreContext';
import { routes } from '../lib/routes';

/**
 * Walk existing article slugs and return the smallest `untitled-N` (N>=1)
 * that is not already taken. Defensive crypto-uuid fallback prevents a
 * runaway loop if the slug-generation invariant is ever broken.
 */
function nextUntitledSlug(existingSlugs: Set<string>): string {
  let n = 1;
  while (existingSlugs.has(`untitled-${n}`)) {
    n += 1;
    if (n > 9999) return `untitled-${crypto.randomUUID()}`;
  }
  return `untitled-${n}`;
}

/**
 * Returns a callable that creates a brand-new draft article inside the
 * given category and navigates to its editor route.
 *
 * Pass `targetCategoryId` at call time so the caller can decide which
 * category the new draft lands in (the URL-active category in
 * CategoryPage's case; the explorer's active category in
 * EditorExplorer's case).
 *
 * If `targetCategoryId` is missing or doesn't resolve to a category in
 * the store, the call is a no-op and logs a dev warning — surfaces the
 * "no active category" edge case during prototype use without crashing.
 */
export function useCreateArticle(): (targetCategoryId?: string) => void {
  const navigate = useNavigate();
  const { state, dispatch } = useMockStore();

  return useCallback(
    (targetCategoryId?: string) => {
      if (!targetCategoryId) {
        // eslint-disable-next-line no-console
        console.warn(
          '[useCreateArticle] no targetCategoryId — cannot create article',
        );
        return;
      }
      const category = state.categories[targetCategoryId];
      if (!category) {
        // eslint-disable-next-line no-console
        console.warn(
          `[useCreateArticle] unknown categoryId="${targetCategoryId}"`,
        );
        return;
      }
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
    },
    [state.articles, state.categories, dispatch, navigate],
  );
}
