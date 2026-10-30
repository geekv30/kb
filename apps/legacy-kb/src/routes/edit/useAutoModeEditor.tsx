import { useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { BannerCount, SuggestionsBanner } from '../../improvements/SuggestionsBanner';
import { suggestionsReviewPath } from '../../lib/paths';
import { selectAutoChanges, selectAutoWhere } from '../../store/selectors';
import { useStore } from '../../store/StoreContext';
import type { Article } from '../../store/types';

export interface AutoModeEditor {
  /** Above the editor while the article is "Edited by AI". */
  top: ReactNode;
  /** Changes when a suggestion is reverted / re-applied, so the editor reseeds. */
  editorKey: string;
}

/**
 * The edit page's part in auto mode: while Hiver AI's changes wait for a
 * teammate, a banner says so and "Review edits" opens them on the review
 * page, one by one.
 */
export function useAutoModeEditor(article: Article | undefined): AutoModeEditor {
  const { state } = useStore();
  const navigate = useNavigate();
  const articleId = article?.id ?? '';
  const changes = useMemo(
    () => (article ? selectAutoChanges(state, articleId) : []),
    [state.suggestions, article?.bodyHTML, article?.edits, articleId],
  );
  const editorKey = changes.map((c) => `${c.suggestion.id}:${c.status}`).join('|');
  const waiting = changes.filter((c) => c.unchecked).length;
  if (!article || waiting === 0) return { top: null, editorKey };

  const draft = selectAutoWhere(state, articleId) === 'draft';
  return {
    top: (
      <SuggestionsBanner actionLabel="Review edits" onAction={() => navigate(suggestionsReviewPath(article.slug))}>
        Auto mode is on, so Hiver AI applied <BannerCount count={waiting} noun="suggestion" /> to this{' '}
        {draft ? 'draft' : 'article'}. {waiting === 1 ? 'It isn’t' : 'They aren’t'} published yet.
      </SuggestionsBanner>
    ),
    editorKey,
  };
}
