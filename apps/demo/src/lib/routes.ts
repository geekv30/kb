// Typed route helpers for the demo app.
//
// Every place that needs a URL string should call one of these
// functions instead of writing the path inline. That way:
//   - Refactors are grep-safe (rename `/kb/...` once, here).
//   - Slugs are validated at the call site (TypeScript catches
//     missing args; missing slugs surface immediately).
//   - The router config and the navigators agree by construction.

export const routes = {
  /** Home — redirected to default category by `RedirectToDefault`. */
  home: (): string => '/',

  /** KB browse routes. Up to 3 segments deep per PRD §4.1. */
  kb: {
    /** Top-level category page, e.g. `/kb/getting-started`. */
    category: (topLevel: string): string => `/kb/${topLevel}`,
    /** Mid-level (depth 1) sub-category page. */
    sub: (topLevel: string, mid: string): string =>
      `/kb/${topLevel}/${mid}`,
    /** Depth-2 sub-category page. */
    deep: (topLevel: string, mid: string, depth2: string): string =>
      `/kb/${topLevel}/${mid}/${depth2}`,
  },

  /** Editor (collapsed shell) — flat URL keyed by article slug only. */
  article: (articleSlug: string): string => `/articles/${articleSlug}/edit`,

  /** AI Optimise hub + per-article review (collapsed shell). */
  aiOptimise: {
    hub: (): string => '/ai-optimise',
    review: (articleSlug: string): string =>
      `/ai-optimise/${articleSlug}/review`,
  },

  /** Analytics — three sibling tabs. */
  analytics: {
    /** Default tab — `/analytics` redirects here. */
    articlePerformance: (): string => '/analytics/article-performance',
    search: (): string => '/analytics/search',
    aiAnswer: (): string => '/analytics/ai-answer-performance',
  },

  /** Settings placeholder. */
  settings: (): string => '/settings',
} as const;

/** Default category the app boots into (and `/` redirects to). */
export const DEFAULT_KB_CATEGORY_SLUG = 'getting-started';
