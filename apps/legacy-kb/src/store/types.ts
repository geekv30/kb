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

/**
 * `pending` — waiting for review (it may carry an Accept / Dismiss
 * decision in `aiReviewByArticle`, but nothing is final yet).
 * `published` — accepted and published into the article body.
 * `dismissed-final` — dismissed in a review that was published or
 * marked as reviewed. Both final statuses keep the decision for history.
 * `incoming` — not arrived yet; the prototype delivers it on demand
 * (`ai/receiveSuggestions`). Every selector ignores it until then.
 */
export type AISuggestionStatus = 'pending' | 'published' | 'dismissed-final' | 'incoming';

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
  /** Equals the number of `ConversationSource`s linked to this suggestion. */
  sourceCount: number;
  status: AISuggestionStatus;
  /**
   * Arrived while auto mode was on, so nobody reviewed it first. With the
   * `publish` option it went live (and can be undone); with `merge` it
   * waits, pre-accepted, in an improved version of the article.
   */
  autoApplied?: boolean;
  /** ISO timestamp of that arrival. */
  autoAppliedAt?: string;
  /**
   * Someone looked at this auto change and settled it (Keep, or Restore
   * original). Until then it's marked in the editor and counted as needing a look.
   */
  checked?: boolean;
};

/**
 * The two auto-mode designs under comparison (prototype switch):
 * `publish` — applied straight to the live article, each change undoable.
 * `merge` — kept as an improved version; someone merges it into live.
 */
export type AutoModeOption = 'publish' | 'merge';

/**
 * The two ways under comparison to show an article's auto-applied
 * suggestions (prototype switch):
 * `rail` (A) — the article with the suggestion rail, like manual review.
 * `list` (B) — a numbered list above the editor on the edit page.
 */
export type AutoLayout = 'rail' | 'list';

/** Someone marked an article's auto-applied suggestions as reviewed. */
export type AutoReview = { reviewedById: string; reviewedAt: string };

export type ConversationSource = {
  id: string;
  articleId: string;
  /** The suggestion this conversation is evidence for. */
  suggestionId: string;
  sender: { name: string; email: string };
  /** ISO timestamp. */
  timestamp: string;
  subject: string;
  snippet: string;
};

export type AIReviewHistory = {
  /**
   * Article body before the first AI review was published or marked as
   * reviewed. Final suggestions anchor to this body, so the read-only
   * review can be rebuilt after the live body has changed.
   */
  baseBodyHTML: string;
  /** ISO timestamp of the latest publish / mark as reviewed. */
  reviewedAt: string;
  /** Who ran it. */
  reviewedById: string;
  /** `true` when the latest run published changes, `false` for Mark as reviewed. */
  published: boolean;
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
  /** Published / marked-as-reviewed AI reviews, keyed by article id. */
  aiReviewHistoryByArticle: Record<string, AIReviewHistory>;
  /**
   * Site settings › Hiver AI. `false` (manual): suggestions wait in To
   * review. `true` (auto): new suggestions are applied without a review.
   * Suggestions already waiting when it's switched on stay in To review.
   */
  aiAutoApply: boolean;
  /** Prototype only: which auto-mode design is on show. */
  autoModeOption: AutoModeOption;
  /** Prototype only: how an article's auto-applied suggestions are shown. */
  autoLayout: AutoLayout;
  /** Prototype only: the link fixed the layout (`?layout=a|b`), so there's no switch. */
  autoLayoutPinned: boolean;
  /** Latest "Mark as reviewed" on an article's auto-applied suggestions. */
  autoReviewByArticle: Record<string, AutoReview>;
};
