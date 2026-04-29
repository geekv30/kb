// Phase 7.5.6 — Per-article AI Gaps reducer accessor.
//
// The MockStore keeps AI Gaps reducer state per-article in
// `aiGapsStateByArticle[articleId]`. This hook hides the slot lookup so the
// Review page consumes the same `[state, dispatch]` shape that the
// `useAIGapsReducer` hook in kb-ui returns. The dispatch wraps the user's
// `AIGapsAction` in the store action `{ type: 'aiGaps/dispatch', articleId,
// action }` — the root reducer forwards it to the kb-ui `aiGapsReducer`.
//
// Why this lives in the demo and not in kb-ui: the kb-ui hook owns one
// reducer instance via React.useReducer. The demo owns N reducer slots (one
// per AI-targeted article) so a user can review article #1, leave, return,
// and resume mid-flow per PRD §8.5. The store is the durability layer; this
// hook is the read/write facade.

import { useCallback } from 'react';
import {
  initialAIGapsState,
  type AIGapsAction,
  type AIGapsState,
} from '@test-kb-ui/kb-ui';
import { useMockStore } from '../store/MockStoreContext';

export type UseAIGapsForArticleResult = readonly [
  AIGapsState,
  (action: AIGapsAction) => void,
];

export function useAIGapsForArticle(
  articleId: string,
): UseAIGapsForArticleResult {
  const { state, dispatch } = useMockStore();
  const aiGapsState =
    state.aiGapsStateByArticle[articleId] ?? initialAIGapsState;

  const dispatchAction = useCallback(
    (action: AIGapsAction) => {
      dispatch({ type: 'aiGaps/dispatch', articleId, action });
    },
    [dispatch, articleId],
  );

  return [aiGapsState, dispatchAction] as const;
}
