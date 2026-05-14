# Hiver KB — Information Architecture

How the product's pages, routes, and navigation surfaces relate. Use this to decide *where* a new feature lands.

## Sitemap

```
/                                                  → redirect to /kb/getting-started
/kb/:categorySlug                                  → Category page (full shell)
/kb/:categorySlug/:articleSlug/edit                → Editor page (collapsed shell)
/ai-optimise                                       → AI Optimise Hub (full shell)
/ai-optimise/:articleSlug/review                   → AI Gaps interactive review (collapsed shell)
/analytics                                         → redirect to /analytics/article-performance
/analytics/article-performance                     → Analytics tab 1 — default
/analytics/search                                  → Analytics tab 2
/analytics/ai-answer-performance                   → Analytics tab 3
/settings                                          → Coming soon placeholder
*                                                  → 404 (standalone, no shell)
```

## Top-level sections (rail)

| Route prefix | Section name | Rail-active icon |
|---|---|---|
| `/kb/...` | Editor | Editor |
| `/ai-optimise/...` | AI Optimisation | AI |
| `/analytics/...` | Analytics | Analytics |
| `/settings` | Settings | Settings |

## Sub-nav (288px column inside `AppShell.explorer`)

| Section | Sub-nav component | Items |
|---|---|---|
| Editor | `FileExplorerNav` | Hierarchical category tree (depth 0–3) + article leaves |
| AI Optimisation | `AISubNav` | 2 items: AI Center (no-op), AI Optimise (active) |
| Analytics | `FileExplorerNav variant="flat"` | 3 flat items: Article Views, Search, AI Answer |
| Settings | (none — collapsed shell) | — |

## Shell modes

| Mode | When | Components mounted | Components unmounted |
|---|---|---|---|
| Full shell | All routes except editor + review | `SideNavRail`, `FileExplorerNav` / `AISubNav`, `KBBreadcrumbBar`, content | — |
| Collapsed shell | `/kb/.../<slug>/edit`, `/ai-optimise/<slug>/review` | `KBBreadcrumbBar` (editor variant, leading icon = home), content (full viewport) | `SideNavRail`, sub-nav |

`AppShell.sidebarCollapsed=true` flips the layout. `KBBreadcrumbBar` automatically swaps the leading icon.

## Page-by-page composition

| Route | Layout | Primary components |
|---|---|---|
| `/kb/<cat>` | Full shell | `PageHeader` + `SubCategoriesTable` (if any) + `ArticlesTable` |
| `/kb/.../<slug>/edit` | Collapsed shell | `ContentEditor` (left, flex-1) + `ArticleSettingsPanel` (right, 452px) |
| `/ai-optimise` | Full shell | Page header + `SuggestionCard` × N (one per article with pending suggestions) |
| `/ai-optimise/<slug>/review` | Collapsed shell | `ArticleBody` + collapsed `ArticleSettingsPanel` (right) + `AISuggestionsCard` + `AIGapSuggestionCard` × 3 + `SourcesSideSheet` (overlay) |
| `/analytics/article-performance` | Full shell | `PageHeader` + `DateRangePill` + `StatCardGrid` + `AnalyticsAreaChart` + 2-up (`AnalyticsDonutChart` + `ArticlesNeedsAttentionTable`) + `ArticlePerformanceTable` |
| `/analytics/search` | Full shell | `PageHeader` + 2-up charts + `SearchKeywordsTable` + `ContentGapsTable` |
| `/analytics/ai-answer-performance` | Full shell | `PageHeader` + AI metrics + deflection chart + `AIConversationLogsCard` + `MostCitedArticlesTable` |
| `/settings` | Full shell | Centered placeholder |
| `*` (404) | Standalone | Branded 404 + "Back to home" |

## Breadcrumb derivation

| Route | Breadcrumb segments | Variant |
|---|---|---|
| `/kb/<a>/<b>/<c>` | `[a, b, c]` (each clickable) | category |
| `/kb/.../<slug>/edit` | full ancestor chain + article title (last, font-medium) | editor (Save/Publish/×) |
| `/ai-optimise` | `[AI Optimise]` | category (single, non-clickable) |
| `/ai-optimise/<slug>/review` | article ancestor chain + title | editor (publishDisabled until reviewed) |
| `/analytics/...` | `[Analytics]` | category |
| `/settings` | `[Settings]` | category |

## URL design rationale

- **Browse paths mirror category hierarchy** — readable, shareable, deep-linkable.
- **Article paths are flat** — articles have unique slugs globally; survives category re-org.
- **Analytics tabs are routes** — direct linking + browser back works naturally.
- **404 is standalone** — no shell wrapper, easier to brand.

## Where to attach a new top-level section

If a new section warrants its own rail icon (rare — only 4 today):

1. Add the route prefix to the rail mapping.
2. Add a sub-nav component (or `null` for collapsed-only sections).
3. Add a default landing page (for sections with multiple tabs, redirect to the default).
4. Update breadcrumb derivation.

Most new features should attach to an *existing* section. Adding a rail icon is a strategic decision, not a feature.
