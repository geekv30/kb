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
import type { AISuggestion, Article, AutoLayout, AutoModeOption, Category, StoreState } from './types';

export type StoreAction =
  | { type: 'article/create'; article: Article }
  | { type: 'article/updateBody'; articleId: string; bodyHTML: string }
  | { type: 'article/updateTitle'; articleId: string; title: string }
  /**
   * The editor's write. A draft changes in place; a published article
   * collects unpublished edits instead (live "PUBLISHED EDITED").
   */
  | { type: 'article/edit'; articleId: string; title?: string; bodyHTML?: string; modifierId: string; now: string }
  /** Live "Discard Edits": drop the unpublished edits; the live article stays as it is. */
  | { type: 'article/discardEdits'; articleId: string }
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
  /** Auto mode: someone checked an article's auto-applied suggestions. */
  | { type: 'ai/markAutoReviewed'; articleId: string; userId: string; now: string }
  /** Prototype: switch how auto-applied suggestions are shown (no restart). */
  | { type: 'proto/setAutoLayout'; layout: AutoLayout }
  /** Merge option: drop the whole draft update; the live article stays as it is. */
  | { type: 'ai/discardDraft'; articleId: string; modifierId: string; now: string }
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
 * Publish option: Hiver AI writes into the article's newest version and
 * publishes only when that version is the live one.
 *   published          → applied to the live body, published by Hiver AI.
 *   published + edited → applied to the unpublished edits; live keeps its
 *                        text until someone publishes the edits.
 *   draft              → applied to the draft, which stays a draft.
 * A suggestion whose block the newest version no longer has can't be
 * applied, so it waits in To review instead.
 */
function applyAutoBatch(article: Article, batch: AISuggestion[], now: string) {
  const working = article.edits?.bodyHTML ?? article.bodyHTML;
  const { unplacedIds } = buildReviewDocument(working, batch);
  const placed = batch.filter((s) => !unplacedIds.includes(s.id));
  const accepted: Record<string, ReviewDecision> = Object.fromEntries(placed.map((s) => [s.id, 'accepted']));
  const goesLive = article.status === 'PUBLISHED' && !article.edits;
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
          waitsForPublish: !goesLive,
          ...(s.type === 'removal' ? { removedBeforeBlockId: nextBlockId(working, s.anchorBlockId) } : {}),
        };
  }
  const nextArticle: Article = {
    ...article,
    ...(article.edits ? { edits: { ...article.edits, bodyHTML: applied } } : { bodyHTML: applied }),
    lastActivity: goesLive ? 'published' : 'updated',
    modifierId: HIVER_AI_USER_ID,
    modifiedAt: now,
  };
  return { suggestions, article: placed.length > 0 ? nextArticle : article };
}

/**
 * Manual mode: the batch waits in To review. Auto mode, per article:
 *   publish → applied by Hiver AI (see `applyAutoBatch`).
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
      const result = applyAutoBatch(article, batch, now);
      Object.assign(suggestions, result.suggestions);
      articles[articleId] = result.article;
    } else {
      for (const s of batch) suggestions[s.id] = { ...s, status: 'pending', autoApplied: true, autoAppliedAt: now };
      aiReviewByArticle[articleId] = { ...initialReviewState, mode: 'terminal', activeIndex: -1, decisions: accepted };
    }
  }
  return { ...state, suggestions, articles, aiReviewByArticle, aiReviewHistoryByArticle };
}

/**
 * Reverts one auto-applied change, or re-applies a reverted one, in every
 * version that holds it: the live body and any unpublished edits — or
 * only the draft / the edits while it waits for a publish. Only its own
 * block is touched, so the team's edits elsewhere survive.
 */
