# Hiver KB — User Journeys

Three primary journeys in the KB authoring product. Use these to scope where a new feature lands.

| Journey | Persona | Entry point | Landing page | Where new features typically attach |
|---|---|---|---|---|
| Browse & Edit (FLAGSHIP) | Admin / Content Author | Rail "Editor" icon → `/kb/...` | Category page → Editor page | New tabs in `ArticleSettingsPanel`; new actions in `KBBreadcrumbBar`; new tables/cards on Category page |
| AI Optimise Review | Admin reviewing AI-suggested edits | Rail "AI" icon → `/ai-optimise` | Hub page → Interactive review | New suggestion types; new review modes; new sources/citations |
| Analytics Drill | Admin checking content performance | Rail "Analytics" icon → `/analytics/...` | One of 3 tabs (Article Performance / Search / AI Answer) | New analytics tabs; new tables; new metric cards; new drill-downs |

---

## Journey A — Browse & Edit

**Goal:** browse the KB tree, open or create an article, edit, save, publish.

**Steps (condensed):**

1. Land on `/` → redirect to `/kb/getting-started`. Rail "Editor" active. Explorer shows full category tree.
2. Click chevrons in `FileExplorerNav` to expand categories → reveal subcategories at depths 1, 2, 3.
3. Click a category row → navigate to `/kb/<categorySlug>/...`. Content = `PageHeader` + `SubCategoriesTable` + `ArticlesTable`.
4. Click an article row → navigate to `/kb/.../<articleSlug>/edit`. Shell collapses (rail + explorer unmount). Content = `ContentEditor` (left) + `ArticleSettingsPanel` (right).
5. Edit body or settings → editor marks dirty → "Save as draft" enables on `KBBreadcrumbBar`.
6. Cmd+S → save. Cmd+Enter or "Publish" button → publish (status flips, navigates back to category page).
7. "+ New" on `PageHeader` → creates empty draft, jumps straight into editor.
8. Close (× or back) on dirty editor → unsaved-changes guard via `ConfirmDialog`.

**Components in this journey:**

`AppShell`, `SideNavRail`, `FileExplorerNav`, `KBBreadcrumbBar`, `PageHeader`, `SubCategoriesTable`, `ArticlesTable`, `ContentEditor`, `ArticleSettingsPanel`, `Avatar`, `Badge`, `Button`, `TextInput`, `Dropdown`.

**Where new features attach:**

| New feature type | Attach to |
|---|---|
| New article metadata field (e.g., SEO, audience tag) | New section in `ArticleSettingsPanel` |
| New article-level action (e.g., archive, duplicate) | New button in `KBBreadcrumbBar` (editor variant) |
| New category-page widget (e.g., featured articles) | New row of cards above `ArticlesTable` on Category page |
| New editor capability (e.g., AI inline rewrite) | New BubbleMenu action in `ContentEditor` (or slash menu) |
| New bulk operation (e.g., multi-select publish) | New row-selection mode on `ArticlesTable` |

---

## Journey B — AI Optimise Review

**Goal:** review AI-generated suggestions for an article, accept some, dismiss others, publish.

**Steps (condensed):**

1. Click "AI" rail icon → `/ai-optimise`. Sub-nav: AI Center (no-op) + AI Optimise (active). Hub shows 3 `SuggestionCard`s, one per article with pending suggestions.
2. Click a card → `/ai-optimise/<articleSlug>/review`. Shell collapses. `ArticleBody` renders with inline highlights (s1 green=addition, s2 red+green=replace, s3 red=removal). Right rail: `AISuggestionsCard` (mode='pre-review') + collapsed `ArticleSettingsPanel`.
3. Click "Review Suggestions (3)" → reducer enters reviewing mode, scrolls to s1, shows `AIGapSuggestionCard` with controls.
4. ✓ accept (`y` / Enter) → suggestion accepted, body updates, scroll to next. × dismiss (`n`) → reverted, scroll to next. ↶ undo on chip → suggestion → pending.
5. "📄 N Sources" → `SourcesSideSheet` slides in from right (4 conversation sources per article).
6. Once all 3 decided → reducer enters terminal mode. `Publish` enables on `KBBreadcrumbBar`.
7. Click Publish → accepted changes applied permanently, suggestions → published, article → published, navigate to `/ai-optimise`.

