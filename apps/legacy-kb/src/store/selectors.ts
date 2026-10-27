import { buildReviewDocument } from '../improvements/reviewDocument';
import type { ReviewDecision } from '../improvements/reviewState';
import type {
  AISuggestion,
  Article,
  ArticleStatus,
  Category,
  ConversationSource,
  HelpCenter,
  StoreState,
  User,
} from './types';

export type ArticleFilter = 'ALL' | ArticleStatus;

export function selectActiveHelpCenter(state: StoreState): HelpCenter {
  const hc = state.helpCenters[state.activeHelpCenterId];
  if (!hc) throw new Error(`Unknown help center ${state.activeHelpCenterId}`);
  return hc;
}

export function selectCategories(state: StoreState): Category[] {
  return state.categoryOrder
    .map((id) => state.categories[id])
    .filter((c): c is Category => Boolean(c));
}

export function selectCategoryBySlug(state: StoreState, slug: string | undefined): Category | undefined {
  if (!slug) return undefined;
  return selectCategories(state).find((c) => c.slug === slug);
}

export function selectArticlesInCategory(
  state: StoreState,
  categoryId: string,
  filter: ArticleFilter = 'ALL',
): Article[] {
  return state.articleOrder
    .map((id) => state.articles[id])
    .filter((a): a is Article => Boolean(a))
    .filter((a) => a.categoryId === categoryId)
    .filter((a) => filter === 'ALL' || a.status === filter);
}

export function selectArticleBySlug(state: StoreState, slug: string | undefined): Article | undefined {
  if (!slug) return undefined;
  return Object.values(state.articles).find((a) => a.slug === slug);
}

export function selectUser(state: StoreState, userId: string | null): User | undefined {
  return userId ? state.users[userId] : undefined;
}

export function selectUsers(state: StoreState): User[] {
  return Object.values(state.users);
}

export function searchArticles(state: StoreState, query: string): Article[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return state.articleOrder
    .map((id) => state.articles[id])
    .filter((a): a is Article => Boolean(a))
    .filter((a) => a.title.toLowerCase().includes(q));
}

/** `list` in review order on `bodyHTML`: anchor document order, then unplaced (id order). */
function inReviewOrder(bodyHTML: string, list: AISuggestion[]): AISuggestion[] {
  const sorted = [...list].sort((a, b) => a.id.localeCompare(b.id));
  const { orderedIds, unplacedIds } = buildReviewDocument(bodyHTML, sorted);
  const byId = new Map(sorted.map((s) => [s.id, s]));
  return [...orderedIds, ...unplacedIds]
    .map((id) => byId.get(id))
    .filter((s): s is AISuggestion => Boolean(s));
}

function ownSuggestions(state: StoreState, articleId: string): AISuggestion[] {
  return Object.values(state.suggestions).filter((s) => s.articleId === articleId);
}

/**
 * The article's suggestions still waiting to go live, in review order on
 * the current body. The review state machine and the rail walk this list.
 */
export function selectReviewSuggestions(state: StoreState, articleId: string): AISuggestion[] {
  const article = state.articles[articleId];
  if (!article) return [];
  return inReviewOrder(
    article.bodyHTML,
    ownSuggestions(state, articleId).filter((s) => s.status === 'pending'),
  );
}

/** A final suggestion's decision, kept for the review history. */
export function finalDecision(s: AISuggestion): ReviewDecision | undefined {
  if (s.status === 'published') return 'accepted';
  if (s.status === 'dismissed-final') return 'dismissed';
  return undefined;
}

/**
 * What the review view renders for an article:
 *   live    → pending suggestions on the current body (decisions come
 *             from the review state machine).
 *   history → every suggestion is final; rebuilt on the body as it was
 *             before the first publish, with the historical decisions.
 */
export type ReviewSessionData =
  | { kind: 'live'; bodyHTML: string; suggestions: AISuggestion[] }
  | { kind: 'history'; bodyHTML: string; suggestions: AISuggestion[]; decisions: Record<string, ReviewDecision> };

export function selectReviewSession(state: StoreState, articleId: string): ReviewSessionData | undefined {
  const article = state.articles[articleId];
  if (!article) return undefined;
  const own = ownSuggestions(state, articleId);
  if (own.length === 0) return undefined;
  if (own.some((s) => s.status === 'pending')) {
    return { kind: 'live', bodyHTML: article.bodyHTML, suggestions: selectReviewSuggestions(state, articleId) };
  }
  const bodyHTML = state.aiReviewHistoryByArticle[articleId]?.baseBodyHTML ?? article.bodyHTML;
  const decisions: Record<string, ReviewDecision> = {};
  for (const s of own) {
    const d = finalDecision(s);
    if (d) decisions[s.id] = d;
  }
  return { kind: 'history', bodyHTML, suggestions: inReviewOrder(bodyHTML, own), decisions };
}

