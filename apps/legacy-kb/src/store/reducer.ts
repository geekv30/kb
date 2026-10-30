// Pure root reducer. Callers supply timestamps so the reducer stays
// deterministic.

import {
  applyDecisions,
  buildReviewDocument,
  nextBlockId,
  reapplySuggestion,
  revertSuggestion,
} from '../improvements/reviewDocument';
import { reviewReducer, initialReviewState, type ReviewAction, type ReviewDecision } from '../improvements/reviewState';
import { HIVER_AI_USER_ID } from './fixtures/users';
import { seed } from './seed';
import { selectReviewSuggestions } from './selectors';
import type { AISuggestion, Article, Category, StoreState } from './types';

export type StoreAction =
  | { type: 'article/create'; article: Article }
  | { type: 'article/updateBody'; articleId: string; bodyHTML: string }
  | { type: 'article/updateTitle'; articleId: string; title: string }
  /**
   * The editor's write. A draft changes in place; a published article
   * collects unpublished edits instead (live "PUBLISHED EDITED").
   */
  | { type: 'article/edit'; articleId: string; title?: string; bodyHTML?: string; modifierId: string; now: string }
  /**
   * Live "Discard Edits": the article goes back to how it was when this
   * visit to the editor began. Edits saved before the visit stay.
   */
  | { type: 'article/restore'; article: Article }
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
  /** New conversations produced the incoming batch: To review in manual mode, applied in auto mode. */
  | { type: 'ai/receiveSuggestions'; now: string }
  /** Auto mode: revert an applied suggestion in the unpublished edits / draft, or re-apply a reverted one. */
  | { type: 'ai/toggleAutoChange'; suggestionId: string; modifierId: string; now: string }
  /** Auto mode: someone checked an article's suggestions without publishing (a draft, or all reverted). */
  | { type: 'ai/markAutoReviewed'; articleId: string; userId: string; now: string }
  /** Prototype: start the demo over, keeping the auto setting. */
  | { type: 'proto/restart' };

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
 * Hiver AI never publishes. It applies the batch to the article's newest
 * version and leaves it there for a teammate to publish:
 *   published → unpublished edits (started now, or the ones already open),
 *               so the article reads "Edited by AI" and live is untouched.
 *   draft     → the draft itself, which stays a draft.
 * A suggestion whose block the newest version no longer has can't be
 * applied, so it waits in To review instead.
 */
function applyAutoBatch(article: Article, batch: AISuggestion[], now: string) {
  const working = article.edits?.bodyHTML ?? article.bodyHTML;
  const { unplacedIds } = buildReviewDocument(working, batch);
  const placed = batch.filter((s) => !unplacedIds.includes(s.id));
  const accepted: Record<string, ReviewDecision> = Object.fromEntries(placed.map((s) => [s.id, 'accepted']));
  const applied = applyDecisions(working, placed, accepted);

  const suggestions: Record<string, AISuggestion> = {};
  for (const s of batch) {
    suggestions[s.id] = unplacedIds.includes(s.id)
      ? { ...s, status: 'pending' }
      : {
          ...s,
          status: 'published',
          autoApplied: true,
          autoAppliedAt: now,
          waitsForPublish: true,
          ...(s.type === 'removal' ? { removedBeforeBlockId: nextBlockId(working, s.anchorBlockId) } : {}),
        };
  }
  const nextArticle: Article = {
    ...article,
    ...(article.status === 'DRAFT'
      ? { bodyHTML: applied }
      : { edits: { title: article.edits?.title ?? article.title, bodyHTML: applied, people: article.edits?.people ?? [] } }),
    lastActivity: 'updated',
    modifierId: HIVER_AI_USER_ID,
    modifiedAt: now,
  };
  return { suggestions, article: placed.length > 0 ? nextArticle : article };
}

/** Manual mode: the batch waits in To review. Auto mode: see `applyAutoBatch`. */
function receiveSuggestions(state: StoreState, now: string): StoreState {
  const incoming = Object.values(state.suggestions).filter((s) => s.status === 'incoming');
  if (incoming.length === 0) return state;
  const suggestions = { ...state.suggestions };
  if (!state.aiAutoApply) {
    for (const s of incoming) suggestions[s.id] = { ...s, status: 'pending' };
    return { ...state, suggestions };
  }

  const articles = { ...state.articles };
  const byArticle = new Map<string, AISuggestion[]>();
  for (const s of incoming) byArticle.set(s.articleId, [...(byArticle.get(s.articleId) ?? []), s]);
  for (const [articleId, batch] of byArticle) {
    const article = articles[articleId];
    if (!article) continue;
    const result = applyAutoBatch(article, batch, now);
    Object.assign(suggestions, result.suggestions);
    articles[articleId] = result.article;
  }
  return { ...state, suggestions, articles };
}

/** Edits nobody on the team made that now match live (every AI change reverted) aren't edits any more. */
function withoutEmptyEdits(article: Article): Article {
  const { edits } = article;
  if (!edits || edits.people.length > 0 || edits.title !== article.title || edits.bodyHTML !== article.bodyHTML) {
    return article;
  }
  return { ...article, edits: undefined };
}

