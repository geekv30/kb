import { useMemo, useState } from 'react';
import { useToast } from '../components/ui/Toast';
import { selectAutoChanges, selectAutoWhere, selectConversationSources, type AutoWhere } from '../store/selectors';
import { useStore } from '../store/StoreContext';
import { appliedItems, type AppliedItem } from './autoApplied';

export interface AutoAppliedState {
  items: AppliedItem[];
  /** Where the applied suggestions are: unpublished edits, a draft, or live (published by a teammate). */
  where: AutoWhere;
  /** A suggestion nobody has settled yet: the article reads "Edited by AI". */
  needsReview: boolean;
  /** Revert an applied suggestion (toast offers Undo) or re-apply a reverted one. */
  toggle: (id: string) => void;
  /** A draft, or every suggestion reverted: settle without publishing. */
  markReviewed: () => void;
  /** Publish the unpublished edits, Hiver AI's changes with them. */
  publish: () => void;
  sourcesFor: string | null;
  setSourcesFor: (id: string | null) => void;
  sources: ReturnType<typeof selectConversationSources>;
}

const REVERTED_TOAST: Record<AutoWhere, string> = {
  live: 'Suggestion reverted.',
  edits: 'Suggestion reverted in the unpublished edits.',
  draft: 'Suggestion reverted in the draft.',
};

/** The actions on one article's auto-applied suggestions. */
export function useAutoApplied(articleId: string): AutoAppliedState {
  const { state, dispatch } = useStore();
  const { showToast } = useToast();
  const article = state.articles[articleId];
  const changes = useMemo(
    () => selectAutoChanges(state, articleId),
    [state.suggestions, article?.bodyHTML, article?.edits, articleId],
  );
  const items = useMemo(() => appliedItems(changes), [changes]);
  const where = selectAutoWhere(state, articleId);
  const [sourcesFor, setSourcesFor] = useState<string | null>(null);
  const now = () => new Date().toISOString();

  const flip = (id: string) =>
    dispatch({ type: 'ai/toggleAutoChange', suggestionId: id, modifierId: state.currentUserId, now: now() });

  return {
    items,
    where,
    needsReview: changes.some((c) => c.unchecked),
    toggle: (id) => {
      const item = items.find((i) => i.suggestion.id === id);
      if (!item) return;
      flip(id);
      showToast(
        item.applied ? REVERTED_TOAST[where] : 'Suggestion re-applied.',
        item.applied ? { label: 'Undo', onClick: () => flip(id) } : undefined,
      );
    },
    markReviewed: () => {
      dispatch({ type: 'ai/markAutoReviewed', articleId, userId: state.currentUserId, now: now() });
      showToast(`Marked “${article?.title ?? ''}” as reviewed.`);
    },
    publish: () => {
      dispatch({ type: 'article/publish', articleId, modifierId: state.currentUserId, now: now() });
      showToast(`Changes published to “${article?.edits?.title ?? article?.title ?? ''}”.`);
    },
    sourcesFor,
    setSourcesFor,
    sources: sourcesFor ? selectConversationSources(state, sourcesFor) : [],
  };
}