**Components in this journey:**

`AppShell` (sidebarCollapsed), `KBBreadcrumbBar` (editor variant, publishDisabled), `AISubNav`, `SuggestionCard`, `ArticleBody`, `SuggestionBlock`, `AISuggestionsCard`, `AIGapSuggestionCard`, `SourcesSideSheet`, `ArticleSettingsPanel`. Reducer: `useAIGapsReducer`.

**Where new features attach:**

| New feature type | Attach to |
|---|---|
| New suggestion type (beyond addition/replace/removal) | Extend `SuggestionBlock` + `AIGapSuggestionCard` props |
| New review surface (e.g., side-by-side diff) | New mode on `AISuggestionsCard` + new layout on review page |
| New source format (e.g., chat transcript, PDF) | New card type in `SourcesSideSheet` |
| New keyboard shortcut | Extend reducer + `useGlobalShortcuts` |
| Per-suggestion comments | New slot inside `AIGapSuggestionCard` |

---

## Journey C — Analytics Drill

**Goal:** check content performance across 3 tabs, optionally drill into a low-performing article.

**Steps (condensed):**

1. Click "Analytics" rail icon → `/analytics/article-performance` (default tab). Sub-nav: 3 flat items.
2. Tab 1 (Article Performance): `StatCardGrid` + `AnalyticsAreaChart` + 2-up (`AnalyticsDonutChart` + `ArticlesNeedsAttentionTable`) + `ArticlePerformanceTable`.
3. Tab 2 (Search): 2-up search-volume + missed-search charts + `SearchKeywordsTable` + `ContentGapsTable`.
4. Tab 3 (AI Answer): AI metrics + deflection chart + `AIConversationLogsCard` + `MostCitedArticlesTable`.
5. Click any article-row in any table → deep-link to that article's editor (`/kb/.../<articleSlug>/edit`). Rail switches back to "Editor".
6. `DateRangePill` → no-op for v1.

**Components in this journey:**

`AppShell`, `FileExplorerNav` (variant=flat for sub-nav), `PageHeader`, `DateRangePill`, `StatCard`, `StatCardGrid`, `AnalyticsAreaChart`, `AnalyticsDonutChart`, `AnalyticsChartCard`, `Card`, `HelpfulnessTag`, `ArticlesNeedsAttentionTable`, `ArticlePerformanceTable`, `SearchKeywordsTable`, `ContentGapsTable`, `AIConversationLogEntry`, `AIConversationLogsCard`, `MostCitedArticlesTable`.

**Where new features attach:**

| New feature type | Attach to |
|---|---|
| New analytics tab | New route under `/analytics/<slug>`, new entry in flat sub-nav |
| New metric card | New `StatCard` slot in `StatCardGrid` |
| New chart | New `AnalyticsChartCard` wrapping a Recharts series |
| New drill-down (e.g., per-author) | New table component, link to filtered editor view |
| Date range filter activation | Wire `DateRangePill` onClick to a query param + filter state |

---

## Cross-journey notes

- **Shell mode:** Browse + AI Hub + Analytics use the full `AppShell` (rail + sub-nav + breadcrumb). Editor + AI Review use collapsed shell (`AppShell.sidebarCollapsed=true`).
- **Persistence:** session-only mock store; refresh wipes state. Real product would persist via API.
- **Where the "+ New article" entry point lives:** Category page only. Not on AI Hub or Analytics.
- **Cross-journey deep links:** Analytics tables → Editor. AI Hub → AI Review. No other cross-links today.
