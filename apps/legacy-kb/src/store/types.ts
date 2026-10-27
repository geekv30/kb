// In-memory store types for the legacy Help Center admin replica.
//
// Entity shapes mirror what the live app's API returns (category list,
// article list rows, article detail) closely enough that the UI can use
// the same derivations the live code uses — e.g. activity text is
// `${capitalize(lastActivity)} by ${modifier first name} ${relative} ago`.
//
// The AI suggestion + conversation-source slices are copied from
// `apps/demo/src/store/fixtures` so later chunks can wire the
// improvements review module without touching fixtures again.

import type { ReviewState } from '../improvements/reviewState';

export type User = {
  id: string;
  /** Full display name, e.g. "Ashuthosh Rao". */
  name: string;
  /** Single upper-case initial rendered inside the avatar circle. */
  initial: string;
  /** Avatar circle background. */
  avatarColor: string;
};

export type HelpCenter = {
  id: string;
  /** Rendered in the sidebar picker, e.g. "product help center". */
  title: string;
  /** URL segment, e.g. "product" in `/product/category/...`. */
  slug: string;
  subdomain: string;
  /** Internal help centers show the lock badge next to the logo. */
  isInternal: boolean;
};

export type Category = {
  id: string;
  helpCenterId: string;
  slug: string;
  title: string;
  description: string;
  /** Material Icons Outlined ligature name, e.g. "5g". */
  icon: string;
};

export type ArticleStatus = 'DRAFT' | 'PUBLISHED';

/** Mirrors the live API's `lastActivity` values. */
export type ArticleActivity = 'created' | 'updated' | 'published';

export type Article = {
  id: string;
  categoryId: string;
  slug: string;
  title: string;
  status: ArticleStatus;
  /** `null` renders as "Unassigned" with the placeholder avatar. */
  authorId: string | null;
  /** Who performed `lastActivity`. `null` renders as "Unassigned". */
  modifierId: string | null;
  lastActivity: ArticleActivity;
  /** ISO timestamp of `lastActivity`. */
  modifiedAt: string;
  /**
   * Article content as HTML, EXCLUDING the title. The editor renders
   * `<h1>{title}</h1>` followed by this markup (the live CKEditor Title
   * plugin model). For the three AI-targeted articles this is the
   * current (pre-suggestion) content and carries `data-block-id`
   * anchors that the suggestion fixtures reference.
   */
  bodyHTML: string;
  /**
   * One-line overview of what the article's AI suggestions change, shown
   * in the review view's summary card. Only set on articles that carry
   * suggestions.
   */
  aiSummary?: string;
};

export type AISuggestionType = 'addition' | 'replace' | 'removal';

export type AISuggestionStatus = 'pending' | 'accepted' | 'dismissed' | 'published';

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
  /**
   * `addition`: block AFTER which `newHTML` is inserted.
   * `replace` / `removal`: the block being replaced / removed.
   * Always matches a `data-block-id` in the article's `bodyHTML`.
   */
  anchorBlockId: string;
  payload: AISuggestionPayload;
  sourceCount: number;
  status: AISuggestionStatus;
};

export type ConversationSource = {
  id: string;
  articleId: string;
  sender: { name: string; email: string };
  /** ISO timestamp. */
  timestamp: string;
  subject: string;
  snippet: string;
};

export type StoreState = {
  helpCenters: Record<string, HelpCenter>;
  activeHelpCenterId: string;
  users: Record<string, User>;
  /** Persona; new articles are authored by this user. */
  currentUserId: string;
  categories: Record<string, Category>;
  /** Sidebar order. */
  categoryOrder: string[];
  articles: Record<string, Article>;
  /** Table order (live ranks articles by drag order). */
  articleOrder: string[];
  suggestions: Record<string, AISuggestion>;
  conversationSources: Record<string, ConversationSource>;
  /**
   * AI suggestions review progress per article id. Lives in the store so
   * leaving the review view and coming back resumes where you left off.
   * Missing key → the article hasn't been reviewed yet.
   */
  aiReviewByArticle: Record<string, ReviewState>;
};
