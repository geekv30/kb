import { useMemo, useState } from 'react';
import { useToast } from '../components/ui/Toast';
import { selectAutoChanges, selectAutoWhere, selectConversationSources, type AutoWhere } from '../store/selectors';
import { useStore } from '../store/StoreContext';
import { appliedItems, type AppliedItem } from './autoApplied';

const REVERTED_TOAST: Record<AutoWhere, string> = {
  live: 'Suggestion reverted. The original text is live again.',
  edits: 'Suggestion reverted in the unpublished edits.',
  draft: 'Suggestion reverted in the draft.',
};

export interface AutoAppliedState {
  items: AppliedItem[];
  /** Where the applied suggestions are: live, in unpublished edits, or in a draft. */
  where: AutoWhere;
  /** A live suggestion nobody has reviewed yet: Mark as reviewed is offered. */
  needsReview: boolean;
  /** Revert a live suggestion (toast offers Undo) or re-apply a reverted one. */
  toggle: (id: string) => void;
  markReviewed: () => void;
  sourcesFor: string | null;
  setSourcesFor: (id: string | null) => void;
  sources: ReturnType<typeof selectConversationSources>;
}

/** The actions both layouts share for one article's auto-applied suggestions. */
export function useAutoApplied(articleId: string): AutoAppliedState {
  const { state, dispatch } = useStore();
  const { showToast } = useToast();
  const article = state.articles[articleId];
  const changes = useMemo(
    () => selectAutoChanges(state, articleId),
    [state.suggestions, state.aiReviewHistoryByArticle, article?.bodyHTML, article?.edits, articleId],
  );
  const items = useMemo(() => appliedItems(changes), [changes]);
  const where = selectAutoWhere(state, articleId);
  const [sourcesFor, setSourcesFor] = useState<string | null>(null);

  const flip = (id: string) =>
    dispatch({
      type: 'ai/toggleAutoChange',
      suggestionId: id,
      modifierId: state.currentUserId,
      now: new Date().toISOString(),
    });

  return {
    items,
    where,
    needsReview: changes.some((c) => c.unchecked),
    toggle: (id) => {
      const item = items.find((i) => i.suggestion.id === id);
      if (!item) return;
      flip(id);
      showToast(
        item.live ? REVERTED_TOAST[where] : 'Suggestion re-applied.',
        item.live ? { label: 'Undo', onClick: () => flip(id) } : undefined,
      );
    },
    markReviewed: () => {
      dispatch({ type: 'ai/markAutoReviewed', articleId, userId: state.currentUserId, now: new Date().toISOString() });
      showToast(`Marked “${article?.title ?? ''}” as reviewed.`);
    },
    sourcesFor,
    setSourcesFor,
    sources: sourcesFor ? selectConversationSources(state, sourcesFor) : [],
  };
}