function toggleAutoChange(state: StoreState, suggestionId: string, modifierId: string, now: string): StoreState {
  const target = state.suggestions[suggestionId];
  const article = target ? state.articles[target.articleId] : undefined;
  if (!target?.autoApplied || !article || (target.status !== 'published' && target.status !== 'dismissed-final')) {
    return state;
  }
  const reverting = target.status === 'published';
  const flip = (html: string) => (reverting ? revertSuggestion(html, target) : reapplySuggestion(html, target));
  const live = target.waitsForPublish && article.edits ? undefined : flip(article.bodyHTML);
  const edits = article.edits ? flip(article.edits.bodyHTML) : undefined;
  // Its block is gone from the version it lives in: nothing to flip. (A
  // teammate's edits that dropped the block are left as they are.)
  if (live === null || (live === undefined && !edits)) return state;

  const suggestions = {
    ...state.suggestions,
    [suggestionId]: {
      ...target,
      status: reverting ? 'dismissed-final' : 'published',
      // Reverting settles the change; re-applying it needs a look again.
      checked: reverting,
    } as AISuggestion,
  };
  const reachesLive = live !== undefined && article.status === 'PUBLISHED';
  return patchArticle({ ...state, suggestions }, article.id, {
    ...(live !== undefined ? { bodyHTML: live } : {}),
    ...(article.edits && edits ? { edits: { ...article.edits, bodyHTML: edits } } : {}),
    lastActivity: reachesLive ? 'published' : 'updated',
    modifierId,
    modifiedAt: now,
  });
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
  const base = article.edits ?? {
    title: article.title,
    bodyHTML: article.bodyHTML,
    byId: modifierId,
    liveActivity: { lastActivity: article.lastActivity, modifierId: article.modifierId, modifiedAt: article.modifiedAt },
  };
  const next = { ...base, title: title ?? base.title, bodyHTML: bodyHTML ?? base.bodyHTML };
  if (next.title === base.title && next.bodyHTML === base.bodyHTML) return state;
  return patchArticle(state, articleId, { edits: next, lastActivity: 'updated', modifierId, modifiedAt: now });
}

/** Suggestions that only exist in this article's unpublished edits / draft go live with it. */
function goLive(suggestions: StoreState['suggestions'], articleId: string): StoreState['suggestions'] {
  const out = { ...suggestions };
  for (const s of Object.values(suggestions)) {
    if (s.articleId === articleId && s.waitsForPublish) out[s.id] = { ...s, waitsForPublish: false };
  }
  return out;
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
    case 'article/discardEdits': {
      const article = state.articles[action.articleId];
      if (!article?.edits) return state;
      // Hiver AI's changes that only lived in these edits go with them.
      const suggestions = { ...state.suggestions };
      for (const s of Object.values(state.suggestions)) {
        if (s.articleId === article.id && s.waitsForPublish && s.status === 'published') {
          suggestions[s.id] = { ...s, status: 'dismissed-final', waitsForPublish: false, checked: true };
        }
      }
      // The activity goes back to the live version's, unless something went live since.
      return patchArticle({ ...state, suggestions }, article.id, {
        edits: undefined,
        ...(article.lastActivity === 'published' ? {} : article.edits.liveActivity),
      });
    }
    case 'article/publish': {
      // Publishing changes on an edited article makes its edits the live version.
      const article = state.articles[action.articleId];
      return patchArticle({ ...state, suggestions: goLive(state.suggestions, action.articleId) }, action.articleId, {
        ...(article?.edits ? { title: article.edits.title, bodyHTML: article.edits.bodyHTML, edits: undefined } : {}),
        status: 'PUBLISHED',
        lastActivity: 'published',
        modifierId: action.modifierId,
        modifiedAt: action.now,
      });
    }
    case 'article/unpublish': {
      // The draft takes the newest version; Hiver AI's live changes now wait in it.
      const article = state.articles[action.articleId];
      const suggestions = { ...state.suggestions };
      for (const s of Object.values(state.suggestions)) {
        if (s.articleId === action.articleId && s.autoApplied && s.status === 'published') {
          suggestions[s.id] = { ...s, waitsForPublish: true };
        }
      }
      return patchArticle({ ...state, suggestions }, action.articleId, {
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
          [action.articleId]: { reviewedById: action.userId, reviewedAt: action.now },
        },
      };
    }
    case 'proto/setAutoLayout':
      return { ...state, autoLayout: action.layout };
    case 'ai/discardDraft': {
      const items = selectReviewSuggestions(state, action.articleId);
      if (items.length === 0) return state;
      const current = state.aiReviewByArticle[action.articleId] ?? initialReviewState;
      const decisions: Record<string, ReviewDecision> = Object.fromEntries(items.map((s) => [s.id, 'dismissed']));
      const dismissedAll = {
        ...state,
        aiReviewByArticle: { ...state.aiReviewByArticle, [action.articleId]: { ...current, decisions } },
      };
      return rootReducer(dismissedAll, {
        type: 'aiReview/publish',
        articleId: action.articleId,
        modifierId: action.modifierId,
        now: action.now,
      });
    }
    case 'proto/restart':
      return seed({
        aiAutoApply: state.aiAutoApply,
        autoModeOption: action.option,
        autoLayout: state.autoLayout,
        autoLayoutPinned: state.autoLayoutPinned,
      });
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}
