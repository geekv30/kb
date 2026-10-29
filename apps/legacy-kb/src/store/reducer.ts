// Pure root reducer. Callers supply timestamps so the reducer stays
// deterministic.

import { applyDecisions } from '../improvements/reviewDocument';
import { reviewReducer, initialReviewState, type ReviewAction, type ReviewDecision } from '../improvements/reviewState';
import { HIVER_AI_USER_ID } from './fixtures/users';
import { seed } from './seed';
import { selectReviewSuggestions } from './selectors';
import type { AISuggestion, Article, AutoModeOption, Category, StoreState } from './types';

export type StoreAction =
  | { type: 'article/create'; article: Article }
  | { type: 'article/updateBody'; articleId: string; bodyHTML: string }
  | { type: 'article/updateTitle'; articleId: string; title: string }
  | { type: 'article/updateSlug'; articleId: string; slug: string }
  | { type: 'article/setAuthor'; articleId: string; authorId: string | null }
  | { type: 'article/move'; articleId: string; categoryId: string }
  | { type: 'article/publish'; articleId: string; modifierId: string; now: string }
  | { type: 'article/unpublish'; articleId: string; modifierId: string; now: string }
  | { type: 'article/delete'; articleId: string }
  | { type: 'category/create'; category: Category }
  /** Forwards one review action to the article's review state machine. */
  | { type: 'aiReview/dispatch'; articleId: string; action: ReviewAction }
  /**
   * Makes the review's decisions final. With at least one accepted
   * suggestion this is "Publish changes": the accepted changes are
   * written into the body and the article is published by `modifierId`.
   * With only dismissals it is "Mark as reviewed": the body and activity
   * stay as they are. Undecided suggestions stay pending either way.
   * `edited`: the reviewer changed the article text in the review, so it
   * publishes even with nothing accepted (or nothing decided at all).
   */
  | { type: 'aiReview/publish'; articleId: string; modifierId: string; now: string; edited?: boolean }
  | { type: 'settings/setAiAutoApply'; enabled: boolean }
  /** New conversations produced the incoming batch. Where it lands depends on the mode. */
  | { type: 'ai/receiveSuggestions'; now: string }
  /** Option `publish`: undo an applied change on the live article, or reapply an undone one. */
  | { type: 'ai/toggleAutoChange'; suggestionId: string; modifierId: string; now: string }
  /** Prototype: start over on one auto-mode design, keeping the auto setting. */
  | { type: 'proto/restart'; option: AutoModeOption };

function patchArticle(
  state: StoreState,
  articleId: string,
  patch: Partial<Article>,
): StoreState {
  const existing = state.articles[articleId];
  if (!existing) return state;
  return {
    ...state,
    articles: { ...state.articles, [articleId]: { ...existing, ...patch } },
  };
}

/**
 * Manual mode: the batch waits in To review. Auto mode, per article:
 *   publish → applied to the live body by Hiver AI; the pre-change body
 *             is kept as the history base so each change can be undone.
 *   merge   → left off the live body, every suggestion pre-accepted in
 *             the article's review: an improved version waiting to merge.
 */
function receiveSuggestions(state: StoreState, now: string): StoreState {
  const incoming = Object.values(state.suggestions).filter((s) => s.status === 'incoming');
  if (incoming.length === 0) return state;
  const suggestions = { ...state.suggestions };
  if (!state.aiAutoApply) {
    for (const s of incoming) suggestions[s.id] = { ...s, status: 'pending' };
    return { ...state, suggestions };
  }

  const articles = { ...state.articles };
  const aiReviewByArticle = { ...state.aiReviewByArticle };
  const aiReviewHistoryByArticle = { ...state.aiReviewHistoryByArticle };
  const byArticle = new Map<string, AISuggestion[]>();
  for (const s of incoming) byArticle.set(s.articleId, [...(byArticle.get(s.articleId) ?? []), s]);

  for (const [articleId, batch] of byArticle) {
    const article = articles[articleId];
    if (!article) continue;
    const accepted: Record<string, ReviewDecision> = Object.fromEntries(batch.map((s) => [s.id, 'accepted']));
    if (state.autoModeOption === 'publish') {
      for (const s of batch) suggestions[s.id] = { ...s, status: 'published', autoApplied: true, autoAppliedAt: now };
      articles[articleId] = {
        ...article,
        bodyHTML: applyDecisions(article.bodyHTML, batch, accepted),
        status: 'PUBLISHED',
        lastActivity: 'published',
        modifierId: HIVER_AI_USER_ID,
        modifiedAt: now,
      };
      aiReviewHistoryByArticle[articleId] = {
        baseBodyHTML: article.bodyHTML,
        reviewedAt: now,
        reviewedById: HIVER_AI_USER_ID,
        published: true,
      };
    } else {
      for (const s of batch) suggestions[s.id] = { ...s, status: 'pending', autoApplied: true, autoAppliedAt: now };
      aiReviewByArticle[articleId] = { ...initialReviewState, mode: 'terminal', activeIndex: -1, decisions: accepted };
    }
  }
  return { ...state, suggestions, articles, aiReviewByArticle, aiReviewHistoryByArticle };
}