/** The conversations behind one suggestion, newest first. */
export function selectConversationSources(state: StoreState, suggestionId: string): ConversationSource[] {
  return Object.values(state.conversationSources)
    .filter((c) => c.suggestionId === suggestionId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

// ── AI suggestions entry points (sidebar, hub, table pill, editor banner) ──
//
// An article is "to review" while any suggestion is still pending — even
// one that already carries a decision: nothing is live until Publish
// changes (or Mark as reviewed) runs. Once every suggestion is final the
// article moves to "Reviewed".

export type SuggestionImpact = 'high' | 'medium' | 'low';

export type SuggestionHubTab = 'TO_REVIEW' | 'REVIEWED';

export type ArticleSuggestionSummary = {
  article: Article;
  category: Category | undefined;
  stage: SuggestionHubTab;
  /** Suggestions in this batch: pending ones (to review) or all of them (reviewed). */
  total: number;
  /** How many of `total` carry a decision (to review) or are final (reviewed). */
  reviewed: number;
  /** Final suggestions that went live. */
  published: number;
  /** Final suggestions that were dismissed. */
  dismissed: number;
  /** Sum of `sourceCount` across the batch. */
  conversations: number;
  impact: SuggestionImpact;
  /** Latest publish / mark as reviewed, if any. */
  reviewedAt: string | undefined;
};

/** By conversation volume: 12+ high, 6+ medium, otherwise low. */
function deriveImpact(conversations: number): SuggestionImpact {
  if (conversations >= 12) return 'high';
  if (conversations >= 6) return 'medium';
  return 'low';
}

const IMPACT_RANK: Record<SuggestionImpact, number> = { high: 0, medium: 1, low: 2 };

export function selectArticleSuggestionSummary(
  state: StoreState,
  articleId: string,
): ArticleSuggestionSummary | undefined {
  const article = state.articles[articleId];
  if (!article) return undefined;
  const own = ownSuggestions(state, articleId);
  if (own.length === 0) return undefined;
  const pending = own.filter((s) => s.status === 'pending');
  const stage: SuggestionHubTab = pending.length > 0 ? 'TO_REVIEW' : 'REVIEWED';
  const batch = stage === 'TO_REVIEW' ? pending : own;
  const decisions = state.aiReviewByArticle[articleId]?.decisions ?? {};
  const conversations = batch.reduce((acc, s) => acc + s.sourceCount, 0);
  return {
    article,
    category: state.categories[article.categoryId],
    stage,
    total: batch.length,
    reviewed: stage === 'TO_REVIEW' ? batch.filter((s) => decisions[s.id] !== undefined).length : batch.length,
    published: own.filter((s) => s.status === 'published').length,
    dismissed: own.filter((s) => s.status === 'dismissed-final').length,
    conversations,
    impact: deriveImpact(conversations),
    reviewedAt: state.aiReviewHistoryByArticle[articleId]?.reviewedAt,
  };
}

/** Summary only when the article still has suggestions waiting to go live. */
export function selectPendingSuggestionSummary(
  state: StoreState,
  articleId: string,
): ArticleSuggestionSummary | undefined {
  const summary = selectArticleSuggestionSummary(state, articleId);
  return summary?.stage === 'TO_REVIEW' ? summary : undefined;
}

/**
 * Hub rows for one tab. To review: highest impact first, then most
 * conversations, then table order. Reviewed: most recently reviewed first.
 */
export function selectSuggestionArticles(state: StoreState, tab: SuggestionHubTab): ArticleSuggestionSummary[] {
  const rows = state.articleOrder
    .map((id) => selectArticleSuggestionSummary(state, id))
    .filter((s): s is ArticleSuggestionSummary => s !== undefined && s.stage === tab);
  if (tab === 'REVIEWED') {
    return rows.sort((a, b) => (b.reviewedAt ?? '').localeCompare(a.reviewedAt ?? ''));
  }
  return rows.sort((a, b) => IMPACT_RANK[a.impact] - IMPACT_RANK[b.impact] || b.conversations - a.conversations);
}
