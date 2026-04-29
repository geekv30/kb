# Hiver KB — Feature Map

What the product does today, by capability area. Use this to decide whether a PRD describes:
- a **net-new** capability (no current home — needs new section/page),
- an **extension** of an existing capability (slot into an existing component or page),
- or a **modification** of existing behaviour (change a component's props/states).

## Capability areas

| Area | Routes | Owner persona | Lives in |
|---|---|---|---|
| KB browsing | `/kb/...` | Admin / Content Author | Category page, FileExplorerNav |
| Article authoring | `/kb/.../<slug>/edit` | Content Author | Editor page (`ContentEditor` + `ArticleSettingsPanel`) |
| AI suggestion review | `/ai-optimise`, `/ai-optimise/<slug>/review` | Admin (reviewer) | Hub + Review pages |
| Performance analytics | `/analytics/...` | Admin | 3 analytics tabs |
| Settings | `/settings` | Admin | Placeholder (not yet built) |

## What's built today (capabilities by area)

### KB browsing

| Capability | Where |
|---|---|
| Hierarchical category tree (depth 0–3) | `FileExplorerNav` |
| Category page with sub-categories + article list | `/kb/<slug>`, `PageHeader` + `SubCategoriesTable` + `ArticlesTable` |
| Article status badges (published / draft) | `Badge` inside `ArticlesTable` |
| Author avatar per article | `Avatar` inside `ArticlesTable` |
| Last-updated timestamps | `ArticlesTable` column |
| Breadcrumb navigation up the tree | `KBBreadcrumbBar` (category variant) |
| Tree expansion state persistence (session-only) | `MockStore.expandedCategoryIds` (demo); real product would use API |

### Article authoring

| Capability | Where |
|---|---|
| Rich text editor (Tiptap) | `ContentEditor` |
| 14-button BubbleMenu on selection | `ContentEditor` (built-in) |
| Notion-style slash menu (`/` at line start) | `ContentEditor` (built-in) |
| H1–H3, lists, links, code blocks, tables, blockquote, HR, AI highlight strips | `ContentEditor` extensions |
| Settings: author, category, slug, tags, publish date, SEO title, visibility, reviewers | `ArticleSettingsPanel` (8 fields) |
| Save as draft + Publish actions | `KBBreadcrumbBar` (editor variant) |
| Cmd+S (save), Cmd+Enter (publish) shortcuts | `useGlobalShortcuts` |
| Unsaved-changes guard on navigation away | React Router `useBlocker` + `ConfirmDialog` |
| Create new article ("+ New" CTA) | `PageHeader` button → store mutation + navigate |
| Discard new draft on close-without-save | Confirm dialog → store removal |

### AI suggestion review

| Capability | Where |
|---|---|
| Suggestion hub: card per article with pending suggestions | `/ai-optimise`, `SuggestionCard` × N |
| Inline suggestion review on article body | `ArticleBody` + `SuggestionBlock` (3 types: addition/replace/removal) |
| Per-suggestion accept / dismiss / undo | `AIGapSuggestionCard` controls |
| Reducer state machine across all suggestions on an article | `useAIGapsReducer` |
| Active suggestion auto-scroll into view | `scrollIntoView` on activeId |
| Pre-review → reviewing → terminal mode transitions | Reducer mode field |
| Conversation sources side sheet (4 sources per article) | `SourcesSideSheet` |
| Keyboard shortcuts: j/k navigate, y/n decide, Esc close sheet | `useGlobalShortcuts` |
| Publish-disabled until at least one accepted | `KBBreadcrumbBar.publishDisabled` |
| Per-article reducer state (resume mid-flow across articles) | `MockStore.aiGapsStateByArticle` |

### Performance analytics

| Capability | Where |
|---|---|
| Article views + engagement metrics | Tab 1: `StatCardGrid` + `AnalyticsAreaChart` + tables |
| Articles-needing-attention list (low-helpfulness) | `ArticlesNeedsAttentionTable` |
| Per-article performance table (views, helpfulness, last updated) | `ArticlePerformanceTable` |
| Search analytics (volume, missed search) | Tab 2 charts |
| Top search keywords | `SearchKeywordsTable` |
| Content gaps (queries without answers) | `ContentGapsTable` |
| AI answer performance (deflection rate, citation accuracy) | Tab 3 metrics |
| AI conversation logs | `AIConversationLogsCard` (with `AIConversationLogEntry` rows) |
| Most-cited articles by AI | `MostCitedArticlesTable` |
| Drill-down: any article row → that article's editor | All 3 tables |
| Helpfulness tags (positive / wash / negative trend chips) | `HelpfulnessTag` |
| Donut chart for helpfulness distribution | `AnalyticsDonutChart` |

## What's NOT built today (common net-new asks)

| Asked-for capability | Status | Closest existing surface |
|---|---|---|
| Date range filter on analytics | `DateRangePill` exists but no-op | Wire to query param + filter store |
| Settings page (any settings) | Placeholder route only | Whole new page; copy `AppShell` + `PageHeader` pattern |
| Multi-select / bulk actions on articles | Not built | New row-selection mode on `ArticlesTable` |
| Full-text search across KB | Not built | New search bar + results page |
| Versioning / history per article | Not built | New side panel + restore action in editor |
| Public-facing article reader (consumer view) | Out of scope | This library is admin-only |
| Real-time collab in editor | Not built | Tiptap collab extension is the path |
| Comments / annotations on articles | Not built | New thread side panel |
| Export to PDF / CSV | Not built | Net-new |
| Per-user permissions / RBAC | Not built | Settings + per-article ACL field |
| Notifications / activity feed | Not built | Net-new |
| Onboarding tours | Not built | Net-new (overlay) |
| In-product feedback widget | Not built | Net-new |
| AI-assisted article generation (not just review) | Not built | New action in editor BubbleMenu / slash menu |
| Custom analytics dashboards | Not built | Tab 4 + drag-drop dashboard |
| API integrations (Slack, Jira, etc.) | Not built | Settings page |

## Decision rule for "where does this PRD land?"

1. **Read the PRD.** Identify the core capability the user wants.
2. **Match to a capability area above.** If multiple, pick the dominant one.
3. **Check "What's NOT built today".** If listed there, treat as net-new — propose the surface.
4. **Otherwise:** match to an existing component / page from the area's "What's built today" table. Extension or modification.
5. **Surface the trade-off:** is this a small slot inside an existing component, a new section on an existing page, or a whole new page/route?

A useful test: if the PRD's user can already get to your proposed landing page via the existing rail/breadcrumb chain, you're slotting into the right place. If not, they need a new entry point — that's a bigger commitment.
