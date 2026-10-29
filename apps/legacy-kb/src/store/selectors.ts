import { applyDecisions, buildReviewDocument } from '../improvements/reviewDocument';
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

/** Suggestions that have arrived (`incoming` ones haven't yet). */
function ownSuggestions(state: StoreState, articleId: string): AISuggestion[] {
  return Object.values(state.suggestions).filter((s) => s.articleId === articleId && s.status !== 'incoming');
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
  | { kind: 'live'; bodyHTML: string; suggestions: AISuggestion[]; auto: boolean }
  | {
      kind: 'history';
      bodyHTML: string;
      suggestions: AISuggestion[];
      decisions: Record<string, ReviewDecision>;
      auto: boolean;
    };

export function selectReviewSession(state: StoreState, articleId: string): ReviewSessionData | undefined {
  const article = state.articles[articleId];
  if (!article) return undefined;
  const own = ownSuggestions(state, articleId);
  if (own.length === 0) return undefined;
  // Auto: arrived while auto mode was on — applied (publish) or pre-accepted (merge).
  const auto = own.some((s) => s.autoApplied);
  if (own.some((s) => s.status === 'pending')) {
    return { kind: 'live', bodyHTML: article.bodyHTML, suggestions: selectReviewSuggestions(state, articleId), auto };
  }
  const bodyHTML = state.aiReviewHistoryByArticle[articleId]?.baseBodyHTML ?? article.bodyHTML;
  const decisions: Record<string, ReviewDecision> = {};
  for (const s of own) {
    const d = finalDecision(s);
    if (d) decisions[s.id] = d;
  }
  return { kind: 'history', bodyHTML, suggestions: inReviewOrder(bodyHTML, own), decisions, auto };
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

/**
 * `AUTO`: arrived while auto mode was on. Option `publish` — applied to
 * the live article ("Applied by AI"). Option `merge` — an improved
 * version waiting to be merged ("Ready to merge"); once merged it moves
 * to Reviewed like any other review.
 */
export type SuggestionHubTab = 'TO_REVIEW' | 'AUTO' | 'REVIEWED';

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
  /** AUTO: when the batch arrived and was applied (or set aside to merge). */
  autoAppliedAt: string | undefined;
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
  const stage = stageOf(state, own, pending);
  const batch = pending.length > 0 ? pending : own;
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
    autoAppliedAt: own.find((s) => s.autoApplied)?.autoAppliedAt,
  };
}

function stageOf(state: StoreState, own: AISuggestion[], pending: AISuggestion[]): SuggestionHubTab {
  if (pending.some((s) => !s.autoApplied)) return 'TO_REVIEW';
  if (pending.length > 0) return 'AUTO';
  if (state.autoModeOption === 'publish' && own.some((s) => s.autoApplied)) return 'AUTO';
  return 'REVIEWED';
}

/** Summary while the article still needs a look: to review, or applied / ready to merge in auto mode. */
export function selectOpenSuggestionSummary(
  state: StoreState,
  articleId: string,
): ArticleSuggestionSummary | undefined {
  const summary = selectArticleSuggestionSummary(state, articleId);
  return summary && summary.stage !== 'REVIEWED' ? summary : undefined;
}

// ── Auto mode, shown inside the article ──

/**
 *   live      publish option, applied to the live article
 *   restored  publish option, someone restored the original text
 *   draft     merge option, in Hiver AI's draft update (not live)
 *   removed   merge option, taken out of the draft update
 */
export type AutoChangeStatus = 'live' | 'restored' | 'draft' | 'removed';

export type AutoChange = {
  suggestion: AISuggestion;
  status: AutoChangeStatus;
  /** In the article and nobody has kept it yet: marked in the editor. */
  unchecked: boolean;
};

/** The article's changes from auto mode, in body order. Empty for manual suggestions. */
export function selectAutoChanges(state: StoreState, articleId: string): AutoChange[] {
  const session = selectReviewSession(state, articleId);
  if (!session?.auto) return [];
  const decisions = state.aiReviewByArticle[articleId]?.decisions ?? {};
  return session.suggestions
    .filter((s) => s.autoApplied)
    .map((s) => {
      const status: AutoChangeStatus =
        s.status === 'published'
          ? 'live'
          : s.status === 'dismissed-final'
            ? 'restored'
            : decisions[s.id] === 'dismissed'
              ? 'removed'
              : 'draft';
      return { suggestion: s, status, unchecked: (status === 'live' || status === 'draft') && !s.checked };
    });
}

/**
 * Merge option: the article as Hiver AI's draft update would publish it
 * (live body + every change still in the draft). `undefined` when there's
 * no draft update waiting.
 */
export function selectAutoDraftBody(state: StoreState, articleId: string): string | undefined {
  const article = state.articles[articleId];
  const items = selectReviewSuggestions(state, articleId).filter((s) => s.autoApplied);
  if (!article || items.length === 0) return undefined;
  return applyDecisions(article.bodyHTML, items, state.aiReviewByArticle[articleId]?.decisions ?? {});
}

/** Auto mode: this article has a change to check (publish) or a draft update to publish (merge). */
export function selectAutoNeedsLook(state: StoreState, articleId: string): boolean {
  return state.autoModeOption === 'merge'
    ? selectAutoDraftBody(state, articleId) !== undefined
    : selectAutoChanges(state, articleId).some((c) => c.unchecked);
}

export function articleEditPath(state: StoreState, articleId: string): string {
  const article = state.articles[articleId];
  const category = article ? state.categories[article.categoryId] : undefined;
  return `/product/category/${category?.slug ?? ''}/article/edit/${article?.slug ?? ''}`;
}

/**
 * Where an article's auto-applied suggestions are shown: the article +
 * suggestion rail (layout A), or the edit page's list (layout B). The
 * draft-update option always uses the editor.
 */
export function autoSuggestionsPath(state: StoreState, articleId: string): string {
  const article = state.articles[articleId];
  return state.autoModeOption === 'publish' && state.autoLayout === 'rail'
    ? `/product/ai/suggestions/${article?.slug ?? ''}`
    : articleEditPath(state, articleId);
}

/**
 * Articles that need someone: suggestions to review, plus auto-mode
 * articles with a change nobody has checked yet (publish) or a draft
 * update waiting to be published (merge).
 */
export function selectArticlesNeedingAction(state: StoreState): ArticleSuggestionSummary[] {
  const toReview = selectSuggestionArticles(state, 'TO_REVIEW');
  const auto = selectSuggestionArticles(state, 'AUTO').filter((row) => selectAutoNeedsLook(state, row.article.id));
  return [...toReview, ...auto];
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
  if (tab === 'AUTO') {
    return rows.sort((a, b) => (b.autoAppliedAt ?? '').localeCompare(a.autoAppliedAt ?? ''));
  }
  return rows.sort((a, b) => IMPACT_RANK[a.impact] - IMPACT_RANK[b.impact] || b.conversations - a.conversations);
}