/** Flips one auto-applied change and rebuilds the live body from the pre-change base. */
function toggleAutoChange(state: StoreState, suggestionId: string, modifierId: string, now: string): StoreState {
  const target = state.suggestions[suggestionId];
  const history = target ? state.aiReviewHistoryByArticle[target.articleId] : undefined;
  if (!target?.autoApplied || !history || (target.status !== 'published' && target.status !== 'dismissed-final')) {
    return state;
  }
  const suggestions = {
    ...state.suggestions,
    [suggestionId]: { ...target, status: target.status === 'published' ? 'dismissed-final' : 'published' } as AISuggestion,
  };
  const own = Object.values(suggestions).filter((s) => s.articleId === target.articleId && s.status !== 'incoming');
  const decisions: Record<string, ReviewDecision> = {};
  for (const s of own) decisions[s.id] = s.status === 'published' ? 'accepted' : 'dismissed';
  const next = patchArticle({ ...state, suggestions }, target.articleId, {
    bodyHTML: applyDecisions(history.baseBodyHTML, own, decisions),
    status: 'PUBLISHED',
    lastActivity: 'published',
    modifierId,
    modifiedAt: now,
  });
  return next;
}

export function rootReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'article/create':
      return {
        ...state,
        articles: { ...state.articles, [action.article.id]: action.article },
        articleOrder: [...state.articleOrder, action.article.id],
      };
    case 'article/updateBody':
      return patchArticle(state, action.articleId, { bodyHTML: action.bodyHTML });
    case 'article/updateTitle':
      return patchArticle(state, action.articleId, { title: action.title });
    case 'article/updateSlug':
      return patchArticle(state, action.articleId, { slug: action.slug });
    case 'article/setAuthor':
      return patchArticle(state, action.articleId, { authorId: action.authorId });
    case 'article/move':
      return patchArticle(state, action.articleId, { categoryId: action.categoryId });
    case 'article/publish':
      return patchArticle(state, action.articleId, {
        status: 'PUBLISHED',
        lastActivity: 'published',
        modifierId: action.modifierId,
        modifiedAt: action.now,
      });
    case 'article/unpublish':
      return patchArticle(state, action.articleId, {
        status: 'DRAFT',
        lastActivity: 'updated',
        modifierId: action.modifierId,
        modifiedAt: action.now,
      });
    case 'article/delete': {
      if (!state.articles[action.articleId]) return state;
      const { [action.articleId]: _removed, ...rest } = state.articles;
      void _removed;
      return {
        ...state,
        articles: rest,
        articleOrder: state.articleOrder.filter((id) => id !== action.articleId),
      };
    }
    case 'category/create':
      return {
        ...state,
        categories: { ...state.categories, [action.category.id]: action.category },
        categoryOrder: [...state.categoryOrder, action.category.id],
      };
    case 'aiReview/dispatch': {
      const items = selectReviewSuggestions(state, action.articleId);
      if (items.length === 0) return state;
      const current = state.aiReviewByArticle[action.articleId] ?? initialReviewState;
      const next = reviewReducer(current, action.action, items);
      if (next === current) return state;
      return { ...state, aiReviewByArticle: { ...state.aiReviewByArticle, [action.articleId]: next } };
    }
    case 'aiReview/publish': {
      const article = state.articles[action.articleId];
      if (!article) return state;
      const items = selectReviewSuggestions(state, action.articleId);
      const decisions = state.aiReviewByArticle[action.articleId]?.decisions ?? {};
      const decided = items.filter((s) => decisions[s.id] !== undefined);
      if (decided.length === 0) {
        // Edits only: publish the article; the review stays open as it was.
        return action.edited
          ? patchArticle(state, action.articleId, {
              status: 'PUBLISHED',
              lastActivity: 'published',
              modifierId: action.modifierId,
              modifiedAt: action.now,
            })
          : state;
      }
      const publishes = action.edited === true || decided.some((s) => decisions[s.id] === 'accepted');

      const suggestions = { ...state.suggestions };
      for (const s of decided) {
        const status: AISuggestion['status'] = decisions[s.id] === 'accepted' ? 'published' : 'dismissed-final';
        suggestions[s.id] = { ...s, status };
      }
      const nextArticle: Article = publishes
        ? {
            ...article,
            bodyHTML: applyDecisions(article.bodyHTML, items, decisions),
            status: 'PUBLISHED',
            lastActivity: 'published',
            modifierId: action.modifierId,
            modifiedAt: action.now,
          }
        : article;
      // Any undecided suggestions start a fresh review next time.
      const { [action.articleId]: _done, ...aiReviewByArticle } = state.aiReviewByArticle;
      void _done;
      const previous = state.aiReviewHistoryByArticle[action.articleId];
      return {
        ...state,
        articles: { ...state.articles, [article.id]: nextArticle },
        suggestions,
        aiReviewByArticle,
        aiReviewHistoryByArticle: {
          ...state.aiReviewHistoryByArticle,
          [article.id]: {
            baseBodyHTML: previous?.baseBodyHTML ?? article.bodyHTML,
            reviewedAt: action.now,
            reviewedById: action.modifierId,
            published: publishes,
          },
        },
      };
    }
    case 'settings/setAiAutoApply':
      return { ...state, aiAutoApply: action.enabled };
    case 'ai/receiveSuggestions':
      return receiveSuggestions(state, action.now);
    case 'ai/toggleAutoChange':
      return toggleAutoChange(state, action.suggestionId, action.modifierId, action.now);
    case 'proto/restart':
      return seed({ aiAutoApply: state.aiAutoApply, autoModeOption: action.option });
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}