/**
 * Reverts one of Hiver AI's changes, or re-applies a reverted one, in the
 * version it waits in (unpublished edits or the draft). Only its own block
 * is touched, so the team's edits elsewhere survive. Once published, a
 * change is history: the text is edited like any other.
 */
function toggleAutoChange(state: StoreState, suggestionId: string, modifierId: string, now: string): StoreState {
  const target = state.suggestions[suggestionId];
  const article = target ? state.articles[target.articleId] : undefined;
  if (!target?.autoApplied || !target.waitsForPublish || !article) return state;
  if (target.status !== 'published' && target.status !== 'dismissed-final') return state;
  const reverting = target.status === 'published';
  // A published article changes only through unpublished edits (started
  // again here if reverting everything had emptied them).
  const edits =
    article.status === 'PUBLISHED' ? (article.edits ?? { title: article.title, bodyHTML: article.bodyHTML, people: [] }) : undefined;
  const working = edits?.bodyHTML ?? article.bodyHTML;
  const flipped = reverting ? revertSuggestion(working, target) : reapplySuggestion(working, target);
  // Its block is gone from the text (a teammate's edit): nothing to flip.
  if (flipped === null) return state;

  const suggestions = {
    ...state.suggestions,
    [suggestionId]: {
      ...target,
      status: reverting ? 'dismissed-final' : 'published',
      // Reverting settles the change; re-applying it needs a look again.
      checked: reverting,
    } as AISuggestion,
  };
  const next = withoutEmptyEdits({
    ...article,
    ...(edits ? { edits: { ...edits, bodyHTML: flipped } } : { bodyHTML: flipped }),
    lastActivity: 'updated',
    modifierId,
    modifiedAt: now,
  });
  return { ...state, suggestions, articles: { ...state.articles, [article.id]: next } };
}

/** The editor's write: in place on a draft, into unpublished edits on a published article. */
function editArticle(
  state: StoreState,
  { articleId, title, bodyHTML, modifierId, now }: Extract<StoreAction, { type: 'article/edit' }>,
): StoreState {
  const article = state.articles[articleId];
  if (!article) return state;
  if (article.status === 'DRAFT') {
    return patchArticle(state, articleId, {
      ...(title !== undefined ? { title } : {}),
      ...(bodyHTML !== undefined ? { bodyHTML } : {}),
    });
  }
  const base = article.edits ?? { title: article.title, bodyHTML: article.bodyHTML, people: [] };
  const next = { ...base, title: title ?? base.title, bodyHTML: bodyHTML ?? base.bodyHTML };
  if (next.title === base.title && next.bodyHTML === base.bodyHTML) return state;
  if (!next.people.includes(modifierId)) next.people = [...next.people, modifierId];
  return patchArticle(state, articleId, { edits: next, lastActivity: 'updated', modifierId, modifiedAt: now });
}

/**
 * Publishing the version Hiver AI's changes wait in sends them live and
 * settles them: the article leaves "Edited by AI" for Reviewed.
 */
function publishAutoChanges(state: StoreState, articleId: string, userId: string, now: string): StoreState {
  const waiting = Object.values(state.suggestions).filter((s) => s.articleId === articleId && s.waitsForPublish);
  if (waiting.length === 0) return state;
  const suggestions = { ...state.suggestions };
  for (const s of waiting) suggestions[s.id] = { ...s, waitsForPublish: false, checked: true };
  return {
    ...state,
    suggestions,
    autoReviewByArticle: {
      ...state.autoReviewByArticle,
      [articleId]: { reviewedById: userId, reviewedAt: now, published: true },
    },
  };
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
    case 'article/edit':
      return editArticle(state, action);
    case 'article/restore':
      return state.articles[action.article.id]
        ? { ...state, articles: { ...state.articles, [action.article.id]: action.article } }
        : state;
    case 'article/publish': {
      // Publishing changes on an edited article makes its edits the live version.
      const article = state.articles[action.articleId];
      const settled = publishAutoChanges(state, action.articleId, action.modifierId, action.now);
      return patchArticle(settled, action.articleId, {
        ...(article?.edits ? { title: article.edits.title, bodyHTML: article.edits.bodyHTML, edits: undefined } : {}),
        status: 'PUBLISHED',
        lastActivity: 'published',
        modifierId: action.modifierId,
        modifiedAt: action.now,
      });
    }
    case 'article/unpublish': {
      // The draft takes the newest version, edits included.
      const article = state.articles[action.articleId];
      return patchArticle(state, action.articleId, {
        ...(article?.edits ? { title: article.edits.title, bodyHTML: article.edits.bodyHTML, edits: undefined } : {}),
        status: 'DRAFT',
        lastActivity: 'updated',
        modifierId: action.modifierId,
        modifiedAt: action.now,
      });
    }
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
    case 'ai/markAutoReviewed': {
      const suggestions = { ...state.suggestions };
      for (const s of Object.values(state.suggestions)) {
        if (s.articleId === action.articleId && s.autoApplied) suggestions[s.id] = { ...s, checked: true };
      }
      return {
        ...state,
        suggestions,
        autoReviewByArticle: {
          ...state.autoReviewByArticle,
          [action.articleId]: { reviewedById: action.userId, reviewedAt: action.now, published: false },
        },
      };
    }
    case 'proto/restart':
      return seed({ aiAutoApply: state.aiAutoApply });
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}
