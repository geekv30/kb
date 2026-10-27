// Store-backed review state for one article. The store keeps one review
// state per article, so leaving the review view and coming back resumes
// mid-flow (same as the new UI's `useAIGapsForArticle`).

import { useCallback } from 'react';
import { useStore } from '../store/StoreContext';
import { initialReviewState, type ReviewAction, type ReviewState } from './reviewState';

export function useArticleReview(articleId: string): readonly [ReviewState, (action: ReviewAction) => void] {
  const { state, dispatch } = useStore();
  const review = state.aiReviewByArticle[articleId] ?? initialReviewState;
  const send = useCallback(
    (action: ReviewAction) => dispatch({ type: 'aiReview/dispatch', articleId, action }),
    [dispatch, articleId],
  );
  return [review, send] as const;
}
