// What the Admin Panel nudges count: articles in the replica's help
// center ("product help center") with Hiver AI suggestions still to
// review, and the suggestions across them. Both drop to 0 as reviews are
// published or marked as reviewed, which hides the nudges.

import { useMemo } from 'react';
import { selectArticlesNeedingAction } from '../store/selectors';
import { useStore } from '../store/StoreContext';

export function useAiSuggestionCounts(): { articles: number; suggestions: number } {
  const { state } = useStore();
  return useMemo(() => {
    const rows = selectArticlesNeedingAction(state);
    return { articles: rows.length, suggestions: rows.reduce((sum, r) => sum + r.total, 0) };
  }, [state]);
}
