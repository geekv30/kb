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
