import { buildReviewDocument } from '../improvements/reviewDocument';
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

/**
 * An article's AI suggestions in review order: document order of their
 * anchors, then any whose anchor is missing (id order). The review
 * state machine and the rail both walk this list.
 */
export function selectReviewSuggestions(state: StoreState, articleId: string): AISuggestion[] {
  const article = state.articles[articleId];
  if (!article) return [];
  const own = Object.values(state.suggestions)
    .filter((s) => s.articleId === articleId)
    .sort((a, b) => a.id.localeCompare(b.id));
  const { orderedIds, unplacedIds } = buildReviewDocument(article.bodyHTML, own);
  const byId = new Map(own.map((s) => [s.id, s]));
  return [...orderedIds, ...unplacedIds]
    .map((id) => byId.get(id))
    .filter((s): s is AISuggestion => Boolean(s));
}

export function selectConversationSources(state: StoreState, articleId: string): ConversationSource[] {
  return Object.values(state.conversationSources)
    .filter((c) => c.articleId === articleId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

// ── AI suggestions entry points (sidebar, hub, table pill, editor banner) ──
//
// "Pending" = not yet published. An article whose suggestions are all
// decided but not yet published is still "to review": the work isn't
// live until Publish changes runs.

export type SuggestionImpact = 'high' | 'medium' | 'low';

export type SuggestionHubTab = 'TO_REVIEW' | 'PUBLISHED';

export type ArticleSuggestionSummary = {
  article: Article;
  category: Category | undefined;
  stage: SuggestionHubTab;
  /** Suggestions in this batch: pending ones (to review) or published ones. */
  total: number;
  /** How many of `total` already carry an Accept / Dismiss decision. */
  reviewed: number;
  /** Sum of `sourceCount` across the batch. */
  conversations: number;
  impact: SuggestionImpact;
};

/**
 * Ported from `apps/demo/src/routes/ai-optimise/HubPage.tsx` `deriveImpact`
 * so both apps rank the same articles the same way: the password-reset
 * article is the canonical "high"; otherwise by conversation volume.
 */
function deriveImpact(articleId: string, suggestions: AISuggestion[]): SuggestionImpact {
  if (articleId === 'art-how-to-reset-your-password') return 'high';
  const totalSources = suggestions.reduce((acc, s) => acc + s.sourceCount, 0);
  if (totalSources >= 16) return 'high';
  if (totalSources >= 8) return 'medium';
  return 'low';
}

const IMPACT_RANK: Record<SuggestionImpact, number> = { high: 0, medium: 1, low: 2 };

export function selectArticleSuggestionSummary(
  state: StoreState,
  articleId: string,
): ArticleSuggestionSummary | undefined {
  const article = state.articles[articleId];
  if (!article) return undefined;
  const own = Object.values(state.suggestions).filter((s) => s.articleId === articleId);
  if (own.length === 0) return undefined;
  const pending = own.filter((s) => s.status !== 'published');
  const stage: SuggestionHubTab = pending.length > 0 ? 'TO_REVIEW' : 'PUBLISHED';
  const batch = stage === 'TO_REVIEW' ? pending : own;
  const decisions = state.aiReviewByArticle[articleId]?.decisions ?? {};
  const reviewed =
    stage === 'TO_REVIEW'
      ? batch.filter((s) => decisions[s.id] !== undefined || s.status === 'accepted' || s.status === 'dismissed').length
      : batch.length;
  return {
    article,
    category: state.categories[article.categoryId],
    stage,
    total: batch.length,
    reviewed,
    conversations: batch.reduce((acc, s) => acc + s.sourceCount, 0),
    impact: deriveImpact(articleId, batch),
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

/** Hub rows for one tab: highest impact first, then table order. */
export function selectSuggestionArticles(state: StoreState, tab: SuggestionHubTab): ArticleSuggestionSummary[] {
  return state.articleOrder
    .map((id) => selectArticleSuggestionSummary(state, id))
    .filter((s): s is ArticleSuggestionSummary => s !== undefined && s.stage === tab)
    .sort((a, b) => IMPACT_RANK[a.impact] - IMPACT_RANK[b.impact]);
}
