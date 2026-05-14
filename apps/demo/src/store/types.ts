// Phase 7.5.2 — MockStore types.
//
// Mirrors the entity contracts in `demo-app-prd.md` §5 and the exact state
// shape from `demo-app-trd.md` §5.1. All ID-keyed maps; ISO timestamp
// strings (no Date objects in the store — keeps the reducer pure and
// JSON-serialisable for future dev-tools snapshots).

// Re-exported from @test-kb-ui/kb-ui after Phase 7.5.1 prep so the demo's
// per-article reducer slots align exactly with what the kb-ui state
// machine produces.
import type { AIGapsState, AIGapsAction } from '@test-kb-ui/kb-ui';

export type { AIGapsState, AIGapsAction };

/* ─────────────────────────────────────────────────────────────
 * Domain entities
 * ───────────────────────────────────────────────────────────── */

export type User = {
  id: string;
  name: string;
  /** 2-character upper-case initials, e.g. 'AK'. */
  initials: string;
  /** Hex color used by the avatar background tint when we wire it. */
  avatarColor: string;
};

export type CategoryDepth = 0 | 1 | 2 | 3;

export type Category = {
  id: string;
  slug: string;
  title: string;
  /** ~10-word descriptor surfaced as the category-page subtitle. */
  subtitle: string;
  parentId: string | null;
  depth: CategoryDepth;
};

export type ArticleVisibility = 'public' | 'private';

export type ArticleSettings = {
  slug: string;
  tags: string[];
  /** ISO date string when published, null when draft. */
  publishDate: string | null;
  seoTitle: string;
  visibility: ArticleVisibility;
  /** Reviewer user IDs — never includes the article's author. */
  reviewerIds: string[];
  /**
   * Free-text meta description (≤160 chars). Empty/undefined falls back
   * to the search-engine auto-generated snippet.
   */
  metaDescription?: string;
  /**
   * Admin-only override for the article's canonical URL. When unset, the
   * canonical URL is auto-generated from the primary domain + slug.
   */
  canonicalUrlOverride?: string;
};

export type ArticleStatus = 'draft' | 'published';

export type Article = {
  id: string;
  slug: string;
  categoryId: string;
  title: string;
  status: ArticleStatus;
  authorId: string;
  /** ISO timestamp. */
  lastUpdatedAt: string;
  /**
   * Article body as HTML. The 3 AI-targeted articles include
   * `data-block-id="…"` markers on the paragraphs that suggestions
   * anchor to. See seed.ts integrity asserts.
   */
  bodyHTML: string;
  settings: ArticleSettings;
  /**
   * Optional per-article context-specific summary surfaced in the AI
   * Gaps rail header. Briefly describes the actual suggestions on this
   * article (e.g. "Refining the article with updated instruction set,
   * updating link and by removing legacy instructions"). When absent,
   * the rail falls back to a generic blurb. Only seeded on the 3
   * AI-targeted articles.
   */
  aiGapsSummary?: string;
};

export type AISuggestionType = 'addition' | 'replace' | 'removal';

export type AISuggestionStatus =
  | 'pending'
  | 'accepted'
  | 'dismissed'
  | 'published';

export type AISuggestionPayload = {
  /** Replacement / insertion HTML. */
  newHTML?: string;
  /** Original block HTML — used by `replace` and `removal`. */
  oldHTML?: string;
};

export type AISuggestion = {
  id: string;
  articleId: string;
  type: AISuggestionType;
  title: string;
  description: string;
  /** Matches a `data-block-id="…"` on a `<p>` or `<section>` in the article body. */
  anchorBlockId: string;
  payload: AISuggestionPayload;
  sourceCount: number;
  status: AISuggestionStatus;
};

export type ConversationSourceSender = {
  name: string;
  email: string;
};

export type ConversationSource = {
  id: string;
  /** Which AI-targeted article this customer email belongs to. */
  articleId: string;
  sender: ConversationSourceSender;
  /** ISO timestamp. */
  timestamp: string;
  subject: string;
  snippet: string;
};

/* ─────────────────────────────────────────────────────────────
 * Toast (cross-cutting feedback)
 * ───────────────────────────────────────────────────────────── */

export type ToastVariant = 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
};

/* ─────────────────────────────────────────────────────────────
 * MockStoreState
 * ───────────────────────────────────────────────────────────── */

export type MockStoreState = {
  // Domain entities — id-keyed maps for O(1) lookup.
  users: Record<string, User>;
  categories: Record<string, Category>;
  articles: Record<string, Article>;
  suggestions: Record<string, AISuggestion>;
  conversationSources: Record<string, ConversationSource>;

  // Per-article AI Gaps reducer state. Populated lazily on first
  // `aiGaps/dispatch` for an article, cleared on `aiGaps/publish`.
  aiGapsStateByArticle: Record<string, AIGapsState>;

  // Session state (not domain, but lives here for convenience).
  /** Tree expansion persistence — survives in-app navigation. */
  expandedCategoryIds: string[];
  /** Persona id; new articles auto-assign this user as author. */
  currentUserId: string;

  // Toast queue — single-instance per PRD §12.1.
  currentToast: Toast | null;
};
